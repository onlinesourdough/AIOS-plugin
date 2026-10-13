# Design integration preservation

> Historical record. AIOS 0.29.0 removed the design, review-design and
> openpencil-workbench skills; see the [changelog](../CHANGELOG.md).

The design portion of AIOS 0.9.0 preserves the methods from ADS commit
`52322edeb796bfc47e65b0f2561a90305b998557` in three built-in skill folders.
The shared package owns core routing, native manifests and validation.

The result is three skills, each metadata version **1.0.0**. The primary
[design](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/SKILL.md) body is 3,011 UTF-8 bytes. Conditional
references retain specialist detail; shared lifecycle and human-writing remain
the single owners of their existing procedures. These byte counts describe
files, not measured model cost or behavior.

## Responsibility preservation

| ADS source responsibility/resource | New home or deliberate retention |
| --- | --- |
| `agentic-design-system/SKILL.md`: selected context, routing, canonical direction, scope and completion | [design](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/SKILL.md); current task and actual project-local working files, with no mandatory collection, registry or cross-System handoff |
| `design-solution/SKILL.md`: brief, one visual idea, realistic content, hierarchy, responsive/state design, inspectable output | Conditional [authoring reference](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/references/design-solution.md) |
| `review-design/SKILL.md`: job, specificity, voice, composition, states, accessibility, rights, contract, native proof, ownership, correction evidence | [review-design](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/review-design/SKILL.md), read-only judgment with repair returned to the existing writer |
| `audit-design-system/SKILL.md`: accumulated evidence, all selected scope, PASS/FAIL/BLOCKED, recovery/provenance distinctions, no mutation | [audit reference](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/review-design/references/audit.md) plus the portable [audit helper](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/review-design/scripts/audit.py). Historical recovery inspection remains an explicit judgment procedure; no replacement ledger is introduced |
| `openpencil-workbench/SKILL.md`: optional editor, exact release, private working copy, browser/live save/reopen, export boundaries, locale, lifecycle and cleanup | [openpencil-workbench](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/openpencil-workbench/SKILL.md) and its skill-local helper; native editor is external and optional |
| `adaptive-references.md`: owner-first precedence, pointer-only media, direct/discover/explore, six original lenses, bounded discovery, practitioner evidence and rendered confirmation | [source selection](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/references/source-selection.md), without a catalog, route schema or durable selection store |
| `docs/contract.md`, `HANDOFF_TEMPLATE.md`, handoff sections in `validation.md` | One [portable work reference](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/references/portable-work.md) and the binder produced by the handoff helper. Preserve named independent/owner review, exact review hashes, optional companions, provenance/licenses, limitations and separate actual receiver acceptance |
| Canonical `DESIGN.md`, brief/review choices, exact accepted versions and snapshots | Kept in owner/project work data. No folder migration, regeneration of old IDs, copied examples, or promotion of recovered evidence. Same-workspace work needs no binder |
| `docs/SOURCES.md`, `SOURCE_AUDIT.md`, `THIRD_PARTY.md` | Relevant judgment condensed into source selection; historical revisions/reuse decisions below remain provenance, not current adoption approval |
| `docs/ARCHITECTURE.md`, `preservation.md`, `evidence-map.md`, `astra-alignment.md`, workspace/learning and reference indexes | Historical source records remain at the pinned ADS source. Portable ownership/recovery principles are retained; collection layout, branding and old run claims are not product instructions |

## Helpers and execution

| ADS program/tests | Migration decision |
| --- | --- |
| `workspace/engine/designs.mjs` | [paths.mjs](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/scripts/paths.mjs): explicit external directory selection, containment, existing-directory checks, package-data separation and symlink rejection. Slug rules and collection discovery are retired |
| `serve.mjs`, `test_serve.py` | [serve.mjs](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/scripts/serve.mjs); retained loopback-only serving, malformed/escaping URL and symlink denial. Tests execute against an unrelated cwd and external work path with spaces |
| `create-handoff.mjs`, `test_handoff.py`, relevant `handoff_tracer.mjs` scenarios | [create-handoff.mjs](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/scripts/create-handoff.mjs); retained minimum portable snapshot, optional preview/assets/native files and token derivatives, identity/review gates and unavailable-tool fallback. Synthetic tests cover real file/CLI boundaries without the branded tracer fixtures |
| `openpencil-workbench.mjs`, `test_openpencil_workbench.py` | [adopted helper](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/openpencil-workbench/scripts/openpencil-workbench.mjs), with the meaningful fake-daemon tests retained under [tests/design](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/tests/design/test_openpencil.py). The historical customer-artifact hash test is excluded with its assets |
| `audit_design_system.py`, `audit_tracer.py`, `test_audit.py` | A smaller read-only audit of explicit design/snapshot scopes retains stale/missing/contradictory evidence outcomes and all-scope inspection. Portable tests prove no mutation. Repository-shell assertions and mandatory collection/failure/curation state are retired |
| `tracer.py`, `test_tracer.py`, `test_migration.py` | Standalone collection creation, simulated run ledgers, curation and historical collection migrations stay in ADS. Portable execution tests replace the relevant selection, collision, review, snapshot and recovery-preservation cases; no operational database/runtime is recreated |
| `checks.mjs`, `skill-metadata.mjs`, `test_skills.py` | Package/global metadata validation stays with the lead's existing validators. Local [resource tests](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/tests/design/test_resources.py) cover every retained file, metadata, Markdown links, script imports and stale operational roots. Source-selection judgment is retained in prose, not manufactured as automated visual proof |
| `review-social-preview.mjs`, `export-social-banners.mjs` | Branded platform-specific preview/export automation stays in ADS. Selected visual/accessibility proof is retained as adaptable design/review criteria, not copied customer pages, crops or media |

Node 20+ suffices for preview, selection and minimal handoff. Python 3.9+
standard library suffices for the audit. The handoff's selected token exports
require an explicit external `@google/design.md@0.3.0` CLI; no implicit install
or cwd-local module lookup remains. OpenPencil also needs the documented
compatible runtime, `unzip` for VSIX extraction and an available browser. The
copied fake runtime tests prove control mechanics only.

Preservation improvements made during the port:

- Every pre-existing handoff directory is refused, including pending snapshots
  and partial/failed output. Failures retain partial output for inspection.
- New review evidence binds the current brief as well as DESIGN and every
  selected pre-existing companion. Changing constraints cannot reuse a stale
  PASS. New snapshot revision hashes cover the complete included manifest, so
  companion-only changes also get a new revision.
- Existing snapshot identity strings and the `ADS-HANDOFF/1` binder label remain
  interpretable; old snapshots are never rewritten. Historical missing brief
  hashes remain a disclosed audit gap, not a reason to mutate old evidence.
- OpenPencil requires explicit separate external state. Unknown state and
  source/runtime collisions are refused. Externally supplied runtimes are not
  chmodded. `--runtime-root` layout/version checks are distinguished from
  verified VSIX bytes in export evidence.
- Package paths cannot become work data, outputs or editor state. All output
  files are explicitly selected; tests verify the installed package remains
  byte- and mode-identical.

## Source and license disposition

All adopted ADS program/test code and method adaptations retain the source MIT
notice, copyright 2026 onlinesourdough, in each affected skill folder and
`tests/design/LICENSE`. No third-party component library, editor binary, font,
brand, customer design or media collection is redistributed.

| Historical ADS source | Preserved value and boundary |
| --- | --- |
| Google Design.md `@google/design.md@0.3.0` | Portable semantic format and optional lint/CSS/DTCG/Tailwind exports. Source tool remains a separately installed dependency only when selected, with its own license |
| elayadesign/ai-design-skills `1c1e97cb9878e236552c772092dda7adcdddbcb2`; petergyang/no-ai-slop `d30eddb9e04562234f2070b5ee63ca4649d9a05e`; Leonxlnx/taste-skill `e988add20dab0fa97d7a76781c48961c8184288e` | Focused intake, specific copy, composition and states; no copied skill catalog, rigid aesthetic, complexity mandate or universal ban list |
| VoltAgent/awesome-design-md `8147538b4226ae41e2487a9179e3bcc1f68e8554` | Optional variety research only; no brand files/templates copied |
| HeroUI `1d2164e7b9a60221e39501081f0fe4f6c564bccf`; Origin UI→coss `19620ae8cae81e30775f2cde03829326cb4916b2`; ThreeUI `fbc9b3d61b0ef4b2e93b42e4fffa617ca277429b`; DesEngs `634ff685dfee02419d48891baf2f79160f7959b6` | Source-selection judgment retains interaction, editorial and spatial research value while checking identity/license changes, accessibility proof, private entitlement and framework cost. No source is a default or installed claim |
| OpenPencil v0.8.4 `c51d7ed41a96068a09127bbc096fee143fce0b22`; observed upstream `9c810776dab546076a5d9db791a49d9e8048dbd7` | Historical optional-adapter verification, macOS arm64 VSIX checksum and live-save/export boundaries retained in its skill. Upstream MIT notice applies to separately obtained runtime; no binary copied |
| ibelick/ui-skills `9f140de767e6e2d4adc3970eb68d24b3ec896f99`, W3C use-of-color/reflow/motion guidance | Adjacent programmatically associated errors, non-color status, relevant narrow reflow and reduced motion. No vendor package, fixed palette or copied playbook |
| Mood-board guidance, Vercel design.md production accounts, dated practitioner/X signals and VisualWebBench 2024 | Owner-first sources, bounded alternatives, canonical design, actual rendered proof and honest evidence age. These are historical inputs, not current model-performance or accessibility claims |
| Refactoring UI-derived material; historical customer references, AI Hero screenshots, fonts and media | No book taxonomy/passages, customer content, screenshots or assets copied. Prior source provenance remains at the source |

## Verification and remaining acceptance

Run `PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/design -p
'test_*.py' -v`. Set `TMPDIR` to task evidence space when retaining isolated
execution there. Tests use copied read-only installed skill folders, unrelated
cwd, real external data roots and synthetic content. They cover minimal/optional
handoffs, independent/owner identity, stale brief/design/companion hashes,
immutable snapshots, selected derivatives, path/collision denial, loopback HTTP,
audit outcomes and no mutation, and OpenPencil fake-daemon isolation, locale,
CanvasKit aliases, output limits/timeouts, source drift and cleanup.

The suite passes 18 tests. All retained
Markdown links and relative script imports resolve; no retained resource
instructs use of the old System root. Compatibility labels, protocol routes
and source notices are intentional historical identifiers.

No live OpenPencil canvas, native browser download, real Google exporter, visual
artifact review, accessibility conformance, native harness installation or model
behavior was tested. Independent lead Review and integrated routing/manifests/
validators are covered in [integration proof](integration-proof.md).
