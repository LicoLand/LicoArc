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
acceptance, approval, effects, and endpoint-authenticated evidence.

**Station**
An independently operated, Endpoint-untrusted intermediary with only the
transport authority granted by the pinned Protocol Line.

**Network**
A federation interoperability context under one pinned Protocol Line. It is
not a trust root or an Endpoint authority.

**Group**
A protected, versioned collaboration object whose members are Endpoints. It is
not a fourth entity.

**Protocol Line**
A closed composition of mandatory capability semantics, Protection Profiles,
security claims, selection rules, lifecycle policy, and content identity. One
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

**Support statement**
An Endpoint-authenticated bounded set of exact `(wireId, generation,
protocolLineId)` tuples plus its monotonic minimum-generation floor.

**Session eligibility**
A machine lifecycle property permitting authenticated new-session selection.
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
An authenticated peer result that can advance the exact Reliable Exchange
state. A Station result cannot substitute for it.

**Transferable Evidence**
An Endpoint-signed statement and checkpoint joined to an exact identity state
and Protocol Line identity. It proves only the defined cryptographic
attribution, not truth, intent, legal responsibility, trusted time, or delivery.

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
The independent distribution/use state: `Candidate`, `Published`,
`Deprecated`, or `Retired` as permitted by the owning registry.

**Allocation tombstone**
A permanently non-reusable retired identifier entry. It reserves only the
identifier and carries no active wire, parser, implementation, or compatibility
behavior. The current Profile registry retains exactly two.

**Source-integrity verification**
Repository-owned checks that prove the tracked definition graph, corpora,
formal bindings, content identities, and generated artifact agree. This is not
an implementation, interoperability, audit, publication, deployment, support,
or operation result.
