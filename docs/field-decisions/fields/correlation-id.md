# Field Review: Correlation Reference

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-correlation-id` |
| Decision status | `RETIRED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `correlationId`, `inReplyTo`, request ID, parent Message ID |
| Candidate layer | Generic Message or Reliable Exchange inside protection |
| Observer set | Peer Endpoints |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Predecessor or successor | Succeeded by `FLD-correlation-id-recovery`. |
| Current conclusion | The former `relatesTo` scope covered `response`, `error`, `cancel`, and `streamChunk`; that placement scope is retired because it omitted Attachment Receive State. |

## Question

Should a response, error, cancellation, or stream chunk reference the original
logical Message directly, share a correlation value, or use a typed relation
structure?

## Role in communication

The receiver associates a protected record with an earlier request or stream.
The value does not establish transport delivery, global conversation identity,
or application authorization.

## Contribution to LicoArc's final vision

Retiring the narrow relation scope lets attachment recovery bind to the exact
declaring Message without inventing a parallel correlation namespace.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Reference spoofing, type confusion, cycles, and cross-session references must be rejected. |
| Privacy and metadata | Protected placement hides relation graphs from Stations; endpoints still retain them. |
| Interoperability | Relation kinds, cardinality, missing target, cancellation, and stream closure need exact rules. |
| Implementation complexity | Reusing Message ID is simpler; family IDs support streams but add indexes. |
| CPU, memory, and wire cost | Small wire values; unresolved references require bounded buffering. |
| Evolution and downgrade | Unknown relation kinds need criticality behavior and cannot silently degrade. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Associate response-like records with the request or stream they concern. |
| Removal consequence | Concurrent operations cannot be matched deterministically. |
| Derivation | Not derivable from arrival order under asynchronous or out-of-order delivery. |
| Lower-layer carrier | Transport request IDs disappear across store-and-forward and route changes. |
| Protected placement | Relation and referenced identity must be endpoint-authenticated and hidden. |
| Duplicate-authority risk | A new correlation ID can duplicate the original Message ID, stream ID, or application conversation ID. |

## Value model

The admitted value is an `ID128` equal to the related logical `messageId`.
Message `kind` supplies the relation meaning, so `relatesTo` does not carry a
second kind tag or allocate a family identifier. Protocol Line state-machine
rules bound unresolved references, stream lifetime, cancellation, and invalid
cross-session or cyclic use.

## Alternatives

- `inReplyTo` reference to the request's logical Message ID.
- Shared correlation ID allocated before the first record.
- Stream identifier plus per-chunk sequence.
- Transport request ID, rejected for asynchronous federation.
- Arrival-order pairing, rejected under concurrency and retry.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- JSON-RPC returns the request `id`
  in the response, demonstrating direct-reference correlation.
- MCP inherits JSON-RPC request/response IDs and
  adds protocol lifecycle rules.
- Matrix relation events support richer event
  graphs, but their room-visible
  identifiers and server graph semantics exceed LicoArc's bounded first
  release.

## Decision history

The original record stayed `OPEN` while direct references, shared correlation
families, and typed relation graphs were compared. The six closed Message
kinds showed that a direct reference covers the required first-release
relations. Reusing `messageId` avoids competing correlation namespaces and an
open relation graph while still supporting asynchronous, out-of-order
exchange. The canonical registry therefore admitted `relatesTo` and rejected
a separate correlation identifier namespace.

LicoArc review on 2026-08-03 retired this bounded placement scope after
`FLD-correlation-id-recovery` reused the same field for protected Attachment
Receive State. The successor preserves direct Message identity and adds no
correlation namespace.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
