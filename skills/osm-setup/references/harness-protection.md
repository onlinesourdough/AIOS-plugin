# Protection and execution coverage

Read only when native permissions, sandbox or an existing pre-execution hook
affects the requested change. Use the shared [configuration procedure](harness-configuration.md).

Instructions guide decisions. Native permissions/sandbox restrict execution;
pre-execution hooks can intercept supported calls. These are separate controls.
Full Access is not isolation for active security tests. This package supplies
no runtime protection hook, denylist or enforcement adapter. The former Global
Skills guard implementation is an archived reference, not a bundled or preferred
active installation.

When an existing hook or permission boundary matters, record the harness/version,
execution host, effective tool coverage, trust state and observed deny/allow
behavior. Use current [Codex hooks](https://learn.chatgpt.com/docs/hooks),
[native permissions](https://learn.chatgpt.com/docs/agent-approvals-security) or
[Pi extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md)
and the installed implementation. Do not infer worker/cloud coverage from a
local setup. Shell matchers do not cover every tool, interpreter, interactive
stdin or extension execution path. Regex can miss obfuscation and block harmless
argument text; it is an accident barrier, not a complete security boundary.

Test missing files, malformed rules, handler errors/timeouts and changed trust
with harmless probes in an authorized isolated fixture. Label whether failure
blocks execution (fail-closed) or permits it (fail-open); never claim protection
from a configured flag alone. If required protection is absent or fails, stop
the affected action. Missing optional protection does not block ordinary OSM.
Do not repair gaps by bypassing hook trust or broadening permissions. A native
trust change needs its own existing authority and supported review flow; do not
edit trust stores. Keep rule/code versions and affected rechecks with their owner,
not a second OSM-managed protection service.
