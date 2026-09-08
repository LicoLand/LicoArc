# Field Review: Per-Attachment Chunk Size

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-chunk-size` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject `attachmentChunkSize`; each exact Protocol Line fixes one `ATTACHMENT_CHUNK_BYTES` constant for every attachment. |

## Question

Must each attachment transmit a selectable chunk size, or can every peer
derive the same grid from its exact Protocol Line?

## Role in communication

Chunk size fixes byte boundaries, count, offsets, final length, resource
bounds, and recovery indexes. It is therefore protocol geometry, not sender
preference, transport metadata, or implementation tuning.

## Contribution to LicoArc's final vision

Keeping chunk size as one Protocol-Line constant makes attachment geometry
invariant across peers, retries, sessions, Routes, and implementations.

## Field model and trade-offs

There is no field. `ATTACHMENT_CHUNK_BYTES` is a positive Protocol-Line
constant that must fit the smallest safe protected Message capacity admitted by
that line and cannot exceed the containing `MAX_PAYLOAD_BYTES` bound. It cannot
change during retry, restart, re-protection, Route migration, or recovery. A
different constant requires a different Protocol Line and a new attachment
identity.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Derive one immutable chunk grid independently. |
| Field-level necessity | None; `protocolLineId` already selects the constant. |
| Removal consequence | No loss of information or action. |
| Derivation | Exact from the selected Protocol Line. |
| Duplicate-authority risk | A sender field can disagree with the line, enable tiny-chunk amplification, or change on recovery. |

## Visibility and trust

No extra protected or Station-visible metadata exists. Packet lengths and
traffic volume remain observable, but no sender-supplied size selector can
alter work geometry.

## Alternatives

- One Protocol-Line constant: selected.
- Sender-selected integer: rejected as duplicate authority and amplification
  control.
- Transport-derived size: rejected because Route migration must not regrid an
  active attachment.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned derivation and
resource-bound question is self-contained.

## Decision history

Protocol-line constant, sender-selected, and transport-derived alternatives
were closed during `OPEN`. Derivation, migration, amplification, and downgrade
evidence created an objective field-admission failure, so LicoArc review on
2026-08-03 moved the field directly to `REJECTED` and recorded its owner in the
Field Registry.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
