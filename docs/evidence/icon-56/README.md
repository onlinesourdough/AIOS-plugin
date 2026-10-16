# Issue #56 icon: before and after

Revision: 2026-10-16

## Centred mark on the global tool (2026-10-16, evening)

Codex was restarted with `687f99a` installed (described below), and the AIOS sidebar
icon was still far darker than the neighbouring Meetings, Security and Code Review
icons. Separately, the owner had asked on the pull request
([comment](https://github.com/onlinesourdough/AIOS-plugin/pull/57#issuecomment-6176947725))
for the filled shape to sit in the centre, linked outward to simple surrounding
nodes. Earlier candidates kept the filled card in a corner.

The candidate has a filled hub circle at the exact centre, linked to four small
outline circles at the corners. `assets/branding/aios-icon.svg` and
`assets/icon.png` use the same geometry.

The installed Meetings 0.8.88 plugin, read as source and installed bytes on the
owner's Mac, sends one unthemed SVG data URI as both its server icon and its global
tool's `icons`. AIOS sent only a server icon, which hosts read after tool icons.
The MCP SDK 1.31 high-level API drops tool icons. The candidate therefore lists its
tools through its own `tools/list` handler, set on the SDK's public low-level
server. The handler adds one icon to `aios_open`, its only new field. The server
icon, which already existed, now carries the same icon: one unthemed SVG, 16x16, setting neutral
grey itself (`#4c4e4a` for light, `#b4b4b4` for dark schemes), as Meetings does.
Each colour has at least 3:1 contrast on its own scheme's backgrounds, selected or
not. Whether this metadata path caused the earlier failures is unknown.

[comparison.html](comparison.html) shows `687f99a`'s server icon and the
candidate's `aios_open` icon, and both packaged PNGs, at 16, 20 and 24 CSS px. Each
cell sets the CSS `color-scheme` of an unmodified `<img>` of emitted or packaged
bytes on an approximate sidebar background. Two columns are assumptions, not
observations: an image that did not receive the dark colour scheme, and a host
that tints the icon as a mask. It is a browser proxy, not a native Codex
screenshot.

![687f99a and the centred candidate at 16, 20 and 24 px on proxy sidebar backgrounds](comparison.png)

[comparison.png](comparison.png) is that page captured by the T3 headless browser
as a 720-pixel-wide image of the 720 CSS px page, one image pixel per CSS pixel, so
the icons appear at their real size.

Inputs: the `tools/list` result and server identity returned over stdio by the
`687f99a` and candidate bundles, and `assets/icon.png` from both.

Whether the installed Codex sidebar shows the centred mark, as readable as its
neighbours in light and dark themes, selected and unselected, is still to be
observed.

## Theme-less adaptive server icon, `687f99a` (2026-10-16)

After an ordinary Codex restart with candidate `6d3e040` installed, the owner saw
the AIOS global sidebar icon almost black on the dark sidebar, beside readable
grey icons for other plugins. The AIOS panel itself looked fine. Which icon
metadata Codex used is not known; the owner's screenshots are kept private.

`6d3e040` sent two server icons, a dark-brown `light` icon first and a cream
`dark` icon second. `687f99a` sent one server icon with no `theme` field, setting
neutral grey through an embedded `prefers-color-scheme` style, with a root
`color="#808080"` fallback. In a browser it was readable in all four states, but
natively it was still too dark, as described above.
[comparison-687f99a.html](comparison-687f99a.html) and its
[capture](comparison-687f99a.png) compare the 0.29.0 release, `6d3e040` and
`687f99a`.

## First candidate (2026-10-13)

[comparison-2026-10-13.html](comparison-2026-10-13.html) and its
[capture](comparison-2026-10-13.png) compare the 0.29.0 release with `6d3e040`.
They used the theme-matched `6d3e040` icons, which looked readable in a browser
but did not predict the native result.
