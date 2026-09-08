# Field Review: Authority Transition Kind

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-authority-transition-kind` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `authorityTransitionKind` or inferred roster diff |
| Candidate layer | User Authority State |
| Observer set | Endpoints validating authority succession |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | No predecessor. |
| Current conclusion | A mandatory closed enum distinguishes `genesis`, `management`, and `recovery`. |

## Question

How does a validator select the exact signer and replacement rules without
inferring security meaning from a roster diff?

## Role in communication

The transition author declares the path; validators require the corresponding
predecessor management or recovery composition and reject inconsistent changes.

## Contribution to LicoArc's final vision

Keeps ordinary management and loss recovery explicit and interoperable.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Closed enum |
| Presence | Mandatory |
| Values or range | `genesis`, `management`, `recovery` |
| Canonical representation | Protocol-Line-fixed unsigned labels |
| Invalid input | Unknown or transition-inconsistent values reject |

## Necessity proof

The same roster result may arise through different authorized key sets; it
cannot be derived safely from content or signatures after verification starts.

## Visibility and trust

Protected in peer delivery and covered by authority signatures. It selects
validation rules but does not itself authorize a change.

## Alternatives

Inference from changed fields and loose signature discovery are ambiguous and
downgrade-prone. The closed enum is selected.

## Technical evaluation

Constant-size dispatch with fail-closed unknown values and no algorithm menu.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
