# Field Review: Signing-Key Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-signing-key-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Mandatory `keyId` is a `DIGEST256` that resolves one verification key within the containing identity or descriptor context. |

## Question

How does each signature identify its verification key without copying public
key material or turning the key reference into an entity identity?

## Role in communication

`SigningKey` declares the key identifier and `Signature` references it. The
verifier resolves the identifier only in the containing authenticated key set
or Endpoint identity context.

## Contribution to LicoArc's final vision

Selects one exact verification key within its authenticated context so bounded
rotation does not require repeating keys or create a global identity alias.

## Field model and trade-offs

The reference supports bounded key rotation and multiple admitted signing
keys without repeating large public keys in every signature. Context scoping
prevents one globally stable key label from becoming an Endpoint, Station,
Provider, or Network identifier.

## Visibility and trust

Observers of the signed object see equality and rotation patterns. A matching
digest is only lookup input; profile validation, key authorization, signature
verification, lifecycle, and local policy still decide acceptance.

## Decision history

Closure review found that `Signature` otherwise depended on an unnamed key
selection rule. A shared scoped `keyId` was admitted for `SigningKey` and
`Signature`, while global identity semantics and Provider names were rejected.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
