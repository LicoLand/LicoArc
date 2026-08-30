# Algorithm Decision: Core v1 Hybrid AKE

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-core-v1-hybrid-ake` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Final Protocol Vision](../../PRODUCT.md#final-protocol-vision) and [Pairwise Protection architecture](../../ARCHITECTURE.md#3-pairwise-protection) |
| Authority targets | `spec/v1/protection/`, `spec/v1/protection/registry.json`, `spec/FIELD-REGISTRY.md`, `formal/`, `conformance/v1/protection/`, `spec/v1/manifest.json`, and `spec/protocol-lines.json` |
| Predecessor or successor | Supersedes the ratchet-establishment scope of `ALG-baseline-pairwise-protection-suite`; the retired high-assurance construction has no active successor. |

## Question and scope

Which exact implementation-neutral Hybrid AKE construction closes Core v1
asynchronous establishment, dual Endpoint authentication, downgrade binding,
paired prekey redemption, key confirmation, failure behavior, and the
associated proof obligations? The decision covers primitive selection and
shapes, the hybrid combiner, domain separation, transcript inputs, prekey
roles and one-time consumption, atomic state transitions, and the boundary
between establishment and the classic Double Ratchet. It does not add a wire
field, select a Provider, or authorize a reduced-security fallback.

## Primary lineage and Algorithm Prototype

The selected construction is the LicoArc `stable-core` composition with
`paired-one-time` prekeys. RFC-7748, RFC-8032, RFC-8439, RFC-5869, FIPS 203,
and FIPS 204 provide comparative primitive lineage and vector conventions;
they do not define LicoArc roles, fields, transcript, state, or trust.

The closed LicoArc Algorithm Prototype is:

1. **Primitive suite.** Raw X25519 supplies 32-byte private keys, public keys,
   and shared secrets. ML-KEM-768 supplies a 64-byte `dkSeed`, 1,184-byte
   encapsulation key, 1,088-byte ciphertext, and 32-byte shared secret. Plain
   Ed25519 supplies a 32-byte seed, 32-byte public key, and 64-byte signature.
   ML-DSA-65 supplies a 32-byte seed, 1,952-byte public key, and 3,309-byte
   signature. These names are final-standard names: Kyber, Dilithium, DHKEM,
   Ed25519ctx, and Ed25519ph are not aliases for this Profile.
2. **Authenticated pairing.** Every asynchronous establishment uses one
   responder-issued pair containing one X25519 and one ML-KEM-768 one-time
   prekey. The bundle binds the exact Protocol Line and Protection Profile
   content identities, responder identity state, both identity signing-key
   references, one globally monotonic pair sequence, public material, validity
   and both signatures. A sequence at or below the persistent high-water mark
   cannot be reused; the active-pair map is bounded. Publication or receipt
   never reserves a pair and no expiry creates a second redemption state.
3. **Hybrid combiner.** The initiator contributes a fresh X25519 ephemeral and
   ML-KEM ciphertext. The responder rejects an all-zero X25519 result and uses
   ML-KEM implicit rejection. HKDF-SHA-256 receives the shared secrets in the
   fixed order `X25519 || ML-KEM-768`; its extract salt is a
   domain-separated digest of the prekey transcript. Every extract/expand,
   role, context, and confirmation input uses a distinct NUL-terminated ASCII
   domain; labels are Protocol-Line constants and never caller-selected.
4. **Authentication and confirmation.** Ed25519 and ML-DSA-65 authenticate
   the canonical handshake inputs. The transcript binds both complete
   Endpoint support statements and minimum-generation floors, the exact line
   and Profile identities, identity-continuity state, role and purpose,
   selected paired prekeys, all public values, the first ciphertext, and both
   signatures. The initiator's first authenticated ciphertext carries the
   mandatory encrypted client-confirm value. The responder's SessionAccept is
   authenticated by a full 32-byte HMAC-SHA-256 over its canonical,
   transcript-bound context.
5. **Atomic paired redemption.** The responder validates the complete input
   against tentative state, then atomically compare-and-commits the session,
   redeems both one-time prekeys, removes their active entries, and records
   their non-reusable sequence state. A conflicting concurrent commit returns
   the typed consumed failure. An exact replay returns the identical committed
   SessionAccept. No component fallback, inventory substitution, translation,
   or reduced-security retry exists.
6. **Failure and security boundary.** Invalid encoding, lengths, signatures,
   line/Profile identity, transcript, validity, public material, key result,
   confirmation, replay, or resource bound returns one typed terminal
   handshake failure without revealing which primitive failed and without
   mutating prior state. Continuous post-quantum post-compromise recovery is
   a future independent Profile and is not a Core v1 claim.

### Frozen primitive and framing constraints

| Primitive or value | Core v1 constraint |
| --- | --- |
| HKDF | HKDF-SHA-256 with fixed Protocol-Line domains and role-separated labels |
| Confirmation | HMAC-SHA-256, full 32-byte output; no truncation |
| Record AEAD | ChaCha20-Poly1305 with 32-byte key, 12-byte nonce, and 16-byte tag; no XChaCha variant |
| Ciphertext framing | Canonical header, ciphertext, then its 16-byte tag |
| Signature validation | Strict Ed25519 verification and exact ML-DSA-65 profile/length checks |
| KEM/DH validation | ML-KEM implicit rejection and X25519 all-zero rejection |

## Necessity and alternatives

Offline establishment requires one exact hybrid construction whose security
inputs cannot be selected by a Station, Provider, or component-wise
negotiation. A classical-only, ML-KEM-only, reusable-component, or
implementation-selected construction omits a required security property or
permits downgrade. The selected `paired-one-time` rule accepts inventory
exhaustion as a terminal failure in exchange for the strongest initial
forward-secrecy boundary; `pq-one-time` with a reusable classical prekey is
rejected for this Profile. The `stable-core` choice deliberately uses a
classic X25519 Double Ratchet. Triple Ratchet, ML-KEM Braid, and ongoing PQ
post-compromise recovery require a separately decided and identified Profile.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | The Prototype fixes primitive names, byte shapes, order, transcript inputs, confirmation, paired redemption, and fail-closed behavior. Formal claims remain separately bound and may not be inferred from lineage. |
| Known attacks and limitations | Downgrade, unknown-key-share, reflection, prekey substitution, replay, concurrent redemption, rollback, and compromise cases are explicit validation/proof inputs. Ongoing PQ recovery is a nonclaim. |
| Misuse and failure behavior | Invalid or over-bound inputs return a typed terminal result and preserve the prior state; primitive-specific failure detail is not disclosed. |
| Side channels and secret handling | Endpoint implementations own constant-time behavior, zeroization, provider isolation, and memory protection; no implementation claim is made here. |
| Interoperability | One canonical deterministic representation and one indivisible Profile composition are selected; Provider APIs and external wire conventions cannot alter them. |
| Normative CPU work bound by operation | Public-key, signature, KEM, and transcript work is bounded by the Profile handshake contract before state commit. |
| Normative memory and state bounds | Active pairs, sequence high-water state, tentative derivations, and committed session state are bounded by the Profile contract. |
| Persistent protocol state | Atomic session/prekey commit and monotonic pair sequence are required; lower-generation restoration fails closed. |
| Capability and handshake wire bytes | Exact standard primitive lengths, canonical CBOR, domain-separated inputs, and Profile maxima determine the handshake bound. |
| Established-record and control wire bytes | Established framing belongs to the selected classic Double Ratchet and its independent `FLD-ratchet-header` decision. |
| Work and allocation before peer authentication | Parsing, canonicalization, and candidate verification are bounded; attacker-controlled collections cannot allocate unbounded state. |
| Agility, downgrade, replacement, and retirement | The line/Profile content identities and transcript select one indivisible composition. Semantic change requires a new decision and new identity; fallback and identifier reuse are forbidden. |

## Source-derived conformance material

The decision fixes the future authority-vector classes: valid and malformed
prekey bundles; every exact public and signature length; all-zero X25519;
ML-KEM implicit rejection; wrong line/Profile, role, purpose, or identity
state; support and minimum-generation downgrade; transcript substitution;
missing, repeated, or wrong-purpose signatures; client-confirm and
SessionAccept mismatch; paired inventory exhaustion; concurrent redemption;
exact replay; sequence rollback; over-bound input; and no-mutation-on-failure.
Expected bytes and outcomes must be derived from this Prototype in
`conformance/v1/protection/`, never from a Provider or implementation.

## Decision outcome

`OPEN → READY → DECIDED` is closed in this bounded authority change. The
explicit outcome adopts the `stable-core` Hybrid AKE, final-standard
primitive set, `paired-one-time` redemption, full SessionAccept HMAC,
canonical transcript binding, no-fallback rule, and atomic failure boundary.
The joined `spec/v1/protection/` authority, formal bindings, conformance
vectors, Canonical Field Registry, and Candidate Protocol Line close the exact
bytes and states.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The machine-readable Profile, proof bindings, corpus, and aggregate line close
the selected algorithmic construction without making a downstream claim.

## Comparative evidence, never authority

RFC-7748, RFC-8032, RFC-8439, RFC-5869, FIPS 203, and FIPS 204 inform
primitive lineage and known risks only. They cannot define LicoArc fields,
roles, trust, transcript, state, or Protocol Line meaning.
