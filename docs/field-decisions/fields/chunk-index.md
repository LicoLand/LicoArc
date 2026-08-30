# Field Review: Chunk Index

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-chunk-index` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `chunkIndex` is required for every `streamChunk`; on an attachment it identifies one immutable slice under `(relatesTo, attachmentId)` and is bounded by descriptor-derived chunk count. |

## Question

How does a receiver place, deduplicate, and detect gaps among protected stream
chunks despite retry or reordering?

## Role in communication

The sender assigns the ordinal and the receiver validates it within the
correlated logical stream. For an attachment, the tuple of declaring Message,
attachment, and index is the stable chunk identity across retry, restart,
re-protection, and Route migration. It is not a Pairwise Protection counter or
Station delivery sequence.

## Contribution to LicoArc's final vision

Gives protected streaming a bounded order so peers can reject duplicates,
gaps, and ambiguous reassembly.

## Field model and trade-offs

The value is a conditionally mandatory `uint64` starting at zero. Attachment
indexes must be less than the count derived from `byteLength` and the fixed
Protocol-Line `ATTACHMENT_CHUNK_BYTES` constant, and the derived count cannot
exceed `MAX_ATTACHMENT_CHUNKS`. The first valid Message for a tuple binds both
its stable `messageId` and content. Exact duplicates are idempotent; a different
Message identity or content is a terminal attachment conflict. Arrival order
does not affect placement or acceptance.

## Visibility and trust

The ordinal must be Endpoint-authenticated and protected. A Station may delay,
duplicate, reorder, or suppress chunks but cannot authoritatively renumber
them; traffic shape can remain externally observable.

## Decision history

The field was admitted because stream position cannot be inferred reliably
from arrival order, retransmission order, or protection-layer counters.

LicoArc review on 2026-08-03 closed the attachment use: the index and existing
declaring Message and attachment identities form the durable chunk key and
bind one stable chunk Message identity, while offset, length, count, final
marker, and per-chunk digest remain derived or rejected.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
