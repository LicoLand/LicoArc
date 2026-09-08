# Field Review: Hop Trace

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-hop-trace` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A message-carried list of traversed Stations or network hops is rejected. |

## Question

Must a protocol message accumulate an interoperable trace of the Stations or
network hops it traverses?

## Role in communication

No protocol role is admitted. Implementations may keep bounded local
operational telemetry under their own privacy policy, but it is not forwarded
as LicoArc message state and cannot establish authenticity, delivery, or trust.

## Contribution to LicoArc's final vision

Rejecting a hop trace prevents a globally correlatable forwarding history and keeps
transport observations outside Endpoint security authority.

## Field model and trade-offs

No field value is admitted. `hopTrace`, a `Received` chain, and aliases are
rejected. Operator-local privacy-minimal observation is the only active owner;
it is not forwarded protocol state.

## Visibility and trust

A hop trace would expose topology and a stable cross-operator correlation
surface. Every hop could omit, forge, reorder, or extend it, and endpoints
could not safely infer the actual path. Protection from some observers would
not make the accumulated assertions authoritative.

## Decision history

Repository review rejected the field because routing and delivery do not
require a forwarded hop list, while the metadata, amplification, and false
authority costs are material. This detail page is rejection evidence, not a
second protocol specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
