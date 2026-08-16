# Field Review: Generic Payload Length

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-generic-payload-length` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject generic `payloadLength` and `originalLength`; canonical byte-string encoding, attachment `byteLength`, and Transport Profile framing already own their exact lengths. |

## Question

Does ordinary user Payload need a second declared length?

## Role in communication

Endpoints obtain ordinary Payload length from the canonical byte string,
attachment total length from its descriptor, and packet length from carrier
framing. No sender claim is required.

## Contribution to LicoArc's final vision

Deriving payload boundaries from canonical content encoding and attachment descriptors avoids duplicate length fields while leaving application bytes unchanged.

## Field model and trade-offs

There is no field. Any duplicate length, unit mismatch, overflow, or mismatch
with actual encoded bytes rejects the containing representation rather than
creating another authority.

## Necessity proof

The receiver can derive every required boundary. A duplicate cannot enable a
new interoperable action and spends bytes on every Message.

## Visibility and trust

No additional metadata is exposed. Actual framed size remains observable to
the carrier.

## Alternatives

- Derive from canonical encoding: selected.
- Add uncompressed or logical length: rejected because LicoArc does not
  transform ordinary Payload.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the derivation question is
self-contained.

## Decision history

Derivation, mismatch, overflow, and transformation cases created an objective
field-admission failure. LicoArc review on 2026-08-03 rejected the candidate
and recorded the disposition in the Field Registry.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
