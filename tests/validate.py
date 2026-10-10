"""Fast source checks for the instruction package; no runtime or model claims."""

from pathlib import Path
import argparse
from skill_metadata import parse_frontmatter, skill_version, validate_baseline
from native_manifests import validate_native
import json
import re
import shutil
import struct
import tempfile
from package_documentation import check as validate_documentation


ROOT = Path(__file__).resolve().parents[1]
SKILL_NAMES = {
    "aios", "aios-build-work", "aios-check", "aios-create-project",
    "aios-maintain-context", "aios-manage-skills",
    "aios-setup", "aios-context", "aios-interview", "aios-orchestrate-workers", "aios-review-work",
    "aios-risky-changes", "aios-ship-work", "aios-spec-work", "aios-triage-improvement",
    "aios-update", "aios-select-model", "human-writing", "write-code",
    "design", "review-design", "openpencil-workbench", "content", "diffusion-studio", "clarify",
}
LEGACY_ROUTE_TARGETS = {
    "aios": ("../../aios/SKILL.md", "../SKILL.md", "../../aios-check/SKILL.md",
             "../../aios-maintain-context/SKILL.md", "../../aios-update/SKILL.md"),
    "aios-build-work": ("../../aios-build-work/SKILL.md",),
    "aios-create-project": ("../../aios-create-project/SKILL.md",),
    "aios-create-system": ("../../aios-manage-skills/SKILL.md",
                           "../../aios-create-project/SKILL.md"),
    "aios-evaluate-completeness": ("../../aios-review-work/SKILL.md",
                                   "../../aios-review-work/references/completeness.md"),
    "aios-evaluate-publish-safety": ("../../aios-ship-work/SKILL.md",
                                     "../../aios-ship-work/references/publish-safety.md"),
    "aios-evaluate-spec-work": ("../../aios-spec-work/SKILL.md",
                                "../../aios-spec-work/references/readiness.md"),
    "aios-onboard": ("../SKILL.md",),
    "aios-review-work": ("../../aios-review-work/SKILL.md",),
    "aios-route-agentic-content-system": ("../../aios/SKILL.md",
                                           "../../aios/references/routing.md"),
    "aios-route-agentic-design-system": ("../../aios/SKILL.md",
                                          "../../aios/references/routing.md"),
    "aios-route-business-constraint": ("../../aios/SKILL.md",
                                       "../../aios/references/routing.md"),
    "aios-ship-work": ("../../aios-ship-work/SKILL.md",),
    "aios-spec-work": ("../../aios-spec-work/SKILL.md",),
    "aios-sync": ("../../aios-maintain-context/SKILL.md",
                  "../../aios-maintain-context/references/sync.md"),
    "aios-triage-improvement": ("../../aios-triage-improvement/SKILL.md",),
    "aios-update": ("../../aios-update/SKILL.md", "migration.md"),
}
LEGACY_EXTERNAL_TARGETS = {
    "clarify": "](../../clarify/SKILL.md)",
    "manage-skills": "](../../aios-manage-skills/SKILL.md)",
    "orchestrate-workers": "](../../aios-orchestrate-workers/SKILL.md)",
    "route-models": "historical change `8b81375`",
    "shape-offer": "Retained in the public Global Skills archive",
}
# Core routes methods; domain details stay in the selected domain skill.
FORBIDDEN_BOUNDARY_TEXT = {
    "skills/aios/references/routing.md": (
        "ACS", "OpenPencil", "DESIGN.md", "HANDOFF.md", ".op",
    ),
    "skills/aios-create-project/SKILL.md": (
        "scripts/create-project.sh", "--in-place", "--source-url", "--source-sha",
    ),
    "skills/aios-manage-skills/SKILL.md": ("skills.sh", "npx skills"),
}
FORBIDDEN_SHIPPED_PATTERNS = (r"\bnpx skills\b", r"\bskills\.sh\b")
DOMAIN_SKILLS = {"design", "review-design", "openpencil-workbench", "content", "diffusion-studio"}
PRODUCT_PATHS = (".codex-plugin", ".claude-plugin", ".cursor-plugin",
                 "gemini-extension.json", "skills", "assets/icon.png", "LICENSE",
                 "docs/aios.md", "runtime/sidebar")
FORBIDDEN_KEYS = {"scripts", "dependencies", "devDependencies", "peerDependencies"}
SECRET_PATTERNS = (
    r"AKIA[0-9A-Z]{16}",
    r"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----",
    r"gh[pousr]_[A-Za-z0-9_]{30,}",
    r"sk-[A-Za-z0-9_-]{20,}",
    r"xox[baprs]-[A-Za-z0-9-]{10,}",
)


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def frontmatter(path):
    try:
        return parse_frontmatter(path.read_text())
    except AssertionError as error:
        raise AssertionError(f"frontmatter: {path}: {error}") from error


def link_targets(path, boundary=None):
    for target in re.findall(r"\[[^\]]*\]\(([^)]+)\)", path.read_text()):
        if re.match(r"[a-z]+:", target) or target.startswith("#"):
            continue
        resolved = (path.parent / target.split("#", 1)[0]).resolve()
        if boundary:
            require(resolved.is_relative_to(boundary.resolve()),
                    f"product link escapes package: {path} -> {target}")
        require(resolved.exists(), f"broken link: {path} -> {target}")
        yield resolved


def copy_product(root, destination):
    for relative in PRODUCT_PATHS:
        source = root / relative
        require(source.exists() and not source.is_symlink(), f"product path: {relative}")
        target = destination / relative
        if source.is_dir():
            shutil.copytree(source, target)
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)


def validate(root=ROOT, release_tag=None):
    validate_native(root, require)
    try:
        validate_documentation(root, release_tag)
    except ValueError as error:
        raise AssertionError(str(error)) from error
    manifest = json.loads((root / ".codex-plugin/plugin.json").read_text())
    package = json.loads((root / "package.json").read_text())
    marketplace = json.loads((root / ".agents/plugins/marketplace.json").read_text())

    require(manifest["name"] == package["name"] == "aios", "package identity")
    require(manifest["version"] == package["version"], "version mismatch")
    require(re.fullmatch(r"\d+\.\d+\.\d+", manifest["version"]), "invalid version")
    require(not (FORBIDDEN_KEYS & package.keys()), "consumer script or dependency")
    require(set(package["files"]) == set(PRODUCT_PATHS) | {"README.md"},
            "package inventory")
    require(set(package["pi"]) == {"skills"} and len(package["pi"]["skills"]) == 1,
            "Pi declaration")
    require('hooks' not in manifest, "unexpected plugin hooks")

    skill_root = (root / manifest["skills"]).resolve()
    require(skill_root == (root / package["pi"]["skills"][0]).resolve(),
            "Codex and Pi use different skill sources")
    require(skill_root == (root / "skills").resolve(), "noncanonical skill root")

    entry = marketplace["plugins"]
    require(len(entry) == 1, "marketplace entry count")
    entry = entry[0]
    require(entry["name"] == "aios", "marketplace identity")
    require((root / entry["source"]["path"]).resolve() == root.resolve(),
            "marketplace source")
    require(entry["policy"] == {"installation": "AVAILABLE", "authentication": "ON_INSTALL"},
            "marketplace policy")

    skill_files = sorted(skill_root.glob("*/SKILL.md"))
    require({path.parent.name for path in skill_files} == SKILL_NAMES, "skill inventory")

    # Product development consumes the shared skills too. No local aliases,
    # wrappers or copied bodies may silently become a second discovery source.
    local_skills = list((root / ".agents/skills").rglob("SKILL.md"))
    for local in local_skills:
        require(local.parent.name not in SKILL_NAMES and
                not re.fullmatch(r"(?:spec|build|review|ship|audit)-(?:project|solution)|choose-technology",
                                 local.parent.name),
                "duplicate generic repository skill payload")
    for caller in (root / "AGENTS.md", root / "README.md"):
        require(not re.search(r"\.agents/skills/(?:spec|build|review|ship|audit)-(?:project|solution)/|"
                              r"\.agents/skills/choose-technology/", caller.read_text()),
                "removed local phase caller")
    skill_fields = {}
    for path in skill_files:
        fields = frontmatter(path)
        skill_fields[path.parent.name] = fields
        try:
            skill_version(fields)
        except AssertionError as error:
            raise AssertionError(f"skill version: {path}: {error}") from error
        require(fields.get("name") == path.parent.name, f"skill name: {path}")
        require(0 < len(fields.get("description", "")) <= 1024,
                f"skill description: {path}")
        require("disable-model-invocation" not in fields, f"implicit invocation: {path}")

    primary_targets = set(link_targets(skill_root / "aios/SKILL.md"))
    for name in ("design", "content", "human-writing", "write-code", "aios-interview", "aios-setup"):
        require((skill_root / name / "SKILL.md").resolve() in primary_targets,
                f"built-in method route missing: {name}")
    for caller in ("aios-build-work", "aios-review-work"):
        require((skill_root / "write-code/SKILL.md").resolve() in
                set(link_targets(skill_root / caller / "SKILL.md")),
                f"shared code-quality route missing: {caller}")
    creation_targets = set(link_targets(skill_root / "aios-create-project/SKILL.md"))
    seed_reference = skill_root / "aios-create-project/references/repository-seed.md"
    require(seed_reference.resolve() in creation_targets,
            "optional repository-seed route missing")
    # Engineering foundation is a separately selected external method; AIOS
    # must not reintroduce a bundled engineering contract under any name.
    require(not (skill_root / "aios-project-foundation").exists(),
            "retired engineering-foundation skill shipped")
    # Spec owns contract preparation; tracking is one linked shared owner.
    # Native decisions require the independent behavioral probes, not wording tests.
    spec_targets = set(link_targets(skill_root / "aios-spec-work/SKILL.md"))
    for target in ("aios/references/lifecycle.md", "aios-spec-work/references/readiness.md",
                   "aios-build-work/SKILL.md"):
        require((skill_root / target).resolve() in spec_targets,
                f"Spec contract route missing: {target}")
    risky_changes = (skill_root / "aios-risky-changes/SKILL.md").read_text()
    spec_work = (skill_root / "aios-spec-work/SKILL.md").read_text()
    review_work = (skill_root / "aios-review-work/SKILL.md").read_text()
    require(skill_fields["aios-risky-changes"]["description"].startswith("Assess ") and
            "not routine edits or lifecycle management" in risky_changes and
            "Name the material real-world assumptions" in risky_changes and
            "proportional baseline or check" in risky_changes and
            "safe recovery or stop path" in risky_changes and
            "unit test alone as representative proof" in risky_changes and
            "Compare the same representative pre- and post-change" in risky_changes and
            "residual unknowns" in risky_changes and
            "does not create a lifecycle, goal, worker" in risky_changes,
            "risky-change owner boundary")
    require("[Risky Changes](../aios-risky-changes/SKILL.md)" in spec_work and
            "Routine edits do not select it." in spec_work and
            "[Risky Changes](../aios-risky-changes/SKILL.md)" in review_work and
            "Review still owns acceptance and does not gain Ship authority" in review_work,
            "risky-change caller routing")
    primary = (skill_root / "aios/SKILL.md").read_text()
    lifecycle = (skill_root / "aios/references/lifecycle.md").read_text()
    require("persistent-goal request boundary" in primary and
            re.search(r"If activation requires an explicit request and none\s+exists", lifecycle) and
            re.search(r"do\s+not silently substitute a note", lifecycle) and
            re.search(r"genuinely\s+has no native goal controls", lifecycle) and
            "The lead's default model remains the user's configured choice." in lifecycle,
            "native goal request boundary")
    recovery = (skill_root / "aios/references/recovery.md").read_text()
    require("## Native-state deadlock" in recovery and
            "standing owner fallback policy" in recovery and
            "native resumption\nis unavailable" in recovery and
            "same truthful logical contract, session, worker and concise todo" in recovery and
            "not a claim that the native goal was reactivated" in recovery and
            "Do not hunt for a different worker session, delete a worker goal" in recovery and
            "unresolved external, user-action or security blocker still stops" in recovery and
            "explicitly requires native-only continuation" in recovery,
            "native-state deadlock")
    workflow_scenarios = (skill_root / "aios-check/references/workflow-scenarios.md").read_text()
    require("| Native-state deadlock |" in workflow_scenarios and
            "| Native-only continuation |" in workflow_scenarios and
            "| No native task list |" in workflow_scenarios and
            "without hunting a session, deleting, reactivating, replacing or duplicating a goal or worker" in workflow_scenarios and
            "[native tracking SOP](../aios/references/lifecycle.md)" in spec_work and
            "[native tracking SOP](../aios/references/lifecycle.md)" in review_work,
            "native-state deadlock scenario")
    require("| Routine risky-change boundary |" in workflow_scenarios and
            "do not load Risky Changes or create a lifecycle, goal, worker, or extra test suite" in workflow_scenarios,
            "routine risky-change negative route")
    onboard = (skill_root / "aios-setup/SKILL.md").read_text()
    manage_skills = (skill_root / "aios-manage-skills/SKILL.md").read_text()
    require("[Manage Skills](../aios-manage-skills/SKILL.md)" in onboard and
            re.search(r"normal setup does not\s+depend on an optional guard implementation", onboard, re.I) and
            "setup-guardrails" in manage_skills and
            "[protection coverage](../aios-setup/references/harness-protection.md)" in manage_skills and
            "archived, not a preferred active installation" in manage_skills and
            "setup-agent-guardrails" not in manage_skills and
            "not an AIOS prerequisite or package dependency" in manage_skills and
            all(term in manage_skills for term in ("source identity", "installation state",
                                                   "trust/configuration state", "native-active observation")) and
            "| Optional autonomous-use guardrails |" in workflow_scenarios and
            "setup-guardrails" not in SKILL_NAMES,
            "optional guardrails route boundary")
    orchestrate = (skill_root / "aios-orchestrate-workers/SKILL.md").read_text()
    # Ownership and portability invariants; behavior needs independent model rehearsal.
    selection = skill_root / "aios-select-model/SKILL.md"
    for caller in ("aios-spec-work", "aios-build-work", "aios-orchestrate-workers"):
        require(selection.resolve() in set(link_targets(skill_root / caller / "SKILL.md")),
                f"model selection route missing: {caller}")
    for source in (selection, skill_root / "aios-orchestrate-workers/SKILL.md"):
        require(not re.search(r"\b(?:gpt-\d|claude-\d|gemini-\d)", source.read_text()),
                f"nonportable model default: {source}")
    owner_assets = skill_root / "aios-setup/assets/owner"
    require(not any("model" in p.name.lower() for p in owner_assets.rglob("*")),
            "owner template carries a model inventory")
    sync = (skill_root / "aios-maintain-context/references/sync.md").read_text()
    require("never `git add .`" in sync and
            "user-owned personal-skill folder identified" in sync and
            "shared\nplugin/library tree or an unrecorded folder" in sync and
            "symlink or nested Git repository" in sync and
            "every reachable commit\nand ref" in sync and
            "never silently rewrite, force-push" in sync and
            "source machine's absolute owner root or standing push approval" in sync and
            "verification candidates with `ask`" in sync and
            "initialize a fresh local Git registration" in sync and
            "Never copy\nthe source or temporary staging checkout's `.git`, config, hooks" in sync and
            "| Continuity provenance |" in workflow_scenarios and
            "| Continuity native behavior |" in workflow_scenarios,
            "continuity scope and provenance")
    maintain = (skill_root / "aios-maintain-context/SKILL.md").read_text()
    build = (skill_root / "aios-build-work/SKILL.md").read_text()
    readiness = (skill_root / "aios-spec-work/references/readiness.md").read_text()
    require("For an explicit `aios sync`, read [Sync](references/sync.md) first" in maintain and
            "missing\nor genuinely empty chosen home" in maintain and
            "do not mistake that absence for a malformed owner home" in maintain and
            "fallback applies only to an\nalready verified goal state" in lifecycle and
            "does not waive initial activation" in build and
            "canonical blocked/terminal fallback applies only after prior verified activation" in readiness,
            "sync missing-home and native-goal gate ordering")
    canonical_sources = skill_root / "aios/references/canonical-sources.md"
    require(canonical_sources.is_file(), "missing canonical source route")
    canonical_text = canonical_sources.read_text()
    require(canonical_sources.resolve() in primary_targets and
            "fact is missing from the accepted input and loaded package" in canonical_text and
            "one relevant source" in canonical_text and
            re.search(r"do not copy or sync", canonical_text) and
            "already-authorized native account" in canonical_text and
            "Never inspect, copy, transport, or ask for credentials" in canonical_text and
            "never change\nvisibility or publish" in canonical_text,
            "canonical source isolation")
    curation = (skill_root / "aios-maintain-context/references/curation.md").read_text()
    require("Keep facts in one canonical source" in curation and
            "A read of MEMORY alone neither invokes this procedure nor grants write authority" in curation and
            "recorded or standing authority" in curation,
            "memory read/write separation")
    continuation = skill_root / "aios/references/continuation.md"
    require(continuation.is_file() and
            not (skill_root / "aios-select-model/references/continuation.md").exists() and
            continuation.resolve() in set(link_targets(skill_root / "aios/references/lifecycle.md")) and
            (skill_root / "aios-maintain-context/references/curation.md").resolve()
            in set(link_targets(skill_root / "aios-setup/references/setup.md")),
            "single continuation and context framework owners")

    overview = root / "docs/aios.md"
    require(overview.is_file(), "missing local AIOS overview")
    overview_text = overview.read_text()
    require("portable context and skills" in overview_text and
            "Shared method, owner context" in overview_text and
            "Customer documentation stays in its\nsource system" in overview_text and
            "Install it separately in each app you choose" in overview_text and
            "never paste credentials into a chat" in overview_text and
            "Native package updates are separate from owner-data Sync" in overview_text,
            "local overview boundaries")
    distribution = (root / "docs/distribution.md").read_text()
    require("docs/aios.md" in distribution and
            "## Local documentation" in distribution and
            "## Release and adoption" in distribution,
            "local documentation and release contract")

    manager = skill_root / "aios-manage-skills"
    owner_lifecycle = manager / "references/owner-skills.md"
    require(owner_lifecycle.is_file(), "missing personal-skill owner")
    require(not (skill_root / "aios-maintain-context/references/owner-skills.md").exists(),
            "duplicate personal-skill owner")
    caller_targets = set()
    for relative in (
        "skills/aios/SKILL.md",
        "skills/aios-setup/SKILL.md",
        "skills/aios-check/references/checks.md",
        "skills/aios-maintain-context/references/curation.md",
    ):
        caller_targets.update(link_targets(root / relative))
    require((manager / "SKILL.md").resolve() in caller_targets, "Manage Skills not routed")
    require(owner_lifecycle.resolve() in caller_targets, "personal-skill procedure not routed")

    owner = skill_root / "aios-setup/assets/owner"
    require((owner / "AIOS_FORMAT").read_bytes() == b"2\n", "owner format")
    require(not (owner / "projects").exists() and not (owner / "systems").exists(),
            "mandatory owner registry in new scaffold")
    require(not list(owner.rglob("AGENTS.md")) and not list(owner.rglob("AGENTS.override.md")),
            "inherited owner instructions")
    bridge = (skill_root / "aios-setup/assets/bridge.md").read_text()
    require(len(bridge.splitlines()) <= 14 and "AIOS_ABSOLUTE_PATH" in bridge,
            "bridge scope")
    require("local AGENTS.md and lifecycle first" in bridge and
            "Do not preload personal AIOS context" in bridge, "bridge isolation")
    owner_skills = (owner / "skills/README.md").read_text()
    require("For continuity, identify each transferable personal method" in owner_skills and
            "| Personal skill | Canonical source | Owner |" in owner_skills and
            "shared plugin/library" in owner_skills,
            "personal-skill continuity provenance")

    parity = (skill_root / "aios-setup/references/legacy-parity.md").read_text()
    parity_rows = {}
    parity_names = []
    for line in parity.splitlines():
        match = re.match(r"^\| (aios[^ ]*) \|", line)
        if match:
            legacy_name = match.group(1)
            parity_names.append(legacy_name)
            parity_rows[legacy_name] = line
    require(len(parity_names) == len(set(parity_names)) == len(LEGACY_ROUTE_TARGETS)
            and set(parity_rows) == set(LEGACY_ROUTE_TARGETS),
            "legacy behavior map")
    for legacy_name, targets in LEGACY_ROUTE_TARGETS.items():
        require(all(f"]({target})" in parity_rows[legacy_name] for target in targets),
                f"legacy route target: {legacy_name}")
    require("ca1ba807716d1a992889f02d41cddf94fdee9f32" in parity,
            "legacy inventory identity")
    for external_name, target in LEGACY_EXTERNAL_TARGETS.items():
        require(f"| `{external_name}` |" in parity and target in parity,
                f"legacy external disposition: {external_name}")

    for relative, forbidden_values in FORBIDDEN_BOUNDARY_TEXT.items():
        boundary_text = (root / relative).read_text()
        require(not any(value in boundary_text for value in forbidden_values),
                f"external owner coupling: {relative}")

    shipped_text = sorted((root / "skills").rglob("*.md"))
    shipped_text += sorted((root / "docs").rglob("*.md"))
    for path in shipped_text:
        text = path.read_text()
        require(not any(re.search(pattern, text, re.I)
                        for pattern in FORBIDDEN_SHIPPED_PATTERNS),
                f"external owner coupling: {path.relative_to(root)}")

    readiness = (skill_root / "aios-spec-work/references/readiness.md").read_text()
    completeness = (skill_root / "aios-review-work/references/completeness.md").read_text()
    require("[Risky Changes](../../aios-risky-changes/SKILL.md)" in readiness and
            "baseline/check, recovery, and evidence-gap result" in readiness and
            "routine edits do not select it" in readiness,
            "consequential behavior contract")
    require("[Risky Changes](../../aios-risky-changes/SKILL.md)" in completeness and
            "representative before/after comparison and residual-unknown result" in completeness,
            "consequential behavior review")

    icon = (root / "assets/icon.png").read_bytes()
    require(icon[:8] == b"\x89PNG\r\n\x1a\n" and icon[12:16] == b"IHDR", "icon format")
    width, height = struct.unpack(">II", icon[16:24])
    require(width == height and 256 <= width <= 2048, "icon dimensions")
    interface = manifest["interface"]
    require(interface["composerIcon"] == interface["logo"] == "./assets/icon.png",
            "icon declaration")

    for relative in PRODUCT_PATHS:
        product = root / relative
        members = product.rglob("*") if product.is_dir() else [product]
        for path in members:
            require(not path.is_symlink(), f"product symlink: {path}")
            if path.is_file():
                parts = path.relative_to(root).parts
                domain = len(parts) >= 4 and parts[0] == "skills" and parts[1] in DOMAIN_SKILLS
                helper = domain and parts[2] == "scripts" and path.suffix in {".mjs", ".py"}
                ui = (len(parts) == 4 and parts[0] == "skills" and
                      parts[1] in SKILL_NAMES and parts[2] == "agents" and
                      path.name == "openai.yaml")
                neutral_text = domain and parts[2] == "assets" and path.suffix == ".txt"
                sidebar = path.relative_to(root).as_posix() in {
                    'runtime/sidebar/server.cjs', 'runtime/sidebar/index.html',
                    'runtime/sidebar/THIRD-PARTY-NOTICES.md'}
                allowed = (path.suffix in {".md", ".json"} or helper or ui or neutral_text or sidebar or
                           path.name in {"LICENSE", "AIOS_FORMAT", ".gitignore"} or
                           path == root / "assets/icon.png")
                require(allowed, f"unexpected product file: {path}")

    documents = [root / "README.md", root / "AGENTS.md", root / "CHANGELOG.md"]
    for folder in (root / "docs", root / "skills", root / ".agents/skills"):
        documents.extend(folder.rglob("*.md"))
    for path in documents:
        list(link_targets(path))
        text = path.read_text()
        require(not re.search(r"/(?:Users|home)/[\w.-]+/", text),
                f"personal machine path: {path}")
        require(not any(re.search(pattern, text) for pattern in SECRET_PATTERNS),
                f"secret-like content: {path}")

    with tempfile.TemporaryDirectory(prefix="aios-package-") as temporary:
        staged = Path(temporary) / "aios"
        copy_product(root, staged)
        require(not any((staged / name).exists() for name in (".agents", "tests", "AGENTS.md")),
                "author content in product")
        require({p.relative_to(staged).as_posix() for p in (staged / "docs").rglob("*")
                 if p.is_file()} == {"docs/aios.md"},
                "unapproved documentation in product")
        require(not any((staged / "skills" / name).exists()
                        for name in ("setup-guardrails", "shape-offer")),
                "optional global capability shipped")
        require((staged / "skills/human-writing/SKILL.md").is_file(), "built-in writing capability missing")
        for path in staged.rglob("*.md"):
            list(link_targets(path, staged))


def rejected(mutator, expected):
    with tempfile.TemporaryDirectory(prefix="aios-negative-") as temporary:
        copy = Path(temporary) / "repo"
        shutil.copytree(ROOT, copy, ignore=shutil.ignore_patterns(".git", ".tmp", "node_modules"))
        mutator(copy)
        try:
            validate(copy)
        except AssertionError as error:
            require(expected in str(error), f"wrong rejection: {error}")
        else:
            raise AssertionError(f"accepted regression: {expected}")


def negative_controls():
    def missing_skill_version(root):
        path = root / "skills/aios/SKILL.md"
        path.write_text(re.sub(r'^  version: [^\n]*\n', '', path.read_text(), count=1, flags=re.M))

    def unquoted_skill_version(root):
        path = root / "skills/aios/SKILL.md"
        path.write_text(re.sub(r'^  version: [^\n]*', '  version: 1.0.0',
                               path.read_text(), count=1, flags=re.M))

    def missing_spec_tracking_route(root):
        path = root / "skills/aios-spec-work/SKILL.md"
        path.write_text(path.read_text().replace(
            "[native tracking SOP](../aios/references/lifecycle.md)", "tracking"))

    def missing_domain_route(root):
        path = root / "skills/aios/SKILL.md"
        path.write_text(path.read_text().replace(
            "](../design/SKILL.md)", "](../human-writing/SKILL.md)"))

    def compulsory_registry(root):
        (root / "skills/aios-setup/assets/owner/projects").mkdir()

    def split_source(root):
        package = json.loads((root / "package.json").read_text())
        package["pi"]["skills"] = ["./copied-skills"]
        (root / "package.json").write_text(json.dumps(package))

    def install_script(root):
        package = json.loads((root / "package.json").read_text())
        package["scripts"] = {"postinstall": "echo unexpected"}
        (root / "package.json").write_text(json.dumps(package))

    def inherited_instructions(root):
        (root / "skills/aios-setup/assets/owner/AGENTS.md").write_text("Read all owner data.\n")

    def duplicate_owner(root):
        path = root / "skills/aios-maintain-context/references/owner-skills.md"
        path.write_text("# Duplicate owner\n")

    def runtime_script(root):
        (root / "skills/aios/unsafe.sh").write_text("echo unexpected\n")

    def coupled_system_tool(root):
        path = root / "skills/aios/references/routing.md"
        path.write_text(path.read_text() + "\nUse OpenPencil for design.\n")

    def missing_legacy_route(root):
        path = root / "skills/aios-setup/references/legacy-parity.md"
        path.write_text(path.read_text().replace(
            "](../../aios-triage-improvement/SKILL.md)", "](missing-triage.md)", 1))

    def duplicate_legacy_route(root):
        path = root / "skills/aios-setup/references/legacy-parity.md"
        duplicate = next(line for line in path.read_text().splitlines()
                         if line.startswith("| aios-build-work |"))
        path.write_text(path.read_text() + duplicate + "\n")

    def local_phase_copy(root):
        folder = root / ".agents/skills/spec-project"
        folder.mkdir(parents=True)
        shutil.copyfile(root / "skills/aios-spec-work/SKILL.md", folder / "SKILL.md")

    def local_phase_wrapper(root):
        folder = root / ".agents/skills/build-project"
        folder.mkdir(parents=True)
        (folder / "SKILL.md").write_text("---\nname: build-project\ndescription: Use shared Build.\n---\nInvoke aios-build-work.\n")

    def native_version_drift(root):
        path = root / 'gemini-extension.json'
        data = json.loads(path.read_text())
        data['version'] = '99.0.0'
        path.write_text(json.dumps(data))

    def native_split_source(root):
        path = root / '.cursor-plugin/plugin.json'
        data = json.loads(path.read_text())
        data['skills'] = './copied-skills'
        path.write_text(json.dumps(data))

    def implicit_hook(root):
        (root / 'hooks').mkdir()
        (root / 'hooks/hooks.json').write_text('{}')

    rejected(native_version_drift, 'native identity/version drift')
    rejected(native_split_source, 'native split skill source')
    rejected(implicit_hook, 'unexpected native runtime')

    rejected(missing_domain_route, "built-in method route missing")
    rejected(compulsory_registry, "mandatory owner registry")
    rejected(split_source, "different skill sources")
    rejected(install_script, "consumer script or dependency")
    rejected(inherited_instructions, "inherited owner instructions")
    rejected(duplicate_owner, "duplicate personal-skill owner")
    rejected(runtime_script, "unexpected product file")
    rejected(coupled_system_tool, "external owner coupling")
    rejected(missing_legacy_route, "legacy route target")
    rejected(duplicate_legacy_route, "legacy behavior map")
    rejected(local_phase_copy, "duplicate generic repository skill payload")
    rejected(local_phase_wrapper, "duplicate generic repository skill payload")
    rejected(missing_skill_version, "missing metadata.version")
    rejected(unquoted_skill_version, "metadata values must be quoted strings")
    rejected(missing_spec_tracking_route, "Spec contract route missing")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", help="local Git release/commit for per-skill SemVer maintenance")
    parser.add_argument("--release-tag", help="version tag being promoted to a GitHub Release")
    args = parser.parse_args()
    validate(release_tag=args.release_tag)
    negative_controls()
    if args.baseline:
        commit = validate_baseline(ROOT, args.baseline, SKILL_NAMES)
        print(f"PASS: per-skill version maintenance against {commit}")
    print(f"PASS: package declarations, {len(SKILL_NAMES)} versioned skill frontmatters, complete legacy routes, links, isolation, and security checks")
    print("PASS: discovery contracts and external-owner coupling boundaries")
    print("PASS: rejects split sources, install hooks, misplaced helpers, inherited instructions, and duplicate ownership")
