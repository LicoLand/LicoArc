# Field Review: Final Chunk Marker

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-chunk-final` |
| Decision status | `RETIRED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-chunk-final-attachment`. |
| Current conclusion | The former scope required `chunkFinal` on every `streamChunk`; that scope is retired because attachment finality is derived from its descriptor and fixed chunk grid. |

## Question

How does a receiver distinguish a complete stream from a temporarily absent or
suppressed next chunk?

## Role in communication

The sender marks the terminal chunk and the receiver uses the authenticated
marker with chunk ordering to close the correlated stream. It does not prove
application-effect completion.

## Contribution to LicoArc's final vision

Rejecting `chunkFinal` on attachment chunks prevents a second completion
authority from conflicting with descriptor-derived length and integrity.

## Field model and trade-offs

The value is a conditionally mandatory `bool`. Its encoding and invalid-input
behavior come only from the Field Registry.

## Visibility and trust

The marker is protected and Endpoint-authenticated. A Station may suppress the
terminal record and cause incompleteness but cannot forge successful stream
completion; message timing and size remain observable.

## Decision history

The field was admitted because absence of a later chunk cannot unambiguously
signal completion across an unreliable or malicious transport.

LicoArc review on 2026-08-03 retired the all-stream placement. Successor
`FLD-chunk-final-attachment` keeps the marker only for the non-attachment
stream whose length is otherwise unknown and forbids it on attachment chunks.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
