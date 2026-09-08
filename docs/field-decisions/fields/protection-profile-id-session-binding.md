# Field Review: Protection Profile ID Session Binding

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protection-profile-id-session-binding` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate placement withdrawn; the specified `FLD-handshake-transcript-v1` binds active Profile membership without preserving predecessor bytes. |
| Current conclusion | No independent Profile field or component negotiation is active; the complete Protocol Line fixes one stable-core Profile and its content identity is transcript-bound. |

## Preserved requirement

The complete Protocol Line owns its exact Profile membership. The specified
AKE binds the selected Profile content identity in its transcript without
permitting independent component selection.

## Retirement rationale

The Candidate field enabled composition before line/Profile content identity
and proof binding were closed. The active line and transcript now close those
bindings; no predecessor field, identifier encoding, placement, or fallback
survives.

## Definition evidence

The definition is `NOT-SPECIFIED`; no retired value is a fallback.
