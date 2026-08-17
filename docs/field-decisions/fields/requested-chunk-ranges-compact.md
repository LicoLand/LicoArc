# Field Review: Compact Attachment Recovery State

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-requested-chunk-ranges-compact` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-requested-chunk-ranges`; no successor. |
| Current conclusion | `requestedChunkRanges` is the sole normal attachment feedback surface: non-empty state requests bounded missing work and empty state reports verified completion. |

## Question

How can an attachment normally complete with one small reverse control record
and recover only when chunks are missing?

## Role in communication

The receiver persists chunks without sending routine success confirmations.
After interruption or detected gaps it sends bounded canonical ranges; after
complete length and digest verification it sends empty state. The sender
retains source data until that terminal state or another terminal boundary.
Non-empty recovery updates remain session-authenticated derivative traffic;
the final empty verified state is a Transferable Statement and cannot advance
attachment completion until its Evidence Checkpoint joins.

## Contribution to LicoArc's final vision

Uses bounded recovery batches and one verified completion state as the normal attachment feedback path, eliminating routine per-chunk success confirmations.

## Field model and trade-offs

The field remains mandatory `ChunkRange[0..MAX_REQUEST_RANGES]` in Attachment
Receive State. Non-empty state is one recovery batch and empty state is
completion. Empty state requires complete-content verification and one valid
Evidence Checkpoint before finality. Each changed state uses a new `messageId`, but an attachment is
also bounded by `MAX_ATTACHMENT_STATE_UPDATES`,
`MAX_ATTACHMENT_RECOVERY_ROUNDS`,
`MAX_ATTACHMENT_RETRANSMITTED_CHUNKS`, and
`MAX_ATTACHMENT_CONTROL_BYTES`. Repetition cannot refresh any bound.

Ranges remain sorted, strictly disjoint, non-adjacent, half-open, and bounded
by both `MAX_REQUEST_RANGES` and `MAX_REQUESTED_CHUNKS`. Invalid or silently
normalized input fails closed. Completion, cancellation, and terminal failure
are absorbing.

## Necessity proof

The receiver alone knows durable gaps. A range set communicates sparse loss
without acknowledging every successful chunk; an empty set carries the one
normal terminal result.

## Visibility and trust

The state is Endpoint-authenticated and hidden from Stations. Only its final
empty verified state becomes independently attributable through a checkpoint;
packet size, timing, and retransmission shape remain observable and are not
anonymity claims.

## Alternatives

- Routine per-chunk success confirmations: rejected for linear reverse
  control traffic.
- Replay the entire attachment: correct but wastes Payload bytes.
- Cursor or bitmap: rejected for gaps or unbounded state.
- Bounded ranges plus empty completion: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned recovery and
control-budget question is self-contained.

## Decision history

The predecessor selected bounded ranges while retaining routine per-chunk
Endpoint Confirmation. LicoArc review on 2026-08-03 made receive state the sole
normal attachment feedback surface, added lifetime traffic bounds, updated the
Field Registry, and retired the broader predecessor. The transferable-evidence
review required one checkpoint for final empty verified state while retaining
unsigned bounded non-empty recovery updates and chunks.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
