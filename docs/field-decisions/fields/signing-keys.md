# Field Review: Station Signing Keys

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-signing-keys` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.signingKeys` is a mandatory bounded `SigningKey[1..MAX_KEYS]`; each entry binds a key-profile identifier, key identifier, and public verification bytes. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers use the declared public verification material to validate
descriptor signatures under the exact declared key profile.

## Contribution to LicoArc's final vision

Publishes a bounded authenticated verification-key set so Station discovery
can rotate keys without losing deterministic validation.

## Field model and trade-offs

The collection is non-empty and bounded. Each entry contains exactly
`keyProfileId`, `keyId`, and `publicKey` as separate registry-owned fields;
their final versioned schema, concrete bounds, and admitted profile registry
remain specification work.

## Visibility and trust

Discovery participants observe public verification material. Possessing or
validating a Station key does not establish Endpoint identity, certification,
membership, or local admission.

## Decision history

Repository review admitted explicit profile-scoped public keys on 2026-08-02
to avoid implementation-selected signature interpretation. This page is
explanation and history, not a second specification; normative semantics come
only from `FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
