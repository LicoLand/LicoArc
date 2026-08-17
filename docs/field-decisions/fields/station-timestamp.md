# Field Review: Station Timestamp

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-timestamp` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | arrival time, origin time, server time, queue time |
| Candidate layer | Station-local state or non-authoritative Transport Profile signal |
| Observer set | Station and any recipient of the signal |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the non-evidence disposition and is not a second field specification. |
| Current conclusion | A Station timestamp cannot establish Endpoint freshness, ordering, replay status, expiry, or evidence. |

## Question

May a Station-originated time value appear in transport results, and what is an
Endpoint allowed to infer from it?

## Role in communication

A Station may use local time for queue operations, diagnostics, retention
scheduling, or a transport response. Those operational uses are outside
endpoint security. An Endpoint may display or log a suitably privacy-safe
transport observation but cannot use it to accept protected content.

## Contribution to LicoArc's final vision

Keeping Station time local prevents an untrusted carrier clock from becoming
freshness, replay, ordering, or Endpoint evidence.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Granting authority enables delay, replay, and clock-manipulation attacks. |
| Privacy and metadata | Precise timestamps improve traffic correlation and fingerprinting. |
| Interoperability | Clock precision, leap seconds, skew, and timezone syntax create avoidable variation. |
| Implementation complexity | Keeping the value local avoids parsing and precedence rules. |
| CPU, memory, and wire cost | Negligible bytes; operational logs can create significant retained metadata. |
| Evolution and downgrade | A diagnostic value must never be reinterpreted as security-authoritative in place. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | No endpoint protocol action requires authoritative Station time. |
| Removal consequence | Station implementation may lose one diagnostic or scheduling value; endpoint interoperability remains intact. |
| Derivation | The Station already has local clock state; it need not be transmitted. |
| Lower-layer carrier | Transport Profile date metadata or implementation-local metadata can carry diagnostics. |
| Protected placement | Endpoint freshness must use endpoint-authenticated counters, epochs, nonces, or protected time rules. |
| Duplicate-authority risk | Severe if Station time competes with protected freshness or retention values. |

## Value model

There is no approved LicoArc endpoint-security field. A future Transport
Profile may define an explicitly non-authoritative timestamp with exact format
and privacy rules, but that would be a separate `OPEN` representation
decision.

## Alternatives

- Keep time entirely Station-local.
- Use carrier-standard diagnostic time.
- Use endpoint-protected time only where a threat model can justify clock
  assumptions.
- Prefer counters or epochs for replay handling when the selected protection
  construction supports them.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Matrix federation transactions include
  `origin_server_ts`, reflecting a
  homeserver-authored event and federation model that LicoArc does not trust.
- Web Push uses a
  relative TTL for service retention rather than making service time
  application freshness evidence.
- TLS, MLS, and
  ratcheting protocols derive security
  state from authenticated
  transcripts, epochs, and counters rather than an untrusted relay clock.

## Decision history

The authority decision is complete: Station time is never endpoint security
evidence. Any future carrier timestamp requires its own Transport Profile
review and must preserve that invariant.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
