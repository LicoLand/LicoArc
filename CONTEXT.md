# Lico Arc Protocol

The exact three-entity domain model and its authority and privacy boundaries
are defined only in the
[README Core Domain Model](README.md#core-domain-model). This document defines
supporting protocol vocabulary and invariants without adding or redefining a
core domain entity.

## Repository authority invariant

LicoArc is the sole authoritative repository for the communication protocol
and strategy of the human-agent collaborative federation network. All
normative protocol sources, definition-level corpora, generated artifacts,
source-integrity rules, lifecycle records, and governance definitions are
owned and resolved here.

## Language

Vocabulary defines protocol meaning. Terms for protection
suites, capability selection, peer verification, identity transparency,
Generic Messaging, Reliable Exchange, minimized delivery, transferable
evidence, and Transport Profiles describe approved planned design only until
[`docs/STATUS.md`](docs/STATUS.md) records a LicoArc-owned Candidate definition
closure.

**Protocol Layer**:
The organization layer owned by Lico Arc Protocol. It defines
implementation-neutral protocol meaning: wire identifiers and contracts,
lifecycle states, closed schemas, policies, definition-level corpora,
content-addressed protocol artifacts, and governance rules. It specifies what
independent implementations must agree on but does not execute their runtime
behavior.
_Avoid_: runtime tier, relay backend, endpoint product

**Final Protocol Vision**:
The implementation-neutral outcome defined in
[`PRODUCT.md`](PRODUCT.md#final-protocol-vision): any conforming Endpoint can
perform protected, reliable exchange with another conforming Endpoint through
independent untrusted Stations under one exact, independently verifiable
Protocol Line. Every field and algorithm must contribute directly to this
outcome or preserve it by remaining absent or at a lower layer.
_Avoid_: product roadmap, consumer requirement, repository integration target

**Protocol Consumer**:
Any independent Endpoint, Station, Network, verifier, or tool implementation
that consumes a complete LicoArc Protocol Line. A consumer may provide
evidence or proposals but cannot define protocol meaning, supply missing
semantics, or become a reference authority.
_Avoid_: downstream design owner, privileged implementation, normative adapter

**Local Research**:
Untracked material that may inform a proposal but never enters the normative
source graph, tracked links, fixtures, artifacts, or closure conditions.
_Avoid_: design authority, semantic dependency, required reference file

**Field Vision Contribution**:
The single necessary outcome that an active field adds to the Final Protocol
Vision, or the property that rejecting or relocating a value preserves. The
Canonical Field Registry owns this statement; field decision records explain
it without importing consumer or comparative-evidence goals.
_Avoid_: implementation benefit, product requirement, borrowed precedent

**Repository Source Closure**:
The exact ordered set of normative machine sources and conformance inputs
declared by a Protocol Line and bound into its generated artifact.
_Avoid_: undocumented input, mutable external input

**Decision Track**:
One of the two independent review paths governed only by the
[LicoArc Decision Lifecycle](docs/DECISION-LIFECYCLE.md): Algorithm Decision or
Message Field Decision. A record and its status belong to exactly one track.
_Avoid_: cross-track approval, convenient shared decision record

**Decision Record**:
A stable `ALG-<slug>` or `FLD-<slug>` non-normative evidence record that
tracks one bounded question through decision status and independent definition status. It links
formal authorities but never replaces them.
_Avoid_: chat approval, implementation as decision, second specification

**Endpoint**:
One of the three core domain entities. Its authoritative definition and
privacy boundary are in the
[README Core Domain Model](README.md#core-domain-model).
_Avoid_: client account, trusted relay

**Independent Endpoint Device**:
A device or isolated runtime that independently holds Endpoint private keys
and protocol state. Each such key-holding participant is its own Endpoint;
multiple devices are never silently merged into one Endpoint identity.
_Avoid_: sub-device identity, shared account endpoint, implicit replica

**Endpoint Identity**:
The Endpoint-controlled cryptographic continuity anchor authenticated by the
handshake and retained across reconnect, Station affiliation, route migration,
and any key rotation that proves continuity. It does not contain or derive
from a Station, domain, Provider, device, account, Delivery Handle, or listener
location. Failure to prove identity continuity creates a new Endpoint and
requires re-pairing rather than a migration shortcut.
_Avoid_: `user@station`, homeserver identity, mailbox identity, current route

**Station Affiliation**:
One entry in the Endpoint-wide current service-relationship snapshot. The
Endpoint authenticates selection and ordering; the Station signs only an
identity-bound opaque commitment and finite expiry. The first entry is the
sole primary Station and later entries are alternates. Affiliation does not
change Endpoint Identity or grant a Station identity, plaintext, peer-trust,
availability, or delivery authority.
_Avoid_: account ownership, federation membership, Endpoint identity,
transitive trust

**Endpoint Affiliation Update**:
The Endpoint-authenticated, Endpoint-wide full snapshot of current Station
affiliations. Its epoch and immediate-predecessor digest are global to the
stable Endpoint identity: every peer must receive the same logical state for
an epoch, and different same-epoch states are equivocation. It contains no
Delivery Handle and remains distinct from relationship Route state.
_Avoid_: per-peer home Station, route list, directory membership, patch

**Station Service Commitment**:
A bounded Station statement in one of two exact scopes: an affiliation
signature accepts an opaque identity-bound commitment and affiliation expiry;
a Route signature issues an exact descriptor, affiliation commitment,
Transport Profile, Delivery Handle, and service expiry. Neither statement
reveals or authenticates Endpoint identity to the Station, proves honesty or
availability, guarantees retention or delivery, or establishes Endpoint
acceptance or an application effect.
_Avoid_: identity guaranty, guaranteed delivery, Station trust, receipt proof

**Route Update**:
The Endpoint-authenticated, peer-relationship-scoped full snapshot of private
transport Routes under one exact accepted Endpoint Affiliation Update. Its
epoch starts at one, advances by exactly one, and each successor commits its
immediate logical predecessor. Route order is attempt preference only; it does
not select the global primary Station.
_Avoid_: incremental add/remove patch, Station directory truth, last-write-wins

**Route Migration**:
Replacement of global Station affiliation and dependent private Routes while
preserving Endpoint Identity and protected intent. A-to-B migration first
advances the Endpoint-wide affiliation chain from primary A to primary B,
then advances each peer Route chain to the new affiliation-state digest and
B-issued capabilities. B must accept the new opaque commitment; A never
receives veto power.
_Avoid_: identity rotation, old-Station approval, provider rename, hop trace

**Station**:
One of the three core domain entities. Its authoritative definition and
untrusted boundary are in the
[README Core Domain Model](README.md#core-domain-model).
_Avoid_: trusted relay, client backend

**Network**:
One of the three core domain entities. Its authoritative federation,
interoperability, and non-authority boundary is in the
[README Core Domain Model](README.md#core-domain-model).
_Avoid_: global trust root, Endpoint authority, Network Host

**Outer Envelope**:
The current `licoarc.protocol-line.v1` Candidate's closed station-facing protocol line.
It is not the approved target carrier shape: the future Transport Profile
carries routing in its request target and protected bytes in its raw body.
_Avoid_: message, plaintext packet

**Outer Header**:
The current relay Candidate's logical class of Station-readable JSON members.
It is not a nested wire object and is not part of the approved target carrier
shape. A field is not endpoint-authenticated merely because it is classified
as a header.
_Avoid_: trusted header, HTTP header, implicit associated data

**Outer Body**:
The current relay Candidate's `ciphertext` JSON member. The approved target
carrier instead uses the Transport Profile's raw binary body. Neither a field
name nor opacity to a Station proves a valid Pairwise Protection frame.
_Avoid_: plaintext body, schema-validated encryption

**Delivery Handle**:
A short-lived, opaque, purpose-scoped Transport Profile routing value carried
by the request target to give one Station only the next-action information it
requires. It is not an Endpoint identity, stable mailbox, account, or trust
assertion.
_Avoid_: user address, permanent inbox, identity key

**First-Contact Delivery Handle**:
A purpose-scoped, short-lived, single-use specialization of Delivery Handle
that permits one bounded first-contact routing attempt without revealing a
stable Endpoint identifier to a Station. It is not a separate token field and
does not authenticate either Endpoint or the invitation; those checks belong
to the endpoint-protected handshake.
_Avoid_: independent invitation field, reusable invitation, bearer identity,
public directory key

**Protected Payload**:
Opaque endpoint-owned bytes carried as the target Transport Profile's raw
binary body.
_Avoid_: station message, relay-readable content

**User Payload**:
The exact application-supplied byte string in an ordinary Generic Message,
including a raw attachment slice. LicoArc authenticates and carries it but does
not parse, compress, normalize, rewrite, or otherwise transform it. A reserved
LicoArc control type instead selects a protocol-owned Control Payload grammar.
_Avoid_: protocol-owned application schema, transparent compression, mutable
content

**Protocol Overhead**:
Every LicoArc-required wire octet except the first transmission of ordinary
User Payload. It includes capability and handshake traffic, protocol metadata,
intrinsic protection framing and tags, Control Payloads, Transport Profile
bytes, and retransmitted User Payload. An exact Protocol Line fixes separate numeric
bounds; no sender field reports or raises them.
_Avoid_: Payload size, self-reported overhead, sender-selected budget

**Protection Profile**:
A versioned, protocol-owned, complete suite contract that fixes asynchronous
establishment, KEM, signatures, session ratchet, sender-metadata protection,
handshake and transcript, authenticated associated data,
freshness, replay, rekey, retirement, Protocol Overhead, and normative
resource and wire bounds. Endpoints implement the profile and hold its private keys and
protected state. The mandatory profile adds no discretionary traffic-shaping
bytes or schedule.
_Avoid_: endpoint-selected cryptography, station encryption

**Complete Protection Suite**:
One indivisible Protection Profile. Its KEM, traditional and post-quantum
signatures, ratchet, encodings, sender-metadata protection, bounds, and
lifecycle are selected together rather than negotiated as independent
components.
_Avoid_: algorithm menu, best-effort downgrade, partial profile

**Normative Resource Contract**:
A Protection-Profile-owned implementation-neutral envelope for CPU work, memory, persistent state, wire cost, control traffic, and unauthenticated-input work. Runtime measurement and device admission belong downstream.
_Avoid_: benchmark result, device gate, implementation claim

**Primary Algorithm Lineage**:
The traceable original algorithm definition plus its correctness or security
claims and the exact later normative edition, revisions, corrections, and
errata selected by LicoArc. Algorithm reliability is established from this lineage before the definition is closed.
_Avoid_: dependency behavior as algorithm definition, implementation majority
as correctness oracle

**Algorithm Prototype**:
The normalized, implementation-neutral algorithm baseline derived from the
Primary Algorithm Lineage and owned by LicoArc. Downstream dependencies must preserve this Prototype but never enter the LicoArc definition graph.
_Avoid_: prototype source code, dependency-defined algorithm, unreviewed safer
variant

**Signed Capability Declaration**:
A bounded, expiring, Endpoint-signed set of complete supported profiles and
minimum-safe lifecycle constraints. Two declarations and the selected
strongest common profile are authenticated by the handshake transcript and
locked for the session.
_Avoid_: unsigned feature list, component negotiation, mid-session upgrade

**Pairwise Protection**:
The first-release endpoint-protection capability for two independently
implemented Endpoints. Its planned design offers a mandatory baseline complete
suite and a separately complete high-assurance suite, and applies exactly one
selected Protection Profile to authenticated session establishment and
protected records without owning endpoint key custody, provider selection, or
local persistence.
_Avoid_: product-local encryption mode, Station TLS, arbitrary algorithm negotiation

**Peer Verification State**:
Endpoint-local state describing whether Endpoint identity continuity has been
independently established. First contact begins as protected but `unverified`;
QR, short-authentication-string, or trusted-identity evidence can support a
later local transition. LicoArc defines protected Verification Records and
evidence inputs, while no peer field directly sets the state and endpoint
products enforce local operation policy.
_Avoid_: plaintext first contact, automatic trust, product risk classification

**Generic Message**:
A closed application-neutral protected record whose core class is `event`,
`request`, `response`, `error`, `cancel`, or `streamChunk`. Its compact content
type dispatch, correlation, bounds, and namespaced extension behavior are
independent of a product command catalog. Ordinary `payload` is User Payload
and remains opaque to the Protocol Layer; only reserved LicoArc Control
Payloads such as attachment receive-state structures are protocol-validated.
All remain hidden from every Station.
_Avoid_: product-local command, relay message, UI event

**Group**:
A protected, versioned collaboration object interpreted only by member
Endpoints. It is not a core domain entity, identity, Station resource,
Network, account, room service, or human authority.
_Avoid_: fourth entity, server-owned room, Network membership

**Group Membership State**:
The protected bounded snapshot that identifies one Group collaboration state,
its member Endpoint references, admitted protocol roles, and exact predecessor
relation under the defined Group Profile.
_Avoid_: Station directory, product permission database, unbounded member list

**Group Epoch**:
The protected ordering coordinate for one Group Membership State. Its value
model, genesis, increment, overflow, and fork behavior are defined by the Group
Profile and `FLD-group-epoch`.
_Avoid_: Station sequence, wall-clock time, implementation revision

**Group Message**:
One logical Generic Message bound to one exact Group Membership State and
delivered through bounded per-member Endpoint protection, retry, and result
aggregation. Product actions remain namespaced opaque User Payload.
_Avoid_: broadcast to a Station room, product command catalog, unbounded fan-out

**Endpoint Association Claim**:
A prospective protected claim by one Endpoint that it is associated with one
or more other Endpoints. It is always non-authoritative input to recipient
local policy and never proves shared human identity, device ownership, account
control, consent, trust, or Group membership. Its field necessity remains
open.
_Avoid_: User entity, Device entity, identity merge, automatic trust

**Attachment Descriptor**:
A bounded immutable protected manifest entry that commits Message-scoped
attachment identity, content type, total raw-byte length, and final content
integrity. It is the root for protected chunking and recovery but never embeds
the file bytes, a retrieval locator, a storage path, or a Station capability.
_Avoid_: retrieval reference, mutable file metadata, Station-readable
attachment metadata

**Attachment Chunk**:
One Endpoint-protected raw-byte slice of an Attachment Descriptor's immutable
Protocol-Line chunk grid. Its identity is the declaring Message,
`attachmentId`, and `chunkIndex`; retry, restart, re-protection, session
renewal, Route migration, and Station migration do not change that identity or
its bytes.
_Avoid_: transport part, file block locator, mutable upload part

**Attachment Receive State**:
A protected Generic Message `event` that binds to one declaring Message and
attachment and reports a bounded canonical set of chunk intervals requested
by the receiver. A non-empty set requests selective retransmission; an empty
set is valid only after exact length and final content integrity are durably
verified and is the sole routine success report. It is the sole normal
attachment feedback path; accepted chunks do not each produce a confirmation.
_Avoid_: Station receipt, open-ended range request, retry scheduler

**Attachment Checkpoint**:
Endpoint-local durable state backing accepted attachment chunks, requested
ranges, deduplication, and terminal result. LicoArc
defines the observable transitions and persistence obligation, not the
database, bitmap, file layout, cache, or cleanup mechanism. Its fixed
Protocol-Line recovery window cannot be reset by retry, restart, Route change,
Station migration, or replay. Payload state may be released at a terminal
transition, but the terminal and deduplication tombstones remain through the
window so that result cannot be reopened.
_Avoid_: wire checkpoint field, Station queue state, implementation database

**Protected Intent**:
The stable endpoint-authenticated meaning that one Reliable Exchange attempts
to deliver. One intent may retain its identity across exact-envelope retry or
an explicitly authorized route change without making two local effects valid.
_Avoid_: envelope ID, station job, exactly-once promise

**Reliable Exchange**:
The endpoint state machine for stable logical Message identity, at-least-once
retry, endpoint deduplication, application idempotency input, durable outbox
and inbox transitions, bounded aggregate confirmation, bounded selective
attachment recovery, mandatory Evidence Checkpoint gating, Protocol Overhead
limits, and explicit failure. It makes successful exchange recoverable across
restart and route change; it does not guarantee Station delivery, a malicious
peer's cooperation, or exactly-once local effects.
_Avoid_: reliable station, guaranteed delivery

**Endpoint Confirmation**:
An end-to-end authenticated protocol record that distinguishes durable endpoint
acceptance from completed local effect. One sorted bounded Message-identity
array may share one stage, outcome, and failure code. It is never created or
replaced by a Station Signal, and routine successful attachment chunks never
produce it. Its transferable statement must be covered by a valid Evidence
Checkpoint before it advances peer state.
_Avoid_: station acknowledgement, delivery proof

**Station Received**:
A Station Signal claiming receipt or custody of one Outer Envelope. It is a
transport hint only.
_Avoid_: Endpoint Accepted, delivery proof

**Endpoint Accepted**:
A checkpoint-covered Endpoint Confirmation stating that a protected record was
validated, durably accepted, and deduplicated. The state cannot advance from
Station delivery, session authentication alone, or an uncovered confirmation.
_Avoid_: Station Received, Effect Completed

**Effect Completed**:
A checkpoint-covered Endpoint Confirmation stating that the application
completed the local effect associated with an accepted request. It attributes
the statement to the Endpoint but does not independently prove the statement's
real-world truth or exactly-once execution.
_Avoid_: Endpoint Accepted, exactly-once proof

**Transferable Statement**:
The Protocol-Line-defined canonical projection of one Endpoint-authored logical
record for independent attribution. It includes exact Endpoint identities and
all User Payload or state-transition meaning, while excluding session lookup,
protection framing, ciphertext, retry, Route, and Station carriage.
_Avoid_: ciphertext digest, transport transcript, parsed application object

**Evidence Checkpoint**:
A protected, independently signed record containing one bounded canonical set
of Transferable Statement digests, the exact Protocol Line, signer and
counterparty Endpoint identities, and signing Identity state. A covered
statement has no deliverable or peer-state effect until both parts are present.
The checkpoint is self-authenticating and never requires confirmation or
another checkpoint.
_Avoid_: optional receipt, per-record signature, recursive checkpoint

**Evidence Profile**:
The Protocol-Line-bound complete construction for Transferable Statement
projection, digesting, Evidence Checkpoint signing and verification, identity
key-purpose continuity, pending-state joins, failure behavior, and mobile
resource bounds. Its exact algorithms remain an independent Algorithm Decision.
_Avoid_: loose signature menu, provider algorithm name, legal policy

**Transferable Evidence**:
An Evidence Checkpoint together with the disclosed Transferable Statements and
bounded Endpoint Identity continuity material needed for third-party
verification. It provides technical attribution to an Endpoint key state; it
does not prove a natural person's intent, statement truth, trustworthy time,
uncompromised custody, legal responsibility, or a statement the counterparty
never signed.
_Avoid_: legal non-repudiation guarantee, Station receipt, trusted timestamp

**Technical Non-Repudiation**:
The protocol property that a valid Transferable Evidence package lets an
independent verifier attribute exact disclosed statements to the authorized
Endpoint key state that signed their checkpoint. The term is deliberately
limited to cryptographic protocol evidence and never asserts legal
admissibility, factual truth, human consent, or trusted time.
_Avoid_: absolute non-repudiation, legal conclusion, proof of reality

**Station Signal**:
A station-local receipt, lease, timestamp, queue state, acknowledgement, or
delivery claim that provides an operational hint but no endpoint security
evidence.
_Avoid_: delivery proof, trust receipt

**Transport Profile**:
A named, versioned carrier contract for bounded protected-packet submission,
bounded Station store-and-forward, retrieval, parser selection, routing,
raw-body framing, one fixed storage window without a per-submission TTL, and
transport failure semantics. It fixes a numeric per-operation overhead bound
and may use transport encryption,
but it cannot change Pairwise Protection, Generic Messaging, Reliable
Exchange, Endpoint identity, or confirmation meaning.
_Avoid_: protection profile, station implementation, endpoint trust

**Identity Transparency**:
The protocol-owned non-enumerable proof, independent-witness, endpoint-gossip,
rotation-continuity, and consistency rules that let Endpoints detect
unauthorized endpoint-key or profile retargeting. A directory, discovery
service, witness, Station, or product remains an input rather than the final
Endpoint trust authority. Rotation without provable continuity creates a new
Endpoint and requires re-pairing.
_Avoid_: global account directory, station identity, automatic peer admission

**Provider**:
Replaceable endpoint implementation plumbing for storage, transport,
cryptography, discovery, or platform services. Provider names, endpoints,
certificates, plugins, and vendors are not protocol data, Endpoint identity,
or trust roots.
_Avoid_: protocol profile, federation identity, mandatory service

**Protocol Line**:
A versioned, closed manifest composition of compatible protocol capability
sources, conformance material, and consumer artifacts with one declared
lifecycle state. Capability versions may evolve independently, but an Endpoint
executes only an explicitly declared compatible composition with one
minimum-safe policy, handshake binding, and session lock.
_Avoid_: product release

**Governance Artifact Representation**:
Restricted JSON canonicalized with JCS for manifests, policies, registries,
signatures, and release-governance inputs. JSON Schema, OCI, DSSE, and TUF may
define or distribute exact governance artifacts; they do not define Endpoint
runtime wire bytes.
_Avoid_: runtime message encoding, mutable control plane, second authority

**Runtime Wire Representation**:
Protocol-Line-pinned deterministic CBOR described by closed CDDL, compact
unsigned-integer labels, bounded definite-length values, and raw
`protectedPacket` transport bodies. Semantic registry names never become wire
strings.
_Avoid_: JSON runtime envelope, text field names, binary-to-text packet armor

**Multi-Root Threshold Governance**:
A governance model in which no single operator, Station, Network Host, or
artifact service is sufficient to authorize federation or Protocol Line
state. Threshold-approved artifacts provide reviewable inputs while each
Endpoint retains the final local trust decision.
_Avoid_: global trust root, automatic endpoint admission, hosted-service authority

**Candidate**:
A reviewable Protocol Line whose sources and artifacts may still change
before an authorized immutable publication.
_Avoid_: released, published, stable

**Published Protocol Line**:
An immutable, content-addressed Protocol Line made available through an
explicitly authorized protocol publication.
_Avoid_: generated artifact, package version

**Conformance Corpus**:
A set of implementation-neutral positive and negative cases that defines
observable acceptance for a Protocol Line.
_Avoid_: product integration test

**Repository Source Integrity**:
The LicoArc-owned schema, registry, policy, corpus, artifact-generation, and digest checks that prove one tracked Protocol Line definition is internally consistent.
_Avoid_: implementation claim, runtime compatibility claim

**Consumer Bundle**:
A content-addressed projection of a Protocol Line containing its declared
protocol data and verification identity.
_Avoid_: runtime package, publication receipt

**Federation Membership**:
Protocol-governed recognition of a participant within a federation context.
_Avoid_: endpoint admission, station trust

**Compatibility**:
Agreement with a named Protocol Line at its declared wire boundary.
_Avoid_: product integration, synchronized release
