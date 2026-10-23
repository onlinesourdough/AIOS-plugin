---
name: osm-risky-changes
description: Assess consequential changes needing representative proof and recovery, not routine edits or lifecycle management.
metadata:
  version: "2.0.0"
---

# OSM:risky-changes

Use this as a bounded assessment when a change could materially alter a real
world outcome, caller experience, operational responsibility, trust boundary,
or difficult-to-reverse effect. Ordinary mechanical, local, and readily
reversible edits stay with their owning task and do not select this skill.

## Before the change

Name the material real-world assumptions and the representative behavior or
outcome they could change. Establish a proportional baseline or check that can
observe that behavior, and identify the intended post-change result. Decide the
safe recovery or stop path before the consequential effect; do not treat a
unit test alone as representative proof when the material risk is outside unit
behavior.

Use an observed caller, operator, or operational outcome when it is available
and authorized. If the needed representative observation cannot safely be made,
state that evidence gap and its effect on the claim rather than manufacturing a
baseline or an authority to run one.

## After the change

Compare the same representative pre- and post-change behavior or outcome.
Report whether the material assumption held, the recovery state when exercised,
and residual unknowns. Keep synthetic, source, and native or operational
evidence distinct.

This assessment does not grant mutation, delivery, or external-effect
authority; it does not create a lifecycle, goal, worker, or required test
suite. Its natural return is the compact risk assessment and evidence gap for
the owning Spec, Review, or task.
