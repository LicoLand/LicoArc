# Field Review: Retry-After Hint

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-retry-after` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A `transient` Station result conditionally requires `retryAfterMs`, a bounded `uint32` untrusted relative hint capped by the Transport Profile; Endpoint scheduling remains local. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The Station can suggest a bounded delay after a transient result, while the
calling Endpoint retains all retry scheduling and policy decisions.

## Contribution to LicoArc's final vision

Provides a bounded untrusted scheduling hint without allowing a Station to
control Endpoint retry correctness or terminal message state.

## Field model and trade-offs

The value is an unsigned 32-bit relative millisecond count capped by the exact
Transport Profile. It is not an absolute timestamp, lease, or sender-defined
retry budget.

## Visibility and trust

The calling Endpoint and Station observe it. The Endpoint treats it as
untrusted input, applies the profile cap, and may choose a different local
schedule.

## Decision history

Repository review admitted a bounded relative hint on 2026-08-02 while
keeping scheduling local. This page is explanation and history, not a second
specification; only `FIELD-REGISTRY.md` supplies normative semantics.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
