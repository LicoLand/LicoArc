# Field Review: Endpoint Identity Session Binding

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-identity-session-binding` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Stable Endpoint identity remains complete; Candidate Pairwise placement is replaced by the specified AKE and `FLD-handshake-transcript-v1`; no predecessor bytes survive. |
| Current conclusion | The former standalone Pairwise identity field is withdrawn; the specified transcript authenticates Endpoint identity state through exact key and identity-state bindings. |

## Preserved requirement

The active AKE authenticates portable Endpoint identity and continuity
without making a Station, route, Provider, product, or device label an identity
authority. The stable Identity registry is unchanged.

## Retirement rationale

The Candidate placement preceded the Hybrid AKE, transcript, and key
confirmation definitions. The specified construction owns exact identity key
and state-digest inputs; no predecessor field, repeated placement, or
compatibility path survives.

## Definition evidence

The retired Pairwise placement is `NOT-SPECIFIED`; the specified AKE and
independent Identity capability own current authentication semantics.
