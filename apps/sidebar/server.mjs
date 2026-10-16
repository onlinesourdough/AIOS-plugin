import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { OpenAIExtensions } from '@openai/mcp-extensions/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readNotionSetup } from './codex-status.mjs';
import { readContextRoute, saveContextRoute } from './context-route.mjs';
import { readSources, saveSources } from './sources.mjs';
import { z } from 'zod';
import { NotionPages } from './notion-pages.mjs';

const uri = 'ui://aios/home-v5';
const notionPages = new NotionPages();
// Context-hub mark; assets/branding/aios-icon.svg renders the same geometry as assets/icon.png.
// A data-URI image does not inherit the host's text colour, so one theme-less icon adapts
// itself: neutral grey for light or dark schemes, and a mid grey if its style is ignored.
const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" color="#808080" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><style>:root{color:#4c4e4a}@media (prefers-color-scheme:dark){:root{color:#b4b4b4}}</style><rect x="2" y="2" width="8" height="8" rx="2" fill="currentColor"/><rect x="13" y="3" width="5" height="5" rx="1.25"/><rect x="3" y="13" width="5" height="5" rx="1.25"/><rect x="13" y="13" width="5" height="5" rx="1.25"/><path d="M10 5.5h3M5.5 10v3M15.5 8v5M8 15.5h5"/></svg>';
// MCP SDK 1.31 does not serialize tool icons. The spec's server-icon fallback
// supplies the navigation icon without patching SDK internals.
const server = new McpServer({ name: 'aios', title: 'AIOS', version: __AIOS_VERSION__,
  icons: [{ src: `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`, mimeType: 'image/svg+xml', sizes: ['20x20'] }],
});
new OpenAIExtensions(server);

registerAppResource(server, 'aios-setup', uri, {}, async () => ({ contents: [{
  uri, mimeType: RESOURCE_MIME_TYPE, text: await readFile(join(__dirname, 'index.html'), 'utf8'),
  _meta: {
    ui: { csp: { connectDomains: [], resourceDomains: ['https://www.notion.so'] }, prefersBorder: false },
    'openai/ui': { preferredDisplayMode: 'fullscreen', availableDisplayModes: ['fullscreen'] },
  },
}] }));

// Each snapshot carries its start time so delayed reads cannot undo a newer save.
let lastCheck = 0;
async function status() {
  lastCheck = Math.max(lastCheck + 1, Date.now());
  const checkedAt = new Date(lastCheck).toISOString();
  const [notion, context] = await Promise.all([readNotionSetup(), readContextRoute()]);
  const sources = context.state === 'configured' ? await readSources(context.target) : { state: 'missing', title: '', links: {} };
  return { version: __AIOS_VERSION__, features: { notionPages: true, notionIcons: true }, notion, context, sources, checkedAt };
}
async function result() {
  return { content: [{ type: 'text', text: 'AIOS dashboard. Connection status and saved links to Context, Docs, Skills and Memory; no business records are copied.' }],
    _meta: { 'aios/status': await status() } };
}
registerAppTool(server, 'aios_open', {
  title: 'AIOS', description: 'Open the AIOS panel with connection status and the saved context location. No page search, conversation request or Notion write.',
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { resourceUri: uri }, 'openai/ui': { entrypoints: [{ type: 'global' }] } },
}, result);
registerAppTool(server, 'aios_notion_pages', {
  title: 'Choose a Notion page', description: 'List or search accessible Notion page names through the separate official Notion connection. Returns navigation metadata only. No page bodies, model turn, second connection or Notion write.',
  inputSchema: { query: z.string().max(160).default('') },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { visibility: ['app'] } },
}, async ({ query }) => {
  try { return { content: [], _meta: { 'aios/kind': 'pages', 'aios/pages': await notionPages.list(query) } }; }
  catch (error) { return { isError: true, content: [{ type: 'text', text: error.message }], _meta: { 'aios/kind': 'pages' } }; }
});
registerAppTool(server, 'aios_notion_icons', {
  title: 'Read selected page icons', description: 'Read icons for up to six selected Notion destinations. The official fetch response is reduced to page identity and icon; page bodies are discarded, never returned or stored.',
  inputSchema: { targets: z.array(z.string().max(2048)).min(1).max(6) },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { visibility: ['app'] } },
}, async ({ targets }) => {
  try { return { content: [], _meta: { 'aios/kind': 'icons', 'aios/icons': await notionPages.icons(targets) } }; }
  catch { return { isError: true, content: [{ type: 'text', text: 'Page icons are unavailable.' }], _meta: { 'aios/kind': 'icons' } }; }
});
registerAppTool(server, 'aios_status', {
  title: 'Refresh AIOS', description: 'Refresh Notion connection metadata and the saved context location.',
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { visibility: ['app'] } },
}, result);
registerAppTool(server, 'aios_settings', {
  title: 'AIOS settings', description: 'Open the AIOS source settings. Reads current configuration without changing it.',
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  _meta: { ui: { resourceUri: uri, visibility: ['app'] }, 'openai/ui': { entrypoints: [{ type: 'settings', searchTerms: ['context', 'skills', 'memory', 'Notion'] }] } },
}, async () => {
  const snapshot = await result();
  snapshot._meta['aios/view'] = 'settings';
  return snapshot;
});
registerAppTool(server, 'aios_save_context', {
  title: 'Save your context', description: 'Save the user-entered personal default context location in the AIOS block of Codex instructions. Preserve other rules and back up changed instructions. This does not verify access or create business sources.',
  inputSchema: { target: z.string().min(1).max(2048), expectedRevision: z.string().regex(/^[a-f0-9]{64}$/) },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  _meta: { ui: { visibility: ['app'] } },
}, async (args) => {
  try {
    const bridge = await readFile(join(__dirname, '../../skills/aios-context/assets/bridge.md'), 'utf8');
    await saveContextRoute(args, { bridge });
    return await result();
  } catch (error) { return { isError: true, content: [{ type: 'text', text: error.message }] }; }
});

server.registerTool('aios_sources', {
  title: 'Read AIOS source links',
  description: 'Read the current personal context location and its saved navigation links with revision tokens. Use only for requested setup or source-link maintenance. These are saved links, not live Notion records or proof of access.',
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async () => {
  const context = await readContextRoute();
  const sources = context.state === 'configured' ? await readSources(context.target) : { state: 'missing', title: '', links: {} };
  return { content: [{ type: 'text', text: JSON.stringify({ context, sources }) }] };
});
const sourceLink = z.object({ title: z.string().min(1).max(100), target: z.string().min(1).max(2048) }).strict();
registerAppTool(server, 'aios_save_sources', {
  title: 'Save AIOS source links',
  description: 'Save only navigation names and links for the selected personal context. Setup uses verified destinations; the panel accepts user-entered links. Does not read or write Notion content, store skills or memories, verify access, or change the context pointer. Replaces the whole link map; include every role to keep. Read aios_sources for current revision tokens first. Never use the personal default for a different client.',
  inputSchema: { target: z.string().min(1).max(2048), expectedContextRevision: z.string().regex(/^[a-f0-9]{64}$/), expectedRevision: z.string().regex(/^[a-f0-9]{64}$/), title: z.string().max(100), links: z.object({ docs: sourceLink.optional(), personalSkills: sourceLink.optional(), teamSkills: sourceLink.optional(), memory: sourceLink.optional(), teamMemory: sourceLink.optional() }).strict() },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
  _meta: { ui: { visibility: ['app', 'model'] } },
}, async args => {
  try {
    await saveSources(args);
    return await result();
  } catch (error) { return { isError: true, content: [{ type: 'text', text: error.message }] }; }
});

server.connect(new StdioServerTransport()).catch(() => {
  console.error('AIOS sidebar could not start. Check the Node runtime and plugin installation.');
  process.exitCode = 1;
});
process.stdin.on('end', () => void notionPages.close());
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await notionPages.close(); process.exit(0); });
