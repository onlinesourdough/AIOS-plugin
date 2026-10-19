import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveOverview, readOverview, overviewView, LIMITS } from './model-overview.mjs';
import { ownerModel, teamModel, mixedModel, modelTarget } from './model-fixtures.mjs';

const page = n => `https://app.notion.com/p/${String(n).padStart(32, '0')}`;
const titles = overview => overview.groups.map(group => [group.title, group.links.map(link => link.title)]);

test('an owner-shaped model yields its two source groups; policy, evidence, code and quoted links do not', () => {
  const overview = deriveOverview(ownerModel);
  assert.equal(overview.state, 'ready');
  assert.deepEqual(titles(overview), [['Context sources', ['Soul', 'About', 'Memory', 'Skills']], ['Work and outputs', ['Tasks', 'Projects', 'Repository']]]);
  const targets = overview.groups.flatMap(group => group.links.map(link => link.target));
  for (const n of [20, 21, 22, 23, 24, 25]) assert.ok(!targets.includes(page(n)), `prose or quoted link ${n} is not a route`);
  assert.ok(!targets.includes('https://example.com/pricing'));
  assert.equal(overview.partial, false); assert.equal(overview.skipped, 0);
  assert.deepEqual(deriveOverview(ownerModel), overview, 'the same text always gives the same overview');
});

test('other headings, languages and optional team sources work without a fixed heading or owner name', () => {
  const overview = deriveOverview(teamModel);
  assert.equal(overview.state, 'ready');
  assert.deepEqual(titles(overview), [['Personlig', ['Hukommelse', 'Metoder']], ['Team', ['Team hukommelse', 'Team metoder']], ['Leverancer', ['Kunder']]]);
  const repeated = deriveOverview('## Skills\n### Team\n- [A](' + page(1) + ')\n## Memory\n### Team\n- [B](' + page(2) + ')');
  assert.deepEqual(repeated.groups.map(group => group.title), ['Skills › Team', 'Memory › Team']);
});

test('a mixed section or repeated heading is reported for a one-time section choice, not guessed', () => {
  const overview = deriveOverview(mixedModel);
  assert.equal(overview.state, 'ambiguous'); assert.deepEqual(overview.groups, []);
  assert.deepEqual(overview.sections, [{ key: 'Sources', title: 'Sources', links: 1, mixed: true }, { key: 'Team', title: 'Team', links: 1, mixed: false }]);
  const chosen = deriveOverview(mixedModel, { sections: ['Sources'] });
  assert.equal(chosen.state, 'ready');
  assert.deepEqual(titles(chosen), [['Sources', ['Docs']]], 'only the source item of a chosen mixed section is shown');
  const duplicate = deriveOverview(`## Links\n- [A](${page(1)})\n## Links\n- [B](${page(2)})`);
  assert.equal(duplicate.state, 'ambiguous');
});

test('missing structure and removed chosen sections are reported truthfully', () => {
  const none = deriveOverview(`# Model\nRead [Docs](${page(1)}) and [Memory](${page(2)}) when relevant.\n- Keep it short.`);
  assert.equal(none.state, 'unsupported'); assert.deepEqual(none.groups, []);
  const changed = deriveOverview(mixedModel, { sections: ['Sources', 'Archive'] });
  assert.equal(changed.state, 'changed'); assert.deepEqual(changed.missing, ['Archive']);
  assert.deepEqual(titles(changed), [['Sources', ['Docs']]]);
});

test('unsafe or unsupported links are left out and counted; labels are bounded', () => {
  const long = 'x'.repeat(300);
  const overview = deriveOverview(['## Sources', '- [Script](javascript:void)', '- [Plain](http://example.com/a)', '- [Login](https://user:pass@example.com/)',
    '- [Relative](/workspace/page)', `- [${long}](${page(3)})`, `- <mention-page url="${page(4)}"/>`, `- [Copy](${page(3)}?source=copy_link)`].join('\n'));
  assert.equal(overview.state, 'ready');
  assert.equal(overview.skipped, 4);
  assert.deepEqual(overview.groups[0].links.map(link => link.title.length), [LIMITS.label, 'app.notion.com/p/00000000000000000000000000000004'.length]);
  assert.equal(overview.groups[0].links.length, 2, 'a copied URL variant of the same page is not repeated');
});

test('code examples never become navigation, whatever their fence length or kind', () => {
  const longer = ['## Sources', `- [Real](${page(1)})`, '````md', '```', '## Example', `- [Example](${page(2)})`, '```', '````', '## After', `- [After](${page(3)})`].join('\n');
  const mixedKinds = ['## Sources', `- [Real](${page(1)})`, '~~~', '```', `- [Tilde example](${page(4)})`, '~~~', '```js', '~~~', '``` js', `- [Backtick example](${page(5)})`, '```', '## After', `- [After](${page(3)})`].join('\n');
  for (const [name, content] of [['four-backtick block containing three', longer], ['tilde and backtick blocks containing the other kind', mixedKinds]]) {
    const overview = deriveOverview(content);
    const targets = overview.groups.flatMap(group => group.links.map(link => link.target));
    for (const n of [2, 4, 5]) assert.ok(!targets.includes(page(n)), `${name}: example link ${n} is not a route`);
    assert.equal(overview.state, 'ready', name);
    assert.deepEqual(titles(overview), [['Sources', ['Real']], ['After', ['After']]], `${name}: the section after the true closing fence is kept`);
  }
});

test('an indented run inside a code block is example text; a fence indented up to three spaces still closes it', () => {
  const block = inner => ['## Sources', `- [Real](${page(1)})`, '```', inner, `- [Example](${page(2)})`, '```', '## After', `- [After](${page(3)})`].join('\n');
  for (const [name, content] of [['four spaces', block('    ```')], ['a tab', block('\t```')], ['two tabs before a longer run', block('\t\t````')]]) {
    const overview = deriveOverview(content);
    assert.ok(!overview.groups.flatMap(group => group.links.map(link => link.target)).includes(page(2)), `${name}: the example link is not a route`);
    assert.equal(overview.state, 'ready', name);
    assert.deepEqual(titles(overview), [['Sources', ['Real']], ['After', ['After']]], `${name}: the section after the true closing fence is kept`);
  }
  for (const spaces of ['', ' ', '  ', '   ']) {
    const content = ['## Sources', `- [Real](${page(1)})`, '```', `- [Example](${page(2)})`, `${spaces}\`\`\``, '## After', `- [After](${page(3)})`].join('\n');
    assert.deepEqual(titles(deriveOverview(content)), [['Sources', ['Real']], ['After', ['After']]], `a closing fence after ${spaces.length} spaces closes the block`);
  }
  const nested = ['## Sources {toggle="true"}', `\t- [Real](${page(1)})`, '\t```', `\t- [Example](${page(2)})`, '\t```', '## After', `- [After](${page(3)})`].join('\n');
  assert.deepEqual(titles(deriveOverview(nested)), [['Sources', ['Real']], ['After', ['After']]], 'a code block nested in a toggle closes at its own depth');
});

test('oversize text is refused; truncated reads and bounded output are marked partial', () => {
  assert.throws(() => deriveOverview('x'.repeat(LIMITS.content + 1)), /too large/);
  assert.equal(deriveOverview(`<content>\n## Sources\n- [A](${page(1)})`).partial, true, 'a missing closing tag is a partial read');
  const many = Array.from({ length: 30 }, (_, i) => `- [P${i}](${page(100 + i)})`).join('\n');
  const bounded = deriveOverview(`## A\n${many}\n## B\n${many}\n## C\n${many}\n## D\n${many}`);
  assert.equal(bounded.partial, true);
  assert.ok(bounded.groups.every(group => group.links.length <= LIMITS.links));
  assert.ok(bounded.groups.flatMap(group => group.links).length <= LIMITS.total);
});

const stored = (overrides = {}) => ({ version: 1, state: 'ready', model: { identity: 'notion:x', target: modelTarget, title: 'AI Operating Model' }, revision: '2026-10-19T09:00:00.000Z',
  readAt: '2026-10-19T09:01:00.000Z', complete: true, partial: false, selection: null, missing: [], skipped: 0, sections: [], changes: null, ...deriveOverview(ownerModel), ...overrides });
const statusWith = (model, context = { state: 'missing' }, notion = 'connected') => ({ notion: { state: notion }, context, model });

test('snapshots are validated whole; an unsafe stored link rejects the snapshot', () => {
  assert.ok(readOverview(stored()));
  for (const bad of [{ version: 2 }, { state: 'live' }, { readAt: 'yesterday' }, { model: { target: 'https://example.com/model', title: 'M' } },
    { groups: [{ title: 'G', links: [{ title: 'X', target: 'javascript:alert(1)' }] }] }]) assert.equal(readOverview(stored(bad)), null);
});

const linksFrom = (start, size) => Array.from({ length: size }, (_, i) => ({ title: `P${start + i}`, target: page(start + i) }));
const groupsOf = (count, size) => Array.from({ length: count }, (_, g) => ({ title: `G${g}`, links: linksFrom(1000 + g * 100, size) }));
const badLink = { title: '', target: 'javascript:void' };
test('stored snapshots at the output bounds are accepted; any excess or malformed entry rejects them whole', () => {
  const upper = readOverview(stored({ groups: groupsOf(3, 20) }));
  assert.ok(upper); assert.equal(upper.groups.flatMap(group => group.links).length, LIMITS.total); assert.equal(upper.partial, false);
  assert.ok(readOverview(stored({ groups: groupsOf(LIMITS.groups, 5) })), 'twelve groups within the total are accepted');
  for (const [name, overrides] of [
    ['more links in total than allowed', { groups: groupsOf(4, 20) }],
    ['more groups than allowed', { groups: groupsOf(13, 1) }],
    ['more links in one group than allowed', { groups: groupsOf(1, 21) }],
    ['a malformed group after twelve valid ones', { groups: [...groupsOf(12, 1), { title: 'G', links: [badLink] }] }],
    ['a malformed link after twenty valid ones', { groups: [{ title: 'G', links: [...linksFrom(1, 20), badLink] }] }],
    ['an empty group', { groups: [{ title: 'G', links: [] }] }],
    ['links in a snapshot that may hold none', { state: 'no_access', groups: groupsOf(1, 1) }],
    ['too many listed sections', { sections: Array.from({ length: 25 }, (_, i) => ({ key: `S${i}`, title: `S${i}`, links: 1, mixed: false })) }],
    ['a malformed listed section', { sections: [{ key: 'S', title: 'S', links: 1, mixed: false }, 'not a section'] }],
    ['too many chosen sections', { selection: Array.from({ length: 13 }, (_, i) => `S${i}`) }],
    ['a malformed missing section', { missing: ['S', 7] }],
    ['a negative skipped count', { skipped: -1 }],
    ['a malformed change count', { changes: { added: 1, removed: 'two' } }],
  ]) assert.equal(readOverview(stored(overrides)), null, name);
});

test('non-string targets and read times are refused rather than coerced', () => {
  const docs = page(7);
  const accepted = readOverview(stored({ groups: [{ title: 'G', links: [{ title: 'Docs', target: docs }] }] }));
  assert.ok(accepted, 'an ordinary string target is accepted'); assert.equal(accepted.groups[0].links[0].target, docs);
  for (const [name, overrides] of [
    ['a link target in a one-element array', { groups: [{ title: 'G', links: [{ title: 'Docs', target: [docs] }] }] }],
    ['a link target object', { groups: [{ title: 'G', links: [{ title: 'Docs', target: { href: docs } }] }] }],
    ['an overlong link target', { groups: [{ title: 'G', links: [{ title: 'Docs', target: `${docs}?${'x'.repeat(600)}` }] }] }],
    ['a model target in a one-element array', { model: { identity: 'notion:x', target: [modelTarget], title: 'AI Operating Model' } }],
    ['a read time in a one-element array', { readAt: ['2026-10-19T09:01:00.000Z'] }],
    ['a numeric read time', { readAt: 1792400460000 }],
  ]) assert.equal(readOverview(stored(overrides)), null, name);
});

test('connected, read and pointer saved stay separate; disconnection and failed reads hide links', () => {
  const preview = overviewView(statusWith(stored()));
  assert.equal(preview.pointer, 'none'); assert.equal(preview.groups.length, 2); assert.equal(preview.readable, true);
  assert.equal(overviewView(statusWith(stored(), { state: 'configured', target: modelTarget + '?source=copy_link' })).pointer, 'saved');
  assert.equal(overviewView(statusWith(stored(), { state: 'configured', target: '/work/context' })).pointer, 'other');
  assert.equal(overviewView(statusWith(stored(), { state: 'ambiguous' })).pointer, 'blocked');
  const disconnected = overviewView(statusWith(stored(), { state: 'missing' }, 'not_connected'));
  assert.deepEqual(disconnected.groups, []); assert.match(disconnected.notes[0], /not connected/);
  assert.equal(overviewView(statusWith(stored(), { state: 'missing' }, 'unknown')).groups.length, 2, 'an unverified check is not evidence of a change');
  const denied = overviewView(statusWith(stored({ state: 'no_access', groups: [] })));
  assert.equal(denied.readable, false); assert.deepEqual(denied.groups, []); assert.match(denied.notes[0], /could not access/);
  assert.equal(overviewView(statusWith({ state: 'missing' })), null);
  assert.deepEqual(overviewView(statusWith({ state: 'unavailable' })), { unavailable: true });
  for (const view of [preview, disconnected, denied]) assert.ok(!view.notes.some(note => /loaded|ready|enabled/i.test(note)));
});
