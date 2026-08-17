# Field Review: Protection Profile ID Session Binding

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protection-profile-id-session-binding` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate placement withdrawn; any future exact binding belongs to open `FLD-handshake-transcript-v1`. |
| Current conclusion | No Profile field or independent Profile selection is active. |

## Preserved requirement

A future complete Protocol Line owns its complete Profile membership. If the
decided AKE needs an explicit transcript value, its exact identity and
placement must be decided with that construction.

## Retirement rationale

The Candidate field enabled composition before line/Profile content identity
and proof binding were closed. No identifier encoding or placement survives.

## Definition evidence

The definition is `NOT-SPECIFIED`; no retired value is a fallback.
