# Field Review: Capability Valid Until

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-valid-until` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `validUntil` bounds capability-declaration use and is neither message expiry nor Endpoint freshness evidence. |

## Question

How does a peer reject a capability declaration after its authorized lifetime?

## Role in communication

The declaring Endpoint sets the bound and the peer consumes it before profile
selection. It bounds declaration validity; it is not a Station timestamp or
proof of receipt.

## Contribution to LicoArc's final vision

Limits how long a capability declaration can participate in session
establishment without becoming message freshness evidence.

## Field model and trade-offs

The value is mandatory unsigned Unix seconds. Its exact encoding, bounds, and
invalid-input behavior come only from the Field Registry.

## Visibility and trust

The value is trustworthy only within the authenticated declaration. A Station
can delay or suppress the declaration and may learn its lifetime, but cannot
extend it or establish Endpoint freshness.

## Decision history

The field was admitted to bound replay and lifecycle exposure independently of
transport retention. It does not authorize Station time as a trust source.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
