# AIOS skills

AIOS ships 22 native skills. A skill's name appears on four separate surfaces:

| Surface | Example | Changes how you call it? |
| --- | --- | --- |
| Portable `name` in the skill's frontmatter | `aios`, `content` | Yes: it is the canonical name |
| Markdown heading in `SKILL.md` | `AIOS:context-and-methods`, `Content` | No |
| Codex `display_name` in `agents/openai.yaml` | `AIOS:context-and-methods`, `Content` | No |
| Claude plugin-qualified invocation | `/aios:aios`, `/aios:content` | Comes from the plugin namespace and the portable name |

Core AIOS methods use an `AIOS:label` heading and Codex display: uppercase
`AIOS`, a colon without spaces, and a lowercase hyphenated label, usually the
canonical name without a leading `aios-`. The entry skill `aios` is labelled
`AIOS:context-and-methods` because it brings in owner context and chooses AIOS
methods only when a task needs them. Content and Diffusion Studio are domain
methods and keep their own names, `Content` and `Diffusion Studio`, without an
AIOS prefix; while they ship in AIOS, Claude still invokes them through the
plugin namespace, such as `/aios:content`. Automatic selection uses each skill
description; explicit invocation uses the canonical name and native namespace,
which this labelling does not change. Source metadata does not prove what a
given app displays or that an invocation succeeds; that is checked in the app.
Setup replaces the former `aios-onboard` entrypoint with `aios-setup`; update
explicit callers on adoption. Each carries an independent quoted
`metadata.version`; see [version maintenance](skill-versioning.md). Repository
development methods in `.agents/skills/` are separate and are not product skills.

| Skill | Responsibility |
| --- | --- |
| [AIOS:clarify](../skills/clarify/SKILL.md) | Explain complex topics and decisions with concrete examples and visuals when they help understanding |
| [Content](../skills/content/SKILL.md) | Produce and review content with sources, lineage and reuse evidence when needed |
| [Diffusion Studio](../skills/diffusion-studio/SKILL.md) | Use optional Diffusion Studio for video production |
| [AIOS:human-writing](../skills/human-writing/SKILL.md) | Default prose drafting and editing that preserves facts, uncertainty and the user’s voice |
| [AIOS:write-code](../skills/write-code/SKILL.md) | Quality and proportionate verification whenever writing or changing code, including scripts and automation; shared criteria for read-only code review |
| [AIOS:context](../skills/aios-context/SKILL.md) | Select and maintain the chosen context-home contract; route setup, retrieval and audit to its provider |
| [AIOS:context-and-methods](../skills/aios/SKILL.md) (`aios`) | Bring in owner context and choose AIOS methods only when a task needs them; ordinary questions, small edits and independent repository work proceed directly. Example: "Use AIOS to plan this week's client work from my business context." |
| [AIOS:interview](../skills/aios-interview/SKILL.md) | Explore context, challenge assumptions and find direction when requested or materially needed at the start; no routine interruption of execution |
| [AIOS:build-work](../skills/aios-build-work/SKILL.md) | Implement and verify accepted work through in-scope fixes and Review |
| [AIOS:check](../skills/aios-check/SKILL.md) | Inspect installation, discovery, owner format and context-home health without changes |
| [AIOS:create-project](../skills/aios-create-project/SKILL.md) | Establish a useful project workspace, context and simple structure; Git is optional |
| [AIOS:maintain-context](../skills/aios-maintain-context/SKILL.md) | Maintain owner facts, routes, connections, and explicit continuity Sync |
| [AIOS:manage-skills](../skills/aios-manage-skills/SKILL.md) | Manage personal and installed skill lifecycles |
| [AIOS:setup](../skills/aios-setup/SKILL.md) | Set up, resume or move a context home and its host pointer, then prove a useful first task |
| [AIOS:orchestrate-workers](../skills/aios-orchestrate-workers/SKILL.md) | Prepare and recover delegated workers when the caller retains coordination and acceptance |
| [AIOS:risky-changes](../skills/aios-risky-changes/SKILL.md) | Assess consequential changes proportionately |
| [AIOS:review-work](../skills/aios-review-work/SKILL.md) | Inspect the final result against its contract; caller acceptance remains separate for delegated work |
| [AIOS:select-model](../skills/aios-select-model/SKILL.md) | Assess remaining judgment and select model/reasoning for the accepted work; return capability/cost evidence to the shared task decision |
| [AIOS:ship-work](../skills/aios-ship-work/SKILL.md) | Deliver an exactly reviewed result under authority |
| [AIOS:spec-work](../skills/aios-spec-work/SKILL.md) | Resolve a substantive AIOS work contract |
| [AIOS:triage-improvement](../skills/aios-triage-improvement/SKILL.md) | Route a concrete underlying improvement signal |
| [AIOS:update](../skills/aios-update/SKILL.md) | Adopt or roll back a reviewed AIOS package or a selected System; acquiring new skills belongs to Manage Skills |

Content preserves its domain standards through focused references
and helpers. The assistant chains relevant skills using the current task and
its accepted result; no workflow engine or fixed chain schema is required.
Working material stays in the project. Optional tool setup is loaded only for
work that uses that tool.

The [README skill table](../README.md#skills) summarizes these entrypoints by
purpose. Interview owns adaptive exploration and a shared question
procedure; Setup owns home and harness readiness. Spec reuses interview answers
and owns the execution contract. Neither installation nor a new project alone
requires an interview.

AIOS 0.29.0 no longer ships Design, Review Design or OpenPencil Workbench.
For visual work, use an installed design method if the host provides one;
otherwise do the work directly or report the missing method. Existing projects
keep their `DESIGN.md` and `design/` files. Build's
[review handoff](../skills/aios-build-work/references/review-handoff.md) keeps
the before/after rule: compare a real baseline and candidate capture of the
same state, viewport and data.

Plugin namespaces come from the harness, for example `aios:content`; canonical
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
Update owns native package adoption, recovery and selected System maintenance;
Maintain Context owns facts, and Check observes state. The
[legacy behavior map](../skills/aios-setup/references/legacy-parity.md) records
older method routes. Domain preservation is documented in the
[content](content-preservation.md) map; the [design map](design-preservation.md)
is historical for the design skills retired in 0.29.0.

## Retired: Project Foundation (0.28.0)

`aios-project-foundation` is no longer shipped. For engineering preparation of
a new or existing software project, use the separately usable
[Factory Foundation](https://github.com/arcitai/factory/tree/main/foundation/factory-foundation)
skill directly in Codex or Claude; T3 Code is not required. AIOS has no runtime
dependency on it, does not install it and contains none of its content. Small
coding work stays with Write Code; without a selected foundation method, AIOS
reports the gap. Explicit callers of the old name must be updated. The
[Project Foundation note](project-foundation.md) keeps its history.
