# Field Review: Authorized Device Status

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-device-status` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `deviceStatus`, deletion, omission, or local enablement |
| Candidate layer | Authorized Device entry |
| Observer set | Endpoints validating user authority |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | No predecessor. |
| Current conclusion | A mandatory closed enum records `active` or `revoked` authorization without erasing rejected history. |

## Question

How does a successor distinguish currently authorized Endpoints from explicit
revocation without relying on omission or local UI state?

## Role in communication

Authority-state authors set the status; validators require it to agree with
admission/revocation epochs and the authorized transition.

## Contribution to LicoArc's final vision

Makes Endpoint revocation explicit while keeping distinct device identities.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Closed enum |
| Presence | Mandatory |
| Values or range | `active`, `revoked` |
| Canonical representation | Protocol-Line-fixed unsigned labels |
| Invalid input | Unknown or epoch-inconsistent values reject |

## Necessity proof

Omission cannot distinguish never admitted from explicitly revoked and permits
history rewriting. Local enablement has no peer interoperability authority.

## Visibility and trust

Protected from Stations; status is signed but grants no peer trust.

## Alternatives

Deletion, nullable entries, and free-form status are ambiguous. A two-value
enum is sufficient.

## Technical evaluation

Constant-size validation; retained revoked entries consume the bounded current
snapshot but do not impose a lifetime event limit.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
