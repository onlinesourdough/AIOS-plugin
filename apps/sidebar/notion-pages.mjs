import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NOTION_ID, notionState, readNotionPlugin, resolveCodexCommand } from './codex-status.mjs';
import { classifyTarget } from './ui-model.mjs';
import { pageIcon, notionPageId, fetchedPageIcon } from './page-icons.mjs';

const serverName = 'codex_apps';
const browseTools = ['notion.notion-list-favorite-pages', 'notion.notion-list-private-pages', 'notion.notion-list-shared-pages'];
const searchTool = 'notion.search';
const allowedTools = new Set([...browseTools, searchTool, 'notion.fetch']);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const unavailable = () => new Error('Could not load Notion pages. Refresh the connection and try again.');

// Only narrow this ephemeral transport. Never write settings or turn a disabled
// connector on. Other local MCP processes are unnecessary for page navigation.
export function transportLimits(config) {
  const limits = { plugins: {}, mcp_servers: {} };
  for (const id of Object.keys(config.plugins || {})) {
    if (!id.startsWith('notion@')) limits.plugins[id] = { enabled: false };
  }
  for (const id of Object.keys(config.mcp_servers || {})) {
    if (id !== serverName) limits.mcp_servers[id] = { enabled: false };
  }
  return limits;
}

export function pageToolAllowed(config, name, annotations) {
  const defaults = config.apps?._default || {}, app = config.apps?.[NOTION_ID] || {};
  if ((app.enabled ?? defaults.enabled) === false) return false;
  const specific = [app.tools?.[name], app.tools?.[name.replace(/^notion\./, '')]].filter(Boolean);
  if (specific.some(tool => tool.enabled === false) || app.default_tools_enabled === false && !specific.some(tool => tool.enabled === true)) return false;
  if (annotations.openWorldHint && (app.open_world_enabled ?? defaults.open_world_enabled) === false) return false;
  const approval = specific.find(tool => tool.approval_mode != null)?.approval_mode ?? app.default_tools_approval_mode ?? defaults.default_tools_approval_mode;
  // An account may demand confirmation even when the app default does not.
  const allowedModes = [null, undefined, 'auto', 'writes', 'approve'];
  return allowedModes.includes(approval) && Object.values(app.links || {}).every(link => allowedModes.includes(link.default_tools_approval_mode));
}

// Only navigation metadata reaches the panel. Source content and credentials
// remain with the official connector; nothing from this catalog is persisted.
function resultData(result) {
  if (result?.isError) throw unavailable();
  let data = result?.structuredContent;
  if (!data) {
    try { data = JSON.parse(result?.content?.find(item => item.type === 'text')?.text); }
    catch { throw unavailable(); }
  }
  if (!record(data)) throw unavailable();
  return data;
}
export function pageLinks(result) {
  const data = resultData(result);
  if (!Array.isArray(data.results)) throw unavailable();
  const pages = new Map();
  for (const item of data.results.slice(0, 200)) {
    if (!record(item) || typeof item.title !== 'string' || typeof item.url !== 'string') continue;
    const route = classifyTarget(item.url);
    if (route?.kind !== 'notion') continue;
    const url = new URL(route.target);
    const id = url.pathname.replace(/-/g, '').match(/[a-f0-9]{32}$/i)?.[0].toLowerCase();
    if (!id) continue;
    const title = item.title.replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, 100) || 'Untitled';
    const path = typeof item.path === 'string' ? item.path.replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, 200) : '';
    pages.set(id, { id, title, target: `${url.origin}${url.pathname}`, ...(path ? { path } : {}), ...(Object.hasOwn(item, 'icon') ? { icon: pageIcon(item.icon) } : {}) });
  }
  return { pages: [...pages.values()], hasMore: Boolean(data.nextCursor || data.next_cursor || data.has_more) };
}

export class NotionPages {
  constructor({ launch = spawn, command = resolveCodexCommand, plugin = readNotionPlugin, timeoutMs = 30000, idleMs = 60000 } = {}) {
    Object.assign(this, { launch, command, plugin, timeoutMs, idleMs });
    this.pending = new Map(); this.sequence = 0; this.users = 0; this.generation = 0;
  }

  async start() {
    if (this.ready) return this.ready;
    const generation = ++this.generation;
    this.ready = this.initialize(generation).catch(async error => { if (generation === this.generation) await this.close(); throw error; });
    return this.ready;
  }

  async initialize(generation) {
    const current = () => { if (generation !== this.generation) throw unavailable(); };
    const executable = await this.command(); current(); this.executable = executable;
    if (await this.plugin({ command: executable }) !== 'enabled') throw new Error('Enable the official Notion plugin in Codex first.');
    current();
    const cwd = await mkdtemp(join(tmpdir(), 'osm-notion-pages-'));
    if (generation !== this.generation) { await rm(cwd, { recursive: true, force: true }); throw unavailable(); }
    this.cwd = cwd;
    const child = this.child = this.launch(this.executable, ['app-server', '--stdio'], { cwd, stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true });
    let buffer = '';
    const fail = () => { if (this.child === child) void this.close(); };
    child.on('error', fail); child.on('exit', fail); child.stdin.on('error', fail); child.stdout.on('error', fail);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      if (this.child !== child) return;
      buffer += chunk;
      if (Buffer.byteLength(buffer) > 16 * 1024 * 1024) return fail();
      let end;
      while ((end = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
        if (!line.trim()) continue;
        let response;
        try { response = JSON.parse(line); } catch { fail(); return; }
        if (!record(response)) { fail(); return; }
        if (response.method && response.id !== undefined) {
          // Never accept approvals, elicitation or authentication on the user's behalf.
          this.send({ id: response.id, error: { code: -32601, message: 'User interaction must be completed in Codex.' } });
          fail(); return;
        }
        const request = this.pending.get(response.id);
        if (!request) continue;
        this.pending.delete(response.id);
        if (response.error) request.reject(unavailable()); else request.resolve(response.result);
      }
    });
    await this.call('initialize', { clientInfo: { name: 'osm-notion-pages', version: '1.0.0' }, capabilities: { experimentalApi: true } });
    current();
    this.send({ method: 'initialized', params: {} });
    const config = (await this.call('config/read', { includeLayers: false, cwd: this.cwd }))?.config;
    current();
    if (!record(config)) throw unavailable();
    // An in-memory transport context, with zero turns: no agent, prompt, history
    // scan, token spend or user-facing chat is started to populate a dropdown.
    const started = await this.call('thread/start', { ephemeral: true, cwd: this.cwd, sandbox: 'read-only', config: transportLimits(config) });
    current();
    if (!started?.thread?.ephemeral || typeof started.thread.id !== 'string') throw unavailable();
    this.threadId = started.thread.id;
    const catalog = await this.call('mcpServerStatus/list', { threadId: this.threadId, serverName, detail: 'toolsAndAuthOnly', limit: 100 });
    current();
    const servers = catalog?.data?.filter(server => server.name === serverName);
    if (servers?.length !== 1 || !record(servers[0].tools)) throw unavailable();
    this.tools = servers[0].tools;
  }

  send(message) { this.child?.stdin.write(JSON.stringify(message) + '\n'); }

  async call(method, params) {
    if (!this.child) throw unavailable();
    const id = ++this.sequence;
    let timer;
    try {
      return await new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(unavailable()), this.timeoutMs);
        this.pending.set(id, { resolve, reject }); this.send({ id, method, params });
      });
    } finally { clearTimeout(timer); this.pending.delete(id); }
  }

  async tool(name, args, config = {}, decode = pageLinks) {
    if (!allowedTools.has(name) || this.tools?.[name]?.annotations?.readOnlyHint !== true || this.tools[name].annotations.destructiveHint === true) throw unavailable();
    if (!pageToolAllowed(config, name, this.tools[name].annotations)) throw new Error('Notion page browsing needs permission in Codex’s Notion tool settings.');
    return decode(await this.call('mcpServer/tool/call', { threadId: this.threadId, server: serverName, tool: name, arguments: args }));
  }

  async connected(operation) {
    if (this.users >= 3) throw new Error('Page search is busy. Try again in a moment.');
    clearTimeout(this.idle); this.users++;
    try {
      await this.start();
      const [apps, plugin, settings] = await Promise.all([this.call('app/installed', { forceRefresh: true }), this.plugin({ command: this.executable }), this.call('config/read', { includeLayers: false, cwd: this.cwd })]);
      if (!record(settings?.config)) throw unavailable();
      const matches = apps?.apps?.filter(app => app.id === NOTION_ID);
      if (plugin !== 'enabled' || matches?.length !== 1 || notionState(matches[0]) !== 'connected') {
        await this.close(); throw new Error('Connect the official Notion plugin in Codex first.');
      }
      return await operation(settings.config);
    } finally {
      this.users--;
      if (!this.users && this.child) { this.idle = setTimeout(() => void this.close(), this.idleMs); this.idle.unref?.(); }
    }
  }

  async list(query = '') {
    if (typeof query !== 'string' || query.length > 160 || /[\x00-\x1f\x7f]/.test(query)) throw new Error('Use a shorter page name.');
    return this.connected(async config => {
      const text = query.trim();
      if (text) {
        const result = await this.tool(searchTool, { query: text, query_type: 'internal', page_size: 30, max_highlight_length: 0 }, config);
        return { ...result, hasMore: result.hasMore || result.pages.length === 30 };
      }
      const available = browseTools.filter(name => this.tools?.[name]);
      const results = await Promise.allSettled(available.map(name => this.tool(name, { limit: 20 }, config)));
      const successful = results.filter(result => result.status === 'fulfilled').map(result => result.value);
      if (!successful.length) throw results.find(result => result.status === 'rejected')?.reason || unavailable();
      const pages = [...new Map(successful.flatMap(result => result.pages).map(page => [page.id, page])).values()];
      return { pages, hasMore: true, partial: successful.length !== available.length };
    });
  }

  async icons(targets) {
    if (!Array.isArray(targets) || !targets.length || targets.length > 6 || targets.some(target => !notionPageId(target))) throw new Error('Choose up to six Notion pages.');
    const unique = [...new Map(targets.map(target => [notionPageId(target), target])).values()];
    return this.connected(async config => {
      const results = await Promise.allSettled(unique.map(target => this.tool('notion.fetch', { id: target }, config,
        result => fetchedPageIcon(resultData(result), target))));
      return { icons: results.flatMap(result => result.status === 'fulfilled' ? [result.value] : []), partial: results.some(result => result.status === 'rejected') };
    });
  }

  async close() {
    ++this.generation;
    clearTimeout(this.idle);
    const child = this.child, cwd = this.cwd;
    this.child = null; this.cwd = null; this.ready = null; this.tools = null; this.threadId = null;
    for (const request of this.pending.values()) request.reject(unavailable());
    this.pending.clear();
    if (child) {
      child.stdin.end(); child.kill();
      const timer = setTimeout(() => { if (child.exitCode === null) child.kill('SIGKILL'); }, 1000); timer.unref();
      child.once('exit', () => clearTimeout(timer));
    }
    if (cwd) await rm(cwd, { recursive: true, force: true }).catch(() => {});
  }
}
