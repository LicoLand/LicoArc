# Pairwise Protection v1 — Core Semantic Definition

Pairwise Protection v1 defines one indivisible `stable-core` construction for
asynchronous Endpoint establishment and established records. Its exact machine
authority is [`spec/v1/protection/`](../../spec/v1/protection/). The Profile
semantic sources, content identity, proof admission, source-owned conformance
corpus, and aggregate Protocol Line admission are complete. The Profile and
enclosing line are active `Candidate` definitions with session eligibility;
neither is publication-eligible, and no implementation or interoperability
claim follows.

## Exact construction

The Profile combines raw X25519 and final ML-KEM-768 for establishment,
strict plain Ed25519 and final ML-DSA-65 for dual Endpoint authentication,
HKDF-SHA-256 for every extract and expansion, full 32-byte HMAC-SHA-256 for
SessionAccept, and IETF ChaCha20-Poly1305 for confirmation and records. It is
not an algorithm menu. Kyber, Dilithium, DHKEM, Ed25519ctx, Ed25519ph,
XChaCha20-Poly1305, classical-only and post-quantum-only modes are not aliases
or fallbacks.

The frozen raw shapes include ML-KEM-768 `dkSeed` 64, encapsulation key 1,184,
ciphertext 1,088 and shared secret 32 bytes; ML-DSA-65 seed 32, public key
1,952 and signature 3,309 bytes; X25519 keys/shared secret 32 bytes; Ed25519
seed/public key 32 and signature 64 bytes; and ChaCha20-Poly1305 key 32, nonce
12 and tag 16 bytes. X25519 all-zero results are rejected. ML-KEM uses its
final implicit-rejection behavior. Ed25519 verification is strict and
ML-DSA-65 profile and length checks are exact.

## Support, paired prekeys and transcript

Each Endpoint authenticates one bounded canonical support statement. Every
entry is the exact `(wireId, generation, protocolLineId)` tuple; `wireId` is a
source locator and `protocolLineId` is a 32-byte content identity. The
statement carries the Endpoint's persistent monotonic minimum-generation
floor. Selection validates exact known content identity, complete definition,
new-session policy, session eligibility, both floors, mandatory capability
closure and complete Profile membership, in that order, then selects the
unique highest common generation. Zero or ambiguous results fail without
fallback or state advance.

Every asynchronous establishment consumes one responder-issued pair: one raw
X25519 one-time prekey and one ML-KEM-768 one-time prekey under the same
globally monotonic sequence. The signed bundle binds line and Profile content
identities, responder identity-state digest, both signing-key references,
sequence, both public values and validity. Ed25519 and ML-DSA-65 signatures
must both verify. Missing either inventory component is terminal.

The responder persists one never-decreasing sequence high-water mark and a
map of at most 256 active complete pairs. A sequence at or below the high-water
mark and absent from that map is permanently unavailable, so non-reuse does
not require an unbounded tombstone collection. Publication, receipt and
validity expiry never reserve or redeem a pair. There is no reservation state.
Only the authenticated atomic session commit removes the complete pair.

The deterministic prekey transcript first binds both complete support
statements and floors plus the selected bundle. A non-circular handshake-core
projection then binds the selected line/Profile identities, both identity
states and initiator signing-key references, fixed roles and purpose,
initiator X25519 public key and ML-KEM ciphertext. The initiator signatures,
hybrid KDF and client confirmation bind that core digest. The final transcript
digest covers the complete first packet, including both initiator signatures
and the first confirmation ciphertext/tag, and is in turn bound by
SessionAccept. Every domain is an exact NUL-terminated ASCII constant from
`domains.json`; callers cannot choose or extend labels.

## Hybrid schedule and confirmation

The hybrid input key material is exactly `X25519 shared secret || ML-KEM-768
shared secret`. The HKDF extract salt is the SHA-256 digest of the fixed hybrid
salt domain and prekey-transcript digest. Role- and purpose-separated HKDF
expansions produce the hybrid root, fixed client-confirm key/nonce,
SessionAccept key, initial ratchet roots and opposite-direction chain keys.

The initiator's first packet contains a mandatory ChaCha20-Poly1305 encryption
of the exact fixed client-confirm domain bytes, with the non-circular
handshake-core digest as associated data. The responder validates all input against tentative
state, then atomically commits the session, complete paired redemption,
monotonic state generation and one exact SessionAccept. SessionAccept binds
the transcript, committed session context, responder identity and pair
sequence under an untruncated 32-byte HMAC-SHA-256.

A concurrent losing redemption returns `prekey-consumed`. Each live session
retains one bounded binding from pair sequence and exact first-packet digest
to its committed SessionAccept. An exact replay returns those byte-identical
bytes without mutation; a changed packet for the consumed sequence fails.
Deletion removes the replay binding and subsequent replay remains consumed by
the persistent sequence high-water state. The
initiator durably commits the exact retryable first packet before its first or
retry emission and reaches `ESTABLISHED` only after validating SessionAccept.

## Classic Double Ratchet

The handshake transfers the initiator ephemeral and redeemed responder
X25519 pair into a classic X25519 Double Ratchet. Role-separated HKDF domains
derive root, sending and receiving chains. Each chain step derives exactly one
32-byte ChaCha20-Poly1305 key, one 12-byte nonce and the next chain key.

The plaintext ratchet header is deterministic CBOR `{0: DH, 1: PN, 2: N}`:
raw 32-byte current X25519 ratchet public key, previous sending-chain length
and current message number. Associated data is the exact record-AAD domain,
the 32-byte session-context digest and the complete canonical header. The
frame is canonical header bytes, ciphertext, then its 16-byte tag. Header
confidentiality is not claimed.

Skipped keys use a bounded hash map keyed by `(ratchet-public-key,
message-number)` for expected O(1) lookup. One record can derive at most 256
skipped keys and the session retains at most 1,024. Consumed, duplicate, stale,
over-bound or uint32-overflow coordinates fail without mutation. A new
authenticated DH key performs the fixed root/chain transition; invalid or
all-zero DH results fail against tentative state.

## Atomic persistence, rollback and deletion

Send derives into tentative state, then atomically persists the advanced chain,
counters, monotonic state generation and exact retryable packet before any
emission. Retry emits only that stored packet and never advances a chain.
Receive parses, derives and authenticates against a tentative snapshot, then
atomically persists ratchet advance, skipped-key delta, replay state, durable
inbox record and state generation before releasing plaintext. Authentication,
bound, conflict or persistence failure leaves the prior state unchanged and
emits/releases nothing.

Restart restores the last complete committed monotonic snapshot before any
operation. Restoring below the committed generation returns `state-rollback`
with no packet or plaintext. Deletion atomically advances the state to
`DELETED` and removes root, chain, message, skipped, prekey and retry material
from reachable protocol state. Physical zeroization, rollback detection under
a fully compromised store and memory-side-channel resistance remain Provider
and proof assumptions rather than wire claims.

## Failure and resource boundary

Schemas, compact labels, primitive sizes, KDFs, projections, validation order,
bounds, typed failures and state transitions are closed in the protection
source root. Invalid encodings, unknown fields, wrong lengths, identity or
signature failure, downgrade, unavailable/consumed prekeys, confirmation or
AEAD failure, replay, stale ratchets, skip exhaustion, overflow, conflict,
persistence failure, rollback and deletion return only the defined typed
class. Handshake rejection never reveals which primitive failed.

The source-owned conformance corpus covers exact primitive shapes and hybrid
outputs, canonical header bytes, all-zero rejection, high-water non-reuse, no
reservation, concurrent redemption, exact replay, durable retry, full MAC,
tentative receive, skip/counter bounds, rollback and deletion. They contain
only synthetic authority input and no operational private keys or runtime
data. Proof bindings and corpus cases are bound to the same source-owned
semantics and cannot change their protocol meaning.

Ongoing post-quantum post-compromise recovery, Triple Ratchet and ML-KEM Braid
remain future independent Profile scope. Pairwise Protection provides content
confidentiality/authentication and bounded replay protection; it does not
provide anonymity, transferable evidence, Station trust or application-effect
completion.
