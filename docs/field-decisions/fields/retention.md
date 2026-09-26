# Field Review: Absolute Retention Timestamp


| Property | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-retention` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |

## Current V1 decision

No transport TTL field is admitted. Already accepted opaque custody remains until
an authorized Endpoint handoff, settlement or explicit user deletion. This is not
an adjustable sender retention hint and is never a freshness, authorization or
proof-of-deletion signal. Claim timers release exclusive claims only.

Capacity admission happens before acknowledgment. Storage refusal/backpressure is
visible; accepted messages are not evicted by age. Exact source authority is
`spec/v1/transport/bounds.json` and `spec/v1/reliable/continuity.md`.

## Alternatives and cost

A mandatory fixed-age window loses offline work. An arbitrary per-message retention
field adds policy negotiation without preserving the required durable promise.
Select explicit durable custody and quotas instead. This costs persistent storage
and restart/settlement guards but removes protocol-imposed offline lifetime limits.

## Definition evidence

The continuity field decision, normative custody policy, schemas and definition
models/tests supersede the earlier fixed-window rationale within initial V1.
No deletion guarantee against a malicious Station is claimed.
