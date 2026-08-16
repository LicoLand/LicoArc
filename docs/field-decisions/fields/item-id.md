# Field Review: Claimed Item Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-item-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `ClaimedItem`, `Settlement`, and `SettlementResult` each require the same `TOKEN256` Station-local `itemId` within one claim; it is not exposed to the submitting Endpoint. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The claiming Endpoint identifies each claimed queue unit when asking the
Station to complete or release it.

## Contribution to LicoArc's final vision

Identifies one Station-local claimed item only within bounded retrieval and
settlement, preventing transport storage identity from escaping its scope.

## Field model and trade-offs

The value is a mandatory 32-octet unpredictable Station-local capability token
inside each claimed item, settlement request entry, and corresponding result.
It has no sender-visible or cross-Station identity.

## Visibility and trust

Only the claiming Endpoint and Station observe it; the submitting Endpoint
must not receive it. It identifies queue settlement state only and cannot
replace protected logical Message identity or Endpoint evidence.

## Decision history

Repository review admitted a claimant-only settlement handle on 2026-08-02
to avoid disclosing Station queue identity to submitters. This page is
explanation and history, not a second specification; only
`FIELD-REGISTRY.md` is normative.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
