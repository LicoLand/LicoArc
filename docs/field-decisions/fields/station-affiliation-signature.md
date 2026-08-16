# Field Review: Station Affiliation Signature

This record preserves decision history. Normative semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-affiliation-signature` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | guarantor signature, affiliation attestation, home Station proof |
| Candidate layer | AFFILIATE result and protected StationAffiliation |
| Observer set | Affiliating Endpoint and Station; peer Endpoints under protection |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Future AFFILIATE and affiliation schemas, signature profile, and corpus |
| Predecessor or successor | None |
| Current conclusion | A Station signs only an opaque identity-bound commitment, exact descriptor, and finite affiliation expiry; it never signs or owns Endpoint identity state. |

## Question

What prevents an Endpoint from naming B as its global current service
affiliate when B never accepted the relationship?

## Role in communication

B signs the descriptor digest, affiliation commitment, and not-after value.
The Endpoint separately authenticates global ordering and set. Peers verify
both halves; neither party can impersonate the other's authority.

## Contribution to LicoArc's final vision

Proves only that a Station accepted one opaque identity-bound affiliation for
a finite interval, completing bilateral service affiliation without
transferring Endpoint authority.

## Field model and trade-offs

The user's “trusted guarantor service provider” gains a precise, limited
meaning: B accepted the opaque service affiliation until a finite time. Trust
in B's certification remains each peer's policy, and B cannot authenticate the
user, read plaintext, or guarantee delivery.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `Signature` |
| Presence | Mandatory in accepted AFFILIATE result and StationAffiliation |
| Values or range | One signature under a key in the exact descriptor |
| Canonical representation | Affiliation-domain-separated tuple of descriptor digest, commitment, and not-after; signature excluded |
| Invalid input | Wrong key/profile, altered value, invalid signature, expired descriptor/affiliation, or unknown commitment fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Prove bilateral Station acceptance of the global service affiliation. |
| Field-level necessity | Endpoint authentication proves selection but not Station acceptance. |
| Removal consequence | Any Endpoint can claim any Station as its guarantor. |
| Derivation | Descriptor and Route signatures have generic and route-specific scopes. |
| Existing carrier | No Station Signal covers the Endpoint-specific affiliation commitment and expiry. |
| Protected placement | The signed statement is projected to peers under protection. |
| Duplicate-authority risk | It cannot set epoch, ordering, identity, peer trust, receipt, or effect. |

## Visibility and trust

The statement is transferable evidence only of B's bounded commitment. It
does not prove Endpoint identity or user/device ownership and does not
guarantee honesty, availability, retention, deletion, delivery, acceptance,
or effect. A compromised B cannot advance Endpoint affiliation epoch without
Endpoint authentication.

## Alternatives

Endpoint-only claims, descriptor signature reuse, direct Station signing of
Endpoint identity, old-Station approval, Network membership, and Provider
naming were rejected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

Matrix supplies rejection evidence for server
identity authority; TUF informs exact signed scope
and expiry; MLS informs Delivery Service separation.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Prevents fabricated Station acceptance within signature assumptions. |
| Privacy and metadata | Station sees an opaque commitment; peers see the protected statement. |
| Interoperability | Exact key purpose, profile, domain separator, tuple, and failures are required. |
| Implementation complexity | AFFILIATE signing, renewal, persistence, rotation, and peer verification. |
| CPU, memory, and wire cost | One bounded signature per Station affiliation. |
| Evolution and downgrade | Retired or unknown profiles fail closed. |

## Decision history

The field was separated from `stationServiceSignature`: the former acknowledges
Endpoint-wide affiliation, while the latter issues one relationship Route.
Old-Station approval remains forbidden so A cannot veto migration to B.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
