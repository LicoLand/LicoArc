# Field Review: User-Intent Payload

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-content-user-intent` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-content`; no successor. |
| Current conclusion | Generic Message `payload` carries user-intent bytes unchanged; LicoArc parses only reserved LicoArc control Payloads and never compresses or rewrites ordinary Payload. |

## Question

Which bytes belong to user intent, and what may LicoArc do to them?

## Role in communication

The sending application supplies ordinary Payload and the receiving
application consumes it. LicoArc protects, frames, bounds, and transports
those bytes without semantic interpretation or transformation. Reserved
attachment control Payloads remain protocol-owned and strictly parsed.

## Contribution to LicoArc's final vision

Carries user-intent bytes unchanged and opaque to LicoArc while allowing only LicoArc-owned control payloads to receive protocol grammar validation.

## Field model and trade-offs

The active field is mandatory `payload: bstr[0..MAX_PAYLOAD_BYTES]`. Ordinary
application bytes are reproduced exactly after successful protection and
transport. Attachment chunks carry exact raw slices. LicoArc control content
uses the same byte-string carrier only under a reserved `contentType` and its
closed grammar. Bounds protect resources but do not grant semantic authority.

## Necessity proof

Without a byte carrier no application intent can cross the relationship.
Protocol framing cannot derive or alter those bytes, and a text conversion
would expand traffic and change identity.

## Visibility and trust

Payload remains Endpoint-protected and opaque to Stations. LicoArc does not
claim the Payload is safe, true, authorized, compressible, or meaningful.

## Alternatives

- Preserve exact bytes: selected.
- Protocol compression or rewriting: rejected as user-intent modification and
  side channel surface.
- Text armoring: rejected for expansion and extra allocation.
- Application-selected compressed bytes as Payload: permitted because the
  application, not LicoArc, owns that intent.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned Payload authority
boundary is self-contained.

## Decision history

The predecessor admitted generic content bytes and also assigned LicoArc an
exact-schema interpretation. LicoArc review on 2026-08-03 renamed the field to
`payload`, made ordinary bytes explicitly user-owned, retained strict control
grammars only for LicoArc content, and retired the broader predecessor.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
