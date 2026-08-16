# Algorithm Decision: Baseline Pairwise Protection Suite

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-baseline-pairwise-protection-suite` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Complete protection suites](../../PRODUCT.md#complete-protection-suites) and [Pairwise Protection architecture](../../ARCHITECTURE.md#3-pairwise-protection) |
| Authority targets | `PRODUCT.md`, `ARCHITECTURE.md`, `spec/v1/protection`, `conformance/v1/protection`, and the Protocol Line manifest |
| Predecessor or successor | None |

## Question and scope

Which one indivisible baseline Protection Profile gives two Endpoints
asynchronous authenticated establishment, bounded forward key evolution,
protected sender metadata, replay and downgrade rejection, and a portable
mobile resource envelope?  The decision covers the complete algorithmic
composition and its parameter and failure contract.  It does not add a wire
field, define local trust, choose a transport, or authorize an implementation.

## Primary lineage and Algorithm Prototype

The immutable lineage is `RFC-7748`, `RFC-8032`, `RFC-5869`, `RFC-8439`,
`NIST-203`, `NIST-204`, `SIG-PQXDH-R3`, and `SIG-DR-R4`. The
Signal publications provide asynchronous-prekey and ratchet threat evidence;
the RFC and NIST sources provide primitive definitions and official vectors.
No upstream wire, service role, identity model, or Provider API is inherited.

The closed LicoArc Algorithm Prototype is:

1. **Establishment.**  Each Endpoint publishes one Ed25519 identity key, one
   Ed25519-signed X25519 prekey, and at most 64 one-time X25519 prekeys.  A
   handshake consumes at most one one-time prekey.  The initiator contributes
   one fresh X25519 ephemeral key and one deterministic-test-controlled
   ML-KEM-768 encapsulation; the responder decapsulates both.  The two shared
   secrets are concatenated in the order `X25519 || ML-KEM-768`.
2. **Transcript and authentication.**  The transcript is the deterministic
   encoding of `LP-BASE-TRANSCRIPT\0`, Protocol Line, profile, handshake
   purpose, Endpoint references, both signed declarations, prekey identifiers,
   X25519 public keys, ML-KEM public key/ciphertext, and role bytes.  Ed25519
   authenticates the transcript, and ML-DSA-65 authenticates the same transcript
   with the explicit context `LicoArc-Base-Identity`.  Missing, duplicated, or
   unexpected signature material rejects the handshake.
3. **Root and chain derivation.**  `HKDF-Extract(SHA-256, salt=0^32,
   IKM=X25519 || ML-KEM-768 || transcriptDigest)` creates the root secret.
   `HKDF-Expand` labels are length-prefixed UTF-8 values
   `LicoArc/Base/Root`, `LicoArc/Base/Send`, and `LicoArc/Base/Receive`; no
   label is caller-controlled.  A direction-specific chain advances by one
   counter per protected record and derives a 32-byte message key and 12-byte
   ChaCha20-Poly1305 nonce from `(chainSecret, counter, direction)`.
4. **Record protection and sender metadata.**  The message key uses
   ChaCha20-Poly1305 with authenticated context containing the locked line,
   profile, session, direction, counter, and canonical record header.  Sender
   identity is carried only in an encrypted authenticated inner projection;
   the outer carriage has no sender identity.  There is no discretionary
   padding, artificial delay, or synthetic traffic.
5. **Ratchet and deletion.**  A received valid record advances only its
   direction chain.  At most 256 skipped message keys and a 512-entry replay
   window are retained.  Consumed message keys, one-time prekeys, and replaced
   root material are erased before the transition is committed.  A counter
   wrap, reset without a new authenticated handshake, or stale epoch fails
   closed.
6. **Validation.**  Decoders reject non-canonical encodings, unknown critical
   values, duplicate prekey identifiers, all-zero X25519 output, invalid ML-KEM
   lengths or normalization, invalid Ed25519/ML-DSA signatures, wrong profile
   or line, replayed counters, and any input beyond the contract below.  No
   rejected input allocates state proportional to an attacker-selected value.

### Normative Resource Contract

These are implementation-neutral Protocol-Line resource and wire bounds.

| Dimension | Baseline bound |
| --- | --- |
| Handshake wire bytes | `MAX_HANDSHAKE_WIRE_BYTES = 32768` |
| Prekey declaration | `MAX_PREKEYS = 64`; `MAX_PREKEY_BUNDLE_BYTES = 16384` |
| Established-record overhead | `MAX_ESTABLISHED_RECORD_OVERHEAD_BYTES = 128` excluding first-transmission User Payload |
| Skipped and replay state | `MAX_SKIPPED_MESSAGE_KEYS = 256`; `MAX_REPLAY_WINDOW = 512` |
| Control and evidence coupling | `MAX_CONTROL_RECORD_BYTES = 4096`; `MAX_EVIDENCE_STATEMENTS = 32`; `MAX_EVIDENCE_SIGNATURES = 4`; `MAX_EVIDENCE_CHECKPOINT_BYTES = 8192` |
| Persistent protocol state | ≤ 2 MiB per peer, including ratchet, replay, prekey tombstones, and pending evidence |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Unauthenticated work | ≤ 32 KiB parse, ≤ 64 signature/hash operations, and ≤ 64 prekey candidates before Endpoint authentication |

## Necessity and alternatives

The final vision requires a protected channel that can start when one Endpoint
is offline, evolve keys after compromise, and prevent a Station from learning
sender identity.  Omitting a complete profile leaves those actions without a
portable common contract.  The no-algorithm alternative, classical-only
prekeys, ML-KEM-only establishment, a component-wise negotiation, and an
unbounded ratchet window were rejected because they either omit the required
hybrid or replay properties, permit downgrade, or violate the resource and
state bounds.  A different complete composition requires a successor
decision, not a local Provider substitution.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | The Prototype fixes primitive order, transcript, KDF, nonce, ratchet, and rejection behavior; the linked formal sources close the profile definition without making an implementation claim. |
| Known attacks and limitations | The named attacks, misuse conditions, and residual assumptions constrain downstream implementations without becoming LicoArc delivery gates. |
| Misuse and failure behavior | Invalid lengths, keys, signatures, profile, counter, and state fail closed without state advance. |
| Side channels and secret handling | Downstream implementations own provider behavior, secret erasure, runtime memory, and side-channel controls. |
| Interoperability | One exact implementation-neutral Prototype and source-derived vector map are closed. |
| CPU work by operation | The normative operation envelope is frozen. |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Persistent protocol state | Prekey, root, chain, skipped-key, replay, and tombstone bounds are fixed. |
| Energy by operation and transition | Downstream-owned; no runtime measurement is part of this definition. |
| Capability and handshake wire bytes | Prekey and handshake maxima, capability schema, and profile identifier are closed in the Candidate source. |
| Established-record and control wire bytes | Record overhead and control/evidence maxima and wire schemas are closed in the Candidate source. |
| Work and allocation before peer authentication | Parser work is bounded by the contract. |
| Agility, downgrade, replacement, and retirement | Whole-profile selection is transcript-locked; any semantic change requires a successor Algorithm Decision and new profile identity. |

## Source-derived conformance material

Official RFC 7748, RFC 8032, RFC 5869, RFC 8439, FIPS 203, and FIPS 204
vectors are consumed exactly as defined by their sources.  LicoArc vectors in
`source-vectors.md` cover:

- positive establishment, deterministic KDF, record protection, ratchet
  advance, and valid signature cases;
- negative malformed keys, wrong context, invalid signatures, wrong profile,
  all-zero X25519 output, replay, duplicate prekey, and counter-wrap cases;
- boundary maximum prekeys, handshake bytes, skipped keys, replay window,
  evidence statements, signatures, and control bytes; and
- adversarial downgrade, transcript substitution, key-compromise recovery,
  state rollback, parser resource exhaustion, and sender-metadata correlation.

Each expected byte or result class is derived from the Prototype, not from a
Provider output. The deterministic definition-level vector corpus is closed in
`conformance/v1/protection`.

## Decision outcome

`OPEN → READY → DECIDED` was closed in this bounded change.  The question,
omission alternative, exact Prototype, vector origin, resource contract,
acceptance/rejection criteria, and residual risks are
recorded above.  The explicit decision is to adopt this complete baseline
composition as durable LicoArc intent.  The exact Candidate Profile,
identifier, schemas, CDDL, corpus manifest, state and failure policy, and
resource contract are now closed in [`spec/v1/protection/`](../../spec/v1/protection/)
and [`conformance/v1/protection/`](../../conformance/v1/protection/); they do
not change this Prototype.

## Definition evidence

The definition status is `SPECIFIED`. The implementation-neutral Prototype, parameters, failure behavior, resource bounds, and source-derived conformance material are closed by the linked normative authorities.

## Comparative evidence, never authority

The named standards and publications establish comparative lineage,
primitive behavior, and known risks only. They cannot redefine a LicoArc
field, state transition, trust decision, or wire result.
