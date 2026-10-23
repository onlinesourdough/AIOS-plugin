# Gemini CLI, Cursor and OpenCode

Use the [native adapter boundary](adapters.md) for authorized adoption in one
selected harness. The package has one canonical `skills/` source containing the declared skills. Native installation may materialize a package; OSM adds no copied
instruction tree, loader, wrapper, symlink, hook, executable extension or MCP.
Package registration alone does not configure an owner-home entrypoint or prove
onboarding behavior. Preserve existing skills, settings and owner data.

## Gemini CLI

The root `gemini-extension.json` declares the OSM package identity. Gemini's documented
extension discovery loads `skills/` directly; no manifest skill-path field or
context-file override is needed. See the [extension reference](https://geminicli.com/docs/extensions/reference/)
and [extension management guide](https://geminicli.com/docs/extensions/).

For a new, authorized installation, replace `RELEASE_TAG` with an existing,
reviewed tag or immutable commit containing the manifest; a package version
number alone does not establish that a release tag exists:

```sh
gemini extensions install https://github.com/onlinesourdough/OSM-plugin --ref RELEASE_TAG
gemini extensions list
gemini skills list
```

An already reviewed local package can instead use
`gemini extensions install /absolute/path/to/OSM-plugin`. Read the installed version
and every OSM skill's location, not only its name. If OSM is already registered
or any of its skill names exists elsewhere, reconcile ownership before changing
anything; do not force installation or remove the existing skill.

Native maintenance commands are `gemini extensions update osm` and
`gemini extensions uninstall osm`. Read back registration and discovery after
each action. Update follows the registered source and its native update policy;
it is not a promise to retain an exact release pin. For an exact rollback, use
native uninstall/reinstall of the owned registration at the reviewed earlier
ref, preserving owner data. Do not enable automatic updates for an active task.

For isolated author rehearsals, [Gemini configuration](https://geminicli.com/docs/reference/configuration/)
documents `GEMINI_CLI_HOME`: Gemini creates `.gemini` beneath that root. Set it
to an absolute subdirectory of the authorized `other-fixtures` directory and
run in a separate empty fixture workspace. Keep the operating-system `HOME`
unchanged. A useful no-model sequence is:

```sh
gemini extensions validate /absolute/path/to/reviewed/package
gemini extensions list
gemini skills list
gemini extensions install /absolute/path/to/reviewed/package
gemini extensions list
gemini skills list
gemini extensions update osm
gemini extensions list
gemini skills list
gemini extensions uninstall osm
gemini extensions list
gemini skills list
```

Run every command with the same isolated environment. Require exactly the declared
expected names at the owned installed package paths, compare installed skill
bytes with the reviewed source, and check their removal. An update reporting
"already up to date" proves no version transition. Validation checks do not
prove registration, discovery, skill activation or model behavior.

## Cursor

OSM uses the documented Cursor Plugin format, which requires
`.cursor-plugin/plugin.json`. Its `skills` field references the existing root
`./skills`; there is no Cursor-specific instruction copy. This manifest is
required for that format, not for every format Cursor accepts. Current docs
also support a portable Agent Plugin with root `plugin.json`; that is a distinct
format, not something Gemini's or Codex's manifest implicitly supplies.
See [plugins](https://cursor.com/docs/plugins) and the
[manifest and discovery reference](https://cursor.com/docs/reference/plugins).

The documented installation route is **Customize → select a marketplace plugin
→ Install → choose project or user scope**. OSM must first be available in a
marketplace the user can access. For private distribution, Teams or Enterprise
users can import the repository in Dashboard → Plugins → Add Marketplace →
Import from Repo, review OSM and leave installation optional (Default Off). Do not imply that this candidate is published
or that a private repository is automatically available in the public
marketplace. Local development uses an ordinary package directory at
`~/.cursor/plugins/local/osm`, followed by reload and discovery inspection;
local-import policy and an existing marketplace installation can affect loading.
Neither route authorizes a live installation during an author rehearsal.

The locally installed `cursor-agent` version `2025.10.13-405ee2e` exposes no
plugin command in `--help`. There is no verified CLI install/list/update/uninstall
command for OSM on that binary. Do not substitute `cursor-agent update` (a CLI
upgrade) or invent `cursor-agent plugin install`. No CLI upgrade was performed.
Use native plugin management in a supported Cursor version and verify actual
resource locations before claiming discovery.

The [CLI configuration reference](https://cursor.com/docs/cli/reference/configuration)
documents `CURSOR_CONFIG_DIR`. Use a fixture subdirectory for CLI configuration;
this alone does not establish that the IDE, account-synced plugins or every
plugin resource root is isolated. No desktop or account mutation is part of
this evidence.

## OpenCode

Use native [Agent Skills](https://opencode.ai/docs/skills/). OpenCode's
[plugin interface](https://opencode.ai/docs/plugins/) loads JavaScript/TypeScript
and npm runtime modules; it is not a manifest-only skill package installer.
Do not add OSM to the runtime `plugin` array or create an extension module.

For a reviewed local package, the official [configuration schema](https://opencode.ai/config.json)
supports `skills.paths`. An explicitly authorized, additive configuration change
can reference `/absolute/path/to/OSM-plugin/skills` directly, preserving every existing
path and unrelated setting. This uses the canonical files without copying or
linking. It is native path configuration, not plugin registration, automatic
installation, version management or evidence of discovery on this machine.

Third-party skill installers may write shared `.agents/skills` directories,
even when an agent target is selected. That can expose OSM to other harnesses
or replace existing skill names. This is outside the native, selected-app
installation contract; do not use it as a hidden fallback.

[OpenCode configuration](https://opencode.ai/docs/config/#custom-directory)
documents `OPENCODE_CONFIG_DIR` as an additional configuration directory, not
replacement of every existing source. A safe rehearsal also needs isolated
XDG configuration, data, cache and state roots and an empty fixture workspace.
Keep `HOME` unchanged; account for ambient home-based skill discovery separately.
Do not read/copy credentials, change providers/models, or launch a model to
prove packaging. Native discovery remains a separate check.

## Evidence limits

Official sources were checked on 2026-09-13. Gemini CLI 0.42.0 supplies native
extension and skill controls. The isolated local-source rehearsal passed
installation, 22-skill discovery, installed byte equality, a fixture version
transition, removal and preserved sentinel data/settings. No model call or
live GitHub installation was tested. Cursor CLI 2025.10.13-405ee2e has no plugin command;
its current marketplace/IDE route has not been tested here. OpenCode's native
skill-path configuration is documented, but is not a package installer.
Native registration, discovery and model execution are separate claims.
