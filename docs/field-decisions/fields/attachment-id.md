# Field Review: Attachment Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-id` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-attachment-id-recovery`. |
| Current conclusion | The former scope placed `attachmentId` only in its descriptor and attachment chunks; that placement scope is retired because it omitted protected receive-state reconciliation. |

## Question

How do content and extensions refer unambiguously to one descriptor when a
message contains multiple attachments?

## Role in communication

The sender assigns the identifier and the receiver uses it only within the
Generic Message's attachment scope. It is not a Station resource locator,
retrieval authority, or global content identity.

## Contribution to LicoArc's final vision

Retiring the descriptor-and-chunk-only scope lets protected receive-state
reports reuse the same attachment identity without minting a recovery
identifier.

## Field model and trade-offs

The value is an `ID128`: mandatory in the descriptor, required on an
attachment stream chunk, and forbidden on the single non-attachment content
stream. It is scoped to the related Message and must match one declared
descriptor.

## Visibility and trust

The identifier is protected and Endpoint-authenticated. Reuse outside its
defined scope conveys no authority; outer exposure could correlate messages or
resources and is not authorized by this record.

## Decision history

The field was admitted for unambiguous message-local correlation without
overloading a digest or transport retrieval reference.

LicoArc review on 2026-08-03 retired this bounded placement scope after
`FLD-attachment-id-recovery` admitted the same Message-scoped identity in
Attachment Receive State. The successor creates no transfer identifier,
locator, or compatibility alias.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
