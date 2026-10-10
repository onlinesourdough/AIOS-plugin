# Design companion and polish rehearsal — 2026-10-10

Design's authoring reference forced OpenPencil even though its entrypoint already
allowed direction-only work and portable HTML. The 0.28.1 candidate corrects that
contradiction, clarifies implementation-source ownership, and makes the existing
reference-led polish pass concrete in Design/Review Design 1.2.1. These are
compatible corrections, not a new editor capability or skill. Related:
[issue #36](https://github.com/onlinesourdough/AIOS-Plugin/issues/36). This bounded
slice does not close its broader companion/Paper/OpenDesign research gaps.

The accepted contract is the owner's implementation brief in the current task.
Factory Implement supplied execution and review-handoff guidance. AIOS was not
globally installed: lifecycle guidance used the explicitly authorized canonical
source-read fallback. This record is writer evidence; independent review and
release remain with the parent. There was no GitHub mutation or installation of
an AIOS plugin, optional editor or new runtime.

## What changed in the rendered rehearsal

The [baseline](service-before.html) is an original synthetic fixture created and
rendered before its revision in this task. It deliberately includes repeated
microcopy, unequal offers and a cramped privacy note with an inline-link word
join. It is not a reconstructed customer page or evidence of a historical bug.
The footer image loads in both versions; this checks preservation, not a repair
of the reported customer image defect. All text, brands, prices and the local
SVG are original fictional material under this repository's MIT license.

The [direction](DESIGN.md) names preserve/borrow/change and implementation mapping.
The separately branded [reference](reference.html) was inspected at 1120px and
320px; its [desktop capture](reference-1120.png) shows the selected grouping.
The [revision](service-after.html) keeps Alder Field's serif type, forest/cream
roles, navigation, landscape, information and local behavior. It removes repeated
kickers/taglines, gives the fuller offer its own row, and separates section rhythm
from grouping. Form/FAQ tops align without forced equal heights. The privacy
note has readable spacing and an actual space after its link. More room for the
full offer is a deliberate tradeoff, not a claim that shorter pages are better.

Comparable full-scroll captures retain all content, including the footer:

| CSS width / state | Before | After |
| --- | --- | --- |
| 1120px, light, disclosures closed, idle form | [Before](before-1120-light.png) | [After](after-1120-light.png) |
| 1120px, dark, all disclosures open, invalid empty email | [Before](before-1120-dark.png) | [After](after-1120-dark.png) |
| 320px, light, disclosures closed, idle form | [Before](before-320-light.png) | [After](after-320-light.png) |
| 320px, dark, all disclosures open, invalid empty email | [Before](before-320-dark.png) | [After](after-320-dark.png) |

T3 collaborative preview was used after `preview_status` and `preview_open`.
Inspection used 800px-high viewports and full-scroll views. For the uncropped
PNG, viewport width stayed fixed and height was expanded to document height;
the fixture has no viewport-height-dependent CSS. T3 scales screenshot pixels,
so [observations](browser-observations.json) record both CSS width and actual PNG
dimensions. Source hashes bind the captures. This is a selected state matrix,
not every possible combination of theme, input and disclosure.

Observed actions and results:

- Native summary clicks opened all three answers; close then Enter reopened
  the first answer with visible focus. The 320px dark full-scroll inspection
  retained the qualifications, multiline error, privacy note and footer action.
- Empty form submission showed the adjacent error, set `aria-invalid`, and
  focused email. Entering `gardener@example.com` then submitting hid the error
  and showed “Example complete. Nothing was sent or saved.” The
  [valid-input capture](after-valid-input.png) retains that observed result.
- Tab focused the visible skip link; Enter reached `#main`. The primary action
  reached `#contact`; the privacy link reached its disclosure summary. Both
  labels target their controls and the email describes privacy/error IDs.
- Rendered measurements found no horizontal overflow in the captured service
  states. The footer image loaded at intrinsic width 1200 and its SVG request
  returned 200. Visual inspection covered line wrapping and readable overlays.
  These observations are not an accessibility certification.

The [dense counterexample](dense.html) stays dense: status words, shift, work
windows, crew, equipment, access restrictions and dependencies support assignment
decisions. Nothing is hidden in FAQs to imitate a sparse landing page. Inspected
captures: [desktop light](dense-1120-light.png), [desktop dark](dense-1120-dark.png),
[narrow light](dense-320-light.png), [narrow dark](dense-320-dark.png). All retained
their context and reflowed without horizontal overflow. It is a static morning
example, not a dispatch system; no before/after improvement is claimed for it.

## Editable source, export and receiving use

Local editable HTML was sufficient and available through the native task's file
and browser tools. No external editor was required or tested. The writer copied
the baseline, saved an intervening source edit from “Visits by appointment.” to
“Site visit by appointment; no walk-in advice.”, reopened those bytes, then
applied the polish. The final disk read and browser render retained that edit.
This was a synthetic manual-edit simulation by the writer, not a separate human
editor session. [Editable proof](editable-proof.json) records the intermediate
hash, final files, ownership and export hash; the operations and browser actions
above, rather than that manifest alone, supply the proof.

[service-export.zip](service-export.zip) contains editable HTML with inline CSS/JS,
the SVG, direction and linked reference/counterexample. It was written, reopened,
extracted to a fresh task-local directory, and every member compared byte-for-byte
with its source. Native preview then loaded the extracted page on a separate
loopback server: the manual edit, loaded local image and form remained present;
empty and valid submissions produced the same error/local-success transitions.

The project owns the source and the archive is a derivative with no live sync.
`DESIGN.md` maps the companion to its actual CSS tokens, sections, form and
disclosures without copying a second token source. A receiving implementation
must use its existing components and replace fictional business content; a real
submission/privacy flow remains separate work. Direction-only tasks can stop
at semantic direction. A required unavailable editor-native format must remain
an explicit limitation; this HTML export does not pretend to satisfy one.

## Verification and limits

[Check results](checks.json) retain the actual commands and outcomes for the
source candidate based on `a3d90150aeb5b37bdbf4a48787686fa52c0ad6d5`. Use the
candidate commit/tree from the parent's handoff to identify the final record.
The installed Node 22.23.3 built the locked sidebar; 83 tests and its bundled
smoke passed. All 18 existing design resource/helper tests passed. Sidebar
runtime files equal the base after only `0.28.0` → `0.28.1` substitution.
OpenPencil Workbench, Diffusion Studio, design helper code and all test sources
are unchanged. No exact-word or prose-mirroring test was added.

The initial loopback server and npm restore were blocked by the sandbox's socket
and DNS restrictions. Scoped native approvals allowed the loopback servers,
locked dependency restore (scripts disabled; task-local cache), and suites with
local fixture servers. One invalid `about:blank` preview-open argument was fixed
by opening with no URL; native preview then worked. No alternative browser,
permission bypass, global settings change or user-app restart was used.

This is synthetic rendered task and local editable-source proof. It does not
prove real-customer improvement, conversion, model activation, all editor/host
compatibility, installed 0.28.1 discovery, backend behavior or Mac adoption.
The reference has one fixed theme; service and dense fixtures support light/dark.
No motion was added. Preserve the baseline and any intervening edits on recovery;
regenerate affected captures/export only after an actual source revision.
