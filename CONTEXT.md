# Lico Arc Protocol Context

This glossary projects the current protocol vocabulary. The Core Domain Model
in [`README.md`](README.md#core-domain-model) is authoritative.

**Protocol Layer**
The implementation-neutral authority for protocol meaning. It defines bytes,
identifiers, states, failures, security claims, and governance, but executes no
runtime.

**Endpoint**
The user-controlled origin or destination of protected communication and the
sole runtime authority for its keys, plaintext, protected state, peer
acceptance, approval, effects, and authenticated confirmations. Each
independently key-holding device or isolated runtime is a separate Endpoint
with independent keys and sessions.

**Station**
An independently operated, Endpoint-untrusted intermediary with only the
transport authority granted by the pinned Protocol Line. It has no user/device
roster and no identity, trust, confirmation, freshness, or finality authority.

**Network**
A federation interoperability context under one pinned Protocol Line. It is
not a trust root or an Endpoint authority.

**Group**
A protected, versioned collaboration object whose members are Endpoints. It is
not a fourth entity.

**Protocol Line**
A closed composition of mandatory capability semantics, Protection Profiles,
security claims, current status, and content identity. One
session uses exactly one line.

**Protocol Line identity**
The `DIGEST256` result of the named non-circular line semantic projection. The
human-readable wire ID is only a locator.

**Protection Profile**
An indivisible cryptographic construction with exact algorithms, domains,
schemas, state, bounds, failures, claims, proofs, and corpus. Profile
components are not negotiated separately.

**`stable-core`**
The active complete Candidate Profile: paired X25519 and ML-KEM-768 one-time
prekeys, dual Ed25519 and ML-DSA-65 authentication, transcript-bound hybrid
establishment, SessionAccept, and bounded X25519 Double Ratchet.

**Paired prekey**
One responder-issued X25519 and ML-KEM-768 one-time-prekey pair sharing one
monotonic sequence and one atomic redemption. A partial pair is invalid.

**Session eligibility**
A machine lifecycle property permitting sessions under the fixed V1 definition.
It is not a publication, implementation, interoperability, or operation claim.

**Content identity**
A semantic digest derived from a named deterministic projection. It excludes
self-identifiers and non-semantic lifecycle, publication, tool, and artifact
metadata.

**Conformance corpus**
Source-owned positive and negative synthetic cases that close definition-level
semantics. It is not evidence that a downstream implementation conforms.

**Security claim**
A stable protocol assertion admitted only with its declared adversary model,
required source-owned formal bindings, and proof result.

**Stable nonclaim**
A named security property the Profile does not provide. Passing checks cannot
silently turn a nonclaim into a claim.

**Generic Message**
A protected protocol message with one of six defined classes and an opaque,
namespaced application Payload.

**Reliable Exchange**
The bounded Endpoint state machine for protected intent, logical identity,
retry, confirmation, attachment recovery, terminal failure, and restart
convergence. It cannot guarantee Station delivery.

**Endpoint confirmation**
An exact replay-bound result authenticated by the sending authorized Endpoint
session. Endpoint Accepted requires the matching confirmation. Effect
Completed also requires authenticated success and result binding. A Station
result cannot substitute for it.

**User authority state**
A signed, predecessor-bound snapshot containing the self-certifying user
reference, authority epoch, management and recovery public keys, and a bounded
set of authorized Endpoint devices. The canonical state digest excludes its
authority signatures.

**Device authorization**
User-authority admission of one independent Endpoint state after possession
proof. It permits that Endpoint to participate under the accepted authority
state; it does not set peer trust or merge device keys or sessions.

**Authority recovery**
A predecessor recovery-key-authorized transition that can replace authority
keys and atomically revoke compromised and admit replacement Endpoints. It
does not recreate absent user data or bypass any external account policy.

**Sibling authority binding**
The pairwise transcript binding of each Endpoint-state digest beside its own
accepted user-authority-state digest. Authority snapshots do not contain the
peer digest, so the binding has no digest cycle.

**Transport Profile**
A named, bounded contract for Station-facing operations and opaque protected
packet transport. It cannot choose Endpoint identity or cryptographic meaning.

**Federation Governance**
Threshold-controlled, deterministic semantics for membership, compatibility
certification, revocation, advisories, equivocation handling, and recovery.
Endpoint admission remains local.

**Definition status**
The maturity of repository-owned protocol semantics: `PENDING`, `DRAFT`,
`PARTIAL`, or `COMPLETE`.

**Lifecycle**
The independent definition and publication state. The initial V1 is a mutable
`Candidate`; publication is a separately authorized action.

**Source-integrity verification**
Repository-owned checks that prove the tracked definition graph, corpora,
formal bindings, content identities, and generated artifact agree. This is not
an implementation, interoperability, audit, publication, deployment, support,
or operation result.
