---
name: Alder Field synthetic polish
version: "1.0.0"
---

# Direction and implementation handoff

This is an original, non-sensitive rehearsal for the accepted #36 method slice,
not a real business or customer baseline. The task is to simplify the service
page's composition while keeping its identity, information and local behavior.

**Preserve:** Alder Field's serif typography, forest/cream roles, plain linked
navigation, landscape motif, service details and prices, enquiry anchors, form
labels and error/privacy associations. Keep the intervening source edit, “Site
visit by appointment; no walk-in advice.” All names and commercial details are
fictional. Nothing is submitted, saved as customer data or sent to a service.

**Borrow:** the inspected [VOLT reference](reference.html) groups two compact
offers above a fuller offer, uses larger gaps between sections than within a
group, and stacks content in reading order on narrow screens. Those composition
traits fit unequal service descriptions. Its purple/lime palette, sans-serif
identity, arrow mark and heavy rule do not transfer. This is a selected example,
not a two-plus-one template for other pages.

**Change:** remove repeated kickers and taglines, give the full plan room for its
scope and qualifications, and align form/answers at their tops without forcing
equal heights. Improve privacy-note spacing and fix the inline-link word join.
Keep all offer actions and visible qualifications. Existing native disclosures
retain supporting answers; errors remain beside and associated with the field.
The footer keeps the original loaded [landscape](landscape.svg); no new motion.

The editable [HTML source](service-after.html) is canonical implementation for
this fixture: its `:root` and dark-theme override own color tokens, `.offers` and
`.plan` own composition, and the narrow media query owns stacking. This direction
links to those values instead of maintaining a second token table. Map the header,
offer articles, form and details to the receiving project's existing components
when implementing; keep IDs/anchor targets and form associations. There is no
component framework in this fixture and no claim of automatic code conversion.

The selected export is an HTML/CSS/JS source package with its local SVG and this
direction, not an editor-native document. The project owns the editable source;
the export is a derivative copy, with no live sync. An implementation owner must
replace fictional content and separately implement/verify any real submission
and privacy behavior before using it as a live service.

For a contrasting task, [Field dispatch](dense.html) keeps status words, shift,
work windows, access restrictions, equipment and dependencies visible. These
layers support assignment decisions; removing them or hiding them in FAQs would
undermine the job. Reflow the groups at narrow widths without stripping context.

- **Known limitations:** synthetic static HTML only; no backend, actual customer
  decision, native model activation, external editor or cross-host compatibility
  proof. The reference has one fixed theme; the service and dense example support
  light/dark. No motion is present. Independent acceptance belongs to the parent.
