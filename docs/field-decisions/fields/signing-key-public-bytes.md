# Field Review: Signing-Key Public Bytes

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-signing-key-public-bytes` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Mandatory `SigningKey.publicKey` carries bounded canonical public verification bytes interpreted only under `keyProfileId`. |

## Question

Where does a signed descriptor carry the verification material required by a
discovery participant without exposing any secret key material?

## Role in communication

The signer publishes the public bytes and a verifier parses them under the
selected key profile before validating signatures over the containing object.

## Contribution to LicoArc's final vision

Makes authenticated objects independently verifiable from bounded canonical
public material without a mandatory online key service.

## Field model and trade-offs

Explicit bounded bytes make descriptors independently verifiable and avoid a
mandatory online key service or Provider. Binding interpretation to
`keyProfileId` prevents length guessing and cross-algorithm parsing.

## Visibility and trust

The value is intentionally public to discovery participants and may support
cross-descriptor correlation. It grants verification capability only. Private
keys, seeds, recovery material, and Endpoint-local Provider metadata are
forbidden.

## Decision history

The original `signingKeys` aggregate described public verification bytes but
did not list their member. Closure review promoted the member into the field
registry so no schema could silently choose a text encoding, key service, or
implementation-native structure.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
