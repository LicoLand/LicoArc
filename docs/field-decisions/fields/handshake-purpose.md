# Field Review: Handshake Purpose

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-purpose` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate field withdrawn; context separation belongs to the open AKE and `FLD-handshake-transcript-v1`. |
| Current conclusion | No `handshakePurpose` enum, label, or placement is active. |

## Preserved requirement

The future establishment state machine must reject cross-context replay and
confusion. A Station route or local UI state cannot supply trusted purpose.

## Retirement rationale

The Candidate enum `firstContact`/`reconnect`/`rekey` preceded the exact AKE
and transcript. Whether context is derived or transmitted remains open.

## Definition evidence

The definition is `NOT-SPECIFIED`.
