# Pairwise Protection v1 — Partial Definition

Pairwise Protection is mandatory for an executable LicoArc Core v1 Protocol
Line, but its exact construction is not currently specified. The machine
authority in [`spec/v1/protection/`](../../spec/v1/protection/) contains only
the partial-definition registry and withdrawn Candidate identifier tombstones.
It defines no active Profile, handshake, prekey bundle, established record,
runtime grammar, corpus, or session transition.

## Closed constitution

- Security downgrade, missing assumptions, unknown input, component-wise
  negotiation and implementation-selected fallback fail without state advance.
- A reduced-security or reduced-forward-secrecy construction, if ever admitted,
  is a separate complete Profile with independent claims, proof and immutable
  identity; it is never a baseline fallback.
- The exact Hybrid AKE and its proof precede any mandatory classical or
  post-quantum one-time-prekey consumption rule.
- A real Double Ratchet must encode and authenticate the state needed for DH
  ratchet transitions. The withdrawn epoch/direction/counter frame is not a
  ratchet and is not a compatibility wire.
- Responder key confirmation, transcript binding, prekey consumption,
  rollback, restart, replay, skipped keys, deletion, failure and resource
  bounds must close before a Profile becomes active.

## Open decisions

The owning Algorithm Decisions are
[`ALG-core-v1-hybrid-ake`](../algorithm-decisions/core-v1-hybrid-ake.md) and
[`ALG-core-v1-double-ratchet`](../algorithm-decisions/core-v1-double-ratchet.md).
The independent open Message Field reviews cover the prekey bundle, handshake
transcript, SessionAccept and ratchet header. They allocate no active label or
wire.

## Security claim boundary

[`spec/v1/security/`](../../spec/v1/security/) records security targets,
adversary scopes, assumptions, non-claims and proof bindings. A target without
an actual LicoArc-owned binding remains `unproved`; schema consistency,
comparative lineage, a downstream implementation, interoperability result,
audit or release decision cannot turn it into a claim.

Until these decisions are `DECIDED` and fully `SPECIFIED`, Protocol Line v1 is
`Candidate`/`PARTIAL`, session-ineligible and publication-ineligible.
