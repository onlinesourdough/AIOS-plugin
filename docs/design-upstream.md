# Optional design sources — 0.11.0

> Historical record. AIOS 0.29.0 removed the design, review-design and
> openpencil-workbench skills; see the [changelog](../CHANGELOG.md).

## Accepted outcome

Strengthen reference-led design and review while keeping the upstream examples
with their publishers. Use one conditional source guide rather than copying
Taste skills, catalogs, images or a runtime into the package. Preserve the
existing design / optional OpenPencil / Review design flow and canonical
`DESIGN.md`. Continue from local task and brand evidence when an optional
source is unavailable. Personal skill cleanup remains a separate authorized
owner operation; package installation performs no owner migration.

Compared with `259963f3cf1394aec97446a1d77fcbef329be75a`, design and
review-design advance to 1.1.0, and Manage Skills to 1.0.2. All 23 titles and
Codex display names use `AIOS:skill-name`; the other skills receive patch bumps
for these display changes, preserving canonical names and invocations. The
package remains 23 skills with no runtime dependency or automatic updater. Native plugin
namespaces distinguish package skills; personal methods keep their owner's
chosen identity.

## Source observations

The [conditional guide](https://github.com/onlinesourdough/AIOS-Plugin/blob/a14f2857d8e229e7d3ce2c9beb15b876094e6d85/skills/design/references/taste-sources.md) records
the exact upstream links and licenses inspected on 2026-09-18:

- Taste Skill: `e79ca9ec7e071eb3a3b623c4fb752e853fc3ed58`. Its main v2 skill is
  experimental and excludes dense product UI. Its block schema has no populated
  block library in this tree. Style, image and output variants are alternatives
  selected for a task, not a combined mandatory ruleset.
- Taste Code: `2ef5a0b09b8fb24cde9ee8bf81b6c5617652e674`. The inspected catalog
  has 172 compositions and 316 raster references, including 144 mobile pairs;
  10 compositions are marked reviewed and 162 candidate. The source code is
  Apache-2.0; depicted third-party material needs its own provenance.

Actual Meridian hero desktop/mobile and Nubo desktop pricing references were
inspected. The Meridian views disagree in brand identity, illustrating why
pair metadata cannot replace inspection. AIOS selects references by task fit
and records the accepted adaptation; it does not inherit random selection or
assume catalog status proves quality. The Taste Code runtime was not launched.

## Verification performed

The maintained package, documentation, layout, continuity, skill-version and
context-footprint checks pass. The 18 tests under `tests/design` pass, including
the existing optional workbench checks. The design resource test accepts valid
version metadata rather than requiring the former literal 1.0.0; the package
validator still checks SemVer and transitions against the baseline.
The product allowlist permits the native `agents/openai.yaml` interface file
at the exact location in every shipped skill, keeping other helper-file limits.
Fresh native discovery must verify all 23 display names after installation.

Run the release checks from the repository root:

```sh
python3 tests/validate.py --release-tag v0.11.0 --baseline 259963f3cf1394aec97446a1d77fcbef329be75a
python3 tests/documentation-rehearsal.py
python3 tests/layout-rehearsal.py
python3 tests/continuity-rehearsal.py
python3 tests/skill-version-rehearsal.py
python3 tests/context-footprint.py
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tests/design -p 'test_*.py'
git diff --check
```

One ephemeral read-only Codex 0.154.0 session read the candidate instructions
and mapped six synthetic tasks to actions and required evidence. No production
work, external publishing, image generation or upstream runtime was requested.
The observed responses met the following task constraints:

| Case | Observed decision |
| --- | --- |
| Existing branded interface | Preserve accepted purple/Inter identity, layout, routes and form behavior; improve the requested mobile/focus details. |
| Chosen minimalist direction | Consult the pinned source; inspect and justify a newer revision before changing an accepted selection. |
| Conflicting reference pair | Reconcile logos/actions against the brief, inspect both images and retain media-rights limits despite a reviewed label. |
| Two mobile image concepts | Keep exactly two images and no-code scope, retain the selected OpenPencil companion, and reject an unrelated web-image quota. |
| Offline optional source | Continue the dense operations table from local evidence and report the unavailable inspection. |
| Conflicting GPT recipe | Reject simulated execution claims and mandatory GSAP; require real behavior evidence for motion and reduced motion. |

These are candidate-only instruction-routing observations. They do not measure
a before/after visual improvement, runtime speed, token savings, responsive
behavior, generated image quality or OpenPencil UI operation. The source checks
do not establish those outcomes either. A real design task still needs its
selected rendered and interactive acceptance evidence.

Independent Review must accept the exact delivery tree. Release/tag readback,
installed source/version and fresh native skill discovery are separate delivery
observations under [distribution](distribution.md), not results implied by this
source record. Native adoption in one harness proves nothing about other apps
or replacement of instructions already loaded in an active conversation.
