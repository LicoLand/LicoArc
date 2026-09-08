# Field Review: Delivery Handle Class

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handle-class` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `RESERVE.handleClass` is mandatory with the closed values `async` or `firstContact`; it selects the fixed handle lifecycle, and `firstContact` permits one accepted submission. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The calling Endpoint requests one of the two interoperable Delivery Handle
lifecycles, and the Station enforces the selected fixed lifecycle.

## Contribution to LicoArc's final vision

Selects the exact bounded lifecycle of a Delivery Handle so asynchronous
delivery and single-use first contact cannot be confused.

## Field model and trade-offs

The field is the closed two-value enum `async | firstContact`. It does not
carry a sender-selected lifetime, submission count, or retention policy.

## Visibility and trust

The calling Endpoint and Station observe it. The class governs only Station
routing-capability lifecycle and does not authenticate an Endpoint or the
protected first-contact handshake.

## Decision history

Repository review admitted the closed lifecycle selector on 2026-08-02,
including single accepted submission for `firstContact`. This page records
explanation and history, not a second specification; only
`FIELD-REGISTRY.md` is normative.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
