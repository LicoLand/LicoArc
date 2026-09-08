# Field Review: Previous Route Update Digest

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-previous-route-update-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | previous route, prior station, migration source, route parent |
| Candidate layer | Identity/Discovery and Reliable Exchange |
| Observer set | Peer Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Canonical Field Registry, Identity Route Update schema, grammar, policy, and conformance corpus |
| Predecessor or successor | None |
| Current conclusion | Every non-initial relationship Route Update needs one digest of its immediate logical predecessor so private Handle replacement is a verifiable succession under an exact global affiliation state. |

## Question

Can `routeEpoch` alone prove that a private Route Update is the authorized
successor of the exact relationship state a peer previously accepted?

## Role in communication

The Endpoint producing a successor Route Update commits its exact prior
logical route state. The peer compares the value with retained state before
replacing private transport candidates, and separately validates
`affiliationStateDigest`. The value is Endpoint-authenticated, not supplied or
ordered by a Station.

## Contribution to LicoArc's final vision

Proves exact succession of relationship-specific Routes so private Handle
replacement remains ordered across migration, retry, and reconnect.

## Field model and trade-offs

The field lets an Endpoint rotate or replace relationship-specific Delivery
Handles without losing route continuity. Global A-to-B affiliation is owned by
the separate Affiliation Update chain; a Route successor names that state by
digest and introduces B-specific private paths without requiring A to approve,
release, forward, or delete anything. The Endpoint, not a Station, directory,
repository, mirror, or arrival-order rule, authenticates the succession.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` content identity |
| Presence | Conditional: absent only at `routeEpoch == 1`, mandatory thereafter |
| Values or range | Exactly one digest of the immediate canonical logical predecessor |
| Canonical representation | Protocol-Line-pinned deterministic encoding of `endpointIdentityRef`, `protocolLineId`, `routeEpoch`, `previousRouteUpdateDigest` presence/value, `affiliationStateDigest`, `routes`, and `routeNotAfter`; Protection Profile, capability, session, framing, ciphertext, and retry envelope are excluded |
| Invalid input | Missing successor digest, unexpected initial digest, parent mismatch, epoch gap, or fork fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Replace or rotate private Routes while proving continuity from exact accepted relationship state and detecting forks, gaps, and rollback. |
| Field-level necessity | A monotonic integer orders values but does not bind the successor to one exact predecessor. |
| Removal consequence | Two different updates can claim the next epoch, and a peer cannot distinguish an authorized chain from a fork or omitted intermediate transition. |
| Existing-field evidence | `routeEpoch` supplies a high-water mark only; `routes` supplies the current full snapshot only. |
| Derivation | Arrival order, Station time, and the new route set cannot recover the digest of the exact accepted predecessor. |
| Lower-layer carrier | Transport ordering is adversarial, retryable, and session-specific, so it cannot carry identity-state succession. |
| Existing carrier | No admitted field binds an immediate Route Update parent. |
| Protected placement | The digest belongs inside endpoint protection because route history reveals Station relationships. |
| Duplicate-authority risk | A separate `previousStationId` would conflict with multi-route snapshots and duplicate the predecessor's authenticated contents. |

## Visibility and trust

Only peer Endpoints observe the field under endpoint protection. It is
integrity-protected with the Route Update but does not prove liveness or
prevent suppression. A receiver retains the last accepted epoch and digest
after route expiry; expiry cannot reset the high-water mark. A lower epoch is
stale, the same epoch with different logical bytes is equivocation, and a
successor whose parent does not equal the retained digest is a fork. The
digest can correlate identical logical updates if disclosed, so it is not a
public migration-history identifier.

## Alternatives

- `routeEpoch` alone was rejected because it cannot select one parent.
- `previousStationId` and `fromStationId` were rejected because migration may
  replace an atomic multi-Station set and the previous snapshot already owns
  those identifiers.
- Station-signed release or transfer approval was rejected because a
  malicious, unavailable, or censoring old Station must not block migration.
- Last-write-wins, highest-epoch-wins across a fork, and arrival order were
  rejected because they permit rollback or equivocation to choose state.
- A public hop or migration trace was rejected because it leaks relationship
  history and duplicates authenticated state.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- TUF supplies evidence for versioned, expiring,
  predecessor-aware state and rollback rejection; no TUF object or trust root
  is inherited.
- MLS supplies evidence that authenticated epochs
  and evolving state remain distinct from an untrusted delivery service; MLS
  group state and membership are not adopted.
- Matrix supplies rejection evidence for making
  a service namespace or homeserver the identity and state authority.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Detects stale parents, missing transitions, and divergent successors when compared with retained accepted state. |
| Privacy and metadata | Hidden placement avoids publishing A-to-B history; disclosure still correlates identical state. |
| Interoperability | Requires one exact canonical logical digest scope and deterministic failure classes. |
| Implementation complexity | Adds one retained digest and bounded chain validation per peer relationship. |
| CPU, memory, and wire cost | One 32-octet field and one digest computation per successor; retained state is constant-size apart from any separately bounded catch-up chain. |
| Evolution and downgrade | Epoch and digest high-water marks cannot reset on Station change, reconnect, expiry, or continuity-preserving Endpoint key rotation. |

## Decision history

The omission option, epoch-only ordering, explicit old-Station identifiers,
old-Station approval, and predecessor digest were reviewed. LicoArc review
selected the digest because it is the least exposed value that proves exact
succession for a private Route snapshot. Later threat review moved the global
primary Station fact into `stationAffiliations`; this field now owns only the
relationship Route chain. The Canonical Field Registry, Identity policy and
schema now close safe-integer bounds, SHA-256 logical digests, bounded retained
chain state, and fail-closed gap, fork, replay, rollback, and overflow rules.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
