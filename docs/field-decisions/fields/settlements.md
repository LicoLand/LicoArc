# Field Review: Settlement Entries

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-settlements` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Mandatory `SETTLE.settlements` is a bounded non-empty collection of unique `itemId` and `settleAction` entries belonging to one live claim. |

## Question

How does a claiming Endpoint settle a bounded claimed batch without an
implicit body shape or one network round trip per item?

## Role in communication

The Endpoint submits the collection with `claimId`, `claimEpoch`, and
`operationId`. The Station validates the whole syntax and claim scope before
evaluating each requested item.

## Contribution to LicoArc's final vision

Carries a bounded complete set of claim actions so malformed or cross-claim
requests fail as one deterministic operation.

## Field model and trade-offs

Bounded batching reduces federation round trips and Station scheduling cost
while preserving per-item deterministic action. Unique item identifiers,
fixed order, and hard limits prevent ambiguous duplicates and unbounded work.

## Visibility and trust

The claiming Endpoint and Station observe the batch. Settlement is a Station
operation only: it cannot prove Endpoint acceptance or application effect, and
a Station may still lie, fail, or suppress the result.

## Decision history

The first table listed fields of a `SETTLE` entry without listing the
collection that carried those entries. Closure review admitted the explicit
bounded `settlements` field so a schema cannot invent batch, map, or
single-item semantics.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
