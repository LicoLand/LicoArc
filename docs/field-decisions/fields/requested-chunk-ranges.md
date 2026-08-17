# Field Review: Requested Attachment Chunk Ranges

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-requested-chunk-ranges` |
| Decision status | `RETIRED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-requested-chunk-ranges-compact`. |
| Current conclusion | Retired: the successor keeps bounded ranges and makes receive state the sole normal attachment feedback path. |

## Question

How does a receiving Endpoint report exactly what a large attachment still
needs after interruption, restart, reconnection, re-protection, or Route
migration without sending file-sized state?

## Role in communication

The receiving Endpoint produces Attachment Receive State. The sending
Endpoint validates its declaring Message, attachment identity, range grammar,
range-count bound, and covered-chunk bound before retransmitting only the
requested immutable chunks. Scheduling, quota, and storage layout remain
local.

## Contribution to LicoArc's final vision

Retiring recovery state that coexisted with routine per-chunk success confirmations makes bounded ranges and verified completion the sole normal attachment feedback path.

## Field model and trade-offs

The predecessor value was mandatory `ChunkRange[0..MAX_REQUEST_RANGES]` inside
the Protocol-Line-owned Attachment Receive State. Ranges were sorted,
strictly disjoint, non-adjacent half-open intervals. Their count cannot exceed
`MAX_REQUEST_RANGES`, and the checked sum of covered indexes cannot exceed
`MAX_REQUESTED_CHUNKS`. One state may request a bounded subset of missing
chunks; successive changed state Messages with fresh `messageId` values could
request further batches.

An empty array is valid only after all derived chunk indexes and lengths are
durably accepted, reassembled length equals `byteLength`, and `contentDigest`
verifies. A non-empty array never proves loss or sender fault; it requests
idempotent retransmission of only the original immutable chunk Messages with
their stable `messageId` values. A changed snapshot uses a new Message
identity; replay of the same identity is idempotent. The successor additionally
bounds state updates, recovery rounds, retransmitted chunks, and control bytes.
Neither form refreshes `ATTACHMENT_RECOVERY_WINDOW`, and a stale non-empty request cannot reopen an
attachment after authenticated completion or another terminal result. Both
peers retain that terminal tombstone through the window even if payload bytes
have been released. No input is silently sorted, merged, clipped, or truncated.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Reconcile receiver-held and sender-held attachment state after both endpoints may have restarted. |
| Field-level necessity | The receiver is the only peer that can authoritatively report its durably retained chunk set. |
| Removal consequence | Recovery must replay every chunk or rely only on possibly lost individual confirmations. |
| Derivation | The sender cannot derive receiver persistence from Station delivery or connection history. |
| Existing carrier | `messageId`, `relatesTo`, and `attachmentId` identify state but cannot encode multiple gaps. |
| Duplicate-authority risk | A cursor, bitmap, or open-ended range can conflict with actual gaps or cause unbounded work. |

## Visibility and trust

The array is Endpoint-authenticated and hidden from Stations. Outer packet
length, timing, count, and retransmission shape remain observable. A Station
cannot create new work by modifying the protected ranges; a malicious peer can
request work only within each Protocol-Line bound, while local policy may
still reject or schedule it.

## Alternatives

- Bounded canonical half-open ranges: selected.
- Replay the complete attachment: correct but defeats selective recovery.
- A single resume cursor: rejected because out-of-order gaps remain hidden.
- A received-chunk bitmap or per-chunk acknowledgement array: rejected because
  wire and memory cost grow with attachment chunk count.
- Open-ended or wildcard ranges: rejected because a tiny request can authorize
  an unbounded response.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned recovery-state,
resource-bound, and canonical-representation questions are self-contained.

## Decision history

The question advanced from `OPEN` to `READY` after complete replay, cursor,
bitmap, bounded range, empty completion, overflow, replay, and amplification
cases were closed. LicoArc review on 2026-08-03 selected doubly bounded
canonical ranges, updated the Field Registry in the same bounded change, and
moved the record to `DECIDED`. The later compact-control review retired its
coexistence with routine per-chunk success confirmation and assigned current
semantics to `FLD-requested-chunk-ranges-compact`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
