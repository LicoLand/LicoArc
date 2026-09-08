# Field Review: Revoked Authority Epoch

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-revoked-authority-epoch` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `revokedAuthorityEpoch`, deletion time, or omission |
| Candidate layer | Authorized Device entry |
| Observer set | Endpoints validating user authority |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | No predecessor. |
| Current conclusion | A revoked device entry conditionally names the exact authority epoch that revoked it. |

## Question

How is revocation bound to one authorized transition without a wall clock?

## Role in communication

The revoking successor writes the epoch; validators require presence exactly
for `revoked`, absence for `active`, and immutable preservation thereafter.

## Contribution to LicoArc's final vision

Keeps revocation ordered and rollback-detectable across Stations.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Bounded unsigned integer |
| Presence | Mandatory for `revoked`; forbidden for `active` |
| Values or range | Later than or equal to admission and not later than the containing snapshot |
| Canonical representation | Shortest deterministic unsigned encoding |
| Invalid input | Missing, surplus, rewritten, future, or inconsistent value rejects |

## Necessity proof

Status alone lacks the transition boundary needed for catch-up and rollback
detection; timestamps and local deletion are not protocol authority.

## Visibility and trust

Protected and signed; it does not prove key erasure or device compromise time.

## Alternatives

Omission and wall-clock time are ambiguous. Exact authority epoch is selected.

## Technical evaluation

Constant-size comparison and no time-based expiry.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
