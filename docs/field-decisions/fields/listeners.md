# Field Review: Station Listeners

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-listeners` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.listeners` is a mandatory bounded `Listener[1..MAX_LISTENERS]` set of exact Transport Profile and endpoint pairs; no listener receives privileged trust. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers obtain the bounded carrier/location alternatives at which
the described Station can be contacted.

## Contribution to LicoArc's final vision

Publishes a bounded set of authenticated Station connection choices without
elevating any location or Transport Profile into identity authority.

## Field model and trade-offs

Each entry pairs an exact `transportProfileId` with one `endpointUri`. The
collection is non-empty and capped by the Protocol Line constant
`MAX_LISTENERS`.

## Visibility and trust

Discovery participants observe the set. Ordering or presence cannot grant one
listener special identity, federation, endpoint, or security authority.

## Decision history

Repository review admitted bounded replaceable listener alternatives on
2026-08-02. This detail page records rationale and history only; it is not a
second specification, and `FIELD-REGISTRY.md` remains the sole normative
source.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
