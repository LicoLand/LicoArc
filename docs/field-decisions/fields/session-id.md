# Field Review: Session Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-session-id` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate field withdrawn; future state selection is coupled to the decided AKE, transcript, SessionAccept, and Double Ratchet definitions. |
| Current conclusion | No `sessionId`, `ID128`, derivation, label, or lookup placement is active. |

## Preserved requirement

Endpoints need bounded, authenticated state selection that rejects
cross-session replay and confusion. A Delivery Handle, route, key hint, or
Station observation cannot authenticate a session.

## Retirement rationale

The Candidate allocated a random 16-octet identifier before the establishment
and ratchet state machines determined whether an explicit value was necessary.
No compatibility contract remains.

## Definition evidence

The definition is `NOT-SPECIFIED`.
