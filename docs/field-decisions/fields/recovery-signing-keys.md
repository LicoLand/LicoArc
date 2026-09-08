# Field Review: Recovery Signing Keys

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-recovery-signing-keys` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `recoverySigningKeys`, account recovery token, or infrastructure escrow |
| Candidate layer | User Authority State |
| Observer set | Endpoints validating recovery successors |
| Existing authority | Existing generic `SigningKey` records and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | Reuses generic key fields; adds only the recovery-purpose collection. |
| Current conclusion | A mandatory bounded collection declares the Ed25519 and ML-DSA-65 public keys authorized for recovery replacement. |

## Question

Which exact public keys can replace lost management/device authority without
making a service or surviving device indispensable?

## Role in communication

The predecessor state declares recovery keys. Management successors preserve
them byte-for-byte. Only a successor signed by the currently admitted recovery
composition and carrying possession by every replacement key may rotate or
remove them.

## Contribution to LicoArc's final vision

Makes loss recovery user-held and infrastructure-independent.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Bounded canonical `SigningKey` collection |
| Presence | Mandatory and non-empty |
| Values or range | Exact line-required Ed25519 plus ML-DSA-65 composition |
| Canonical representation | Deterministically ordered generic key entries |
| Invalid input | Missing, duplicate, surplus, downgraded, wrong-purpose, management-modified, or unauthorized replacement keys reject without mutation |

## Necessity proof

Management keys may be lost or compromised. Provider reset and Station recovery
would create external identity authority; explicit recovery keys are required.

## Visibility and trust

Public material is protected in peer delivery. Recovery does not bypass cloud
authorization, recreate absent data, or establish peer trust.

## Alternatives

No recovery fails the retained-history goal; service escrow centralizes
authority; a mnemonic or product workflow remains outside wire semantics.

## Technical evaluation

Bounded public-key verification and state per recovery; no timeout or lifetime
rotation cap; replacement is one atomic signed successor. Recovery-authority
substitution cannot strand the user behind an attacker-selected key set.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
