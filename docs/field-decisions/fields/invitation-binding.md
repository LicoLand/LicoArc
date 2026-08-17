# Field Review: Invitation Binding

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-invitation-binding` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `invitationBinding` is the digest of the complete invitation context and is not an independent routing or invitation token. |

## Question

How does first-contact establishment prove that both Endpoints refer to the
same invitation without trusting the Station-visible route?

## Role in communication

The invitation-accepting Endpoint supplies or validates the binding and both
Endpoints include it in authenticated handshake processing. It is not a
second Delivery Handle and does not itself establish verified peer identity.

## Contribution to LicoArc's final vision

Binds a protected first-contact handshake to its exact invitation context
without creating another reusable routing credential.

## Field model and trade-offs

The value is a conditionally mandatory `DIGEST256` in a first-contact
handshake. Its derivation, encoding, and rejection rules are exclusively Field
Registry semantics.

## Visibility and trust

The value can correlate invitation use and therefore follows the protected
placement in the registry. A Station may replay or suppress traffic but cannot
substitute a binding that passes Endpoint authentication.

## Decision history

The field was admitted to separate protected invitation continuity from
transport routing. It does not preserve a standalone outer first-contact token.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
