# Field Review: Signature Value

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-signature-value` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Mandatory `Signature.signatureValue` carries bounded signature bytes verified with the resolved `keyId` and profile over the containing object's canonical covered bytes. |

## Question

What explicit value carries signature output without allowing a text-object
representation, Provider encoding, or an uncovered field to change signed meaning?

## Role in communication

The signer emits the bytes after canonicalizing the containing object as that
object specifies. The verifier resolves `keyId`, applies its exact profile,
reconstructs the same covered bytes, and validates the signature.

## Contribution to LicoArc's final vision

Carries exact bounded signature bytes in a common object while leaving
algorithm interpretation and covered data under their owning profile and
object.

## Field model and trade-offs

A bounded byte string is language-neutral and can carry traditional,
post-quantum, or hybrid profile output without adding algorithm-specific
common fields. Object-owned coverage rules prevent ambiguous self-signing and
partial-field authentication.

## Visibility and trust

Observers of the signed object see the signature size and key reference. The
bytes create authority only after canonicalization, key authorization, profile
lifecycle, and signature verification all succeed.

## Decision history

The registry originally named `Signature` but left its output implicit.
Closure review made `signatureValue` explicit and kept algorithm identifiers,
component signatures, and Provider encodings inside the selected key profile.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
