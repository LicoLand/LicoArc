# Field Review: Protected Packet Carrier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protected-packet` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `ciphertext`, `packet`, `body`, raw transport body |
| Candidate layer | Transport Profile raw binary body |
| Observer set | Endpoint and Station; outside observers depend on carrier protection |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Authority targets | Future Transport Profile body contract and Pairwise Protection frame |
| Predecessor or successor | None |
| Current conclusion | One bounded protected octet sequence is carried directly as the Transport Profile raw binary body, not as a text-object `ciphertext` value or binary-to-text wrapper. |

## Question

What exact unit crosses the Station boundary: a named field inside a structured
envelope, a binary frame, or the raw body of a Transport Profile?

## Role in communication

The sender Endpoint produces a Pairwise Protection frame. The Station stores
or forwards it without semantic interpretation. The receiver Endpoint selects
the pinned profile, validates, decrypts, and only then exposes a protected
record to upper layers.

## Contribution to LicoArc's final vision

Carries the sole bounded Endpoint-protected packet through a Station without
text conversion, plaintext interpretation, or duplicate content authority.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Exact byte identity is essential for authentication; lossy text decoding or intermediary re-encoding is unacceptable. |
| Privacy and metadata | Station sees packet equality, size, timing, and route even when content is opaque. |
| Interoperability | Raw bytes or one canonical textual encoding must have portable vectors for every independent implementation. |
| Implementation complexity | Direct binary carriage avoids text-armoring copies; a text-object carrier is easier to inspect but adds canonicalization and decoded-size checks. |
| CPU, memory, and wire cost | Binary-to-text armoring adds about one third wire expansion and often an extra allocation. |
| Evolution and downgrade | The outer carrier must not select or reinterpret the authenticated Protection Profile. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Carry the endpoint-protected frame between endpoints. |
| Removal consequence | No message content can traverse the Station. |
| Derivation | The Station cannot derive protected output and must not construct it. |
| Lower-layer carrier | A framed Transport Profile can use its raw binary body directly. |
| Protected placement | This value is the protection container; its internal security fields belong to Pairwise Protection. |
| Duplicate-authority risk | A `ciphertext` field plus a transport body or detached tag can create ambiguous byte identity. |

## Value model

The semantic type is a bounded octet sequence carried without text
reinterpretation. The minimum and maximum byte lengths, frame grammar, media
type, profile binding, streaming rule, and empty-packet
behavior remain to be specified. Character decoding and binary-to-text
armoring are not packet encodings for this carrier.

## Alternatives

- Raw binary Transport Profile body.
- A byte string in a structured binary envelope.
- Text-object string with one canonical binary-to-text encoding.
- Textual compact protection format whose grammar itself is character text.
- Detached protected body plus metadata, which increases binding complexity.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- JWE uses
  Base64URL because JSON cannot represent arbitrary octets.
- COSE uses CBOR byte
  strings for protected headers and content.
- MLS defines a
  binary `message/mls` media type.
- Web Push carries encrypted
  content in the HTTP body; Base64 in its example is presentation-only.
- Matrix carries encrypted payloads as Base64
  strings inside JSON events,
  inheriting JSON's text-only limitation and homeserver event model.
- The JSON and UTF-8 boundary explains why UTF-8
  serializes a JSON text but cannot losslessly reinterpret arbitrary protected
  octets.

## Decision history

After its admission evidence closed and the record reached `READY`, repository
review approved the bounded carrier decision on 2026-08-01: the
protected packet is necessary, has byte-string semantics, and is carried as
the Transport Profile's raw binary body. A text-object `ciphertext` field and
its text-armored or character-encoding representation are excluded from the
target carrier.

Definition remains partial until the Pairwise Protection frame and first
Transport Profile close exact framing, media type, byte bounds, profile
binding, streaming, malformed-input, and failure semantics. Only the linked
normative scope advances this record.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
