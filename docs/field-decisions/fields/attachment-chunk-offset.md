# Field Review: Declared Attachment Chunk Offset

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-chunk-offset` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject attachment `chunkOffset`; the receiver derives it from `chunkIndex * ATTACHMENT_CHUNK_BYTES` with checked arithmetic. |

## Question

Must every attachment chunk transmit its byte offset in addition to its
immutable index?

## Role in communication

The derived offset locates raw bytes in the immutable attachment grid. It
must never let a sender reposition, overlap, or leave undeclared holes.

## Contribution to LicoArc's final vision

Deriving byte offset from `chunkIndex` and the Protocol-Line chunk constant
prevents overlapping or sender-repositioned attachment bytes.

## Field model and trade-offs

There is no field. Checked multiplication of `chunkIndex` by the fixed chunk
constant yields the only valid offset. Overflow, an out-of-range index, or a
result at or beyond `byteLength` for a non-empty chunk fails closed.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Place one chunk at its exact raw-byte position. |
| Field-level necessity | None; the index and Protocol Line fully determine it. |
| Removal consequence | No loss of placement behavior. |
| Derivation | Exact with checked multiplication. |
| Duplicate-authority risk | An offset field can disagree with index and create overlap, gaps, or overwrite ambiguity. |

## Visibility and trust

No extra metadata is exposed. The protected index is sufficient, while local
storage addressing remains implementation-local.

## Alternatives

- Checked derivation from index: selected.
- Transmitted byte offset: rejected as redundant.
- Arrival-order append: rejected under reordering and recovery.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned placement and
overlap question is self-contained.

## Decision history

Index-derived, transmitted-offset, and arrival-order alternatives were closed
during `OPEN`. Exact derivation and duplicate-placement risk created an
objective admission failure, so LicoArc review on 2026-08-03 moved the field
directly to `REJECTED` and recorded its replacement in the Field Registry.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
