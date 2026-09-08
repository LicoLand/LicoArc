# Field Review: Authority Signatures

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-authority-signatures` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `authoritySignatures`, owner signature, or account attestation |
| Candidate layer | User Authority State |
| Observer set | Endpoints validating authority states |
| Existing authority | Existing generic Signature fields and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | Reuses generic signature fields; replaces no evidence signature or checkpoint. |
| Current conclusion | A mandatory bounded collection authenticates the canonical state content under the exact predecessor management or recovery composition. |

## Question

Which bytes authorize one complete authority successor?

## Role in communication

The applicable predecessor keys sign the canonical state hash projection;
validators exclude this collection from that hash and require the exact profile set.

## Contribution to LicoArc's final vision

Authenticates user-controlled authority transitions without infrastructure signatures.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Bounded canonical generic `Signature` collection |
| Presence | Mandatory |
| Values or range | Exact transition-required Ed25519 and ML-DSA-65 composition |
| Canonical representation | Protocol-Line-fixed profile/key order; excluded from state digest |
| Invalid input | Missing, surplus, duplicate, downgraded, wrong-key, or invalid signatures reject |

## Necessity proof

The state fields do not authorize themselves, and service/account signatures
have the wrong trust boundary. The bounded collection is required.

## Visibility and trust

Protected during peer delivery. It proves predecessor-key authorization of the
state only, not statement truth or peer trust.

## Alternatives

Single signatures weaken the selected composition; checkpoints are unrelated
transferable content proof and are retired.

## Technical evaluation

Bounded public-key work per state; deterministic exclusion avoids recursive hashes.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
