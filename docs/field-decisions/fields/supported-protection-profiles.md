# Field Review: Supported Protection Profiles

This record preserves retired Candidate decision history. It is not a wire
specification.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-supported-protection-profiles` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | No direct successor; immutable complete Protocol Lines own Profile membership. |
| Current conclusion | Independent `supportedProtectionProfiles` negotiation is withdrawn and forbidden. |

## Preserved requirement

A future complete line may bind only complete, proof-bound Profiles. Unknown,
incomplete, deprecated-for-new-session, or retired Profiles fail closed.

## Retirement rationale

Independent Profile negotiation allowed component-wise composition outside an
immutable Protocol Line. No collection, identifier encoding, bound, placement,
or fallback survives. Profile membership is line-owned.

## Definition evidence

The definition is `NOT-SPECIFIED`. The retired Candidate collection cannot be
advertised, parsed, or used as compatibility input.
