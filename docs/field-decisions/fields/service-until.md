# Field Review: Station Service-Commitment Expiry

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-service-until` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | route-service expiry, handle expiry, Route commitment expiry |
| Candidate layer | Transport Profile and protected Route |
| Observer set | Reserving Endpoint and Station; peer Endpoints after protected projection |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Canonical Field Registry, HTTPS Transport v1, the Identity Route schema, and conformance corpora |
| Predecessor or successor | None |
| Current conclusion | A Station-signed route capability needs a Station-selected upper validity bound distinct from the Endpoint-selected route-set expiry. |

## Question

How can a peer determine the latest time for which a Station signed its
recognition of one Delivery Handle without treating Station time as message
freshness or delivery evidence?

## Role in communication

The Station produces `serviceUntil` with an accepted asynchronous `RESERVE` result and
binds it into `stationServiceSignature`. The reserving Endpoint copies the
unchanged value into the protected Route. The peer consumes it only to bound
use of that Station-issued route capability.

## Contribution to LicoArc's final vision

Gives every signed asynchronous Route a finite interoperable stopping point
without turning Station availability or delivery claims into Endpoint
evidence.

## Field model and trade-offs

The value allows Station B to issue a finite Route commitment under an already
accepted affiliation. It gives a peer an interoperable stopping condition
while preserving the rule that B
does not authenticate the Endpoint and cannot prove delivery. The expiry is
part of a narrowly scoped Route capability and never becomes account lifetime,
membership, Endpoint freshness, or message-delivery evidence.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | Unsigned Unix seconds |
| Presence | Mandatory in an accepted asynchronous `RESERVE` result and its projected `Route`; not a first-contact field |
| Values or range | Safe non-negative Unix seconds no later than the exact descriptor `notAfter` and matched `affiliationNotAfter` |
| Canonical representation | Deterministic integer representation selected by the containing Transport Profile or Protocol Line |
| Invalid input | Missing, malformed, expired, after descriptor `notAfter`, after matched `affiliationNotAfter`, or changed after signing fails closed rather than being truncated |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Verify that the Station's signed service commitment has not outlived the interval the Station itself issued. |
| Field-level necessity | `routeNotAfter` is chosen by the Endpoint and cannot state the Station's independent commitment bound. |
| Removal consequence | An Endpoint could present a Station signature as indefinitely current or choose a route expiry beyond the Station-issued handle lifetime. |
| Existing-field evidence | Station descriptor expiry bounds the descriptor and key, not one reserved Delivery Handle. |
| Derivation | A peer cannot derive Station-local handle lifetime from the opaque handle or Transport Profile framing. |
| Lower-layer carrier | A transport response may deliver the value to the reserving Endpoint, but the remote peer also needs it inside the protected Route. |
| Existing carrier | Neither `routeNotAfter` nor descriptor `notAfter` has the same producer or scope. |
| Protected placement | The Station sees the value it issues; the peer copy remains endpoint-protected with the relationship route. |
| Duplicate-authority risk | `serviceUntil` must fit within descriptor and affiliation validity; `routeNotAfter` may shorten Route use but cannot repair an invalid Station bound. |

## Visibility and trust

The Station chooses and observes the value during `RESERVE`; the peer sees it
only within endpoint protection. The signature gives integrity, not accurate
clock behavior, availability, deletion, or delivery. A value later than the
descriptor or matched affiliation expiry is invalid. Once valid, the Endpoint
may shorten actual Route use with an earlier `routeNotAfter`. Suppression
remains possible, and expiry cannot reset retained state.

## Alternatives

- Reusing `routeNotAfter` was rejected because the Endpoint and Station are
  independent producers with different authority.
- Reusing descriptor `notAfter` was rejected because one descriptor can issue
  many handles with shorter independent lifetimes.
- A sender-selected TTL or retention class remains rejected; it controls
  neither this service commitment nor Station storage policy.
- Station-local hidden expiry was rejected because a remote peer would lack a
  verifiable bound and could repeatedly attempt a dead route.
- An issue timestamp plus duration was rejected as two fields where one
  absolute upper bound performs the required validation.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- TUF supplies evidence that signed metadata needs
  explicit expiry and retained rollback checks; TUF role and repository
  semantics are not inherited.
- MLS supplies evidence for keeping delivery
  service state separate from endpoint-authenticated protocol state.
- Matrix supplies rejection evidence for
  interpreting service-owned account or membership state as Endpoint identity.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Prevents indefinite replay of a Station-issued route commitment but cannot force the Station to serve it. |
| Privacy and metadata | Hidden from unrelated Stations; the issuing Station already knows its own expiry and handle. |
| Interoperability | Requires exact clock-skew, upper-lifetime, reject-not-truncate, and Route-shortening rules. |
| Implementation complexity | Adds one comparison to reservation, route validation, persistence, and selection. |
| CPU, memory, and wire cost | One bounded integer; constant-time validation and state. |
| Evolution and downgrade | A successor profile may shorten the maximum but cannot reinterpret an existing field as message or retention expiry. |

## Decision history

LicoArc review of the portable Station-affiliation requirement found that
the existing Endpoint-selected `routeNotAfter` could not represent the
Station's independent service commitment. A dedicated signed upper bound was
selected over implicit lifetime, duplicated timestamps, and sender-selected
TTL. Threat review fixed the conflict rule: a value beyond descriptor or
affiliation validity is rejected, not silently capped. The Transport and
Identity schemas close its safe-integer encoding, conditional presence,
covered signature tuple, and fail-closed bounds.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
