# Harness configuration route

Use during authorized onboarding or a requested machine/configuration move.
OSM needs ordinary file tools and its shared skill bodies. Native memories,
Computer Use, Computer History, extra providers and other plugins are optional
extras, never OSM prerequisites or canonical owner context. Leave an existing
choice unchanged unless the user asks to change it. Do not silently reproduce
another user's unrestricted or always-allow setup for a new client.

Read this shared procedure and exactly the references relevant to the request:

- [protection and execution coverage](harness-protection.md) only when native
  permissions, sandbox or an existing hook affects the requested change;
- [Codex configuration](harness-codex.md) for Codex base settings/instructions;
- [Codex context and Memories](harness-codex-context.md), [Computer Use](harness-codex-computer-use.md)
  or [Computer History](harness-codex-computer-history.md) only when that exact
  optional capability is requested or materially relevant; or
- [Pi configuration](harness-pi.md) for Pi settings and registrations.

For full onboarding, assess only relevant config/profile/overrides, supported
features, privacy choices, tool usability and client entry points. Preserve
intentional off states. For a scoped repair or ordinary resume, inspect only its
affected route. The [desktop adapter](adapter-codex-desktop.md) separately owns
New Chat, saved local Projects, cloud environments and sidebar checks.

## Inspect, patch, verify

1. Identify the running harness/version, active user/config home, selected
   profile, launch overrides, workspace trust and managed restrictions. Read
   current official docs and that installed version's help before selecting a
   key. Relevant read-only help includes `codex --help`, `codex features list
   --help`, `codex doctor --help`, `pi --help` and `pi config --help`. Do not
   invoke auth-print commands or dump entire configuration into a transcript.
2. Inspect only relevant nonsecret configuration and effective instructions.
   Compare configured values with runtime-reported settings, advertised tools
   and actual permissions. A file value, feature flag or installed plugin is
   not proof of a usable capability. Report overridden, unavailable and
   unverified states separately. Preserve the user's existing model/provider.
3. Prepare a small diff naming the supported owned keys or registration entries,
   their current value, intended value and existing authorization. Preserve
   comments, unrelated keys, unknown fields and the rest of each instruction
   file. Back up the affected nonsecret content and its source identity in
   protected local evidence. If a file contains credentials, retain only the
   necessary nonsecret preimages and file hash; do not copy the credentials.
4. Re-read the target before patching. A baseline mismatch or ambiguous override
   stops the write with both versions retained. Apply only the reviewed key or
   marker spans, using the native supported control when the setting is UI-only.
   Never rewrite config.toml/settings.json wholesale or edit opaque app state,
   databases, tokens, keychains, permission stores or provider credentials.
5. Parse/read back the changed config, compare the scoped diff, then verify the
   effective choice in a fresh session. Restore only affected spans still equal
   to the just-written values; preserve later edits on conflict. An identical
   replay is a no-op. Record capability proof independently of config readback.

Classify legacy references before cleanup as active configuration/discovery,
current routes, or historical/recovery text. An old name in an archive is not an
active setting. Preserve history and recovery; change only verified active stale
references in scope. Read-only diagnostic app state may explain disagreement,
but an undocumented JSON key is not a supported writable setting. Use an exact
supported mutation and readback, or retain a precise manual/unavailable gate.

## Return a small baseline checklist

Report per relevant area: preserved or requested change; authoritative config/UI
source; effective state; verified capability or NOT VERIFIED; rollback evidence;
and one manual step if unavailable. Include only relevant approvals/access,
optional capability choices, provider/model, Pi settings and registration
collisions. Never include secrets or personal baseline values in distributable
docs. Unknown optional settings do not block a useful OSM task; an unsafe
requested config write remains held.

Documentation and runtime help checked 2026-09-04. Recheck at installation;
support varies by version, account and machine. This checklist supplies no
runtime scripts, proxy, MCP server or automatic configuration policy.
