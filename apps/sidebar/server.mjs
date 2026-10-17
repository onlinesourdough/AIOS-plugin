import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { OpenAIExtensions } from '@openai/mcp-extensions/server';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
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
// A monochrome SVG drawn only in currentColor, with no colour of its own, so the host can colour
// it like its other sidebar icons. It is the global tool icon and the server icon.
const icon = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="3.25" fill="currentColor"/><circle cx="3.75" cy="3.75" r="2"/><circle cx="16.25" cy="3.75" r="2"/><circle cx="3.75" cy="16.25" r="2"/><circle cx="16.25" cy="16.25" r="2"/><path d="M5.2 5.2l2.4 2.4M14.8 5.2l-2.4 2.4M5.2 14.8l2.4-2.4M14.8 14.8l-2.4-2.4"/></svg>';
const icons = [{ src: `data:image/svg+xml;base64,${Buffer.from(icon).toString('base64')}`, mimeType: 'image/svg+xml', sizes: ['16x16'] }];
const server = new McpServer({ name: 'aios', title: 'AIOS', version: __AIOS_VERSION__, icons });
new OpenAIExtensions(server);
// Registered tool handles, in registration order, for the tools/list handler below.
const tools = new Map();
const appTool = (name, config, cb) => tools.set(name, registerAppTool(server, name, config, cb));
const modelTool = (name, config, cb) => tools.set(name, server.registerTool(name, config, cb));

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
appTool('aios_open', {
  title: 'AIOS', description: 'Open the AIOS panel with connection status and the saved context location. No page search, conversation request or Notion write.',
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { resourceUri: uri }, 'openai/ui': { entrypoints: [{ type: 'global' }] } },
}, result);
appTool('aios_notion_pages', {
  title: 'Choose a Notion page', description: 'List or search accessible Notion page names through the separate official Notion connection. Returns navigation metadata only. No page bodies, model turn, second connection or Notion write.',
  inputSchema: { query: z.string().max(160).default('') },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { visibility: ['app'] } },
}, async ({ query }) => {
  try { return { content: [], _meta: { 'aios/kind': 'pages', 'aios/pages': await notionPages.list(query) } }; }
  catch (error) { return { isError: true, content: [{ type: 'text', text: error.message }], _meta: { 'aios/kind': 'pages' } }; }
});
appTool('aios_notion_icons', {
  title: 'Read selected page icons', description: 'Read icons for up to six selected Notion destinations. The official fetch response is reduced to page identity and icon; page bodies are discarded, never returned or stored.',
  inputSchema: { targets: z.array(z.string().max(2048)).min(1).max(6) },
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { visibility: ['app'] } },
}, async ({ targets }) => {
  try { return { content: [], _meta: { 'aios/kind': 'icons', 'aios/icons': await notionPages.icons(targets) } }; }
  catch { return { isError: true, content: [{ type: 'text', text: 'Page icons are unavailable.' }], _meta: { 'aios/kind': 'icons' } }; }
});
appTool('aios_status', {
  title: 'Refresh AIOS', description: 'Refresh Notion connection metadata and the saved context location.',
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  _meta: { ui: { visibility: ['app'] } },
}, result);
appTool('aios_settings', {
  title: 'AIOS settings', description: 'Open the AIOS source settings. Reads current configuration without changing it.',
  inputSchema: {},
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  _meta: { ui: { resourceUri: uri, visibility: ['app'] }, 'openai/ui': { entrypoints: [{ type: 'settings', searchTerms: ['context', 'skills', 'memory', 'Notion'] }] } },
}, async () => {
  const snapshot = await result();
  snapshot._meta['aios/view'] = 'settings';
  return snapshot;
});
appTool('aios_save_context', {
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

modelTool('aios_sources', {
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
appTool('aios_save_sources', {
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

// MCP SDK 1.31's McpServer omits tool icons from tools/list. This handler, set through the SDK's
// public low-level server, lists the same registered tools as McpServer does and adds the icon to
// the global entry, which hosts read before the server icon. Registration, validation and calls
// stay with McpServer.
const jsonSchema = (schema, io) => z.toJSONSchema(schema, { target: 'draft-7', io });
server.server.setRequestHandler(ListToolsRequestSchema, () => ({
  tools: [...tools].filter(([, tool]) => tool.enabled).map(([name, tool]) => ({
    name, title: tool.title, description: tool.description,
    inputSchema: tool.inputSchema ? jsonSchema(tool.inputSchema, 'input') : { type: 'object', properties: {} },
    annotations: tool.annotations, execution: tool.execution, _meta: tool._meta,
    ...(tool.outputSchema && { outputSchema: jsonSchema(tool.outputSchema, 'output') }),
    ...(name === 'aios_open' && { icons }),
  })),
}));

server.connect(new StdioServerTransport()).catch(() => {
  console.error('AIOS sidebar could not start. Check the Node runtime and plugin installation.');
  process.exitCode = 1;
});
process.stdin.on('end', () => void notionPages.close());
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await notionPages.close(); process.exit(0); });
