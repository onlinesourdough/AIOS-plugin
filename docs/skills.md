# AIOS skills

AIOS ships 25 native skills. Their titles and Codex display names use
`AIOS:skill-name`: uppercase `AIOS`, a colon without spaces, and lowercase
hyphenated names. The display label omits a redundant leading `aios-` from the
canonical name. Automatic selection uses each skill description; explicit
invocation uses the canonical name and native namespace. Setup replaces the
former `aios-onboard` entrypoint with `aios-setup`; update explicit callers on
adoption. Each
carries an independent quoted `metadata.version`; see
[version maintenance](skill-versioning.md). Repository development methods in
`.agents/skills/` are separate and are not product skills.

| Skill | Responsibility |
| --- | --- |
| [AIOS:clarify](../skills/clarify/SKILL.md) | Explain complex topics and decisions with concrete examples and visuals when they help understanding |
| [AIOS:design](../skills/design/SKILL.md) | Develop a brief into an implementation-ready design, using discovery or exploration when needed |
| [AIOS:review-design](../skills/review-design/SKILL.md) | Review exact design evidence and prepare a stable handoff |
| [AIOS:openpencil-workbench](../skills/openpencil-workbench/SKILL.md) | Use optional OpenPencil tooling with project-local work |
| [AIOS:content](../skills/content/SKILL.md) | Produce and review content with sources, lineage and reuse evidence when needed |
| [AIOS:diffusion-studio](../skills/diffusion-studio/SKILL.md) | Use optional Diffusion Studio for video production |
| [AIOS:human-writing](../skills/human-writing/SKILL.md) | Default prose drafting and editing that preserves facts, uncertainty and the user’s voice |
| [AIOS:write-code](../skills/write-code/SKILL.md) | Quality and proportionate verification whenever writing or changing code, including scripts and automation; shared criteria for read-only code review |
| [AIOS:context](../skills/aios-context/SKILL.md) | Select and maintain the chosen context-home contract; route setup, retrieval and audit to its provider |
| [AIOS:aios](../skills/aios/SKILL.md) | Select relevant context and methods for the current task |
| [AIOS:interview](../skills/aios-interview/SKILL.md) | Explore context, challenge assumptions and find direction when requested or materially needed at the start; no routine interruption of execution |
| [AIOS:build-work](../skills/aios-build-work/SKILL.md) | Implement and verify accepted work through in-scope fixes and Review |
| [AIOS:check](../skills/aios-check/SKILL.md) | Inspect installation, owner format, and discovery |
| [AIOS:create-project](../skills/aios-create-project/SKILL.md) | Establish a useful project workspace, context and simple structure; Git is optional |
| [AIOS:maintain-context](../skills/aios-maintain-context/SKILL.md) | Maintain owner facts, routes, connections, and explicit continuity Sync |
| [AIOS:manage-skills](../skills/aios-manage-skills/SKILL.md) | Manage personal and installed skill lifecycles |
| [AIOS:setup](../skills/aios-setup/SKILL.md) | Set up or move an owner home and native bridge |
| [AIOS:orchestrate-workers](../skills/aios-orchestrate-workers/SKILL.md) | Prepare and recover delegated workers when the caller retains coordination and acceptance |
| [AIOS:risky-changes](../skills/aios-risky-changes/SKILL.md) | Assess consequential changes proportionately |
| [AIOS:review-work](../skills/aios-review-work/SKILL.md) | Inspect the final result against its contract; caller acceptance remains separate for delegated work |
| [AIOS:select-model](../skills/aios-select-model/SKILL.md) | Assess remaining judgment and select model/reasoning for the accepted work; return capability/cost evidence to the shared task decision |
| [AIOS:ship-work](../skills/aios-ship-work/SKILL.md) | Deliver an exactly reviewed result under authority |
| [AIOS:spec-work](../skills/aios-spec-work/SKILL.md) | Resolve a substantive AIOS work contract |
| [AIOS:triage-improvement](../skills/aios-triage-improvement/SKILL.md) | Route a concrete underlying improvement signal |
| [AIOS:update](../skills/aios-update/SKILL.md) | Update selected optional specialists or adopt/roll back AIOS |

Design and content preserve their domain standards through focused references
and helpers. The assistant chains relevant skills using the current task and
its accepted result; no workflow engine or fixed chain schema is required.
Working material stays in the project. Optional tool setup is loaded only for
work that uses that tool.

The [systems and workflow overview](../README.md#agentic-systems-and-skill-chains) connects these entrypoints
by purpose and result. Interview owns adaptive exploration and a shared question
procedure; Setup owns home and harness readiness. Spec reuses interview answers
and owns the execution contract. Neither installation nor a new project alone
requires an interview.

The conditional [Taste source guide](../skills/design/references/taste-sources.md)
links to upstream design/style/image skills and Taste Code's reference catalog.
It adds no installed package or catalog copy. Record the used revision, adapt
selected traits to the task and compare them with the rendered output. The
OpenPencil companion remains optional through its existing workbench route.
Design and Review Design 1.2.1 clarify [available companion selection and a
lightweight reference-led polish pass](../skills/design/references/design-solution.md).
Direction-only work needs no editor; selected editable delivery needs actual
edit preservation, save/reopen and export proof.

Plugin namespaces come from the harness, for example `aios:design`; canonical
skill names remain portable. Personal methods keep their owner's chosen name
and use the existing Manage Skills rename/discovery procedure; no AIOS prefix
is required. They remain separate from the distributed package. Shared Review
already owns contextual principles, voice and visual checks; reuse it where a
personal evaluator adds no distinct requirement.

Write code also applies directly to small code requests. Build invokes it for
any code it authors, and Review uses its criteria without editing. It does not
introduce a second lifecycle or require unit tests for every UI change. See the
[implementation and verification record](write-code.md).

Create Project establishes a workspace for the actual work; Git and a repository
template are optional. Manage Skills owns reusable specialist
methods. Independently maintained solutions keep their local ownership and
ordinary project lifecycle. No mandatory AIOS registration is created.
Update owns native package recovery and selected specialist maintenance;
Maintain Context owns facts, and Check observes state. The
[legacy behavior map](../skills/aios-setup/references/legacy-parity.md) records
older method routes. Domain preservation is documented in the
[design](design-preservation.md) and [content](content-preservation.md) maps.

## Retired: Project Foundation (0.28.0)

`aios-project-foundation` is no longer shipped. For engineering preparation of
a new or existing software project, use the separately usable
[Factory Foundation](https://github.com/arcitai/factory/tree/main/foundation/factory-foundation)
skill directly in Codex or Claude; T3 Code is not required. AIOS has no runtime
dependency on it, does not install it and contains none of its content. Small
coding work stays with Write Code; without a selected foundation method, AIOS
reports the gap. Explicit callers of the old name must be updated. The
[Project Foundation note](project-foundation.md) keeps its history.
