"""Reject documentation and release drift without network or native installs."""

import json
from pathlib import Path
import tempfile
import unittest

from package_documentation import SOURCE_PATH, check


class DocumentationTest(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory(prefix="osm-documentation-")
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.overview = self.root / SOURCE_PATH
        self.overview.parent.mkdir()
        self.overview.write_text("# The Onlinesourdough Method\n\nOSM version: 0.10.1\n\nLocal overview.\n")
        (self.root / ".codex-plugin").mkdir()
        (self.root / ".codex-plugin/plugin.json").write_text('{"version":"0.10.1"}')
        self.package = {"version": "0.10.1", "files": [SOURCE_PATH]}
        self.save_package()
        (self.root / "CHANGELOG.md").write_text("# Changelog\n\n## 0.10.1 — 2026-09-13\n")

    def save_package(self):
        (self.root / "package.json").write_text(json.dumps(self.package))

    def test_versioned_local_package_and_release(self):
        check(self.root)
        check(self.root, "v0.10.1")

    def test_missing_package_entry(self):
        self.package["files"] = []
        self.save_package()
        with self.assertRaisesRegex(ValueError, "explicitly included"):
            check(self.root)

    def test_package_drift(self):
        self.package["version"] = "0.9.0"
        self.save_package()
        with self.assertRaisesRegex(ValueError, "package version mismatch"):
            check(self.root)

    def test_overview_drift_missing_and_repeated_labels(self):
        for document in ("# The Onlinesourdough Method\n",
                         "# The Onlinesourdough Method\n\nOSM version: 0.9.0\n",
                         "# The Onlinesourdough Method\n\nOSM version: 0.10.1\nOSM version: 0.10.1\n",
                         "# AIOS\n\nAIOS version: 0.10.1\n"):
            with self.subTest(document=document):
                self.overview.write_text(document)
                with self.assertRaisesRegex(ValueError, "overview version"):
                    check(self.root)

    def test_missing_or_linked_overview(self):
        self.overview.unlink()
        with self.assertRaisesRegex(ValueError, "regular package file"):
            check(self.root)
        self.overview.symlink_to(self.root / "CHANGELOG.md")
        with self.assertRaisesRegex(ValueError, "regular package file"):
            check(self.root)

    def test_wrong_release_tag(self):
        for tag in ("v0.9.0", "0.10.1", "v0.10.1-unreviewed"):
            with self.subTest(tag=tag), self.assertRaisesRegex(ValueError, "Release tag version"):
                check(self.root, tag)

    def test_release_without_matching_notes(self):
        (self.root / "CHANGELOG.md").write_text("# Changelog\n\n## 0.10.10\n")
        with self.assertRaisesRegex(ValueError, "changelog entry"):
            check(self.root, "v0.10.1")


if __name__ == "__main__":
    unittest.main()
