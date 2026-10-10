# Codex sidebar — 0.28.0

The Meetings-inspired layout uses a compact header and three matching sections
of simple rows: Context with Primary and Docs, then Personal/Team for Skills and
Memory. Primary opens the selected context page, shown with its own icon and
title; Docs is supporting documentation, not a second authority. Missing
destinations stay visible with Add. Source actions open their links; no repeated external-arrow icons or
full-width divider bands. Local paths display their location.

New setups show all four numbered sections from the beginning: Notion, Context,
Skills, Memory. Sections are independently revisitable and keep drafts. The first
context save enables Docs; Continue then saves source edits and advances.
Finish opens the dashboard. Existing contexts open there
directly. Settings is a separate drawer with explicit Save and discard handling.
The same interface is exposed through a native settings entrypoint.

Connected Notion selectors show page names, starting with favorites and top-level
private/shared pages. Search finds other accessible pages; results are bounded
and do not claim to enumerate the workspace. Context uses the same searchable
dropdown in setup and Settings. A Settings context change requires confirmation;
its sources remain separate. Optional slots offer None. Add/Edit link remains
available. Page discovery establishes visible navigation metadata, not business
readiness or access to every linked destination.

Selected Notion destinations display their original emoji or built-in icon in
setup, Settings and the dashboard. Icons already supplied by the page listing
are reused. Missing icons are read only for selected destinations, in batches
of at most six, and cached for the current panel until Refresh. Existing saved
maps work without a migration or a navigation write. The official fetch tool
returns a page/database response; AIOS checks its identity, extracts only the
icon metadata and discards the rest before returning to the UI. AIOS does not
persist these responses; the Codex host owns its own logging. Opening a connected
panel can start the temporary transport for this read, even without a page search. Search results
are not individually fetched. Unsupported custom/uploaded icons and failed
icon reads retain a usable text label; no arbitrary external image host is loaded.
Icon failure does not affect the connection badge or saved source choices.

A chat-bubble button beside Settings, in setup and on the dashboard, opens the
AIOS GitHub repository through the host link route. A failed open shows a
message with the link; clicking again retries. There is no feedback form, draft,
email or sending from the panel.
Settings groups Docs under Context and notes that a context switch applies
immediately while source changes apply with Save. It omits the repeated visible
Optional labels; None still clears a slot. Spacing rather than divider lines
separates the Settings header and actions.

The lower-left footer shows only onlinesourdough in Geist Pixel Square. The font is
embedded in the packaged HTML with its SIL Open Font License in the notices;
body text and controls continue to use the Codex theme.

## Boundaries

The official Notion plugin/account stays separate. Native CLI inventory and
public app/installed metadata determine installation, enablement and connection.
Unknown is not Connected; Connected does not prove page access. Refresh checks
that metadata. AIOS has no Notion server, credential store or custom OAuth.

AIOS MCP serves this panel and stores only navigation labels/links. Its app-only
page picker calls an allowlist of read-only Notion tools through the documented
Codex app-server protocol. It creates one temporary in-memory transport context,
never a model turn or persisted conversation, and closes it after a minute idle.
CLI helpers use stable temporary directories: Codex may replace an installed
plugin cache while reloading configuration.
The ephemeral context disables unrelated configured local MCPs/plugins without
changing installed settings. Each request checks current plugin/account availability
and effective Notion tool restrictions. Required confirmation stays in Codex;
the picker cannot grant it. Searches coalesce while a prior request is running,
and a timed-out read does not cancel other successful reads. It never reads credentials,
accepts approvals or uses private HTTP APIs. Only page names, identities, icons, paths and
links reach the UI; result bodies/highlights are excluded. Company knowledge, personal/team methods, Memory and Spaces
stay in their chosen home. The panel displays destinations, not live records or
counts. Source entry does not create a workspace or establish business readiness.

Explicit Setup handles a new or messy workspace, verifies sources through its
existing connector and registers personal navigation using Context's dashboard
procedure. A client task does not alter the consultant's personal default. Source
maintenance updates navigation only during an authorized route change; no sync
job is introduced. Context remains provider-agnostic and retrieves only needed data.

## Runtime and storage

Codex runs the packaged Node.js 22+ stdio server. Page selection requires Codex
CLI 0.161.0+ supporting the documented direct MCP tool call. No consumer npm, Docker, hosted
service or telemetry. The UI may load built-in icons from www.notion.so; no
external font service is used. Source: apps/sidebar. Locked bundles:
runtime/sidebar. Resource: ui://aios/home-v5. Tools:

- aios_open: read-only global app entry; status and links are UI metadata.
- aios_status: app-only read-only refresh.
- aios_notion_icons: app-only bounded icon reads for selected destinations.
- aios_notion_pages: app-only bounded read-only navigation listing/search; UI metadata only.
- aios_settings: app-only native settings entry, opening the same drawer.
- aios_save_context: app-only owned AGENTS pointer save.
- aios_sources: explicit model read of the context and navigation with revisions.
- aios_save_sources: app/model navigation replacement, scoped to current context.

The short pointer lives in CODEX_HOME/AGENTS.md. Installing AIOS alone does not
choose a context. Saving the primary Context during setup, or confirming a
Context switch in Settings, automatically writes its managed AIOS block there,
keeping unrelated instructions; normal setup needs no manual copy. A fresh chat
verifies that Codex discovers the instructions; Notion connection and page
access still need their own check. Pointer saves keep unrelated
bytes and custom rules, back up prior bytes, and reject ambiguous blocks,
symlinks, oversized files and detected edits. Unchanged saves make no write.

Navigation is private state at CODEX_HOME/aios/panel/<identity-hash>.json. It
contains a context title and up to five roles: docs, personalSkills, teamSkills,
memory and teamMemory. The existing memory key remains the default/personal
source. A team slot is optional; labels imply no permissions and create no
remote databases. The actual context guide owns which sources apply to a task.

Notion identity normalizes copied URL variants; other providers use their exact
location. A changed context loads its own map, never the previous one's sources.
No source bodies, credentials, policy or access claims are stored. The map is
not preloaded as agent context or used as a second source of business truth.

Writes use bounded reads, file identity checks, per-map locking, context/source
revisions, backups and atomic rename. Invalid or symlinked state fails closed.
Pointer and source saves remain separate durable steps. Failed later writes
preserve earlier success; stale drafts cannot silently adopt refreshed revisions.
Restoring a context pointer loads an existing map before allowing replacement.

## Verification and recovery

Run the locked build, Node tests and bundled stdio smoke, package checks and
repository rehearsals. Browser proof covers initial setup, revisiting sections,
source pickers, optional slots, settings Save/discard, failed saves, retry,
keyboard/focus, light/dark and 320px. GitHub button proof covers its
presence in setup and dashboard, the exact repository link, and a failed open
with a visible retryable message. Synthetic host results are distinct from
native installed-runtime adoption and do not prove new-account OAuth.

Page-picker proof includes a real read-only Notion listing and AIOS search via
Codex 0.161.0, zero-turn transport inspection, title/URL validation, disabled
connection, prompt rejection, timeout cleanup, stale searches and explicit
context-switch confirmation. Test fixtures use invented page identities. The
live preview reads actual page metadata only when requested; its pointer and
source saves remain isolated in a temporary home.

Pilot verification covers a standard connected account and normal shutdown.
Enterprise-managed policies, abrupt process termination and every Codex approval
mode have not been exercised. Codex can briefly start native helper processes;
the panel does not promise a process-free lookup.

The loopback fixture uses temporary isolated Codex homes. /setup is fresh setup,
/ is a sample dashboard, /settings opens the sample settings and /test exposes
labelled scenario/theme/error controls. Setup and dashboard are separate fixtures;
refreshing either does not alter real instructions or company sources. Source-link
open requests are recorded, not sent to fictional destinations.
Opt in to actual read-only Notion page browsing with
`AIOS_PREVIEW_LIVE_NOTION=1 npm run preview --prefix apps/sidebar`. Its visible
label distinguishes live Notion from sample data. No preview writes to Notion
or to the owner's Codex instructions.

Rollback with the supported plugin manager to an earlier reviewed tag; keep
Notion and its sources. Clear a selected teamMemory navigation slot before a
0.24 downgrade: older validation rejects this unknown role. Alternatively restore
a reviewed earlier map, preserving any later edits. Pointer backups are under
CODEX_HOME/backups/aios-context; map backups sit alongside the JSON file as
<file>.<revision>.bak. Prove a crashed writer stopped before removing its lock.
An already-open Codex panel may require an app reopen to load the new runtime.
