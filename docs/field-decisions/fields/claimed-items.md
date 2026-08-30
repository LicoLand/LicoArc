# Field Review: Claimed Items

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-claimed-items` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A `CLAIM` result conditionally contains `items` as `ClaimedItem[1..MAX_CLAIM_ITEMS]`, present only when items are available, with item count and aggregate bytes fixed and bounded. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The Station returns a bounded batch of opaque protected packets and their
Station-local settlement handles to the claiming Endpoint.

## Contribution to LicoArc's final vision

Carries a bounded unit of opaque Station-held delivery work so an Endpoint can
claim without unbounded allocation or plaintext exposure.

## Field model and trade-offs

The collection is non-empty when present and capped by
`MAX_CLAIM_ITEMS`; its aggregate encoded bytes are also capped by a fixed
profile constant. Empty availability is represented without this field.

## Visibility and trust

The claiming Endpoint and Station observe collection structure and sizes;
protected packet content remains opaque to the Station. Inclusion is a queue
claim only, not Endpoint acceptance or effect evidence.

## Decision history

Repository review admitted a bounded claim batch on 2026-08-02 to support
efficient delivery without unbounded amplification. This record explains the
decision and history; it is not a second specification, and normative
semantics come only from `FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
