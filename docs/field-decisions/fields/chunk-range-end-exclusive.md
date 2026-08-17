# Field Review: Chunk Range Exclusive End

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-chunk-range-end-exclusive` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Mandatory `endChunkIndexExclusive` is the exclusive `uint64` end of one canonical requested chunk interval. |

## Question

Where does one bounded attachment recovery interval stop without an inclusive
boundary or open-ended-range ambiguity?

## Role in communication

The receiving Endpoint names the first chunk not requested by the interval.
The sender subtracts start from end with checked arithmetic, validates the
derived count and global request bound, and never interprets the value as a
byte length or unbounded suffix.

## Contribution to LicoArc's final vision

Closes each half-open recovery interval unambiguously so independent Endpoints
compute the same bounded retransmission set.

## Field model and trade-offs

The semantic type is mandatory `uint64`. It must be greater than
`startChunkIndex` and no greater than the descriptor-derived chunk count. A
value that overflows arithmetic, overlaps or touches another range, violates
ordering, or makes the request exceed its covered-chunk bound rejects the
complete Attachment Receive State.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Bound the number of chunks one interval requests before performing work. |
| Field-level necessity | Start alone cannot distinguish one chunk from an unbounded suffix. |
| Removal consequence | A small state Message can cause ambiguous or unbounded retransmission. |
| Derivation | The end cannot be inferred when gaps and request coalescing vary. |
| Protected placement | The work bound must be Endpoint-authenticated and Station-blind. |

## Visibility and trust

Only peer Endpoints observe the protected value. It authorizes no Station
action and cannot override sender-local quotas. A Station can still observe
the number and size pattern of resulting opaque packets.

## Alternatives

- Exclusive end: selected for direct length calculation and empty-range
  rejection.
- Inclusive end: rejected because maximum values and length arithmetic require
  an extra checked increment.
- Open end or wildcard: rejected as an amplification surface.
- Byte length: rejected because the range is expressed in immutable chunks.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned range-bound and
amplification question is self-contained.

## Decision history

The question advanced from `OPEN` to `READY` after inclusive, exclusive,
open-ended, overflow, adjacency, and amplification cases were closed. LicoArc
review on 2026-08-03 selected the explicit exclusive chunk index, updated the
Field Registry, and moved the record to `DECIDED`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
