# Algorithm Decision: Core v1 Hybrid AKE

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-core-v1-hybrid-ake` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | Core v1 security constitution in `PRODUCT.md` and `ARCHITECTURE.md` |
| Authority targets | `spec/v1/protection`, security claims, conformance corpus, and a future complete Protocol Line |
| Predecessor or successor | Successor to `ALG-baseline-pairwise-protection-suite`; the high-assurance construction has no active successor. |

## Question and scope

Which exact implementation-neutral Hybrid AKE construction closes classical
and post-quantum establishment, hybrid Endpoint authentication, downgrade
binding, key confirmation, failure behavior, and proof obligations for Core
v1? The question includes fixed secret shapes and ordering, the combiner,
domain separation, transcript inputs, prekey roles and consumption, and rekey.
It does not authorize a wire field or a reduced-security fallback.

## Partial conclusion

Core v1 forbids silent fallback, component-wise negotiation, and state advance
after any failed security precondition. Any reduced-security construction must
be a separately decided, proved, and identified complete Profile. The exact
classical and post-quantum one-time-prekey consumption rule remains open and
must follow the final construction and proof rather than precede them.

## Alternatives and acceptance

Omission, classical-only establishment, reusable-PQ silent fallback, and a
construction justified only by comparative lineage are inadmissible. `READY`
requires one exact Prototype, complete assumptions and claim mapping,
source-derived cases, formal binding inputs, and proof evidence capable of
distinguishing every admitted fixed shape.

## Source-derived conformance material

No positive establishment vector is active. Future material must derive from
the decided Prototype and must cover downgrade, prekey reuse, transcript
substitution, compromise variants, replay, rollback, bounds, and atomic failure.

## Definition evidence

The definition status is `PARTIAL`: only the fail-closed constitution and
non-fallback boundary are decided. No active handshake, prekey bundle,
transcript, SessionAccept, Profile, or Protocol Line wire exists.
