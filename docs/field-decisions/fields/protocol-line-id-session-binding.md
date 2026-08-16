# Field Review: Protocol Line ID Session Binding

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protocol-line-id-session-binding` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate placement replaced by open `FLD-protocol-support-statement-v1` and `FLD-handshake-transcript-v1`. |
| Current conclusion | Exact line content identity must be authenticated, but the former mandatory handshake `DIGEST256` and inherited placement are withdrawn. |

## Preserved requirement

Endpoints must agree on one immutable complete line before session state can
advance. Ordinary records cannot carry an unauthenticated selector, and a
content mismatch cannot fall back to a lower line.

## Retirement rationale

The old placement preceded the exact Hybrid AKE and transcript construction.
No digest width, field, label, record, or inheritance rule remains active.

## Definition evidence

The definition is `NOT-SPECIFIED`; this record is history only.
