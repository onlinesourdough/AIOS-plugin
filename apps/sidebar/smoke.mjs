import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const scratch = await mkdtemp(join(tmpdir(), 'aios-sidebar-smoke-'));
const client = new Client({ name: 'aios-sidebar-check', version: '1' });
const transport = new StdioClientTransport({
  command: process.execPath, args: [fileURLToPath(new URL('../../runtime/sidebar/server.cjs', import.meta.url))],
  env: { PATH: process.env.PATH, HOME: scratch, CODEX_HOME: scratch }, stderr: 'pipe',
});
try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name), ['aios_open', 'aios_notion_pages', 'aios_notion_icons', 'aios_status', 'aios_settings', 'aios_save_context', 'aios_sources', 'aios_save_sources']);
  assert.deepEqual(tools[0]._meta['openai/ui'].entrypoints, [{ type: 'global' }]);
  for (const name of ['aios_notion_pages', 'aios_notion_icons', 'aios_status']) {
    assert.deepEqual(tools.find(tool => tool.name === name)._meta.ui.visibility, ['app']);
    assert.equal(tools.find(tool => tool.name === name).annotations.openWorldHint, true);
  }
  // Data-URI icons render as standalone images, so each theme needs its own ink.
  const icons = client.getServerVersion().icons;
  assert.deepEqual(icons.map(icon => icon.theme), ['light', 'dark']);
  const svgs = icons.map(icon => {
    assert.equal(icon.mimeType, 'image/svg+xml');
    assert.deepEqual(icon.sizes, ['20x20']);
    assert.ok(icon.src.startsWith('data:image/svg+xml;base64,'));
    const svg = Buffer.from(icon.src.slice(icon.src.indexOf(',') + 1), 'base64').toString();
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 20 20"[^>]*>.*<\/svg>$/s);
    assert.equal(svg.includes('currentColor'), false);
    return svg;
  });
  assert.notEqual(svgs[0], svgs[1]);
  const view = await client.readResource({ uri: 'ui://aios/home-v5' });
  assert.equal(view.contents[0].mimeType, 'text/html;profile=mcp-app');
  assert.deepEqual(view.contents[0]._meta['openai/ui'], { preferredDisplayMode: 'fullscreen', availableDisplayModes: ['fullscreen'] });
  assert.ok(view.contents[0].text.includes('onlinesourdough'));
  const settings = await client.callTool({ name: 'aios_settings', arguments: {} });
  assert.equal(settings._meta['aios/view'], 'settings');
  assert.equal(tools.find(tool=>tool.name==='aios_settings')._meta['openai/ui'].entrypoints[0].type, 'settings');
  const result = await client.callTool({ name: 'aios_open', arguments: {} });
  assert.equal(result.isError, undefined);
  assert.equal(result._meta['aios/status'].context.state, 'missing');
  assert.ok(['unknown', 'not_connected', 'not_installed'].includes(result._meta['aios/status'].notion.state));
  assert.equal(JSON.stringify(result.content).includes('Context:'), false);
  const target = 'https://app.notion.com/p/00000000000000000000000000000001';
  const saved = await client.callTool({ name: 'aios_save_context', arguments: { target, expectedRevision: result._meta['aios/status'].context.revision } });
  assert.equal(saved.isError, undefined);
  assert.equal(saved._meta['aios/status'].context.target, target);
  const read = await client.callTool({ name: 'aios_status', arguments: {} });
  assert.equal(read._meta['aios/status'].context.target, target);
  assert.equal(tools.find(tool=>tool.name==='aios_save_context').annotations.readOnlyHint, false);
  assert.deepEqual(tools.find(tool=>tool.name==='aios_save_context')._meta.ui.visibility, ['app']);
  const links = { memory: { title: 'Decisions', target: 'https://example.com/memory' }, teamMemory: { title: 'Team decisions', target: 'https://example.com/team-memory' } };
  const sources = await client.callTool({ name: 'aios_save_sources', arguments: { target, expectedContextRevision: read._meta['aios/status'].context.revision, expectedRevision: read._meta['aios/status'].sources.revision, title: 'My AIOS', links } });
  assert.equal(sources.isError, undefined);
  assert.deepEqual(sources._meta['aios/status'].sources.links, links);
  const metadata = await client.callTool({ name: 'aios_sources', arguments: {} });
  assert.deepEqual(JSON.parse(metadata.content[0].text).sources.links, links);
  console.log('PASS: bundled stdio server, global entrypoint, fullscreen resource and isolated first run.');
} finally { await client.close(); await rm(scratch, { recursive: true, force: true }); }
