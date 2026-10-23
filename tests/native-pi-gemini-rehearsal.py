"""Opt-in native packaging rehearsal, using disposable Pi and Gemini state.

Uses documented PI_CODING_AGENT_DIR and GEMINI_CLI_HOME; HOME stays unchanged.
No model requests, credentials, real settings edits or executable extensions.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import selectors
import shutil
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]


def hashes(folder):
    return {str(p.relative_to(folder)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in folder.rglob('*') if p.is_file()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('harness', choices=['pi', 'gemini'])
    args = parser.parse_args()
    parent = ROOT.parent / 'portability-research' / 'native-fixtures'
    parent.mkdir(parents=True, exist_ok=True)
    base = Path(tempfile.mkdtemp(prefix=args.harness + '-', dir=parent))
    source, work, config = base / 'source', base / 'work', base / 'config'
    for p in (source, work, config):
        p.mkdir()
    for name in json.loads((ROOT / 'package.json').read_text())['files'] + ['package.json']:
        src, dst = ROOT / name, source / name
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
    expected = {p.parent.name for p in (source / 'skills').glob('*/SKILL.md')}
    assert expected == {p.parent.name for p in (ROOT / 'skills').glob('*/SKILL.md')}
    package_version = json.loads((source / 'package.json').read_text())['version']
    # Adjacent synthetic owner data and another harness remain byte-identical.
    preserved = base / 'preserved'
    (preserved / 'owner').mkdir(parents=True)
    (preserved / 'other-harness').mkdir()
    (preserved / 'owner' / 'AIOS.md').write_text('Synthetic owner data.\n')
    (preserved / 'other-harness' / 'settings.json').write_text('{"fixture":true}\n')
    before = hashes(preserved)
    env = {k: os.environ[k] for k in ('HOME', 'PATH', 'TMPDIR', 'LANG', 'LC_ALL') if k in os.environ}
    env['PI_CODING_AGENT_DIR' if args.harness == 'pi' else 'GEMINI_CLI_HOME'] = str(config)
    settings_root = config if args.harness == 'pi' else config / '.gemini'
    settings_root.mkdir(exist_ok=True)
    sentinel = settings_root / 'skills' / 'fixture-sentinel' / 'SKILL.md'
    sentinel.parent.mkdir(parents=True)
    sentinel.write_text('---\nname: fixture-sentinel\ndescription: Fixture only.\n---\nKeep this skill.\n')
    sentinel_bytes = sentinel.read_bytes()
    settings = settings_root / 'settings.json'
    initial_settings = {'quietStartup': True} if args.harness == 'pi' else {'ui': {'hideBanner': True}}
    settings.write_text(json.dumps(initial_settings) + '\n')
    executable = shutil.which(args.harness)
    assert executable, 'Native CLI unavailable'
    logs = []

    def run(*arguments):
        p = subprocess.run([executable, *map(str, arguments)], cwd=work, env=env,
                           input='y\n' if arguments[:2] in (('extensions', 'install'), ('extensions', 'update')) else '',
                           capture_output=True, text=True, timeout=55)
        logs.append({'arguments': list(map(str, arguments)), 'exit': p.returncode,
                     'stdout': p.stdout, 'stderr': p.stderr})
        (base / 'commands.json').write_text(json.dumps(logs, indent=2) + '\n')
        assert p.returncode == 0, str(arguments) + ': ' + p.stderr[-1600:]
        return p.stdout + p.stderr

    def unchanged():
        assert hashes(preserved) == before, 'Other harness or owner data changed'
        assert sentinel.read_bytes() == sentinel_bytes, 'Unrelated skill changed'
        current = json.loads(settings.read_text())
        assert all(current.get(k) == v for k, v in initial_settings.items()), 'Existing setting changed'
        assert not any((p / n).exists() for p in (config, work, settings_root)
                       for n in ('AIOS.md', 'AIOS_FORMAT', 'AGENTS.md', 'CLAUDE.md')), 'Implicit owner setup'

    def pi_skills():
        p = subprocess.Popen([executable, '--mode', 'rpc', '--no-session', '--offline',
                              '--no-extensions', '--no-approve', '--no-context-files',
                              '--no-prompt-templates'], cwd=work, env=env, stdin=subprocess.PIPE,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        try:
            p.stdin.write('{"id":"discovery","type":"get_commands"}\n')
            p.stdin.flush()
            selection = selectors.DefaultSelector()
            selection.register(p.stdout, selectors.EVENT_READ)
            deadline = time.monotonic() + 35
            while time.monotonic() < deadline:
                for key, _ in selection.select(1):
                    line = key.fileobj.readline()
                    assert line, 'Pi exited without discovery'
                    try:
                        item = json.loads(line)
                    except ValueError:
                        continue
                    if item.get('id') == 'discovery':
                        assert item.get('success'), item
                        commands = [c for c in item['data']['commands'] if c.get('source') == 'skill']
                        (base / f'discovery-{len(logs)}.json').write_text(json.dumps(commands, indent=2))
                        return commands
            raise TimeoutError('Pi discovery')
        finally:
            p.terminate()
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                p.kill()
                p.wait()

    version = run('--version').strip()
    if args.harness == 'pi':
        assert not any(str(source) in c.get('sourceInfo', {}).get('path', '') for c in pi_skills())
        run('install', source, '--no-approve')
        run('list')
        loaded = pi_skills()
        own = [c for c in loaded if str(source / 'skills') in c.get('sourceInfo', {}).get('path', '')]
        assert len(own) == len(expected) and {Path(c['sourceInfo']['path']).parent.name for c in own} == expected
        assert (source / 'docs/osm.md').read_bytes() == (ROOT / 'docs/osm.md').read_bytes()
        assert any('fixture-sentinel' in c.get('sourceInfo', {}).get('path', '') for c in loaded)
        unchanged()
        run('update', '--extension', source, '--no-approve')
        unchanged()
        run('remove', source, '--no-approve')
        assert not any(str(source) in c.get('sourceInfo', {}).get('path', '') for c in pi_skills())
        assert not json.loads(settings.read_text()).get('packages')
        update_proof = 'Native local-source update; no version transition claimed'
    else:
        run('extensions', 'validate', source)
        run('extensions', 'list')
        run('extensions', 'install', source, '--consent')
        listing = run('extensions', 'list')
        assert f'osm ({package_version})' in listing, listing
        discovered = run('skills', 'list')
        cache = settings_root / 'extensions' / 'osm'
        assert hashes(cache / 'skills') == hashes(source / 'skills'), 'Installed bytes differ'
        overview = source / 'docs/osm.md'
        assert (cache / 'docs/osm.md').read_bytes() == overview.read_bytes(), 'Installed documentation differs'
        for name in expected:
            assert str(cache / 'skills' / name / 'SKILL.md') in discovered, 'Undiscovered: ' + name
        assert str(sentinel) in discovered, 'Unrelated skill not discoverable'
        unchanged()
        manifest = source / 'gemini-extension.json'
        data = json.loads(manifest.read_text())
        data['version'] = '99.0.0-rehearsal'
        manifest.write_text(json.dumps(data) + '\n')
        overview.write_text(overview.read_text().replace(f'OSM version: {package_version}\n',
                                                        'OSM version: 99.0.0-rehearsal\n'))
        run('extensions', 'update', 'osm')
        listing = run('extensions', 'list')
        assert '99.0.0-rehearsal' in listing, 'Gemini version transition not observed'
        assert (cache / 'docs/osm.md').read_bytes() == overview.read_bytes(), 'Updated documentation differs'
        update_proof = 'Version transition'
        run('skills', 'list')
        unchanged()
        run('extensions', 'uninstall', 'osm')
        assert 'osm (0.' not in run('extensions', 'list')
        assert str(cache / 'skills') not in run('skills', 'list')
    unchanged()
    print(json.dumps({'harness': args.harness, 'version': version, 'skills': len(expected),
                      'install_discovery_removal_coexistence': 'PASS', 'update': update_proof,
                      'fixture': str(base)}, indent=2))


if __name__ == '__main__':
    main()
