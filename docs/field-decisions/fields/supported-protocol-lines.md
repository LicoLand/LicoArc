# Field Review: Supported Protocol Lines

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-supported-protocol-lines` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `supportedProtocolLines` lists exact complete Protocol Lines, not loose feature or field combinations. |

## Question

Which complete Protocol Lines may the peer select without guessing support or
allowing component-wise negotiation?

## Role in communication

The declaring Endpoint produces the set and the peer intersects it with local
policy and support. The set is selection input, not permission for a Station
or Provider to negotiate on the Endpoint's behalf.

## Contribution to LicoArc's final vision

Declares exact complete Protocol Lines so peers establish interoperability
without translating, guessing, or combining incompatible semantics.

## Field model and trade-offs

The value is a mandatory `DIGEST256[1..MAX_LINES]` collection. Ordering,
uniqueness, and unknown-value rules come only from the Field Registry.

## Visibility and trust

The set must be authenticated with the declaration because modification can
force incompatibility or downgrade. Disclosure can fingerprint an Endpoint;
a Station-visible copy is never authoritative.

## Decision history

The field was admitted because support cannot be safely derived from transport
or implementation identity. Only complete registered lines are advertised.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
