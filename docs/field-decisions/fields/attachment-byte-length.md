# Field Review: Attachment Byte Length

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-byte-length` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `byteLength` is the total raw attachment length used for resource bounds, chunk-count derivation, final-chunk validation, and completion. |

## Question

How can a receiver enforce bounds and verify completeness before accepting or
allocating for separately carried attachment bytes?

## Role in communication

The sender declares the raw-octet length and the receiver first checks the
Protocol-Line attachment bound, then derives chunk count and final-chunk
length, and finally compares it with durable reassembly. It is not an outer
packet boundary, Station claim, or proof that storage succeeded.

## Contribution to LicoArc's final vision

Lets an Endpoint bound resources and derive exact attachment completeness
before final digest verification while keeping transfer geometry Station-blind.

## Field model and trade-offs

The value is a mandatory `uint64[0..MAX_ATTACHMENT_BYTES]` raw-octet count.
The receiver derives zero chunks for zero bytes; otherwise it uses
overflow-safe ceiling division by the Protocol Line's fixed
`ATTACHMENT_CHUNK_BYTES`. The derived count must not exceed
`MAX_ATTACHMENT_CHUNKS`. Every non-final chunk has the exact fixed length and
the final chunk has the exact remainder. Invalid bounds or arithmetic reject
the descriptor before allocation.

## Visibility and trust

The protected authenticated value prevents undetected descriptor alteration
but remains a sender claim until checked against bytes. Length is highly
correlating metadata and must not be exposed unnecessarily to Stations.

## Decision history

The field was admitted because descriptor-time resource bounds and later
completeness cannot be derived from bounded per-Message carriage. LicoArc
review on 2026-08-03 additionally closed its derived chunk-count and
final-length role without adding count, offset, length, or final-marker fields.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
