# Field Review: Declared Attachment Chunk Count

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-chunk-count` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject `totalChunkCount`; the receiver derives it from `byteLength` and `ATTACHMENT_CHUNK_BYTES` with checked arithmetic. |

## Question

Does an attachment need to declare its total chunk count separately from its
total byte length and fixed chunk grid?

## Role in communication

The derived count bounds valid `chunkIndex` and recovery ranges. It is a
deterministic observation, not sender-authored metadata.

## Contribution to LicoArc's final vision

Deriving total chunk count from `byteLength` and the Protocol-Line chunk
constant removes duplicate geometry and mismatch cases.

## Field model and trade-offs

There is no field. For zero bytes the count is zero; otherwise the receiver
uses overflow-safe ceiling division of `byteLength` by
`ATTACHMENT_CHUNK_BYTES`. A value beyond the Protocol Line's attachment or
chunk-count bound rejects the descriptor before allocation.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Bound valid attachment indexes. |
| Field-level necessity | None; the inputs are already authenticated and exact. |
| Removal consequence | No loss of action or interoperability. |
| Derivation | Exact with checked integer arithmetic. |
| Duplicate-authority risk | A transmitted count can disagree with byte length, final length, or range bounds. |

## Visibility and trust

No extra metadata is exposed. Each Endpoint derives the same bounded count
from protected descriptor state and its pinned Protocol Line.

## Alternatives

- Checked derivation: selected.
- Transmitted count: rejected as redundant.
- Infer from the largest received index or final marker: rejected because
  arrival and sender markers are not attachment completion authority.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned arithmetic and
duplicate-authority question is self-contained.

## Decision history

Omission and transmitted-count alternatives were closed during `OPEN`.
Exact derivation made the field unnecessary and a mismatch source, so LicoArc
review on 2026-08-03 moved it directly to `REJECTED` and recorded the derived
owner in the Field Registry.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
