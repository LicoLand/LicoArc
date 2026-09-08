# Field Review: Ratchet Header

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-ratchet-header` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Pairwise Protection architecture](../../../ARCHITECTURE.md#3-pairwise-protection) and the [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/FIELD-REGISTRY.md`, `spec/v1/protection/`, `spec/v1/protection/registry.json`, `formal/`, `conformance/v1/protection/`, and `spec/v1/manifest.json` |
| Predecessor or successor | Replaces the withdrawn epoch/direction/counter scope; preserves no counter-only wire or compatibility path. |
| Current conclusion | The classic X25519 Double Ratchet header carries authenticated DH public key, previous-chain length `PN`, and message number `N` in a canonical plaintext-but-authenticated header. |

## Question

Which transmitted ratchet coordinates are necessary for asynchronous
out-of-order delivery, bounded skipped-key handling and replay rejection under
the exact Core v1 Double Ratchet?

## Role in communication

The receiving Endpoint uses the authenticated header to select the exact
ratchet state, derive bounded skipped keys, apply a DH transition, and reject
replays or stale coordinates. Transport order and a generic epoch/counter
cannot replace these coordinates.

## Contribution to LicoArc's final vision

Enables independent Endpoints to process asynchronous, reordered protected
records under one classic ratchet while keeping state, work, and metadata
bounds explicit.

## Field model and trade-offs

| Coordinate | Approved semantic |
| --- | --- |
| DH | Current ratchet public key, exactly the raw X25519 public-key value used for the authenticated DH transition. |
| PN | Previous sending-chain length used to derive skipped keys before a DH transition. |
| N | Current message number in the sending chain; consumed once and rejected on replay or overflow. |
| Representation | Canonical deterministic Profile header; core values are finite and bounded by the Profile. |
| Authentication | Header is plaintext for routing/metadata visibility but is authenticated as complete associated data with the ciphertext. |
| Lookup | Skipped keys are indexed by `(ratchet-public-key, message-number)` in a bounded map for O(1) lookup. |
| Failure | Invalid, stale, duplicate, over-bound, or overflowed coordinates fail without mutating the prior state. |

The header is Profile-owned, not a common field or algorithm menu. Its
associated data is the session-context digest plus the complete canonical
header, and the protected frame is header, ciphertext, then the 16-byte
ChaCha20-Poly1305 tag. Header confidentiality and ongoing PQ post-compromise
recovery are explicit nonclaims.

## Visibility and trust

Plaintext DH/PN/N coordinates reveal residual traffic shape and session
progress. They are not security authority until AEAD authentication succeeds.
A Station or observer cannot use their visibility to authoritatively advance,
reset, or select Endpoint ratchet state.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Select a ratchet state and derive bounded skipped keys for asynchronous and out-of-order records. |
| Removal consequence | A counter-only frame cannot identify DH transitions and cannot safely distinguish stale, skipped, or replayed messages. |
| Derivation | The receiver cannot derive the sender's current ratchet public key or prior-chain boundary from transport order. |
| Lower-layer carrier | A Transport sequence or Station timestamp is not Endpoint-authenticated ratchet state. |
| Protected placement | The exact Profile header authenticates these coordinates; no common sequence, nonce, or session identifier is admitted. |
| Duplicate-authority risk | Common counters, generic nonces, or per-record Profile selectors would conflict with the selected ratchet and are rejected. |

## Decision history

Repository review on 2026-08-31 adopted the classic X25519 DH/PN/N header,
canonical authenticated framing, tuple-indexed bounded skipped-key state, and
no-counter-only rule. Exact integer widths, labels, byte order, bounds, and
vectors are closed by the linked machine authority.

## Decision outcome

The ratchet header semantics are approved as an independent field decision.
They remain Profile-owned and do not allocate a common field or selector.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The linked schema, integer widths, labels, byte order, bounds, formal bindings,
vectors, and aggregate source closure close the exact Profile header.
