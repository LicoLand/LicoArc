# Field Review: Handshake Purpose

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-purpose` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `handshakePurpose` binds the handshake to one state transition and prevents cross-purpose replay. |

## Question

How does a peer distinguish ordinary establishment from another admitted
handshake context before applying context-specific validation?

## Role in communication

The initiating Endpoint states the purpose and both Endpoints authenticate it
in the transcript. The value selects protocol validation only; it does not
authorize a local effect or imply user approval.

## Contribution to LicoArc's final vision

Binds session establishment to first contact, reconnect, or rekey so protected
state cannot be replayed across incompatible transitions.

## Field model and trade-offs

The value is the mandatory closed enum `firstContact`, `reconnect`, or `rekey`.
Representation and invalid-input behavior come only from the Field Registry.

## Visibility and trust

Purpose may reveal first-contact context and can be modified for downgrade or
confusion if left unprotected. Stations cannot make it authoritative, and
Endpoints must reject transcript mismatch.

## Decision history

The field was admitted because context cannot safely be inferred from a
Delivery Handle, transport route, or local UI state.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
