# Field Review: Explicit Packet Length

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-explicit-packet-length` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Candidate spellings | `length`, `packetLength`, carrier `Content-Length`, binary frame prefix |
| Candidate layer | Transport Profile framing |
| Observer set | Endpoint, Station, carrier |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the rejection decision and is not a second field specification. |
| Authority targets | HTTPS Transport v1 specifies native framing and bounded packet processing without redefining Generic Messaging attachment chunks. |
| Current conclusion | Reject a generic or duplicate LicoArc `packetLength` field. The selected Transport Profile supplies the actual encoded-body boundary; this decision does not fix one universal packet maximum or alter Protocol-Line-owned attachment chunking. |

## Question

Does the selected Transport Profile need a LicoArc-owned length field to
delimit or preflight a packet, or can it use existing frame boundaries and
derive the length?

## Role in communication

A receiver uses length for allocation bounds, incremental reads, frame
delimitation, and early rejection. It must never treat length as protected
content semantics.

## Contribution to LicoArc's final vision

Rejecting a duplicate packet-length field avoids framing disagreement and
unnecessary metadata while preserving bounded parsing in the Transport
Profile.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Early bounds prevent memory exhaustion; inconsistent duplicate lengths create request-smuggling-like ambiguity. |
| Privacy and metadata | An explicit field does not hide a length already visible to the Station. |
| Interoperability | Counted unit, endianness, overflow, and mismatch behavior must be exact. |
| Implementation complexity | Derived length is simplest; stream framing requires incremental parsers. |
| CPU, memory, and wire cost | Small field cost; safe preallocation can help, trusting attacker length can hurt. |
| Evolution and downgrade | Maximum-size changes require profile lifecycle rules, not silent acceptance. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Bound allocation and locate the end of a packet on a byte stream. |
| Removal consequence | Depends entirely on carrier framing; message-framed carriers lose nothing. |
| Derivation | Always possible once a complete message body or byte string is available. |
| Lower-layer carrier | Transport body framing, deterministic binary byte-string length, another message-framed carrier, or a binary frame prefix can provide it. |
| Protected placement | Intrinsic frame boundaries belong inside endpoint protection if they affect interpretation. |
| Duplicate-authority risk | High when declared length differs from actual carrier/body length. |

## Value model

There is no independent field value model. HTTPS Transport v1 uses canonical
`Content-Length` equal to the exact body octets and rejects transfer encoding,
streaming, mismatch, empty packets, and bodies over `MAX_PACKET_BYTES`. Any
successor byte-stream profile that needs a bounded length prefix must make it
part of that Profile's framing grammar, not a generic LicoArc message field.

Endpoint-protected attachment chunking and selective recovery are
owned by Generic Messaging and Reliable Exchange; a Transport Profile may
bound their opaque packets but cannot regrid or reinterpret them.

## Alternatives

- Derive from a message-framed carrier.
- Use the carrier's standard body length.
- Use a profile-specific binary length prefix.
- Use profile-specific native framing.
- Duplicate length in an outer object, rejected by default because mismatch
  handling adds another authority.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- TCP is a byte stream and does
  not preserve application-message boundaries.
- Noise bounds its
  messages but delegates higher-level framing and length to the application.
- CBOR and HTTP already
  encode or frame body length in their carrier syntax.

## Decision history

Repository review rejected an independent `packetLength` field on 2026-08-02.
The required delimitation and allocation inputs already belong to carrier or
profile framing, while a duplicate value creates mismatch, parser ambiguity,
and request-smuggling-like failure modes without enabling additional protocol
behavior. This objective admission failure permits direct transition from
`OPEN` to `REJECTED`.

The rejection does not make one maximum universal across successor Profiles.
HTTPS Transport v1 fixes its own exact body and allocation bounds; any
successor capacity or byte-stream framing decision cannot change the
attachment chunk grid owned by the exact Protocol Line.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
