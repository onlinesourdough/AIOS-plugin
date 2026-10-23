# Evaluate publish safety

Freeze the content and proposed recipient, channel, destination, identity and
action. Inspect accepted task authority and only relevant connection/source
records. Run this after other applicable evaluations, immediately before the
external effect; never edit or deliver the subject while evaluating.

| Check | Pass evidence |
| --- | --- |
| Exact authority | Current task or recorded standing grant covers this action, destination and scope; a credential or skill is not approval |
| Confidentiality | No secrets, credentials, private URLs or unauthorized client facts are exposed |
| Claims | Material numbers and claims trace to current authoritative evidence |
| Commitments | Time, money, scope and date promises are owner-set or absent |
| Identity and version | The permitted sending identity and this final version are within the accepted authority |

Return PASS only with evidence for every applicable check. Otherwise return FAIL
and hold the action, with a safe redacted draft when useful and the exact
missing authority or correction. Do not ask again when the existing grant
already covers the unchanged reviewed action. Approval is not inferred from
silence, a preselected answer, another account or a different destination.

Any later relevant edit returns to affected evaluation and Review. After PASS,
[Ship](../SKILL.md) performs only the authorized action, reads back
the result and resolves an uncertain response before retrying.
