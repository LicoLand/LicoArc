# Field Review: Authority Epoch

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-authority-epoch` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `authorityEpoch`, arrival order, timestamp, or implicit counter |
| Candidate layer | User Authority State |
| Observer set | Endpoints validating the authority chain |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | No predecessor. |
| Current conclusion | Genesis is epoch zero and every valid successor increments exactly once. |

## Question

How are authority successors ordered independently of transport order and time?

## Role in communication

The authorizing Endpoint sets the epoch; validators combine it with the exact
predecessor digest. The value orders one chain but cannot resolve siblings alone.

## Contribution to LicoArc's final vision

Makes user authority rollback- and gap-detectable across transport changes.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Bounded unsigned integer |
| Presence | Mandatory |
| Values or range | Genesis `0`; successor is predecessor plus one |
| Canonical representation | Shortest deterministic unsigned encoding |
| Invalid input | Stale, skipped, overflowed, or malformed values reject without mutation |

## Necessity proof

The predecessor digest detects content lineage but does not independently expose
a gap or provide bounded monotonic comparison. Arrival time and Station clocks
have no authority.

## Visibility and trust

Protected in peer delivery; a Station can replay or suppress but not validly
advance it. Equal epochs with unequal valid children remain an explicit fork.

## Alternatives

Timestamp and arrival order are attacker-controlled; digest-only traversal is
less bounded. The explicit epoch plus predecessor digest is selected.

## Technical evaluation

Constant-time numeric checks, fixed bounds, and no lifetime timeout preserve
simple deterministic evolution; exhaustion rejects and requires a new line.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
