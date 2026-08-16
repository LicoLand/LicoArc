# Algorithm Decision: High-Assurance Pairwise Protection Suite

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-high-assurance-pairwise-protection-suite` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Complete protection suites](../../PRODUCT.md#complete-protection-suites) and [Pairwise Protection architecture](../../ARCHITECTURE.md#3-pairwise-protection) |
| Authority targets | `PRODUCT.md`, `ARCHITECTURE.md`, `spec/v1/protection`, `conformance/v1/protection`, and the Protocol Line manifest |
| Predecessor or successor | None |

## Question and scope

Which one indivisible high-assurance Protection Profile adds continuous
post-quantum recovery and stronger establishment parameters without silently
falling back to the baseline?  The decision covers the complete hybrid
composition, Triple-Ratchet state evolution, parameter and failure contract,
and a separate mobile resource envelope.  It does not add a wire field,
define human assurance, choose a transport, or authorize code.

## Primary lineage and Algorithm Prototype

The immutable lineage is `RFC-7748`, `RFC-8032`, `RFC-5869`, `RFC-8439`,
`NIST-203`, `NIST-204`, `SIG-PQXDH-R3`, `SIG-DR-R4`, and `SIG-BRAID-R1` in
the comparative lineage for this decision.
`SIG-BRAID-R1` supplies continuous post-quantum recovery and vulnerable-set
analysis; it does not define LicoArc profile identifiers or state semantics.

The closed LicoArc Algorithm Prototype is:

1. **Stronger asynchronous establishment.**  The prekey bundle and role
   binding are the baseline Prototype's exact construction, with
   ML-KEM-1024 replacing ML-KEM-768.  At most 32 one-time prekeys are exposed
   because the larger KEM keys consume more admission budget.  The combined
   secret order is `X25519 || ML-KEM-1024` and cannot be negotiated.
2. **Hybrid identity authentication.**  Ed25519 and ML-DSA-87 both sign the
   transcript with contexts `LicoArc-High-Identity` and
   `LicoArc-High-Transcript`.  Verification requires exactly the profile's
   signature set; a valid baseline signature set is not a high-assurance
   substitute.
3. **Triple Ratchet.**  The root state contains three independent chains:
   classical symmetric, classical X25519 rekey, and post-quantum ML-KEM Braid.
   Every admitted post-quantum epoch consumes one ML-KEM-1024 encapsulation
   and one X25519 rekey input.  The next root is
   `HKDF-Extract(0^32, classicalChain || x25519Secret || pqChain ||
   transcriptDigest)` with fixed labels `LicoArc/High/Classical`,
   `LicoArc/High/Rekey`, and `LicoArc/High/PQ`.
4. **Continuous recovery cadence.**  A post-quantum epoch advances after at
   most 64 established records or 10 minutes of Endpoint activity, whichever
   comes first.  An epoch transition is all-or-nothing: missing, duplicated,
   stale, or out-of-order KEM material rejects the transition and does not
   consume the next state.  No peer may force more than one pending epoch.
5. **Record protection and deletion.**  Established records use the same
   ChaCha20-Poly1305 and authenticated context shape as the baseline, with
   high-assurance domain separation.  At most 128 skipped keys and 256 replay
   entries are retained.  Old classical and PQ roots, decapsulation secrets,
   and consumed epoch material are erased before state commit.
6. **Fail-closed downgrade and validation.**  Profile declarations, transcript
   fields, signature set, KEM parameter, epoch counter, and cadence are
   authenticated together.  A high-assurance session cannot select baseline
   after a declaration mismatch; an endpoint that cannot satisfy this
   contract declines the session rather than downgrading.

### Normative High-Assurance Resource Contract

The high-assurance contract is independent of the baseline and cannot borrow
its bounds. The numbers are implementation-neutral protocol limits.

| Dimension | High-assurance bound |
| --- | --- |
| Handshake wire bytes | `MAX_HANDSHAKE_WIRE_BYTES = 65536` |
| Prekey declaration | `MAX_PREKEYS = 32`; `MAX_PREKEY_BUNDLE_BYTES = 32768` |
| Established-record overhead | `MAX_ESTABLISHED_RECORD_OVERHEAD_BYTES = 160` excluding first-transmission User Payload |
| PQ epoch cadence | ≤ 64 records or 600 seconds; ≤ 1 pending epoch |
| Skipped and replay state | `MAX_SKIPPED_MESSAGE_KEYS = 128`; `MAX_REPLAY_WINDOW = 256` |
| Control and evidence coupling | `MAX_CONTROL_RECORD_BYTES = 6144`; `MAX_EVIDENCE_STATEMENTS = 32`; `MAX_EVIDENCE_SIGNATURES = 4`; `MAX_EVIDENCE_CHECKPOINT_BYTES = 8192` |
| Persistent protocol state | ≤ 8 MiB per peer, including three chains and pending evidence |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Unauthenticated work | ≤ 64 KiB parse, ≤ 128 signature/hash operations, and ≤ 32 KEM candidates before Endpoint authentication |

## Necessity and alternatives

The final vision includes a stronger option for peers that require continuous
post-quantum recovery after a session is established.  Omitting it leaves
those peers with only periodic baseline recovery.  The no-high-assurance
alternative, ML-KEM-only state, periodic-but-not-continuous PQ updates,
unbounded KEM cadence, baseline fallback, and a component-wise negotiation
were rejected because they either weaken recovery, permit downgrade, or make
attacker-triggered work unbounded.  A different composition requires a new
lineage and successor decision.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | Prototype closes the three-chain order, KEM cadence, transcript, and all-or-nothing epoch transition; it is not a completed profile or security proof. |
| Known attacks and limitations | The named attacks, misuse conditions, and residual assumptions constrain downstream implementations without becoming LicoArc delivery gates. |
| Misuse and failure behavior | Missing, duplicate, malformed, stale, or wrong-parameter epoch material fails closed and allocates no unbounded state. |
| Side channels and secret handling | Downstream implementations own provider behavior, secret erasure, runtime memory, and side-channel controls. |
| Interoperability | One exact implementation-neutral Prototype and source-derived vector map are closed. |
| CPU work by operation | The normative operation envelope is frozen. |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Persistent protocol state | Three roots, epoch receipts, skipped keys, replay entries, and pending checkpoint joins are bounded above. |
| Energy by operation and transition | Downstream-owned; no runtime measurement is part of this definition. |
| Capability and handshake wire bytes | Larger KEM and signature encodings fit only the high-assurance handshake bound. |
| Established-record and control wire bytes | Record, control, and checkpoint maxima and Candidate wire schemas are closed. |
| Work and allocation before peer authentication | KEM candidates and parser bytes are bounded. |
| Agility, downgrade, replacement, and retirement | One high-assurance identifier binds all three chains and parameters; semantic change requires a new profile and successor decision. |

## Source-derived conformance material

Official FIPS 203/204 and RFC vectors are consumed for every primitive.  The
LicoArc vector map adds positive, negative, boundary, and adversarial cases for
dual-chain initialization, Triple-Ratchet progression, missing or duplicate
PQ epochs, cadence limits, high-to-baseline downgrade, rollback, KEM failure,
signature-purpose mismatch, skipped-key exhaustion, and maximum checkpoint
batches.  Expected output and failure classes derive from this Prototype, not
from a Provider implementation.

## Decision outcome

`OPEN → READY → DECIDED` was closed in this bounded change.  The explicit
decision adopts this indivisible high-assurance composition and its separate
resource contract as durable intent.  The exact Candidate Profile, identifier,
wire schemas, CDDL, transcript, state, failure, vector, and resource contracts
are now closed in [`spec/v1/protection/`](../../spec/v1/protection/) and
[`conformance/v1/protection/`](../../conformance/v1/protection/) without weakening the three-chain, ML-KEM-1024,
ML-DSA-87, or fail-closed downgrade requirements.

## Definition evidence

The definition status is `SPECIFIED`. The implementation-neutral Prototype, parameters, failure behavior, resource bounds, and source-derived conformance material are closed by the linked normative authorities.

## Comparative evidence, never authority

The named external lineage is bounded comparative context only. It cannot
define LicoArc wire, state, trust, or provider semantics.
