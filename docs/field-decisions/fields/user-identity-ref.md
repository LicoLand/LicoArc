# Field Review: User Identity Reference

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-user-identity-ref` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `userIdentityRef`, display name, account ID, or random caller label |
| Candidate layer | User Authority State |
| Observer set | Endpoints validating the authority state |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | No predecessor; account, display-name, and directory aliases are rejected. |
| Current conclusion | `userIdentityRef` is a mandatory self-certifying digest derived from canonical genesis management and recovery public-key material. |

## Question

Which stable value joins all authorized device snapshots without inventing a
directory or accepting a caller-supplied identity label?

## Role in communication

Genesis derives the value under a fixed SHA-256 domain; every successor and
possession proof preserves it. Verifiers recompute it at genesis and reject a
mismatch. It provides probabilistic cryptographic uniqueness, not one-human
uniqueness.

## Contribution to LicoArc's final vision

Keeps user-controlled authority portable across Endpoints and Stations.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Mandatory |
| Values or range | Exact domain-separated SHA-256 genesis derivation |
| Canonical representation | 32 raw octets in deterministic encoding |
| Invalid input | Reject the state without mutation |

## Necessity proof

Keys rotate and an Endpoint reference names one device, so neither can identify
the continuing user authority. A display name, account, Station, or random label
is not self-authenticating. The digest is the smallest stable authority join.

## Visibility and trust

It is protected in peer delivery but intentionally stable within the authority
context. It cannot establish peer trust, legal identity, or account ownership.

## Alternatives

Omission breaks successor continuity; human names and accounts add trust roots;
a random opaque value cannot be verified at genesis. The fixed derivation is selected.

## Technical evaluation

Constant-size comparison and hashing give deterministic interoperability with
minimal wire/state cost; changing domain or genesis key projection requires a
new Protocol Line.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
