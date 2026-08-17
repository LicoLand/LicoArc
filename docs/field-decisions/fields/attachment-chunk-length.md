# Field Review: Declared Attachment Chunk Length

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-chunk-length` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject attachment `chunkLength`; each expected length is derived and checked against the actual protected `content` bytes. |

## Question

Does an attachment chunk need to repeat its expected byte length as a field?

## Role in communication

The receiver validates each raw-byte slice before durable acceptance. Every
non-final attachment chunk has the fixed Protocol-Line length; the derived
final chunk contains exactly the remaining bytes.

## Contribution to LicoArc's final vision

Deriving each chunk length from `byteLength`, `chunkIndex`, and the
Protocol-Line chunk constant prevents conflicting size claims.

## Field model and trade-offs

There is no field. Expected length is the smaller of the fixed chunk constant
and the checked remaining attachment bytes at the derived offset. Actual
protected `content` length must equal it exactly. Zero-length attachments have
no chunk Messages.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Reject truncated, oversized, or misplaced chunk content. |
| Field-level necessity | None; expected and actual lengths already exist independently. |
| Removal consequence | No validation behavior is lost. |
| Derivation | Exact from descriptor, index, line constant, and byte-string length. |
| Duplicate-authority risk | A declared length can disagree with both expected geometry and actual framing. |

## Visibility and trust

No duplicate metadata is carried. Stations continue to observe protected
packet length but cannot interpret raw attachment length or alter protected
content without rejection.

## Alternatives

- Compare derived expected length with actual content length: selected.
- Add `chunkLength`: rejected as redundant.
- Accept any final-chunk length: rejected because it makes descriptor
  completeness ambiguous.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned length and
duplicate-authority question is self-contained.

## Decision history

Derived, declared, and framing-only alternatives were closed during `OPEN`.
Exact derivation and mismatch risk made a separate field inadmissible, so
LicoArc review on 2026-08-03 moved it directly to `REJECTED` and recorded its
replacement in the Field Registry.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
