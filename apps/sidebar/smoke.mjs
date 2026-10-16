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
  // Hosts read the global tool's icons before the server icon, so both carry the same single
  // theme-less SVG, and no other tool has an icon.
  const icons = client.getServerVersion().icons;
  assert.deepEqual(tools[0].icons, icons);
  assert.deepEqual(tools.filter(tool => tool.icons).map(tool => tool.name), ['aios_open']);
  assert.equal(icons.length, 1);
  const [icon] = icons;
  assert.equal(icon.theme, undefined);
  assert.equal(icon.mimeType, 'image/svg+xml');
  assert.deepEqual(icon.sizes, ['16x16']);
  assert.ok(icon.src.startsWith('data:image/svg+xml;base64,'));
  const svg = Buffer.from(icon.src.slice(icon.src.indexOf(',') + 1), 'base64').toString();
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" [^>]*viewBox="0 0 20 20"[^>]*>.*<\/svg>$/s);
  // The SVG sets its own neutral colour for each colour scheme; each must read on that scheme's
  // sidebar backgrounds, unselected then selected.
  const luminance = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
  const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
  const light = svg.match(/<style>:root\{color:(#[0-9a-f]{6})\}/i)?.[1];
  const dark = svg.match(/@media \(prefers-color-scheme:\s*dark\)\{:root\{color:(#[0-9a-f]{6})\}\}/i)?.[1];
  for (const [ink, backgrounds] of [[light, ['#ffffff', '#e6e6e6']], [dark, ['#1c1c1c', '#333333']]]) {
    assert.ok(ink, 'icon colour for each scheme');
    for (const background of backgrounds) assert.ok(contrast(ink, background) >= 3, `${ink} on ${background}`);
  }
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
  const invalid = await client.callTool({ name: 'aios_save_context', arguments: { target, expectedRevision: 'stale' } });
  assert.equal(invalid.isError, true);
  const saved =await client.callTool({ name: 'aios_save_context', arguments: { target, expectedRevision: result._meta['aios/status'].context.revision } });
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
