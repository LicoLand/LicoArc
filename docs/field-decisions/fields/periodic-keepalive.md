# Field Review: Mandatory Periodic Keepalive

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-periodic-keepalive` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject mandatory LicoArc `heartbeat`, `presence`, `pingInterval`, and idle acknowledgement fields; idle relationships emit no LicoArc record. |

## Question

Must LicoArc generate periodic traffic merely to keep a relationship alive?

## Role in communication

Session validity comes from authenticated state and lifecycle, not recent
traffic. A Transport Profile or implementation may manage a live connection
locally, but that liveness hint is not an Endpoint receipt or a common record.

## Contribution to LicoArc's final vision

Keeping idle relationships silent avoids mandatory background traffic, radio wakeups, and a stable cadence that Stations could correlate.

## Field model and trade-offs

There is no common field or periodic LicoArc Message. Required expiry, retry,
and reconnect transitions remain explicit and bounded. Carrier-native liveness
cannot advance Endpoint evidence.

## Necessity proof

No protocol state requires a heartbeat. Connection failure can be observed by
the carrier, and asynchronous delivery already tolerates disconnected peers.

## Visibility and trust

Keeping an idle relationship silent reduces traffic metadata and mobile
background work. It does not prove
offline status or availability.

## Alternatives

- No protocol keepalive: selected.
- Fixed or negotiated heartbeat: rejected for recurring cost and correlation.
- Carrier-local connection liveness: permitted but non-authoritative.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned idle-state and
traffic question is self-contained.

## Decision history

LicoArc review on 2026-08-03 rejected periodic common traffic after idle,
reconnect, liveness, metadata, and mobile-resource cases closed objectively.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
