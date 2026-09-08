# Field Review: Protected Packet Carrier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protected-packet` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `ciphertext`, `packet`, `body`, raw transport body |
| Candidate layer | Transport Profile raw binary body |
| Observer set | Endpoint and Station; outside observers depend on carrier protection |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Authority targets | The HTTPS Transport v1 body contract and stable-core Pairwise Protection frame |
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

The semantic type is one non-empty octet sequence of at most
`MAX_PACKET_BYTES = 524,288`, carried without text reinterpretation under
`application/licoarc-protected-packet`. The stable-core Profile owns the
complete ratchet-header, ciphertext, and tag frame. Streaming, parameters,
trailing bytes, text armoring, and empty packets are forbidden.

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

The stable-core Protection frame and HTTPS Transport v1 close exact framing,
media type, byte bounds, Profile binding, streaming, malformed-input, and
failure semantics.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
