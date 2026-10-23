# Pi package and discovery

Use only for authorized Pi package installation, registration or bridge repair.
Apply the shared [native adapter and bridge boundary](adapters.md), read
[Pi configuration](harness-pi.md) only for a requested settings or discovery repair.

The root package.json declares only `pi.skills`, pointing to the same canonical root
`skills/` folders. No extensions or install scripts are provided. Standard
local and Git package routes are:

```sh
pi install /absolute/path/to/OSM-plugin
pi install git:github.com/onlinesourdough/OSM-plugin@REVIEWED_REF
```

Choose one source, not both. Local install references the repository without
copying skill bodies. A Git install is a harness-managed package checkout;
never use it for owner data or development work. Pi may reconcile/reset its
managed Git cache on package update. Dependencies and lifecycle scripts are
absent from this package. Verify `pi list`, package paths, loaded skill names
and a fresh session. Do not manually copy skills into ~/.pi/agent/skills.

For an authorized personal default-home change, use ~/.pi/agent/AGENTS.md; respect a configured agent home. Client setup follows the shared scope rule.
Inspect AGENTS.override.md and any fallback CLAUDE.md plus effective loaded
context. Preserve unrelated content and resolve shadowing as for Codex.
Only patch exact owned keys/array entries if settings require a change; never
rewrite settings.json wholesale or touch authentication stores.

## Preserve existing discovery

Native `pi install` registers the package and exposes its declared skills. No global
skill filter or owner-home registration is required. Keep ambient skills,
other packages, provider choices and trust settings unchanged. Installation in
Pi does not install OSM in Codex, Claude Code or another app.

Use the native `pi config` resource control only for a requested selection or
verified collision. Earlier AIOS guidance recommended excluding ambient global
skills; that is no longer a default. Preserve an existing filter on update
unless its removal is requested or a scoped repair establishes it as obsolete.
Personal skills remain a separate selected owner-method registration.
