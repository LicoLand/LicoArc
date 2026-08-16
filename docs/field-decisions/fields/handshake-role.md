# Field Review: Handshake Role

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-role` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `role` is authenticated in the handshake transcript to prevent reflection and role disagreement. |

## Question

How are the two Endpoint contributions separated so reflection or role
confusion cannot reinterpret one as the other?

## Role in communication

Each Endpoint produces the role assigned by the handshake state machine and
the peer validates it as transcript-bound context. It is not a product,
network, client, or server identity.

## Contribution to LicoArc's final vision

Authenticates initiator and responder roles so reflection and role-confusion
attacks cannot create divergent session state.

## Field model and trade-offs

The value is the mandatory closed enum `initiator` or `responder`. Encoding
and invalid-input handling are owned only by the Field Registry.

## Visibility and trust

The value changes cryptographic interpretation and must be Endpoint-
authenticated. A Station can relay or suppress a contribution but cannot
assign a trusted role; disclosure may reveal interaction direction.

## Decision history

The field was admitted to make role separation explicit and transcript-bound
rather than inferred from an untrusted route or arrival order.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
