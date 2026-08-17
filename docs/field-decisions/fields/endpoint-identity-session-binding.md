# Field Review: Endpoint Identity Session Binding

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-identity-session-binding` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Stable Endpoint identity remains complete; Candidate Pairwise placement is replaced by open `FLD-handshake-transcript-v1`. |
| Current conclusion | No Pairwise handshake identity field or inherited session placement is active. |

## Preserved requirement

The future AKE must authenticate portable Endpoint identity and continuity
without making a Station, route, Provider, product, or device label an identity
authority. The stable Identity registry is unchanged.

## Retirement rationale

The Candidate placement preceded the Hybrid AKE, transcript, and key
confirmation decisions. No repeated field or placement survives.

## Definition evidence

The Pairwise placement is `NOT-SPECIFIED`; the independent Identity capability
remains complete.
