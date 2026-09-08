# Field Review: Descriptor Signatures

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-descriptor-signatures` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.signatures` is a mandatory bounded `Signature[1..MAX_SIGNATURES]` covering the complete canonical descriptor excluding the `signatures` field itself. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers verify that the complete descriptor content was
authorized by the applicable Station signing material.

## Contribution to LicoArc's final vision

Authenticates the complete Station descriptor so listeners, keys, validity,
and certification references cannot be altered independently.

## Field model and trade-offs

The collection is non-empty and bounded. Signature input is the complete
canonical descriptor with this collection excluded. Each `Signature` contains
registry-owned `keyProfileId`, `keyId`, purpose, and exact profile-sized
`signatureValue`; the Identity policy and schema fix admitted profiles and
collection bounds.

## Visibility and trust

Discovery participants observe the signatures. Successful verification
authenticates descriptor origin and integrity only; it does not establish
Endpoint identity, Station honesty, certification, or federation membership.

## Decision history

Repository review admitted whole-descriptor authentication on 2026-08-02 to
prevent selective-field substitution. This page is explanatory history, not
a second specification; normative semantics are solely in
`FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
