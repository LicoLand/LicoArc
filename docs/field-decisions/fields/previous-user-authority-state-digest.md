# Field Review: Previous User Authority State Digest

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-previous-user-authority-state-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `previousUserAuthorityStateDigest`, parent ID, or prior version |
| Candidate layer | Successor User Authority State |
| Observer set | Endpoints validating authority succession |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | No predecessor. |
| Current conclusion | Every non-genesis state names the exact canonical predecessor hash; genesis omits it. |

## Question

Which value prevents an epoch-correct successor from silently changing parents?

## Role in communication

The successor producer commits the exact predecessor; validators require the
accepted parent. Authority signatures are excluded from the hashed state to
give one unambiguous content identity.

## Contribution to LicoArc's final vision

Makes authority replacement and recovery fork-explicit without central ordering.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Omitted at epoch zero; mandatory thereafter |
| Values or range | Fixed domain-separated digest of complete predecessor content excluding authority signatures |
| Canonical representation | 32 raw octets |
| Invalid input | Missing, surplus, mismatched, or ambiguous parent rejects without mutation |

## Necessity proof

Epoch alone cannot distinguish siblings. Full predecessor repetition wastes
wire and creates recursive signatures. One digest is the minimum exact join.

## Visibility and trust

Protected from Stations; replay and suppression cannot forge the signed child.
Sibling children stay explicit and do not auto-converge.

## Alternatives

Arrival order, timestamps, and implicit local parent selection are rejected.

## Technical evaluation

Constant-size wire/state and linear canonical hashing of one bounded snapshot;
digest substitution is a terminal validation failure.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
