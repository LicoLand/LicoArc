# Field Review: Signing-Key Profile Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-signing-key-profile-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Mandatory `SigningKey.keyProfileId` is a `DIGEST256` selecting one exact public-key and signature-verification profile. |

## Question

How can a verifier parse public key and signature bytes without accepting an
implementation-selected algorithm combination?

## Role in communication

The signer publishes the identifier with its verification key. The verifier
uses it to select one complete, registered parsing and verification contract
before consuming `publicKey` or `signatureValue`.

## Contribution to LicoArc's final vision

Selects one exact signing and verification construction so aliases, loose
algorithm lists, and Provider-specific names cannot alter validation.

## Field model and trade-offs

One digest identifier prevents algorithm-name aliases, unsafe parameter
negotiation, and Provider-specific wire values. It keeps signature agility
possible while making the accepted construction closed and downgrade-bound.

## Visibility and trust

Observers of the containing signed object see the profile and may use it for
fingerprinting. The value is authoritative only when the containing object and
profile lifecycle validate; a Station or implementation Provider cannot mint
an accepted profile.

## Decision history

The registry initially referenced `SigningKey` as an opaque structure. Closure
review exposed the profile selector as an implicit field, so it was made
explicit rather than letting key length, a Provider, or trial parsing choose
cryptographic meaning.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
