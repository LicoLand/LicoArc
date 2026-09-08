# Field Review: Handshake Purpose

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-purpose` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate field withdrawn; context separation belongs to the specified AKE and `FLD-handshake-transcript-v1`; no predecessor bytes survive. |
| Current conclusion | No `handshakePurpose` enum, label, or placement is active. |

## Preserved requirement

The active establishment state machine rejects cross-context replay and
confusion. A Station route or local UI state cannot supply trusted purpose.

## Retirement rationale

The Candidate enum `firstContact`/`reconnect`/`rekey` preceded the exact AKE
and transcript. The specified construction derives purpose from its closed
record type, state, domains, and transcript; no standalone field, wire
placement, or compatibility interpretation survives.

## Definition evidence

The definition is `NOT-SPECIFIED`.
