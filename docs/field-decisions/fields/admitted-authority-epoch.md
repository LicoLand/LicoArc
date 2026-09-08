# Field Review: Admitted Authority Epoch

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-admitted-authority-epoch` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `admittedAuthorityEpoch`, creation time, or inferred first observation |
| Candidate layer | Authorized Device entry |
| Observer set | Endpoints validating user authority |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | No predecessor. |
| Current conclusion | Each device entry names the authority epoch at which its exact Endpoint state was admitted. |

## Question

Which state-owned value binds device admission to one authority transition?

## Role in communication

The admitting successor writes the epoch; validators require it to equal the
first state containing the exact Endpoint reference/state digest.

## Contribution to LicoArc's final vision

Makes device authority history deterministic without trusting clocks or arrival order.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Bounded unsigned integer |
| Presence | Mandatory |
| Values or range | Existing authority epoch not later than the containing snapshot |
| Canonical representation | Shortest deterministic unsigned encoding |
| Invalid input | Future, rewritten, malformed, or inconsistent value rejects |

## Necessity proof

Current status cannot distinguish a stable admission from a silently replaced
Endpoint-state digest. Arrival time and device-local creation time are not authority.

## Visibility and trust

Protected and signed; it orders authorization only.

## Alternatives

Derivation from retained complete history is not always available during bounded
catch-up. The explicit epoch is selected.

## Technical evaluation

Constant-size comparison with no timeout or lifetime rotation count.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
