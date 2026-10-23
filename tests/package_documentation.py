"""Validate bundled documentation and a proposed release against the package."""

import json
import re


SOURCE_PATH = "docs/osm.md"


def check(root, release_tag=None):
    package = json.loads((root / "package.json").read_text())
    version = json.loads((root / ".codex-plugin/plugin.json").read_text())["version"]
    if package["version"] != version:
        raise ValueError("OSM package version mismatch.")
    if SOURCE_PATH not in package["files"]:
        raise ValueError("Local overview must be explicitly included in the native package.")
    overview = root / SOURCE_PATH
    if not overview.is_file() or overview.is_symlink() or overview.parent.is_symlink():
        raise ValueError("Local overview must be a regular package file.")
    text = overview.read_text()
    labels = re.findall(r"^OSM version: (.+)$", text, re.M)
    if labels != [version] or not text.startswith(f"# The Onlinesourdough Method\n\nOSM version: {version}\n"):
        raise ValueError("Local overview version must match the OSM package version.")
    if release_tag is not None:
        if release_tag != f"v{version}":
            raise ValueError("Release tag version must match the OSM package version.")
        changelog = (root / "CHANGELOG.md").read_text()
        if not re.search(rf"^## {re.escape(version)}(?: — [^\n]+)?$", changelog, re.M):
            raise ValueError("Release requires a matching changelog entry.")
