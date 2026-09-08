# Field Review: Management Signing Keys

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-management-signing-keys` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `managementSigningKeys`, current owner key, or provider key |
| Candidate layer | User Authority State |
| Observer set | Endpoints validating management successors |
| Existing authority | Existing generic `SigningKey` field records and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | Reuses generic key profile, key ID, and public-key field decisions; adds only the management-purpose collection. |
| Current conclusion | A mandatory bounded collection declares the Ed25519 and ML-DSA-65 public keys authorized for management successors. |

## Question

Which exact public keys may authorize routine authority changes?

## Role in communication

Genesis declares the keys; each management successor is verified under the
predecessor collection and may install a replacement collection atomically.

## Contribution to LicoArc's final vision

Keeps routine device authority under user-controlled cryptographic keys.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Bounded canonical `SigningKey` collection |
| Presence | Mandatory and non-empty |
| Values or range | Exact line-required Ed25519 plus ML-DSA-65 composition |
| Canonical representation | Deterministically ordered generic key entries |
| Invalid input | Missing, duplicate, surplus, downgraded, or wrong-purpose keys reject |

## Necessity proof

Bare signatures cannot resolve authorized public keys; an external account or
Station key has no user authority. The collection is the minimum self-contained
management verifier input.

## Visibility and trust

Public material is protected in peer delivery. It authorizes successors only,
not peer trust, content truth, or recovery unless also named for that purpose.

## Alternatives

One classical key weakens the selected composition; provider lookup adds an
authority dependency; unbounded agility creates downgrade ambiguity.

## Technical evaluation

Bounded public-key work and state per snapshot; exact profiles and ordering are
line-fixed and replacement is atomic.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
