# Field Review: Endpoint Affiliation Epoch

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-affiliation-epoch` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | affiliation version, home Station generation, service epoch |
| Candidate layer | Identity/Discovery protected control state |
| Observer set | Peer Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | The Identity Affiliation Update schema, grammar, policy, and corpus |
| Predecessor or successor | None |
| Current conclusion | One Endpoint-wide epoch orders the current primary and alternate Station affiliations consistently across every peer. |

## Question

What monotonic value lets every peer distinguish current Endpoint-wide
Station-affiliation state from stale, reset, or conflicting state?

## Role in communication

The stable Endpoint identity produces `affiliationEpoch`; every peer consumes
the same logical value and snapshot. A Station never chooses, advances, or
resets it.

## Contribution to LicoArc's final vision

Gives every peer one rollback-resistant order for an Endpoint's global
Station-affiliation state while the Endpoint identity remains stable.

## Field model and trade-offs

The field keeps one Endpoint identity stable while its primary service
affiliate changes from A to B. A global monotonic order and exact predecessor
binding let every peer reject rollback, gaps, and same-epoch equivocation
without granting a Station identity or state authority.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `uint64` |
| Presence | Mandatory in every Endpoint Affiliation Update |
| Values or range | Initial value one; each successor is exactly prior value plus one; no reset |
| Canonical representation | Deterministic unsigned integer in the selected Protocol Line |
| Invalid input | Zero, lower value, gap, reset, overflow without specified recovery, or same epoch with different state fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Order global `{A}` to `{B}` succession and retain one high-water mark across peers. |
| Field-level necessity | A digest binds exact state but does not express monotonic position or gaps. |
| Removal consequence | Peers cannot reject old snapshots or detect omitted generations deterministically. |
| Derivation | Arrival order, Station time, Route epoch, and descriptor sequence have different scopes. |
| Existing carrier | `routeEpoch` is relationship-scoped because Delivery Handles may differ by peer. |
| Protected placement | The value is peer-visible only under endpoint protection. |
| Duplicate-authority risk | No Station-, Network-, Provider-, or route-owned copy may select global affiliation state. |

## Visibility and trust

Peers retain the greatest accepted epoch and exact state digest even after
expiry. Equal epoch with different state is Endpoint equivocation across peer
relationships. Suppression remains possible, but no Station can authenticate
a replacement.

## Alternatives

Reusing relationship-scoped `routeEpoch`, Station descriptor sequence, time,
and last-write-wins were rejected because they cannot own one global Endpoint
affiliation fact.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

The applicable pinned evidence is TUF,
MLS, and Matrix; no
wire object or trust root is inherited from them.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Supplies a global high-water mark; predecessor digest supplies exact parent binding. |
| Privacy and metadata | Protected placement avoids publishing migration cadence. |
| Interoperability | Initial, increment, conflict, and persistence rules are exact. |
| Implementation complexity | Constant-size retained epoch plus fork handling. |
| CPU, memory, and wire cost | One integer and constant-time comparison. |
| Evolution and downgrade | Cannot reset on Station migration, expiry, reconnect, or continuity-preserving key rotation. |

## Decision history

LicoArc review rejected a relationship-scoped “current primary Station”
because the same Endpoint could otherwise claim A to one peer and B to another
without a protocol fork. The Endpoint-wide epoch was selected as the smallest
global ordering value and paired with an exact predecessor digest.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
