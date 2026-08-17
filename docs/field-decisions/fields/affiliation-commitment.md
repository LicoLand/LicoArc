# Field Review: Affiliation Commitment

This record explains the decision and defers all normative semantics to the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-affiliation-commitment` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | affiliation handle, subject commitment, service subject |
| Candidate layer | Station operation and protected affiliation/route state |
| Observer set | Calling Endpoint and Station; peer Endpoints under protection |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Future AFFILIATE, RESERVE, affiliation, Route schemas and corpus |
| Predecessor or successor | None |
| Current conclusion | One domain-separated identity-bound digest is the privacy-minimal join key between Station acceptance, global affiliation state, and relationship Route issuance. |

## Question

What value can B sign and later recognize during Route reservation without
seeing stable Endpoint identity or allowing its statement to be copied to
another Endpoint?

## Role in communication

The Endpoint computes the commitment from its stable identity reference,
Protocol Line, B's stable `stationId`, and a fresh nonce. B signs and stores
only the digest. Peers recompute it from protected affiliation state. An
asynchronous Route repeats it, and B covers it in the route-service signature.

## Contribution to LicoArc's final vision

Links Endpoint-controlled identity continuity to a Station-accepted
affiliation and its private Routes without exposing stable Endpoint identity
to the Station.

## Field model and trade-offs

The commitment is the narrow bridge between Endpoint-controlled identity and
Station-acknowledged service. It enables global A-to-B affiliation plus private
per-peer Routes without embedding a Station namespace in Endpoint identity.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Mandatory in AFFILIATE request/result, asynchronous RESERVE request, StationAffiliation, and Route |
| Values or range | Domain-separated digest of the exact tuple named by the registry |
| Canonical representation | Protocol-Line-pinned deterministic tuple under the selected digest profile |
| Invalid input | Mismatch, unknown profile, wrong Station, copied Endpoint binding, or missing value fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Bind Station acceptance and Route issuance to the same Endpoint-specific affiliation without Station-visible identity. |
| Field-level necessity | Station operations and protected state need one exact common comparison value. |
| Removal consequence | Direct identity exposure or copyable unbound Station statements remain. |
| Derivation | Station receives it from the Endpoint; peers derive it only with protected nonce and identity context. |
| Lower-layer carrier | Transport authentication identifies a local caller but supplies no portable peer-verifiable binding. |
| Existing carrier | Delivery Handle is per Route and cannot be the Endpoint-wide affiliation subject. |
| Protected placement | Station-facing use exposes only the digest; peer use remains protected. |
| Duplicate-authority risk | Every placement must byte-match; aliases are forbidden. |

## Visibility and trust

Equality lets one Station correlate affiliation and Route reservations during
the bounded affiliation lifetime. It does not reveal Endpoint identity without
the nonce and identity context, and proves nothing until both Endpoint and
Station authentication validate the containing states.

## Alternatives

Direct identity, a public mailbox/account identifier, `providerId`,
`networkId`, Delivery Handle reuse, and a copyable random token were rejected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

Matrix provides rejection evidence;
TUF informs exact signed scope and expiry; and
MLS informs separation from the Delivery Service.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Ties Station statements to one Endpoint identity and Station under digest assumptions. |
| Privacy and metadata | Hides identity but creates bounded Station-local operation linkage. |
| Interoperability | Exact tuple, domain separator, digest profile, and comparison are mandatory. |
| Implementation complexity | Shared validation across AFFILIATE, RESERVE, affiliation, and Route admission. |
| CPU, memory, and wire cost | One 32-octet value and digest computation. |
| Evolution and downgrade | Profile changes create a new commitment and affiliation update. |

## Decision history

Threat review showed that a Station-signed opaque handle could be copied to a
different Endpoint, while signing `endpointIdentityRef` would leak stable
identity. The identity-bound randomized commitment was selected.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
