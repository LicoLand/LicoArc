# Field Review: Provider Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-provider-id` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A wire field naming the local cryptographic, identity, transport, or service Provider is rejected. |

## Question

Must an Endpoint transmit which implementation Provider performs a protocol
operation?

## Role in communication

No protocol role is admitted. Endpoints execute the pinned Protocol Line and
its profile semantics; dependency and Provider selection remain local
implementation concerns and cannot affect peer interpretation.

## Contribution to LicoArc's final vision

Rejecting Provider identity keeps protocol meaning invariant under library,
vendor, hosting, service, and implementation replacement.

## Field model and trade-offs

No value model is admitted. `providerId` and aliases are rejected. Endpoint-
or Station-local implementation configuration is the active owner and never a
common wire field.

## Visibility and trust

A Provider identifier would fingerprint implementations, deployments, and
security posture while offering no protocol assurance. A peer or Provider
could misstate it, and accepting Provider-dependent semantics would fragment
the Protocol Line and enable downgrade.

## Decision history

Repository review rejected the field because conformance depends on observable
protocol behavior, not implementation identity. The portable
Station-affiliation review confirmed that a Station service relationship uses
the protocol Station identity and exact signed Route commitment; it never
names the Station's vendor, hosting, adapter, or implementation Provider. This
detail page is rejection evidence, not a second protocol specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
