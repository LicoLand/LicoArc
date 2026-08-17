# Field Review: Settlement Action

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-settle-action` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Each `Settlement` requires `settleAction` with the closed values `complete` or `release`: `complete` removes the claimed unit from the conforming queue and `release` returns it; no sender-selected delay, extension, or TTL exists. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The claiming Endpoint tells the Station whether one currently claimed queue
unit should leave the conforming queue or return to it.

## Contribution to LicoArc's final vision

Defines the only two bounded claim transitions, complete or release, so
Station queue ownership converges without sender-controlled delay semantics.

## Field model and trade-offs

The field is the closed enum `complete | release`. It carries no delay,
claim-extension request, retry time, retention duration, or TTL.

## Visibility and trust

The claiming Endpoint and Station observe it. The action changes only
Station-local queue settlement and does not assert logical-message success,
Endpoint acceptance, or completed application effect.

## Decision history

Repository review admitted the minimal two-action settlement vocabulary on
2026-08-02 and excluded sender-controlled scheduling fields. This record is
explanation and history, not a second specification; normative semantics come
only from `FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
