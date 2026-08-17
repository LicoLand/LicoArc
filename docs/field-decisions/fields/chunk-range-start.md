# Field Review: Chunk Range Inclusive Start

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-chunk-range-start` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Mandatory `startChunkIndex` is the inclusive `uint64` start of one canonical requested chunk interval. |

## Question

Which exact chunk begins a bounded attachment recovery interval?

## Role in communication

The receiving Endpoint names the first chunk it requests. The sender validates
the value against the descriptor-derived chunk count and the surrounding
canonical range array before reading or transmitting any bytes.

## Contribution to LicoArc's final vision

Identifies the first needed chunk in a recovery interval so Endpoint progress
remains independent of arrival order and transport sessions.

## Field model and trade-offs

The semantic type is mandatory `uint64`. It is inclusive, must be smaller than
`endChunkIndexExclusive`, and must be below the derived chunk count. The
containing array must be strictly ordered, disjoint, and non-adjacent. Invalid
arithmetic or ordering rejects the complete Attachment Receive State.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Identify the first index covered by a selective recovery interval. |
| Field-level necessity | A range cannot be reconstructed from its exclusive end or array position. |
| Removal consequence | Sender and receiver can choose different first chunks. |
| Derivation | Not derivable when several sparse gaps exist. |
| Protected placement | Recovery geometry must be Endpoint-authenticated and hidden from Stations. |

## Visibility and trust

Only peer Endpoints observe the protected value. A Station can suppress the
state Message but cannot shift the interval. The sender treats the value as a
bounded peer request, not authority to exceed local resource policy.

## Alternatives

- Inclusive start with exclusive end: selected.
- Byte offset: rejected because chunk index already fixes geometry.
- Closed interval: rejected because boundary arithmetic is less direct.
- Implicit start from prior range: rejected because one malformed predecessor
  would change every later interval.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned interval-boundary
question is self-contained.

## Decision history

The question advanced from `OPEN` to `READY` after inclusive, exclusive,
implicit, byte-offset, overflow, and malformed-order cases were closed.
LicoArc review on 2026-08-03 selected the explicit inclusive chunk index,
updated the Field Registry, and moved the record to `DECIDED`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
