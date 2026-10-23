import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { NotionPages, pageLinks, transportLimits, pageToolAllowed } from './notion-pages.mjs';
import { NOTION_ID } from './codex-status.mjs';

const url = 'https://app.notion.com/p/00000000000000000000000000000001';
const result = (items = [{ title: 'AIOS', url }]) => ({ structuredContent: { results: items } });
const names = ['notion.search', 'notion.notion-list-private-pages', 'notion.notion-list-shared-pages', 'notion.notion-list-favorite-pages', 'notion.fetch'];
const tools = Object.fromEntries(names.map(name => [name, { name, annotations: { readOnlyHint: true, destructiveHint: false } }]));

test('page results retain only safe Notion navigation metadata and deduplicate page identity', () => {
  const got = pageLinks(result([
    { title: 'AIOS', url, content: 'private company body', token: 'secret' },
    { title: 'AIOS', url: url + '?source=copy_link' },
    { title: 'foreign', url: 'https://notion.so.attacker.test/00000000000000000000000000000001' },
    { title: 'credentials', url: 'https://user:secret@notion.so/00000000000000000000000000000002' },
    { title: 'bad scheme', url: 'javascript:alert(1)' },
    { title: 'not a page', url: 'https://notion.so/' },
    null,
  ]));
  assert.deepEqual(got.pages, [{ id: '00000000000000000000000000000001', title: 'AIOS', target: url }]);
  assert.equal(JSON.stringify(got).includes('secret'), false);
  assert.deepEqual(pageLinks({ content: [{ type: 'text', text: JSON.stringify({ results: [], has_more: true }) }] }), { pages: [], hasMore: true });
  for (const invalid of [{ isError: true }, {}, { structuredContent: { results: 'wrong' } }]) assert.throws(() => pageLinks(invalid), /Could not load/);
});

function fixture({ respond, plugin = 'enabled', timeoutMs = 1000 } = {}) {
  const requests = [], children = [];
  let connected = true;
  const launch = (_command, _args, options) => {
    const child = new EventEmitter(); children.push(child);
    child.cwd = options.cwd;
    child.stdin = new PassThrough(); child.stdout = new PassThrough(); child.exitCode = null;
    child.kill = () => { child.exitCode = 0; child.emit('exit', 0); };
    child.stdin.on('data', chunk => {
      const request = JSON.parse(String(chunk)); requests.push(request);
      if (request.id === undefined) return;
      queueMicrotask(() => {
        const supplied = respond?.(request);
        if (supplied === null) return;
        let data = supplied;
        if (!data) {
          const value = request.method === 'thread/start' ? { thread: { id: 'ephemeral-test', ephemeral: true } }
            : request.method === 'config/read' ? { config: {} }
            : request.method === 'mcpServerStatus/list' ? { data: [{ name: 'codex_apps', tools }] }
            : request.method === 'app/installed' ? { apps: [{ id: NOTION_ID, enabled: true, callable: connected }] }
            : request.method === 'mcpServer/tool/call' ? result() : {};
          data = { result: value };
        }
        child.stdout.write(JSON.stringify({ id: request.id, ...data }) + '\n');
      });
    });
    return child;
  };
  const pages = new NotionPages({ launch, command: async () => 'codex', plugin: async () => plugin, timeoutMs, idleMs: 10000 });
  return { pages, requests, children, disconnect: () => { connected = false; } };
}

test('search reuses the existing connector, strips highlights and never starts a model turn', async t => {
  const f = fixture(); t.after(() => f.pages.close());
  assert.equal((await f.pages.list('AIOS')).pages[0].title, 'AIOS');
  await f.pages.list('Docs');
  assert.equal(f.children.length, 1);
  const starts = f.requests.filter(r => r.method === 'thread/start');
  assert.equal(starts.length, 1); assert.equal(starts[0].params.ephemeral, true);
  assert.equal(starts[0].params.sandbox, 'read-only');
  assert.equal(f.children[0].cwd, starts[0].params.cwd, 'transport uses its owned temporary directory, never the replaceable plugin cache');
  assert.equal(f.requests.some(r => /turn\/|thread\/(list|read|resume)|oauth|config\/.*write/.test(r.method)), false);
  const calls = f.requests.filter(r => r.method === 'mcpServer/tool/call');
  assert.deepEqual(calls.map(r => r.params.tool), ['notion.search', 'notion.search']);
  assert.deepEqual(calls[0].params.arguments, { query: 'AIOS', query_type: 'internal', page_size: 30, max_highlight_length: 0 });
  await assert.rejects(f.pages.tool('notion.update-page', {}), /Could not load/);
  assert.equal(f.requests.filter(r => r.method === 'mcpServer/tool/call').length, 2);
});

test('transport limits narrow local capabilities without changing account or policy settings', () => {
  assert.deepEqual(transportLimits({ plugins: { 'osm@example': { enabled: true }, 'notion@official': { enabled: false } },
    mcp_servers: { 'local.tool': { enabled: true }, codex_apps: { enabled: true } }, apps: { [NOTION_ID]: { enabled: false } }, approval_policy: 'on-request' }),
  { plugins: { 'osm@example': { enabled: false } }, mcp_servers: { 'local.tool': { enabled: false } } });
});

test('configured tool denials and required confirmations prevent direct page calls', async t => {
  for (const setting of [{ enabled: false }, { default_tools_enabled: false }, { tools: { search: { enabled: false } } },
    { tools: { 'notion.search': { approval_mode: 'prompt' } } }, { links: { account: { default_tools_approval_mode: 'prompt' } } }]) {
    const f = fixture({ respond: request => request.method === 'config/read' ? { result: { config: { apps: { [NOTION_ID]: setting } } } } : undefined });
    t.after(() => f.pages.close());
    await assert.rejects(f.pages.list('AIOS'), /needs permission/);
    assert.equal(f.requests.some(r=>r.method==='mcpServer/tool/call'),false);
  }
  assert.equal(pageToolAllowed({ apps: { _default: { open_world_enabled: false } } }, 'notion.search', { openWorldHint: true }), false);
  assert.equal(pageToolAllowed({ apps: { _default: { enabled: false, open_world_enabled: false },
    [NOTION_ID]: { enabled: true, open_world_enabled: true } } }, 'notion.search', { openWorldHint: true }), true);
});

test('browse reports partial availability and keeps metadata from successful sources', async t => {
  const f = fixture({ respond: request => request.params?.tool === 'notion.notion-list-shared-pages' ? { result: { isError: true, content: [{ type: 'text', text: 'private failure details' }] } } : undefined });
  t.after(() => f.pages.close());
  const got = await f.pages.list();
  assert.equal(got.pages.length, 1); assert.equal(got.partial, true); assert.equal(got.hasMore, true);
  assert.equal(JSON.stringify(got).includes('private failure'), false);
});

test('disconnecting or disabling the plugin prevents page calls and clears the transport', async t => {
  const f = fixture(); t.after(() => f.pages.close());
  await f.pages.list('AIOS'); f.disconnect();
  await assert.rejects(f.pages.list('Docs'), /Connect the official/);
  assert.equal(f.requests.filter(r => r.method === 'mcpServer/tool/call').length, 1);
  assert.equal(f.children[0].exitCode, 0);
  const disabled = fixture({ plugin: 'disabled' }); t.after(() => disabled.pages.close());
  await assert.rejects(disabled.pages.list('AIOS'), /Enable the official/);
  assert.equal(disabled.children.length, 0);
});

test('a search timeout fails that request only; initialization failures and prompts close safely', async t => {
  const f = fixture({ timeoutMs: 20, respond: request => request.method === 'mcpServer/tool/call' ? null : undefined });
  t.after(() => f.pages.close());
  await assert.rejects(f.pages.list('AIOS'), /Could not load/);
  assert.equal(f.children[0].exitCode, null); assert.equal(f.pages.pending.size, 0);
  const init = fixture({ timeoutMs: 20, respond: request => request.method === 'initialize' ? null : undefined });
  t.after(() => init.pages.close());
  await assert.rejects(init.pages.list('AIOS'), /Could not load/); assert.equal(init.children[0].exitCode, 0);
  const prompt = fixture({ respond: request => request.method === 'mcpServer/tool/call' ? { method: 'tool/requestUserInput', params: {} } : undefined });
  t.after(() => prompt.pages.close());
  await assert.rejects(prompt.pages.list('AIOS'), /Could not load/);
  assert.equal(prompt.children[0].exitCode, 0);
  assert.equal(prompt.requests.some(r => r.result), false);
});

test('one slow browse source cannot cancel the successful sources', async t => {
  const f = fixture({ timeoutMs: 20, respond: request => request.params?.tool === 'notion.notion-list-shared-pages' ? null : undefined });
  t.after(() => f.pages.close());
  const got = await f.pages.list();
  assert.equal(got.partial, true); assert.equal(got.pages.length, 1);
  assert.equal(f.children[0].exitCode, null); assert.equal(f.pages.pending.size, 0);
  assert.equal((await f.pages.list('AIOS')).pages.length, 1);
});

test('selected icon reads are bounded, identity-checked and never return fetched page bodies', async t => {
  const f = fixture({ respond: request => request.params?.tool === 'notion.fetch' ? { result: { structuredContent: { id: request.params.arguments.id, text: '<database icon="/icons/copy_lightgray.svg">private knowledge</database>' } } } : undefined });
  t.after(() => f.pages.close());
  const got = await f.pages.icons([url, url + '?source=copy_link']);
  assert.equal(got.icons.length, 1); assert.equal(got.icons[0].icon, 'https://www.notion.so/icons/copy_lightgray.svg');
  assert.equal(JSON.stringify(got).includes('private knowledge'), false);
  assert.equal(f.requests.filter(r => r.method === 'mcpServer/tool/call').length, 1);
  await assert.rejects(f.pages.icons(Array(7).fill(url)), /six/);
  await assert.rejects(f.pages.icons(['https://example.com/']), /Notion/);
  f.disconnect(); await assert.rejects(f.pages.icons([url]), /Connect the official/);
});

test('Notion list icon metadata is retained independently of the title', () => {
  assert.equal(pageLinks(result([{ title: 'Docs', url, icon: '/icons/copy_lightgray.svg' }])).pages[0].icon, 'https://www.notion.so/icons/copy_lightgray.svg');
  assert.equal(pageLinks(result([{ title: 'Memory', url, icon: '🧠' }])).pages[0].icon, '🧠');
});

test('denied icon fetches do not call the connector or stop navigation', async t => {
  const f = fixture({ respond: request => request.method === 'config/read' ? { result: { config: { apps: { [NOTION_ID]: { tools: { fetch: { enabled: false } } } } } } } : undefined });
  t.after(() => f.pages.close());
  assert.deepEqual(await f.pages.icons([url]), { icons: [], partial: true });
  assert.equal(f.requests.some(r => r.method === 'mcpServer/tool/call'), false);
  assert.equal((await f.pages.list('Docs')).pages[0].title, 'AIOS');
});
