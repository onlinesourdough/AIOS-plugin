# Codex Computer Use

Read only when the requested setup or action materially depends on Computer Use.
Apply the shared [configuration procedure](harness-configuration.md); preserve
existing scoped approvals and never treat plugin availability as broad consent.

Inspect whether the native Computer Use integration/plugin is available and
enabled, then separately inspect allowed applications and browser/site scope.
Plugin enablement does not approve every app or site. Any new persistent or
all-app/all-site approval must be the user's deliberate choice. File/shell access
policy remains a separate layer.

On supported macOS installations the native UI can require Screen Recording
and Accessibility permissions. Inspect System Settings > Privacy & Security and
the app's Computer Use controls using the current
[Computer Use guide](https://learn.chatgpt.com/docs/computer-use). Do not alter
OS permission databases or create a proxy/MCP replacement. Enabling an existing
native integration is an optional harness action, not a new OSM runtime. Verify
the advertised tool and one authorized harmless app interaction before claiming
availability; a configured flag alone is insufficient. If native UI access is
unavailable, return the exact per-machine manual step and continue core OSM.

An explicit native Computer Use denial for an app, including the Codex app, is
an access boundary. Do not bypass it with another automation surface, changed
app identity, OS permissions or app-database/internal-state edits. Distinguish
that denial from an absent UI tool. Use an independently supported native action
only within its own permissions; otherwise leave the affected UI action for the
user with a precise step and later readback. A permitted read-only diagnostic is
not mutation authority.
