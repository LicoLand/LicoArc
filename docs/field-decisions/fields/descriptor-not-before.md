# Field Review: Descriptor Not-Before Time

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-descriptor-not-before` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.notBefore` is mandatory unsigned Unix seconds and controls descriptor activation only; it never establishes message freshness. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers use `notBefore` to decide when an otherwise valid Station
descriptor may begin participating in discovery.

## Contribution to LicoArc's final vision

Defines when authenticated Station discovery state becomes eligible without
turning Station time into Endpoint message freshness.

## Field model and trade-offs

The field is unsigned Unix seconds. It applies only to descriptor activation
and has no message-expiry, replay, or ordering meaning.

## Visibility and trust

Discovery participants observe it. A Station-provided time bound is evaluated
under local validation policy and cannot prove endpoint freshness or Station
honesty.

## Decision history

Repository review admitted a purpose-specific activation bound on 2026-08-02
while rejecting time-authority expansion. This is explanatory history, not a
second specification; normative semantics come only from
`FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
