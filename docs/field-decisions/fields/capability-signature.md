# Field Review: Capability Signature

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-signature` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Mandatory `signature` contains `keyId` and `signatureValue` and covers the complete canonical capability declaration excluding the `signature` field itself. |

## Question

How does a peer authenticate the declaration and detect alteration of its
selection inputs and lifecycle bounds?

## Role in communication

The declaring Endpoint produces the authentication value and the peer verifies
it before using any declaration member. The field carries output of the
selected signature construction but does not select or define that algorithm.

## Contribution to LicoArc's final vision

Makes a capability declaration attributable to the Endpoint identity that
offers it, closing an unauthenticated negotiation path.

## Field model and trade-offs

The semantic value is a mandatory `Signature` containing registry-owned
`keyId` and `signatureValue`. Coverage excludes the signature field itself;
final profile bounds and failure behavior remain Protocol Line work.

## Visibility and trust

The value is transferable authentication material and may enable correlation.
A Station may replay or suppress it, but alteration or substitution must fail
Endpoint validation.

## Decision history

The field was admitted because declaration authenticity cannot be inherited
from transport or inferred from its contents. Algorithm selection remains on
the independent Algorithm Decision track.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
