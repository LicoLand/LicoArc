# Field Review: Protocol Line Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protocol-line-id` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-protocol-line-id-session-binding`. |
| Current conclusion | Retired: established records no longer repeat `protocolLineId`; the successor owns handshake-only placement and session inheritance. |

## Question

Which immutable Protocol Line semantics must both Endpoints apply to the
record or handshake?

## Role in communication

The predecessor allowed the sender to restate the selected line on every
record. The successor states it during authenticated establishment, and the
receiver verifies all later records against retained session state. It is not
a transport version hint.

## Contribution to LicoArc's final vision

Retiring per-record `protocolLineId` repetition preserves exact session authority while removing a 32-octet constant from every established record.

## Field model and trade-offs

The semantic value remains a mandatory `DIGEST256` Protocol Line identifier,
but this predecessor's broad occurrence is retired. Exact current placement,
lifecycle, and invalid-input behavior come only from the Field Registry.

## Visibility and trust

Changing the value can cause parser confusion or downgrade, so Endpoint
authentication and session consistency are required. Stations may route by
separate transport facts but cannot select or reinterpret it.

## Decision history

The field was admitted because an Endpoint must bind processing to one exact
line and cannot derive that authority from transport framing or implementation
version. LicoArc review on 2026-08-03 retired its broad record placement in
favor of `FLD-protocol-line-id-session-binding`; the original admission history
remains preserved here.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
