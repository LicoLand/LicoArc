# Field Review: Affiliation State Digest

This record explains the field. The
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) is authoritative.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-affiliation-state-digest` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | affiliation ref, home state digest, binding-set digest |
| Candidate layer | Relationship-scoped Route Update |
| Observer set | Peer Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Future Route Update and affiliation schemas and corpus |
| Predecessor or successor | None |
| Current conclusion | Every private Route snapshot names one exact accepted Endpoint-wide affiliation state so routes cannot outlive or bypass global migration. |

## Question

How does a relationship Route Update prove that its Station and commitment
remain admitted by the Endpoint's global current affiliation state?

## Role in communication

The Endpoint copies the digest of the exact logical Affiliation Update into a
Route Update. The peer resolves it to its last accepted global state and
validates every Route's `stationId` and `affiliationCommitment` membership.

## Contribution to LicoArc's final vision

Makes every private Route depend on one exact global affiliation state so
routing cannot outlive or bypass a completed Station migration.

## Field model and trade-offs

This field completes the multi-segment design: stable identity authorizes a
global Station affiliation state, and each private Route explicitly depends
on that exact state. A-to-B migration invalidates A-bound Routes without
changing identity or requiring A's cooperation.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Mandatory in every Route Update |
| Values or range | Digest of the exact last-accepted canonical logical Affiliation Update |
| Canonical representation | Protocol-Line-pinned deterministic encoding of `endpointIdentityRef`, `protocolLineId`, `affiliationEpoch`, `previousAffiliationUpdateDigest` presence/value, and `stationAffiliations`, using the same digest profile as affiliation predecessor state |
| Invalid input | Unknown, stale, expired, forked, mismatched state, or Route outside its Station/commitment set fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Retire every A Route when global state moves to B while retaining private peer Handles. |
| Field-level necessity | Per-peer route epoch cannot identify which global affiliation snapshot authorized it. |
| Removal consequence | An old A Route chain may remain internally current after A is globally retired. |
| Derivation | Route arrival time and Station identity cannot select the global affiliation generation. |
| Existing carrier | Neither route predecessor digest nor capability digest owns affiliation state. |
| Protected placement | Global-state correlation remains peer-visible only. |
| Duplicate-authority risk | The digest references but cannot override the Affiliation Update. |

## Visibility and trust

The digest is Endpoint-authenticated and protected but correlates Route and
affiliation updates for the receiving peer. It does not prove Station service
or identity; the referenced state and Route signatures do that within their
limited scopes.

## Alternatives

Copying affiliation epoch alone, duplicating primary `stationId`, implicit
latest-state selection, and embedding peer Handles in global state were
rejected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

TUF informs exact snapshot binding;
MLS informs authenticated context; and
Matrix supplies rejection evidence for
server-owned identity/state coupling.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Prevents route authorization from drifting away from global affiliation. |
| Privacy and metadata | Preserves private Handles outside global state but correlates both states to each peer. |
| Interoperability | Requires exact digest scope and membership validation. |
| Implementation complexity | One dependency lookup and validation across two retained state machines. |
| CPU, memory, and wire cost | One 32-octet field plus bounded membership checks. |
| Evolution and downgrade | New global state invalidates routes until an explicit successor references it. |

## Decision history

Threat review required separation of Endpoint-wide affiliation from
relationship-scoped Routes. This digest was admitted as the minimum explicit
dependency edge between those authorities.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
