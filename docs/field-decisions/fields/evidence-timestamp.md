# Field Review: Evidence Timestamp

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-timestamp` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | A timestamp reported by an Endpoint or Station is not trusted evidence of when a signature was created. |

## Question

Should a checkpoint carry `signedAt`, `evidenceTimestamp`, or Station time as
proof of real-world signing time?

## Role in communication

The proposed field would report a clock reading. Neither Endpoint nor Station
clock supplies an independent time authority, so the value could only prove
that the signer signed the reported number.

## Contribution to LicoArc's final vision

Rejecting a time value reported by an Endpoint or Station prevents an untrusted clock value from masquerading as proof of when an Endpoint signed.

## Field model and trade-offs

There is no evidence time field. Protocol freshness, ordering, expiry, and
pending windows retain their purpose-specific state. A future independently
trusted time-proof capability would require its own role, trust roots, archive,
revocation, field decisions, and Protocol Line.

## Visibility and trust

Omission avoids false time claims and extra metadata. It also means current
evidence cannot distinguish a valid historical signature from a signature
created after later key compromise without separate external proof.

## Alternatives

- Endpoint clock: rejected because the Endpoint reports its own value.
- Station clock: rejected as carrier-controlled.
- No trusted-time claim: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because LicoArc currently defines no trusted
time role and cannot infer one from a clock field.

## Decision history

LicoArc review on 2026-08-03 rejected evidence timestamps and documented the
key compromise limitation instead of hiding it behind a signed clock value.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
