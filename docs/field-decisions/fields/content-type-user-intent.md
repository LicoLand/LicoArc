# Field Review: Compact Payload Type with User-Intent Semantics

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-content-type-user-intent` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-content-type`; no successor. |
| Current conclusion | `contentType` is a compact dispatch token; LicoArc validates only its own reserved control Payload grammars and leaves ordinary application Payload meaning outside the protocol. |

## Question

How can an Endpoint dispatch protected bytes without turning LicoArc into the
authority for application Payload schemas?

## Role in communication

The sender supplies a compact token and the receiving Endpoint routes the
Payload to its application context. Reserved Protocol Line values select
LicoArc-owned attachment control grammars; other values remain opaque to the
Protocol Layer.

## Contribution to LicoArc's final vision

Uses one compact dispatch token while leaving ordinary application Payload semantics outside LicoArc and reserving protocol validation for LicoArc-owned control payloads.

## Field model and trade-offs

The field remains mandatory registered `uint32`. The exact Protocol Line
reserves a closed bounded range for LicoArc control content and defines a
separate application dispatch range. LicoArc validates the integer,
placement, and reserved control grammars, but does not approve, parse, rewrite,
or reject ordinary application Payload semantics.

## Necessity proof

Independent Endpoints need a compact dispatch input. The application meaning
cannot be inferred from encrypted bytes, while a large schema identifier or
text media label would consume more traffic.

## Visibility and trust

The token is Endpoint-protected. It does not authorize content, trust the
sender, or grant a Station visibility into the Payload class.

## Alternatives

- No dispatch token: ambiguous when several application contexts share a
  session.
- Text type names: rejected for repeated wire cost and canonicalization.
- LicoArc-owned application schema registry: rejected as protocol overreach.
- Compact token with reserved control values: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned dispatch and
Payload-authority question is self-contained.

## Decision history

The predecessor selected a compact exact-schema discriminator. LicoArc review
on 2026-08-03 narrowed protocol interpretation to LicoArc-owned control
Payloads and retired the application-schema authority implicit in the broader
record.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
