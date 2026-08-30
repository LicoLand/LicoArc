# Field Review: Protocol-Controlled Payload Compression

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-payload-compression` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject common `compression`, `compressionAlgorithm`, and `originalLength` fields; LicoArc never transforms ordinary user Payload. |

## Question

Should LicoArc select a codec and rewrite user-intent Payload to save traffic?

## Role in communication

Applications may produce any opaque bytes, including content they chose to
compress. LicoArc protects and transports those exact bytes and does not
negotiate, apply, or reverse an application codec.

## Contribution to LicoArc's final vision

Keeping compression outside LicoArc preserves application payload as user intent and prevents protocol-controlled transforms, compression oracles, and repeated codec negotiation.

## Field model and trade-offs

There is no common field. Application Payload identity is the exact supplied
byte string. LicoArc control Payloads are already compact deterministic
structures and cannot enable an open codec negotiation.

## Necessity proof

Compression is not required for any protocol action. A codec selector changes
Payload interpretation, adds failure modes, and can expand incompressible
input.

## Visibility and trust

No codec capability or original length becomes metadata. Applications retain
full authority and risk ownership for their bytes.

## Alternatives

- Application supplies its chosen exact bytes: selected.
- Mandatory or negotiated LicoArc compression: rejected.
- Silent opportunistic compression: rejected because it changes byte identity.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the Payload-authority and transform
question is self-contained.

## Decision history

LicoArc review on 2026-08-03 rejected protocol compression after omission,
expansion, oracle, negotiation, and identity cases closed objectively.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
