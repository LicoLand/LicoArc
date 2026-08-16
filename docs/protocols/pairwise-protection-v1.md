# Pairwise Protection v1

This document projects the machine-readable Candidate contract in
[`spec/v1/protection/`](../../spec/v1/protection/) and its executable corpus in
[`conformance/v1/protection/`](../../conformance/v1/protection/). The schemas,
registries, CDDL, bounds, and corpus are the normative sources; this document
does not add a second wire authority.

## Lifecycle and scope

`licoarc.pairwise-protection.v1` is a Candidate capability on Protocol Line
`licoarc.v1`. It defines only Endpoint-to-Endpoint protection. Endpoint secret
custody, entropy, local trust, Provider selection, transport, implementation,
and every delivery result remain downstream-owned.

The registry admits exactly two complete, indivisible Profiles:

| Profile | Profile identifier | Strength | Decided Prototype |
| --- | --- | ---: | --- |
| baseline | `d9e09414257925eed013b7add0672277fb9f91dd34c2c4e1ee985d0b5b17a7d6` | 1 | [`ALG-baseline-pairwise-protection-suite`](../algorithm-decisions/baseline-pairwise-protection-suite.md) |
| high-assurance | `cbc5bc838141a34aa0dd1b300022de6212f47540f95f9d7958cb1f2dcf74e42e` | 2 | [`ALG-high-assurance-pairwise-protection-suite`](../algorithm-decisions/high-assurance-pairwise-protection-suite.md) |

Each identifier is the SHA-256 digest of the UTF-8 bytes of
`LicoArc/Protection/Profile/v1/<profileName>` followed by one NUL byte. An
implementation cannot mint an identifier or negotiate individual KEM,
signature, AEAD, KDF, ratchet, sender-metadata, framing, or transport fields.
The profile registry contains no Provider, language, library, or API value.

## Capability negotiation

An Endpoint signs one bounded, expiring capability declaration containing its
Protocol Line digest, Endpoint identity reference, a unique list of complete
Profile identifiers, a minimum-safe Profile, an epoch, validity interval, and
one Ed25519 capability-declaration signature. Declarations use the closed
`capability.schema.json` projection and the compact runtime labels in
`labels.json`.

Selection is deterministic:

1. validate both declarations, signatures, validity, line, and profile
   lifecycle;
2. intersect the two complete Profile sets;
3. remove profiles below either Endpoint's minimum-safe Profile;
4. choose the highest `strengthRank` (then the lower identifier byte order); and
5. fail terminally when no common Profile remains.

The selected Profile is not a fallback. A high-assurance minimum cannot be
silently reduced to baseline, and an unknown or retired identifier is rejected.
Station, transport, application, and cryptographic Provider inputs have no
selection authority.

## Establishment transcript

The authenticated handshake carries `protocolLineId`, the selected
`protectionProfileId`, both capability declarations and their digests, both
Endpoint identity references, purpose, explicit initiator/responder roles,
the responder signed-prekey and optional one-time-prekey identifiers, fresh
X25519 material, the responder's signed prekey bundle (Ed25519 identity key,
Profile-specific post-quantum identity key, signed X25519 prekey, bounded
one-time X25519 prekeys, and ML-KEM public key), Profile-sized ML-KEM material,
a transcript digest, and the exact Profile signature set. The transcript is deterministic CBOR over the
ordered fields declared by the Profile, beginning with its fixed domain string.

The baseline transcript uses `LP-BASE-TRANSCRIPT\0`, X25519 plus ML-KEM-768,
Ed25519 plus ML-DSA-65, and `LicoArc-Base-Identity` contexts. The
high-assurance transcript uses `LP-HIGH-TRANSCRIPT\0`, X25519 plus ML-KEM-1024,
Ed25519 plus ML-DSA-87, and the `LicoArc-High-Identity` and
`LicoArc-High-Transcript` contexts. Shared-secret order is always
`X25519 || ML-KEM`; missing, duplicate, unexpected, malformed, or invalid
signature material fails closed.

After both Endpoints commit the authenticated transcript, the line, Profile,
capability digests, identities, roles, purpose, and transcript digest become
an immutable session lock. Established records inherit those values. Repeating
or changing one in an established record is forbidden and is a terminal
session-context failure.

## Key schedule and records

Both Profiles use HKDF-SHA-256 with a zero 32-octet salt, the ordered hybrid
secrets, and the transcript digest. Fixed, Profile-owned labels derive root,
direction-chain, 32-octet message-key, and 12-octet nonce material. Records use
ChaCha20-Poly1305. The nonce is derived from the chain, direction, epoch, and
counter; it is not a wire field. Associated data covers the locked line,
Profile, session, epoch, direction, counter, and canonical record header.
The high-assurance root transition is exactly
`HKDF-Extract(SHA-256, zero-salt-32-octets, classicalChain || x25519Secret ||
pqChain || transcriptDigest)`; the baseline replaces its root only after the
authenticated Double-Ratchet transition has derived and deleted the prior
material.

The outer established record contains only `recordType`, `sessionId`, `epoch`,
`direction`, `counter`, and ciphertext. Sender identity and the exact User
Payload are an encrypted authenticated inner projection. There is no outer
sender identity, per-record Profile/capability/Endpoint field, discretionary
padding, artificial delay, or synthetic traffic.

The baseline is a two-direction Double Ratchet. The high-assurance Profile is
a Triple Ratchet with classical symmetric, classical X25519 rekey, and
post-quantum ML-KEM Braid chains. A valid record advances only its direction
chain after authentication; consumed keys and replaced roots are erased before
the state commit. Baseline retains at most 256 skipped keys and a 512-entry
replay window. High assurance retains at most 128 skipped keys and 256 replay
entries.

Counters cannot wrap. A forward record may derive only the bounded number of
skipped keys; an out-of-window record is rejected without state advance.
Duplicates and replayed counters are rejected. Restart restores the persisted
session lock and high-water state before accepting input; expiry, reconnect,
Route changes, and Station migration cannot reset a ratchet or replay bound.
A reset or rekey requires a new authenticated handshake.

High assurance advances a post-quantum epoch after at most 64 records or 600
seconds of Endpoint activity, whichever comes first. One pending epoch is
allowed. The next epoch must be exactly current plus one and carries one
X25519 rekey public key and one ML-KEM-1024 ciphertext. Missing, duplicate,
stale, malformed, or out-of-order material leaves all three chains unchanged.

## Failure and retirement

The closed failure policy distinguishes unknown or retired Profile, no common
Profile, capability and transcript mismatch, invalid signatures or KEM,
non-canonical input, bounds, replay, counter, skipped-key, epoch, stable-field,
reset, and terminal-session failures. Every rejection is atomic: it does not
advance a counter, replay window, skipped-key store, epoch, one-time-prekey
tombstone, or root. Terminal sessions accept no later record or reset.

Retirement rejects new establishment under the retired identifier, terminates
an active session when retirement is observed, and requires a new authenticated
handshake under a current Profile. No translation or compatibility fork remains.

## Normative resource contract

The two Profiles have independent numeric envelopes in
`resource-contract.json`: handshake and prekey bytes, record overhead, control
and evidence coupling, persistent state, heap and stack, unauthenticated parse
and cryptographic work, CPU p95/p99 targets, and energy targets. No
discretionary traffic-shaping bytes are admitted; residual length, timing,
frequency, route, and correlation leakage remains explicitly documented.

The contract contains protocol-level bounds only. Runtime benchmarks, device
admission, executable interoperability, and audits belong to downstream
implementations and are not represented in LicoArc sources.

## Conformance

`conformance/v1/protection/manifest.json` maps every requirement to positive,
negative, boundary, adversarial, restart, replay, epoch, retirement, and
resource-bound cases. The focused Node suite is
`node --test LicoArc/tests/pairwise-protection.test.mjs`.
