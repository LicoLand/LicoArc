# Field Review: Station Affiliations

This record explains the decision; the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) alone specifies the
field.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-affiliations` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | home Station, guarantor list, service affiliations |
| Candidate layer | Identity/Discovery protected control state |
| Observer set | Peer Endpoints; hidden from Stations as a complete set |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Future Affiliation Update schema and corpus |
| Predecessor or successor | None |
| Current conclusion | One atomic Endpoint-wide ordered snapshot names the sole primary Station service affiliate, bounded alternates, or an explicit unaffiliated state. |

## Question

Where does the protocol state “this stable Endpoint is currently affiliated
with B” independently of per-peer Route Handles?

## Role in communication

The Endpoint publishes the same protected logical snapshot to every peer. The
first entry is primary, later unique Stations are alternates, and each entry
contains a Station-accepted identity-bound commitment. A Station signs only
its own entry and never selects ordering or the complete set.

## Contribution to LicoArc's final vision

States one Endpoint-wide primary and bounded alternates so every peer can
distinguish current Station affiliation from private per-peer routing.

## Field model and trade-offs

The field is the second segment after stable Endpoint Identity. It gives peers
a uniform B-current fact while retaining private Route Handles as a third
segment. Station selection remains Endpoint-authenticated state rather than a
service-qualified identity or Station-owned account fact.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | Bounded ordered `StationAffiliation` collection |
| Presence | Mandatory; zero entries explicitly means unaffiliated |
| Values or range | `0..MAX_AFFILIATIONS`; resolved `stationId` values unique; first is primary |
| Canonical representation | Protocol-Line-pinned deterministic array in declared order |
| Invalid input | Duplicate Station, malformed entry, invalid commitment/signature, expired primary, or excess bound fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Express one global current primary Station while allowing bounded overlap and private relationship Routes. |
| Field-level necessity | Per-peer `routes` may contain different Delivery Handles and cannot be global affiliation authority. |
| Removal consequence | One Endpoint can show A to one peer and B to another without detectable affiliation equivocation. |
| Derivation | Station identity, Route order, Network, Provider, and discovery do not select Endpoint affiliation. |
| Existing carrier | No current field owns an Endpoint-wide atomic Station set. |
| Protected placement | The complete relationship graph stays inside endpoint protection. |
| Duplicate-authority risk | `routes` references but cannot override this snapshot. |

## Visibility and trust

Peers learn current primary and alternate Stations. Stations see only their
own opaque commitments, not the complete set or Endpoint identity. Endpoint
authentication selects the set; Station signatures prove only bounded
acceptance of individual commitments.

## Alternatives

A Station-qualified Endpoint identifier, per-peer Route order, a public
membership list, and an unbounded or patch-based set were rejected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

Matrix supplies rejection evidence;
TUF informs atomic versioned state; and
MLS informs separation from Delivery Service
routing without contributing group membership semantics.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Separates global Endpoint selection from Station acceptance and per-peer routing. |
| Privacy and metadata | Protected but visible to every peer; bounds limit topology disclosure. |
| Interoperability | Ordering, uniqueness, empty state, validation, and maximum size must be exact. |
| Implementation complexity | Atomic snapshot persistence and cross-peer equivocation handling. |
| CPU, memory, and wire cost | Linear in a fixed small `MAX_AFFILIATIONS`. |
| Evolution and downgrade | Set semantics cannot be replaced by patches or Station-selected membership. |

## Decision history

Threat review found that a relationship-scoped primary Route did not satisfy
the Endpoint-wide migration requirement. The table was restructured: this
field became the sole global primary/alternate authority, and Routes became
relationship projections bound back by digest.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
