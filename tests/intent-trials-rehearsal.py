#!/usr/bin/env python3
"""Prepare and score bounded decision probes; never launches a model."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / "tests/fixtures/intent-trials-cases.json"
SOURCES = (
    "skills/aios/SKILL.md",
    "skills/aios-interview/SKILL.md",
    "skills/aios-spec-work/SKILL.md",
    "skills/aios-spec-work/references/local-trials.md",
)
FIELDS = {"id": "string", "interview": "boolean", "trial": "boolean",
          "question": "boolean", "next_action": "string", "reply": "string"}


def prepare(destination, baseline):
    if destination.exists():
        raise SystemExit("Destination exists; preserve prior observations.")
    destination.mkdir(parents=True)
    excerpts, hashes = [], {}
    for relative in SOURCES:
        if baseline:
            result = subprocess.run(["git", "show", f"{baseline}:{relative}"],
                                    cwd=ROOT, text=True, capture_output=True)
            if result.returncode:
                if relative.endswith("/local-trials.md"):
                    continue
                raise RuntimeError(result.stderr)
            content = result.stdout
        else:
            content = (ROOT / relative).read_text()
        hashes[relative] = hashlib.sha256(content.encode()).hexdigest()
        excerpts.append(f"SOURCE {relative}\n{content}")
    cases = json.loads(CASES.read_text())
    prompt = """Exercise these instructions on each synthetic case independently.
Do not execute cases, call tools, read other files or write anything. Context
describes each case's tools, not your own. Return one decision per case.
interview means exploratory conversation before work; a focused mid-task question
alone is not an interview. trial means a local sample or concrete comparison is
the useful next route, including visual-direction exploration. question means a missing
answer holds the next dependent action; inviting a choice after showing variants
does not count as asking now. Include the actual short next reply in the user's
language and a concise next_action. Keep observed and planned evidence distinct.
This is decision simulation, not proof of native selection or executed trials.

"""
    prompt += "\n\n".join(excerpts)
    prompt += "\n\nCASES\n" + json.dumps(
        [{k: v for k, v in case.items() if k != "expected"} for case in cases],
        ensure_ascii=False, indent=2)
    item = {"type": "object", "properties": {
        key: {"type": kind} for key, kind in FIELDS.items()},
        "required": list(FIELDS), "additionalProperties": False}
    schema = {"type": "object", "properties": {
        "decisions": {"type": "array", "items": item}},
        "required": ["decisions"], "additionalProperties": False}
    (destination / "prompt.txt").write_text(prompt)
    (destination / "schema.json").write_text(json.dumps(schema, indent=2) + "\n")
    (destination / "source-hashes.json").write_text(json.dumps(hashes, indent=2) + "\n")
    print(f"Prepared {len(cases)} cases; expectations withheld; {len(prompt.encode())} bytes.")


def score(result):
    cases = json.loads(CASES.read_text())
    decisions = json.loads(result.read_text())["decisions"]
    by_id = {d["id"]: d for d in decisions}
    if len(by_id) != len(decisions) or set(by_id) != {c["id"] for c in cases}:
        raise ValueError("Missing, unexpected or duplicated case identity.")
    failed = []
    for case in cases:
        decision = by_id[case["id"]]
        errors = [f"{key}={decision[key]}, expected {value}"
                  for key, value in case["expected"].items() if decision[key] != value]
        if errors:
            failed.append(case["id"])
        print(f"{'FAIL' if errors else 'PASS'} {case['id']}: " +
              ("; ".join(errors) or decision["next_action"]))
    print(f"{len(cases) - len(failed)}/{len(cases)} decisions passed. Inspect replies separately.")
    return bool(failed)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    prep = commands.add_parser("prepare")
    prep.add_argument("destination", type=Path)
    prep.add_argument("--baseline")
    check = commands.add_parser("score")
    check.add_argument("result", type=Path)
    args = parser.parse_args()
    if args.command == "prepare":
        prepare(args.destination.resolve(), args.baseline)
    else:
        raise SystemExit(score(args.result))
