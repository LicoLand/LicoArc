# Field Review: Attachments

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachments` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `attachments` is the immutable bounded manifest for Endpoint-protected, resumable attachment chunks; descriptors never embed the file bytes themselves. |

## Question

How does a Generic Message commit the immutable roots required to transfer and
resume zero or more large binary attachments without exposing their metadata
or bytes to a Station?

## Role in communication

The sender supplies descriptors and the receiver validates them before
allocating resources or accepting chunks. The collection commits attachment
identity, type, total bytes, and final integrity; actual bytes travel only in
separately protected `streamChunk` Messages. Storage, scanning, execution, and
user interaction remain local.

## Contribution to LicoArc's final vision

Commits a bounded protected manifest for resumable attachment transfer so
peers share identity, type, total length, integrity, and completion authority.

## Field model and trade-offs

The value is an optional bounded immutable `AttachmentDescriptor[]`.
Descriptor count, unique Message-scoped `attachmentId`, ordering,
representation, maximum aggregate attachment bytes, and invalid-input rules
come only from the Field Registry and exact Protocol Line. Changing a
descriptor after any chunk exists is an identity conflict, not an update.

## Visibility and trust

Descriptors are protected because identity, type, size, and digest are
sensitive metadata. Stations may observe outer traffic shape but cannot read
or alter authenticated descriptors without rejection.

## Decision history

The field was admitted to keep attachment metadata structured and bounded
without embedding attachment bytes in the descriptor collection. LicoArc
review on 2026-08-03 closed its role as the immutable root for protected
chunking, selective recovery, and final verification without adding a locator,
transfer token, or Station-visible attachment field.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
