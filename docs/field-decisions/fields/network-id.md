# Field Review: Network Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-network-id` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A generic message-level or route-level `network-id` namespace is rejected. |

## Question

Does interoperability require a transmitted identifier that assigns a
message, Endpoint, route, or Station to one named network?

## Role in communication

No protocol role is admitted. Exact Protocol Line, authenticated governance
inputs, Endpoint identity, Station affiliation, and route bindings each carry
their own scoped meaning; a generic network label must not override or
duplicate them.

## Contribution to LicoArc's final vision

Rejecting a mandatory Network identifier prevents membership, hosting, or
deployment context from becoming Endpoint identity or a global federation
root.

## Field model and trade-offs

No value model is admitted. `networkId` and aliases are rejected. Protocol
compatibility and local route policy supply the needed scoped behavior; there
is no mandatory network-membership field.

## Visibility and trust

A visible network label would add stable correlation and invite false
membership or trust inference. Any participant could misstate an unbound
label, while central allocation would create an unnecessary federation
authority and downgrade surface.

## Decision history

Repository review rejected the field because no unique interoperable action
requires it and existing scoped authorities must not be collapsed into a
generic network concept. The portable Station-affiliation review confirmed
that the current service relationship is expressed by an authenticated
Station descriptor and signed Route, not by membership in a named Network.
This detail page is rejection evidence, not a second protocol specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
