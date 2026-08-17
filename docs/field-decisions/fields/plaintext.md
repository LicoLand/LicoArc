# Field Review: Outer Plaintext

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-plaintext` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `plaintext`, debug payload, fallback content |
| Candidate layer | Rejected from every Station-visible protected-message carrier |
| Observer set | Station and carrier observers if admitted |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the forbidden-field decision and is not a second field specification. |
| Current conclusion | No plaintext application or Generic Message content is admitted outside endpoint protection. |

## Question

May any convenience, compatibility, debugging, fallback, preview, or error path
place application plaintext in the Station-visible envelope?

## Role in communication

It has no conformant role. Endpoint implementations own plaintext before
protection and after successful protected processing. A Station transports
opaque data only.

## Contribution to LicoArc's final vision

Rejects outer plaintext to preserve the central LicoArc promise that Stations
carry only Endpoint-protected content.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Admission directly violates the core confidentiality boundary. |
| Privacy and metadata | Full content disclosure; no mitigation is adequate. |
| Interoperability | A fallback creates two protocol meanings and unsafe downgrade behavior. |
| Implementation complexity | Exclusion is simpler and testable. |
| CPU, memory, and wire cost | Duplicate plaintext wastes resources in addition to disclosure. |
| Evolution and downgrade | No future version may silently reinterpret a plaintext path as conformant protection. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | None. Routing and carrier errors do not require application content. |
| Removal consequence | No conformant protocol capability is lost. |
| Derivation | Not applicable. |
| Lower-layer carrier | Forbidden; hop protection does not satisfy Endpoint-to-Endpoint protection. |
| Protected placement | Application and Generic Message content belongs inside Pairwise Protection. |
| Duplicate-authority risk | Any plaintext copy defeats confidentiality even when an encrypted copy also exists. |

## Value model

No enum, range, encoding, optionality, or compatibility form exists. Unknown
outer members fail closed under a closed envelope. Diagnostic systems must use
bounded non-content reason classes rather than copying payloads.

## Alternatives

- Protected application content.
- Synthetic fixtures in conformance material.
- Local endpoint diagnostics that never cross the Station boundary.
- Typed transport failures without request or payload echo.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- MLS requires
  application messages to use `PrivateMessage`.
- Web Push encryption protects
  content end to end across the push service.
- Matrix encrypted events keep event plaintext
  inside the encrypted payload,
  although surrounding homeserver metadata remains visible.

## Decision history

The field is excluded. No further design vote is required unless the LicoArc
trust model itself is explicitly replaced.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
