# Codex desktop entry point

Read only when onboarding or cutover affects New Chat, saved roots, local/cloud
environments or sidebar state. Package installation can pass independently.

The owner home stores data; it need not be the selected app Project. Ordinary
owner chat should work with no selected Project, using the global bridge.
A null selected Project does not prove the active workspace is empty or current.
Inspect composer selection, active workspace roots and the fresh task's actual
cwd separately; reconcile mismatches before declaring routing/cutover PASS.
Inspect the actual New Chat composer selection and relevant saved roots through
available native tools/UI. Do not promise a persistent default unless that
client's supported feature and effective behavior have been verified.
[Native Projects guidance](https://learn.chatgpt.com/docs/projects) distinguishes
chat without a Project from chats within a Project starting at its primary folder;
that does not establish a universal sticky New Chat default or make Quick chat
an equivalent Codex entry point.

Treat the following as distinct relevant surfaces: active workspace selection,
saved roots, local Projects with physical primary/secondary roots and associated
worktree/setup references, cloud environments, and sidebar presentation. A local
root fix does not update a cached/remote cloud environment. Inspect its canonical
identity/status through supported native sources and change it only under exact
authority; cached metadata alone cannot prove current cloud state.

Discover sidebar preferences when they matter: one list, priority order, custom
sections and pins are client-specific choices, not required OSM structure.
Reuse chosen organization and names. Apply authorized supported changes and read
back actual state; do not map a client's display layout into owner-data taxonomy.

Inventory stale saved roots separately from files and task history. Preserve
chosen custom sections, names, active roots and history. Remove only specifically
authorized obsolete shortcuts through a supported native control; never treat
shortcut cleanup as permission to delete Projects, repositories or owner data.
Include associated local environment/worktree setup references in this scoped
inventory. Resolve physical primary/secondary roots; do not deduplicate by label
or assume every displayed Project has an environment configuration. Preserve
valid setup/actions, credential references and dirty worktrees without executing
setup commands or exposing credentials. Correct only authorized stale native
registrations through supported interfaces. Do not edit app databases/internal
state or infer success from a configuration file.

Check whether the required native inspection/action exists before attempting it.
Respect explicit app-control denials through the relevant
[Computer Use boundary](harness-codex-computer-use.md); never route around a
denied app through alternative automation or internal edits. If unavailable,
give one precise guided UI step, then obtain actual readback of its result. Keep
desktop cutover PENDING until verified; installation may PASS independently. Do
not substitute a CLI test or a tool-created projectless task for interaction with
the real New Chat entry point.

Acceptance: open New Chat, observe its selected Project (or no selection), start
an ordinary fresh owner task and verify its actual cwd and owner routing. Also
verify the selected root and local-first behavior of the relevant System/Project
entry points. Record observed client/version, selection and task-root evidence;
navigate away and back to New Chat before claiming the selection persists.
Refresh Settings > Environments > Select a project and verify the list agrees
with retained canonical Projects, without authorized obsolete or dangling
duplicate roots. An unavailable UI leaves that check pending with one targeted
step. A single correct task does not prove a persistent default. Repeat only
when setup or a requested UI repair changes this boundary, not during ordinary
work. This is Codex-specific; Pi has no compulsory sidebar acceptance step.
