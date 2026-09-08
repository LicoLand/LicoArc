# Field Review: Previous Affiliation Update Digest

This record is explanatory decision history, not a second specification. The
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) is authoritative.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-previous-affiliation-update-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | previous home, transfer source, affiliation parent |
| Candidate layer | Identity/Discovery protected control state |
| Observer set | Peer Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | The Identity Affiliation Update schema, grammar, policy, and corpus |
| Predecessor or successor | None |
| Current conclusion | Every successor binds the exact immediate Endpoint-wide affiliation state, so A-to-B migration is a chain rather than an unverified label change. |

## Question

How does affiliation epoch `n+1` prove that it succeeds the exact global state
accepted at epoch `n`?

## Role in communication

The Endpoint produces a digest of the prior canonical logical Affiliation
Update. Every peer compares it with retained state before accepting the
successor. Neither old nor new Station participates in state ordering.

## Contribution to LicoArc's final vision

Proves exact succession of global Station affiliation so migration is
rollback-resistant, fork-detectable, and independent of the old Station's
consent.

## Field model and trade-offs

The digest proves `{A}` → `{B}` while permitting overlap `{A}` → `{B,A}` →
`{B}` and requiring no release or veto from A. The predecessor is exact
Endpoint-authenticated state rather than a Station, repository, mirror,
membership, or arrival-order assertion.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Absent only at epoch one; mandatory thereafter |
| Values or range | Digest of the exact immediate predecessor tuple named by the registry |
| Canonical representation | Deterministic logical state; pairwise session, protection framing, and ciphertext excluded |
| Invalid input | Missing, unexpected initial value, mismatched parent, gap, or fork fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Detect forks, gaps, rollback, and conflicting A-to-B/A-to-C successors. |
| Field-level necessity | Epoch orders states but does not bind one exact parent. |
| Removal consequence | Different successors can claim the same next epoch without a verifiable parent edge. |
| Derivation | Current affiliations do not reproduce the complete preceding snapshot. |
| Existing carrier | Route predecessor state is relationship-scoped and cannot own Endpoint-wide history. |
| Protected placement | Old and current Station relationships remain hidden from Stations and the public. |
| Duplicate-authority risk | `fromStationId` duplicates an atomic multi-Station predecessor and leaks history. |

## Visibility and trust

The field is endpoint-authenticated and protected. It provides rollback
evidence to retained peers but cannot prevent suppression. Cross-peer different
successors at one epoch are equivocation and require transparency, recovery,
or re-verification rather than highest-value selection.

## Alternatives

Epoch-only ordering, arrival order, old-Station identifiers, public migration
history, and old-Station transfer approval were rejected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

Pinned TUF, MLS, and
Matrix evidence supports the scoped conclusions
above.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Binds one exact parent and exposes divergent successors. |
| Privacy and metadata | Hidden; public disclosure would create migration-chain correlation. |
| Interoperability | Exact digest tuple and fail-closed comparison are mandatory. |
| Implementation complexity | One retained digest plus bounded catch-up and fork state. |
| CPU, memory, and wire cost | One 32-octet field and one digest per successor. |
| Evolution and downgrade | Logical digest excludes relationship protection details so rekey does not rewrite history. |

## Decision history

The Endpoint-wide affiliation review selected an immediate-parent digest over
old-Station identifiers, patches, and old-Station approval. It is a new global
state chain and does not reuse the relationship Route predecessor.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
