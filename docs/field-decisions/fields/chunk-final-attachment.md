# Field Review: Final Marker Outside Attachment Streams

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-chunk-final-attachment` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-chunk-final`; no successor. |
| Current conclusion | `chunkFinal` remains mandatory only for the single non-attachment stream and is forbidden on attachment chunks, whose final index and completeness are descriptor-derived. |

## Question

Should an attachment carry an explicit final marker when its protected
descriptor already fixes total bytes and its Protocol Line fixes chunk
geometry?

## Role in communication

For a non-attachment stream whose length is not declared elsewhere, the
sender marks termination and the receiver closes the stream only after all
prior indexes exist. For an attachment, the receiver derives the final index
and length before any chunk arrives and rejects an added marker.

## Contribution to LicoArc's final vision

Terminates protected streams whose length is otherwise unknown while keeping
attachment completion derived from its authenticated descriptor and fixed
chunk grid.

## Field model and trade-offs

The value remains a conditional `bool` on a non-attachment `streamChunk`. It
is forbidden when `attachmentId` is present. Attachment completion requires
all derived indexes, exact chunk lengths, total `byteLength`, final
`contentDigest`, and an empty authenticated receive-state range set. Arrival,
connection close, Station outcome, or a later chunk never substitutes.

Removing the attachment copy eliminates contradictory completion states. The
non-attachment field remains because that stream has no descriptor length
from which termination can be derived.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Terminate a protected stream whose total length is not declared. |
| Field-level necessity | The non-attachment receiver cannot derive termination from another admitted value. |
| Removal consequence | Temporary absence and permanent completion are indistinguishable for that stream. |
| Derivation | Attachment finality is derivable; non-attachment finality is not. |
| Existing carrier | Descriptor `byteLength` and the Protocol Line chunk constant replace the field only for attachments. |
| Duplicate-authority risk | An attachment marker can conflict with derived count, length, or digest. |

## Visibility and trust

The marker is Endpoint-protected. A Station can suppress it and prevent
non-attachment completion but cannot forge completion. Attachment traffic
continues to expose packet size and timing patterns without exposing the
marker or descriptor.

## Alternatives

- Retain the marker only for non-attachment streams: selected.
- Retain it for every stream: rejected because attachment finality is already
  derived.
- Remove it globally: rejected because length-unknown streams would be
  ambiguous.
- Infer completion from arrival gaps or connection closure: rejected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned derivation and
duplicate-authority question is self-contained.

## Decision history

The question advanced from `OPEN` to `READY` after both stream classes,
omission, derivation, conflict, suppression, and completion cases were closed.
LicoArc review on 2026-08-03 retained explicit termination only where it is
not derivable, updated the Field Registry in the same bounded change, and
moved this successor to `DECIDED`. `FLD-chunk-final` is retired.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
