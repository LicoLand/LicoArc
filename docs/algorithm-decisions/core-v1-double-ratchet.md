# Algorithm Decision: Core v1 Double Ratchet

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-core-v1-double-ratchet` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Pairwise Protection architecture](../../ARCHITECTURE.md#3-pairwise-protection) and the Core v1 Hybrid AKE decision |
| Authority targets | `spec/v1/protection/`, `spec/FIELD-REGISTRY.md`, `formal/`, `conformance/v1/protection/`, `spec/v1/manifest.json`, and `spec/protocol-lines.json` |
| Predecessor or successor | Supersedes the counter-only ratchet scope of `ALG-baseline-pairwise-protection-suite`; a future PQ ratchet requires a new successor decision and Profile identity. |

## Question and scope

Which exact implementation-neutral Double Ratchet construction closes Core v1
initialization from the hybrid handshake, DH transitions, root/send/receive
KDFs, authenticated header, message-key and nonce derivation, skipped-key and
replay state, rollback/restart behavior, deletion transitions, resource
bounds, and compromise claims? The decision does not add a common field,
select a Provider, or claim ongoing post-quantum recovery.

## Primary lineage and Algorithm Prototype

The selected construction is the classic X25519 Double Ratchet initialized by
the approved hybrid AKE. Double Ratchet lineage and HKDF/AEAD standards are
comparative evidence; this record is the LicoArc authority for the exact
composition, state boundary, and failure semantics.

The closed LicoArc Algorithm Prototype is:

1. **Initialization.** The initiator ephemeral X25519 public key and the
   responder's redeemed X25519 one-time prekey are transferred into committed
   session state with the hybrid root. HKDF-SHA-256 derives a root secret and
   role-separated sending and receiving chains. The two peers derive opposite
   directions from the same authenticated context; no counter-only or
   implementation-selected initialization is valid.
2. **Message keys and framing.** Each chain step derives exactly one 32-byte
   ChaCha20-Poly1305 key and one 12-byte nonce. A protected record is the
   canonical plaintext ratchet header followed by ciphertext and its 16-byte
   tag. The header carries the authenticated DH ratchet public key, previous
   sending-chain length (`PN`), and message number (`N`). Its associated data
   is the session-context digest concatenated with the complete canonical
   header. Header confidentiality is not claimed.
3. **DH ratchet.** A newly authenticated peer DH public key advances the root
   and resets the applicable sending/receiving chain according to the fixed
   role-separated KDF domains. A stale key, invalid key, missing predecessor,
   counter wrap, or over-bound transition fails without state mutation.
4. **Skipped and replay state.** Before a DH transition, skipped keys are
   derived only up to the immutable skip bound. They are indexed by the tuple
   `(ratchet-public-key, message-number)` in a bounded hash map for O(1)
   lookup. A consumed key is removed; a duplicate, stale, or over-bound
   message fails closed and cannot allocate an unbounded history.
5. **Atomic send and receive.** Send durably commits the advanced chain and
   exact retryable packet before emission. Receive authenticates against a
   tentative snapshot, then atomically commits ratchet advance, skipped-key
   changes, replay state, and durable inbox state before releasing plaintext.
   An authentication, parse, bound, or persistence failure returns the
   unchanged pre-state.
6. **Restart, rollback, and deletion.** Restart restores the last committed
   monotonic state version. A lower restored generation returns typed
   `state-rollback` and emits neither packet nor plaintext. Deletion makes
   prior keys and prekey use unreachable after the specified transition;
   physical zeroization and resistance to a fully compromised store remain
   explicit provider/proof assumptions, not wire claims.

### Frozen ratchet constraints

| Area | Core v1 constraint |
| --- | --- |
| Ratchet primitive | Classic raw X25519 DH ratchet; no Triple Ratchet, ML-KEM Braid, or component fallback |
| KDF | HKDF-SHA-256 with fixed NUL-terminated ASCII domains and role-separated labels |
| Header | Plaintext but authenticated DH public key, `PN`, and `N`; canonical deterministic representation |
| Record | Header, ciphertext, then 16-byte ChaCha20-Poly1305 tag |
| Associated data | Session-context digest plus the complete canonical header |
| Message key | One 32-byte AEAD key and one 12-byte nonce per chain step |
| Lookup | Bounded map keyed by `(ratchet-public-key, message-number)`; no linear unbounded scan |
| Mutation | Authenticate and validate against tentative state; commit once, then deliver plaintext |
| Future security | Ongoing post-quantum post-compromise recovery is an explicit nonclaim and future Profile scope |

## Necessity and alternatives

An epoch, direction, and counter cannot represent a DH ratchet transition and
does not provide the required asynchronous out-of-order and replay semantics.
The selected classic construction supplies forward key evolution and classic
post-compromise recovery within a bounded state contract. A counter-only
frame, implementation-local ratchet, unbounded skipped-key list, or custom
post-quantum chain without an independent proof is rejected. A future
post-quantum ratchet must be a separately decided complete Profile and cannot
be silently negotiated or used as fallback.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | Initialization, DH transitions, KDF order, framing, skipped-key indexing, replay, persistence, and deletion are fixed; formal claims remain separately bound. |
| Known attacks and limitations | Replays, stale DH keys, skipped-key exhaustion, counter overflow, rollback, compromised state, and plaintext header metadata are explicit cases; header confidentiality and ongoing PQ recovery are nonclaims. |
| Misuse and failure behavior | Invalid, unauthenticated, stale, duplicate, over-bound, or persistence-failing inputs preserve the prior state and return typed failure. |
| Side channels and secret handling | Endpoint implementations own constant-time DH/AEAD, key erasure, memory protection, and provider behavior. |
| Interoperability | One classic X25519 construction and one canonical header/framing rule are selected; generic counters or Provider conventions cannot substitute. |
| Normative CPU work bound by operation | Chain, DH, skipped-key, and AEAD work is capped by the exact Profile operation bounds. |
| Normative memory and state bounds | Skipped keys, replay state, chain state, durable inbox, and retry packet are bounded and non-refreshable by a Station. |
| Persistent protocol state | Atomic monotonic snapshots are required; restoration below the committed generation fails closed. |
| Capability and handshake wire bytes | Initialization inherits the hybrid AKE and does not add a second ratchet negotiation surface. |
| Established-record and control wire bytes | Header, ciphertext, tag, associated data, and bounded control records are fixed by the selected Profile. |
| Work and allocation before peer authentication | Header parsing and candidate skipping are bounded before AEAD authentication; no attacker-sized map is admitted. |
| Agility, downgrade, replacement, and retirement | The Profile selects the whole ratchet. A semantic replacement requires a new decision, Profile identity, and authenticated complete line; no fallback or translation is allowed. |

## Source-derived conformance material

The decision fixes the future authority-vector classes: valid initialization;
opposite role chains; deterministic root/chain/message/nonce derivation;
canonical header and record framing; wrong session context; invalid/all-zero
DH; first-message, DH-transition, skipped, out-of-order, duplicate, stale,
counter-overflow, and over-bound inputs; atomic send/receive retry;
concurrent commit; restart; lower-generation rollback; deletion; and
no-mutation-on-failure. Expected values derive from this Prototype in
`conformance/v1/protection/`, never from an implementation.

## Decision outcome

`OPEN → READY → DECIDED` is closed in this bounded authority change. The
explicit outcome adopts the classic X25519 Double Ratchet, canonical
authenticated plaintext `DH/PN/N` header, ChaCha20-Poly1305 record framing,
bounded tuple-indexed skipped-key state, atomic persistence, and the explicit
nonclaim boundary. The joined Profile, formal, conformance, registry, and
Candidate Protocol Line authorities close the definition.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The exact schemas, labels, bounds, vectors, formal bindings, and aggregate
line admission close the selected construction.

## Comparative evidence, never authority

RFC-7748, RFC-5869, RFC-8439, and published Double Ratchet lineage inform
primitive behavior and known risks only. They cannot define LicoArc fields,
state, trust, or Protocol Line meaning.
