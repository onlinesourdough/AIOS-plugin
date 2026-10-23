import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, constants } from 'node:fs/promises';
import { delimiter, join } from 'node:path';
import { tmpdir } from 'node:os';

// Use the public app-server protocol, never Codex's auth files or private HTTP APIs.
export const NOTION_ID = 'asdk_app_69c18c28f1188191bf5b8445c4ab0a2e';
export const NOTION_CONNECT_URL = `https://chatgpt.com/apps/notion/${NOTION_ID}`;
export const NOTION_PLUGIN_ID = 'notion@openai-curated-remote';
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function notionPluginState(inventory) {
  if (!Array.isArray(inventory?.installed) || !inventory.installed.every((p) => isRecord(p) && typeof p.pluginId === 'string')) return 'unknown';
  const matches = inventory.installed.filter((p) => p.pluginId === NOTION_PLUGIN_ID);
  if (!matches.length) return 'missing';
  if (matches.length !== 1 || matches[0].installed !== true || typeof matches[0].enabled !== 'boolean') return 'unknown';
  return matches[0].enabled ? 'enabled' : 'disabled';
}

export async function resolveCodexCommand({ path = process.env.PATH || '', platform = process.platform, executable = (p) => access(p, constants.X_OK) } = {}) {
  // Desktop apps may omit Homebrew from PATH even when the CLI is installed.
  // Probe only executable locations, not account/config/auth files; never run a login shell.
  const folders = [...path.split(delimiter).filter(Boolean), ...(platform === 'darwin' ? ['/opt/homebrew/bin', '/usr/local/bin'] : [])];
  for (const folder of [...new Set(folders)]) {
    const candidate = join(folder, platform === 'win32' ? 'codex.exe' : 'codex');
    try { await executable(candidate); return candidate; } catch { /* Try the next executable location. */ }
  }
  return 'codex';
}

export async function readNotionPlugin({ run = promisify(execFile), command = 'codex' } = {}) {
  try {
    const { stdout } = await run(command, ['plugin', 'list', '--json'], { cwd: tmpdir(), timeout: 12000, maxBuffer: 4 * 1024 * 1024, windowsHide: true });
    return notionPluginState(JSON.parse(stdout));
  } catch { return 'unknown'; }
}

export function setupState(plugin, connection) {
  if (plugin === 'missing') return 'not_installed';
  if (plugin === 'disabled') return 'plugin_disabled';
  if (plugin !== 'enabled') return 'unknown';
  return connection;
}

export async function readNotionSetup() {
  const command = await resolveCodexCommand();
  const [plugin, connection] = await Promise.all([readNotionPlugin({ command }), readNotionConnection({ command })]);
  return { ...connection, plugin, connection: connection.state, state: setupState(plugin, connection.state) };
}

export function notionState(app) {
  if (!app) return 'not_connected';
  if (app.enabled === false) return 'disabled';
  if (app.enabled !== true || typeof app.callable !== 'boolean') return 'unknown';
  return app.callable ? 'connected' : 'unavailable';
}

export async function readNotionConnection({ launch = spawn, timeoutMs = 12000, command = 'codex' } = {}) {
  let child;
  let timer;
  try {
    return await new Promise((resolve) => {
      let finished = false;
      let buffer = '';
      let bytes = 0;
      const finish = (state, reason) => {
        if (finished) return;
        finished = true;
        resolve({ state, connectUrl: NOTION_CONNECT_URL, ...(reason ? { reason } : {}) });
      };
      child = launch(command, ['app-server', '--stdio'], {
        // Keep the user's actual account/config. No shell and no auth material in output.
        // Plugin refresh can replace the installed cache directory. A child
        // must not inherit that directory as its configuration reload root.
        cwd: tmpdir(), stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true,
      });
      timer = setTimeout(() => finish('unknown', 'timeout'), timeoutMs);
      child.on('error', (error) => finish('unknown', error.code === 'ENOENT' ? 'cli_missing' : 'cli_error'));
      child.on('exit', () => finish('unknown', 'cli_exited'));
      child.stdin.on('error', () => finish('unknown'));
      child.stdout.on('error', () => finish('unknown'));
      const send = (method, params, id) => child.stdin.write(JSON.stringify({ method, params, ...(id ? { id } : {}) }) + '\n');
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        if (finished) return;
        bytes += Buffer.byteLength(chunk);
        if (bytes > 4 * 1024 * 1024) return finish('unknown');
        buffer += chunk;
        let end;
        while ((end = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 1);
          if (!line.trim()) continue;
          let response;
          try {
            response = JSON.parse(line);
            if (!isRecord(response)) return finish('unknown');
            if (response.id === 1) {
              if (response.error || !isRecord(response.result)) return finish('unknown');
              send('initialized', {});
              send('app/installed', { forceRefresh: true }, 2);
            } else if (response.id === 2) {
              if (response.error || !Array.isArray(response.result?.apps)) return finish('unknown');
              const apps = response.result.apps;
              if (!apps.every((app) => isRecord(app) && typeof app.id === 'string' && app.id.trim()
                && typeof app.enabled === 'boolean' && typeof app.callable === 'boolean')) return finish('unknown');
              const matches = apps.filter((app) => app.id === NOTION_ID);
              if (matches.length > 1) return finish('unknown');
              if (matches.length === 1) return finish(notionState(matches[0]));
              return finish('not_connected');
            }
          } catch { return finish('unknown'); }
          if (finished) break;
        }
      });
      send('initialize', { clientInfo: { name: 'osm-sidebar', version: '1.0' }, capabilities: { experimentalApi: true } }, 1);
    });
  } catch {
    return { state: 'unknown', connectUrl: NOTION_CONNECT_URL };
  } finally {
    clearTimeout(timer);
    if (child && child.exitCode === null) {
      child.stdin.end();
      child.kill();
      const forceStop = setTimeout(() => { if (child.exitCode === null) child.kill('SIGKILL'); }, 1000);
      forceStop.unref();
      child.once('exit', () => clearTimeout(forceStop));
    }
  }
}
