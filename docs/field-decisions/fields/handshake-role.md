# Field Review: Handshake Role

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-role` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate field withdrawn; role separation belongs to the specified AKE and `FLD-handshake-transcript-v1`; no predecessor bytes survive. |
| Current conclusion | No standalone `role` field, enum, label, or placement is active. |

## Preserved requirement

The active construction prevents reflection and role disagreement. A
Station route or arrival order cannot assign an authenticated Endpoint role.

## Retirement rationale

The Candidate enum `initiator`/`responder` was selected before the exact AKE
could determine whether roles were derived or transmitted. The specified
transcript, record types, direction domains, and state transitions now own
role separation; no standalone field or compatibility wire shape survives.

## Definition evidence

The definition is `NOT-SPECIFIED`.
