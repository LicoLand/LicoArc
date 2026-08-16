# Field Review: Prekey Bundle v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-prekey-bundle-v1` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Supersedes no active field; the retired Candidate bundle allocated no durable wire. |
| Current conclusion | A canonical hybrid-authenticated bundle is required, but no field set, label, optionality, prekey consumption rule, or wire is allocated before `ALG-core-v1-hybrid-ake` closes. |

## Question

Which exact values must an Endpoint bind into one offline prekey statement so
identity continuity, Protocol Line support, capability state, classical and
post-quantum key material, validity, freshness and authentication cannot be
substituted or downgraded?

## Role in communication

The responder produces the statement and the initiator validates it before
establishment. A Station may carry, suppress or replay bytes but cannot choose
a prekey mode or make the statement authoritative.

## Field model and trade-offs

The proposal's candidate values remain review inputs, not fields. Exact
presence, fixed shapes, dual-signature input, bounds, atomic consumption and
tombstones depend on the decided AKE and proof.

## Visibility and trust

The bundle is security-critical and potentially correlating. Any admitted
form must be Endpoint-authenticated and fail closed on mismatch, replay,
expiry, unknown material or unavailable mandatory assumptions.

## Decision history

Review withdrew the earlier embedded bundle because it lacked a closed PQ
prekey and hybrid-authentication model. No fallback or identifier reuse is
preserved.

## Definition evidence

The definition status is `PARTIAL`. Necessity and fail-closed scope are known;
the interoperable value and placement remain unallocated.
