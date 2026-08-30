# Field Review: Affiliation Nonce

This page is decision history, not a second specification. See the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-affiliation-nonce` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | binding salt, affiliation randomizer |
| Candidate layer | Protected `StationAffiliation` |
| Observer set | Peer Endpoints; hidden from Station during issuance |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | The Identity affiliation schema, grammar, policy, and corpus |
| Predecessor or successor | None |
| Current conclusion | A fresh 256-bit randomizer hides stable Endpoint identity from the Station while allowing peers to verify the Station-signed commitment is identity-bound. |

## Question

How can a Station sign a binding that peers tie to one Endpoint identity
without giving the Station that stable identity reference?

## Role in communication

The Endpoint generates the nonce, computes `affiliationCommitment`, sends only
the commitment to the Station, and later reveals the nonce to peer Endpoints
inside protection. Peers recompute it; the Station never uses the nonce.

## Contribution to LicoArc's final vision

Prevents affiliation commitments from becoming predictable cross-Station
correlation identifiers while allowing peers to verify their identity binding.

## Field model and trade-offs

The field reconciles portable identity with a Station-acknowledged service
relationship: B signs an opaque commitment without learning the global
Endpoint identifier, while peers verify that B's statement cannot be copied
to another Endpoint identity.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `TOKEN256` randomizer |
| Presence | Mandatory in every `StationAffiliation` |
| Values or range | Exactly 32 unpredictable octets, fresh per Station identity and renewal |
| Canonical representation | Byte string in deterministic protected encoding |
| Invalid input | Wrong length, reuse, or commitment mismatch fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Prevent identity exposure and cross-Endpoint copying of a Station affiliation. |
| Field-level necessity | Peers cannot verify a randomized commitment opening without the randomizer. |
| Removal consequence | Direct identity signing exposes the identifier; an unbound opaque token can be copied. |
| Derivation | Fresh entropy cannot be derived from identity or Station data. |
| Existing carrier | No admitted protected value supplies this commitment opening. |
| Protected placement | Only peers need the opening; Station receives the commitment. |
| Duplicate-authority risk | The nonce has no routing, identity, or trust meaning by itself. |

## Visibility and trust

Peer disclosure links that peer to the affiliation it already received. A
Station sees only the digest unless a peer colludes and reveals the opening.
The nonce authenticates nothing and is never a bearer token.

## Alternatives

Direct Station signing of `endpointIdentityRef`, deterministic salt, and an
unbound transferable token were rejected. An anonymous credential would need
separate algorithm and field decisions.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

Matrix supplies privacy rejection evidence;
TUF and MLS inform only
the surrounding signed-state and delivery-service boundaries.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Provides preimage randomization and identity-specific opening under the selected digest assumptions. |
| Privacy and metadata | Keeps stable Endpoint identity out of the Station-facing affiliation request. |
| Interoperability | Exact entropy, tuple, domain separation, and reuse rules are required. |
| Implementation complexity | One secure random generation and retained opening per Station affiliation. |
| CPU, memory, and wire cost | 32 octets and one digest computation. |
| Evolution and downgrade | Digest/profile changes require new commitments, never reinterpretation. |

## Decision history

The field was selected after rejecting both direct Station-visible Endpoint
identity and a copyable opaque affiliation token. It exists only as the
opening for the admitted identity-bound commitment.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
