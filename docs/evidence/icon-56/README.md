# Issue #56 icon: before and after

Revision: 2026-10-16

## Owner result and repair (2026-10-16)

After an ordinary Codex restart with candidate `6d3e040` installed, the owner saw
the AIOS global sidebar icon almost black on the dark sidebar, beside readable
grey icons for other plugins. The AIOS panel itself looked fine. Which icon
metadata Codex used is not known; the owner's screenshot is kept private.

`6d3e040` sent two server icons, a dark-brown `light` icon first and a cream
`dark` icon second. The repair sends one icon with no `theme` field. Its SVG sets
neutral grey for light (`#4c4e4a`) and dark (`#b4b4b4`) colour schemes through an
embedded `prefers-color-scheme` style. If a host ignores that style, the root
`color="#808080"` fallback applies. Each scheme colour has at least 3:1 contrast
on the backgrounds of its own scheme, selected or not; the fallback has it on
both light and dark backgrounds. The context-hub
geometry and the packaged `assets/icon.png` are unchanged.

[comparison.html](comparison.html) is a self-contained browser page with the
0.29.0 release, `6d3e040` and repaired server icons, and the packaged PNG, at 16,
20 and 24 CSS px. Each cell sets its own CSS `color-scheme` on an approximate
sidebar background: light and dark, unselected and selected. Icons are
unmodified `<img>` elements of emitted or packaged bytes. The one exception is
the row labelled as a counterfactual: it removes the repair's `<style>` element
to show the fallback colour. It is a browser proxy, not a native Codex
screenshot. In the T3 headless browser on 2026-10-16, the repaired icon and its
fallback were visible in all four states; the `6d3e040` first icon nearly
disappeared on both dark backgrounds.

![Release, 6d3e040 and repaired icons at 16, 20 and 24 px on proxy sidebar backgrounds](comparison.png)

[comparison.png](comparison.png) is that page captured by the T3 headless browser at
720 CSS px wide and device scale 1, so the icons appear at their real size.

Inputs: `serverInfo.icons` returned over stdio by the bundled server at
`4f39212` (0.29.0), `6d3e040` and the repair; `assets/icon.png` at `4f39212` and
in the candidate.

Whether the installed Codex sidebar now shows the repaired mark, readable in
light and dark themes, selected and unselected, is still to be observed.

## First candidate (2026-10-13)

[comparison-2026-10-13.html](comparison-2026-10-13.html) and its
[capture](comparison-2026-10-13.png) compare the 0.29.0 release with `6d3e040`.
They used the theme-matched `6d3e040` icons, which looked readable in a browser
but did not predict the native result above.
