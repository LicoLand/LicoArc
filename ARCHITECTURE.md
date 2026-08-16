# Lico Arc Protocol Architecture

This document is the top-level design authority for Lico Arc Protocol. It
describes implementation-neutral protocol meaning only.

It applies, but does not redefine, the exact three-entity model in the
[README Core Domain Model](README.md#core-domain-model).

## Architectural objective

The authoritative entities, communication path, Endpoint privacy boundary,
and Station and Network non-authority rules are defined only by the
[Core Domain Model](README.md#core-domain-model). This architecture specifies
the implementation-neutral protocol mechanics that preserve that model; it
does not create additional entities.

## Repository authority

Lico Arc Protocol is the **Protocol Layer** in the LicoLand organization
architecture. It is a definition authority rather than a deployed hop in the
message path.

```text
normative sources · conformance corpus · lifecycle records
                         │
                         ▼
              deterministic generation
                         │
                         ▼
          content-addressed Protocol Line artifact
                         │
                         ▼
             source-integrity checks
```

LicoArc is the sole authority for wire and lifecycle semantics, schemas,
policies, corpora, content-addressed artifacts, compatibility, certification,
and federation governance semantics. A Protocol Line definition is complete
only through its tracked source closure and deterministic integrity checks. Endpoint,
Station, and Network are the domain entities defined in the
[Core Domain Model](README.md#core-domain-model); their runtime code and
operational infrastructure are not part of this architecture.

## Non-authoritative consumers and evidence

A product, repository, implementation, language, library, Provider,
deployment, account system, storage model, gateway, adapter, hosted service,
or reference implementation may consume a Protocol Line or submit a proposal.
It never becomes an architectural input that can define protocol entities,
fields, algorithms, state, wire shape, trust, failure, lifecycle, or
compatibility. Implementation feedback changes LicoArc only after a separate
LicoArc-owned decision establishes necessity from the
[final protocol vision](PRODUCT.md#final-protocol-vision) and the resulting
meaning enters the declared repository source closure.

External standards and implementations may establish facts, risks, lineage,
or comparative evidence. They remain outside the authority graph above and
cannot complete or override missing LicoArc semantics.

## Protocol-definition topology

```text
LicoArc decision
      │
      ▼
identifier · lifecycle · wire · state machine · encodings · bounds
      │
      ▼
positive · negative · boundary · adversarial definition corpus
      │
      ▼
explicit manifest ──▶ deterministic content-addressed Candidate bundle
```

The graph ends at the tracked protocol definition. Downstream repositories may
consume the bundle and corpora, but they own every implementation, dependency,
runtime, executable validation, release, and operation fact. Their results do
not enter this source graph or block its closure.

## Protocol definition boundary

```text
Endpoint A ── end-to-end protected payload ──▶ Network ──▶ Endpoint B
                 no plaintext field            │
                                                └─ untrusted Station carriage
```

The Protocol Line defines how message plaintext remains unavailable to the
Station, how the station-facing transport unit is parsed, and why a Station
receipt is not final-delivery evidence. The repository closes those semantics
in formal sources and definition-level corpora. Endpoint and Station
implementations own execution and runtime validation.

## Design principles

1. **Core-model preservation.** Every capability preserves the Endpoint
   authority and privacy boundary and the Station and Network limits defined
   by the [Core Domain Model](README.md#core-domain-model).
2. **No derived trust.** Architecture must not create a global or transitive
   authority that contradicts the Core Domain Model.
3. **Small mandatory core.** The first complete line standardizes only the
   Pairwise Protection, Generic Messaging, Reliable Exchange, station-facing
   protected-packet carrier, and baseline Transport Profile semantics required for two Endpoints to
   exchange one protected request and response across a Network using
   untrusted Station carriage.
4. **Deterministic authority.** Every Candidate contract and policy is bound
   into a content-addressed bundle. Reviewed source changes produce new exact
   bytes and a new digest.
5. **Asynchronous by default.** Stations and endpoints may be offline. The
   mandatory Transport Profile therefore provides bounded Station
   store-and-forward, while Endpoints still treat retry, duplication,
   reordering, loss, malicious retention, and partition as conditions to
   handle rather than Station-enforced security guarantees.
6. **Metadata minimization.** Each intermediary receives only the routing and
   transport information required for its next action. The fixed
   Transport-Profile storage window requires no per-submission retention
   input.
7. **Implementation neutrality.** Databases, queues, languages, cloud
   platforms, and service meshes remain outside the wire standard.
8. **Continuous adversarial strengthening.** Every station may participate in
   a globally coordinated, adaptive, long-lived attack. Protection profiles
   remain replaceable and downgrade-resistant, failures close, and the
   security boundary strengthens as attack and research evidence evolves.

## Adversarial horizon

The architecture has no planned ceiling at which the station threat is
considered solved. Reviews must assume that future attackers have more time,
coordination, compute, implementation knowledge, and exploit capability than
the current definition-level cases cover. Any design that depends on station honesty,
algorithm obscurity, a permanent algorithm choice, silent downgrade, or a
single implementation is inadmissible.

Protection-related protocol work must compare reviewed standards and public
security analysis, use versioned algorithm/profile identifiers,
define minimum safe versions and retirement paths, bind negotiation against
downgrade, minimize metadata, and fail closed on unknown or unsafe states.
Lico Arc Protocol owns each exact protection profile and its safe transition
semantics. Endpoint implementations own the cryptographic code, keys, entropy,
protected runtime state, provider selection, and execution that conform to the
pinned profile. This split keeps profiles replaceable without turning an
endpoint product or Station into a second protocol authority.

## Roles and trust dimensions

The authoritative entity set and trust boundaries are defined only by the
[README Core Domain Model](README.md#core-domain-model). LicoArc Protocol,
committee authorities, Providers, directories, implementation languages, and
hosted services may have responsibilities, but they are not additional core
domain entity types. Capability-specific trust analysis in this architecture
must reference and preserve the README model rather than restating it.

## Protocol data layering model

The data model separates carrier framing, Station-visible envelope data,
endpoint protection, reliable exchange, generic records, and application
content. The table is an outside-to-inside logical processing model, not a
final byte layout. It does not decide the future protection frame's encoding,
which visible values enter authenticated associated data, or where an
extension container appears.

Endpoint Identity, Endpoint-wide Affiliation Update succession, and
relationship Route Update succession supply authenticated control state to
this processing model rather than adding a Station-qualified identity layer.
Endpoint Identity is stable; current primary and alternate Station bindings
are global protected state; and private routing remains the replaceable final
service segment.

| Order | Logical layer | Protocol responsibility | Station visibility and authority | Definition status |
| --- | --- | --- | --- | --- |
| 1 | Transport Profile | Outer parser selection, bounded submission and retrieval, short-lived Delivery Handle routing, raw-body framing, and transport failure classification | Carrier metadata may be visible; carrier success is never endpoint evidence | Defined in the HTTPS Transport Profile sources |
| 2 | Protected Packet Carrier | One bounded opaque octet sequence carried as the Transport Profile's raw binary body | Station sees packet bytes and length but receives no security authority | Defined by transport and protection framing |
| 3 | Pairwise Protection Frame | Future exact Profile, handshake/session bindings, established framing, authenticated context, confidentiality, freshness, replay, and resource rules | Authenticated context remains Endpoint-bound | Open/partial; zero active Profile or wire sources |
| 4 | Reliable Exchange Record | Protected Intent, logical Message identity, bounded retry/deduplication, aggregate confirmation, compact recovery feedback, evidence-before-finality, and terminal failure | Hidden from the Station by endpoint protection | Defined by Reliable Exchange sources |
| 5 | Evidence Checkpoint Record | Bounded canonical statement digests, portable Endpoint pair, signing Identity state, and independently verifiable signature set | Hidden from the Station in transit; transferable only when an Endpoint discloses it | Defined by Evidence Profile sources |
| 6 | Group Collaboration Object | Protected Group Membership State, exact epoch context, bounded member Endpoints, roles, Group Message binding, and aggregate result semantics | Hidden from the Station by endpoint protection | Defined by Group Collaboration sources |
| 7 | Generic Message Record | Core record class, correlation, compact content-type dispatch, User Payload boundary, closed control Payloads, bounds, and explicit extension semantics | Hidden from the Station by endpoint protection | Defined by Generic Messaging sources |
| 8 | User Payload | Application-supplied exact bytes carried without LicoArc parsing, compression, normalization, or rewrite | Hidden from both the Station and Protocol Layer interpretation | Endpoint-owned; no LicoArc application schema |

The [Canonical Field Registry](spec/FIELD-REGISTRY.md) is the sole authority
for active field names, types, presence, visibility, and dispositions. The
layer table above summarizes that authority and cannot extend or reinterpret
it.

The current `licoarc.protocol-line.v1` source projection is
`Candidate`/`PARTIAL`. It is deterministic and source-bound but is not an
executable Protocol Line: mandatory Pairwise Protection remains open, so the
catalog marks it session- and publication-ineligible. Its manifest cannot
override the Canonical Field Registry or turn an open decision into wire.

The defined carrier has no JSON Outer Envelope: the Transport Profile selects its outer
parser, places a short-lived opaque Delivery Handle in transport routing, and
carries the protected packet as its raw binary body. It has no sender-supplied
transport Envelope identifier, absolute `expiresAt` body field, or
per-submission TTL. The Transport Profile instead fixes one storage window for
accepted submissions.

A Protocol Line assigns every field to exactly one
security class: endpoint-encrypted, Station-visible but endpoint-authenticated,
or Station-mutable transport hint. Station-mutable data may affect only
Station-local routing, queuing, caching, and retention. Any visible field that
changes endpoint interpretation, including protocol/profile selection,
message kind, identity, freshness, replay, or cryptographic context, must be
bound by an unambiguous endpoint-authenticated construction. Duplicate or
cross-class shadow fields are rejected. Extensions require an explicit
container and criticality rules; unknown critical semantics fail closed.
Changing a field's security class requires a new Protocol Line rather than an
in-place reinterpretation.

The current Candidate does not close Pairwise Protection. Its protection
registry contains zero active Profiles and no wire schema, CDDL or corpus.
Field classification alone cannot supply the missing construction or proof.

This separation is informed by the protected/unprotected header and external
associated-data discipline recorded in the
COSE reference, the integrity-protected header and
AAD model recorded in the JWE reference, and the
explicit authenticated framing recorded in the
MLS reference. LicoArc reuses those design lessons,
not their wire representations, identity models, group semantics, servers, or
trust roots.

## Target protocol stack

Every item in this stack is a Protocol Layer contract or protocol-data
definition. None is runtime implementation code, implementation evidence, or
a delivery claim.

### 1. Governance and compatibility

Committee metadata uses threshold-signed, versioned roles informed by the
exact TUF reference: root authority, delegated
targets, snapshot, and short-lived timestamp metadata. The protocol defines
deterministic key rotation, expiry, revocation, minimum safe versions,
and cryptographic-profile retirement; it does not inherit unspecified TUF
semantics.

Threshold governance means M-of-N independent signatures over canonical
metadata from multiple independent roots. No single operator, Station,
Network Host, signer, or artifact service is sufficient. Governance artifacts
use restricted JCS-canonical JSON, closed JSON Schema, content-addressed OCI,
DSSE authorization, and TUF-style rotation, expiry, rollback, and recovery.
They remain inputs to each Endpoint's final local trust decision and do not
require a blockchain or custom threshold cryptography.

### 2. Identity and discovery

The discovery definition may use a domain and a bounded well-known
document to locate:

- federation endpoints and supported protocol versions;
- node operational signing keys and rotation metadata;
- transport, identity, and encryption profile identifiers;
- the exact governance bundle accepted by the node.

Node identity is distinct from endpoint, device, person, and agent identity.
Discovery is not identity: located material must be authenticated,
purpose-scoped, expiring, rollback-resistant, and independent of one Station
or product.

The Identity Transparency definition uses non-enumerable proofs,
independent witnesses, and endpoint gossip to detect split views and
unauthorized key, profile, or route retargeting without making a directory or
witness the final trust authority. An authorized rotation must prove
continuity from the last accepted Endpoint state. Failure to prove continuity
creates a new Endpoint identity and requires re-pairing.

Portable Station affiliation is a separate state dimension. A stable
`endpointIdentityRef` never contains a `stationId`, domain, Provider, account,
listener, or Delivery Handle. An Endpoint Affiliation Update supplies one
atomic Endpoint-wide snapshot: its first `StationAffiliation` is the sole
primary, later unique Stations are alternates, and empty is explicitly
unaffiliated. Its epoch and predecessor digest form one chain across every
peer. Different logical same-epoch snapshots are equivocation, not legal
personalization.

For each Station entry, the Endpoint generates a nonce and a domain-separated
`affiliationCommitment` over `endpointIdentityRef`, `protocolLineId`, stable
`stationId`, and that nonce. The Station-facing `AFFILIATE` operation receives
only the commitment and exact descriptor digest, then returns a finite
`affiliationNotAfter` and `stationAffiliationSignature`. Peers receive the
nonce under protection, recompute the commitment, and verify both the
Endpoint-authenticated snapshot and Station signature. The Station therefore
accepts an identity-bound service relationship without seeing stable Endpoint
identity.

Relationship Route Updates separately carry private Delivery Handles. Each
references the exact global `affiliationStateDigest`, and every Route must
match a current Station identity and commitment. The Station signs the Route's
descriptor, affiliation commitment, Transport Profile, asynchronous Handle,
and `serviceUntil`. A-to-B migration first advances global state, then each
Route chain. A never receives approval, release, or forwarding authority. A
Station signature proves only its bounded scope; it does not establish
Endpoint identity, peer trust, Station honesty or availability, freshness,
acceptance, delivery, or effect.

First contact uses the `firstContact` specialization of a scope- and
audience-bound, single-use Delivery Handle plus protected
`invitationBinding`. It creates a protected session whose Endpoint-local
peer-verification state begins as `unverified`. A QR comparison, short
authentication string, or trusted identity assertion can provide protected
verification evidence. LicoArc defines Verification Record semantics, but no
wire field sets local trust; each Endpoint's local policy classifies operations
and decides which evidence is sufficient before allowing them.

### 3. Pairwise Protection

Pairwise Protection is the mandatory endpoint security capability, but its
Core v1 construction is open. The former Candidate records claimed a complete
ratchet without encoding a DH ratchet transition and defined a custom
post-quantum recovery composition without an applicable proof. Both are
withdrawn from active formal and machine meaning.

The [Hybrid AKE](docs/algorithm-decisions/core-v1-hybrid-ake.md) and
[Double Ratchet](docs/algorithm-decisions/core-v1-double-ratchet.md) successors
are `OPEN`/`PARTIAL`. Their field reviews allocate no prekey bundle,
transcript, SessionAccept, ratchet header or label. The exact AKE and proof
must precede any mandatory classical/post-quantum one-time-prekey consumption
rule.

The closed architecture rule is fail closed: no silent downgrade,
component-wise negotiation, implementation fallback, translation or state
advance after a failed assumption. A future reduced-security construction is
a separately proved complete Profile with a new immutable identity.

One complete Profile must eventually close its identifiers, AKE, transcript,
hybrid authentication, key confirmation, ratchet, record protection,
metadata budget, replay/rollback/restart/deletion transitions, resource bounds,
failures, proof bindings and source-derived corpus together. Until then the
Protocol Line is not executable.

The future complete Profile must specify protocol-visible key deletion,
anti-rollback transitions and hard bounds on prekeys, skipped keys and replay
state. Endpoint products will implement those obligations and continue to own
private keys, entropy, cryptographic providers, protected persistence, user
history, backup and local retention.
A provider name, endpoint, certificate, plugin, or vendor is implementation
plumbing and cannot enter protocol data, Endpoint identity, or a trust root.

### 4. Generic Messaging

Generic Messaging is the defined application-neutral protected-record layer.
Its fixed core consists of `event`, `request`, `response`, `error`, `cancel`,
and `streamChunk`, plus an immutable attachment descriptor, attachment chunks,
and Attachment Receive State. It defines correlation, compact content-type
dispatch, closed control encoding, hard bounds, critical-extension behavior,
and namespaced product extensions. Its mandatory `payload` field carries exact
application-supplied User Payload without LicoArc parsing, compression,
normalization, or rewrite. LicoArc validates only Payload selected by reserved
LicoArc control types, including attachment structure and recovery grammars;
the raw attachment slice remains opaque bytes.

Product-local commands, adapters, approval classes, user-interface events,
conversation storage, and local-effect policy cannot become Generic Messaging
semantics. Any independent Endpoint implementation must be able to implement
the same record contract without importing another product's code or
vocabulary. The definition includes Endpoint-protected large binary attachment
bytes through deterministic chunks. Station-to-Station protocol semantics
remain outside this endpoint protocol.

### 5. Group Collaboration

Group Collaboration is a protected object layer over Generic Messaging and
Reliable Exchange. A Group is not a fourth entity: its bounded members are
Endpoint identity references, and each independently key-holding device or
isolated runtime remains a distinct Endpoint. One Group Membership State
binds the admitted member set, any protocol roles, one state transition, and
its immediate predecessor; one Group Message binds the exact state that
authorizes its sender and recipients.

The [Group State Evolution Algorithm Decision](docs/algorithm-decisions/group-state-evolution.md)
now closes the implementation-neutral state, fork, duplicate, recipient
projection, and resource procedure. Its decision does not create a wire field
or machine schema. The Group identifier, epoch, predecessor digest, member
collection, role, Group Message context, and Endpoint Association Claim remain
independent Message Field Decisions. The active Field Registry defines the
admitted Group fields and records the Association Claim rejection; algorithm
intent alone cannot create a CDDL rule, compact label, schema, Candidate byte,
or conformance claim.

One logical Group Message produces a bounded set of per-member Endpoint
deliveries. Each delivery retains at-least-once retry, Endpoint deduplication,
mandatory Evidence Checkpoint gating, and explicit terminal or partial
failure. Bounded aggregation summarizes member results without turning a
Station into a membership, ordering, group-key, or receipt authority. Product
commands and permissions remain namespaced opaque Payload.

An Endpoint Association Claim remains rejected as a protocol field; any such
application assertion stays protected, opaque, and non-authoritative. It
cannot merge identities or prove a human, device, account, ownership, consent,
trust, or membership fact.

### 6. Reliable Exchange

Reliable Exchange is the defined endpoint state machine above Generic
Messaging. It defines at-least-once retry, stable logical Message identity,
exact-envelope same-route retry, route-change rules, endpoint deduplication,
application idempotency input and conflict, bounded out-of-order recovery,
durable logical outbox and inbox transitions, bounded aggregate Endpoint
Confirmation, compact Attachment Receive State, and transient, ambiguous, and
terminal failure.

For an attachment, the declaring Message plus `attachmentId` is the stable
root and `chunkIndex` binds one stable chunk `messageId` and immutable raw-byte
slice. The same tuple with a different Message identity or bytes is terminal.
The exact Protocol Line fixes the chunk grid. `byteLength` derives count,
offset, and final length; `contentDigest` verifies the complete reassembly. An
attachment chunk forbids `chunkFinal`, and the protocol adds no chunk-size,
count, offset, length, per-chunk digest, transfer ID, or resume-token field.
The declaring Message's Transferable Statement commits the descriptor and its
complete-content digest. Routine attachment chunks and non-empty receive-state
updates therefore remain session-authenticated derivative traffic and do not
each require a separate public-key checkpoint. The final empty verified receive
state is a Transferable Statement and requires one Evidence Checkpoint before
attachment completion advances.

The receiver durably accepts a chunk without returning a routine success
confirmation. After interruption, restart, re-protection, session renewal,
Route migration, or Station migration, protected Attachment Receive State is
the sole normal feedback surface and reports bounded canonical half-open
`requestedChunkRanges`.
The exact line fixes `MAX_ATTACHMENT_BYTES`, `ATTACHMENT_CHUNK_BYTES`,
`MAX_ATTACHMENT_CHUNKS`, `MAX_REQUEST_RANGES`, `MAX_REQUESTED_CHUNKS`, and
`ATTACHMENT_RECOVERY_WINDOW`, plus lifetime maxima for state updates, recovery
rounds, retransmitted chunks, and control bytes. Empty ranges are the sole
routine success report and are terminal only after all derived indexes, exact
total length, and final digest verify. Exceptional chunk rejection or failure
may use an Endpoint Confirmation. Duplicate Payload is idempotent; the same
attachment root and index with different bytes, invalid
geometry, or digest mismatch is a typed terminal failure. Sender and receiver
may exchange successive bounded request batches only within every lifetime
bound. They retain accepted Payload state until completion, cancellation,
terminal failure, or that fixed recovery
window, and retain terminal and deduplication tombstones until the window ends.
Retry, restart, re-protection, Route or Station migration, and replay do not
refresh it; a stale request cannot reopen terminal state.

For non-attachment Messages, one sorted bounded `confirmedMessageIds` array
shares one confirmation stage, outcome, and failure code. Messages with
different results use separate records. This preserves each Message's evidence
transition while amortizing protection framing, tags, and result metadata.

Semantic registry names do not become wire strings: every exact Protocol Line
uses compact unsigned-integer labels and enums with shortest deterministic
encoding. User Payload's first transmission is excluded from Protocol Overhead;
capability and handshake bytes, protocol fields, protection framing and tags,
control Payloads, Transport Profile bytes, and retransmitted User
Payload are included. Separate immutable maxima bound declarations,
handshakes, established-record expansion, control records and transitions,
confirmation groups, Evidence Checkpoint sets, signatures, pending joins,
retries, attachment recovery, and each Transport Profile operation. Idle
relationships generate no mandatory LicoArc keepalive or presence traffic;
active and idle paths add no discretionary traffic shaping, artificial delay,
or synthetic messages.

Route change consumes a peer-specific full snapshot, its exact predecessor
chain, and one exact accepted Endpoint-wide affiliation digest. Route epoch is
scoped to stable Endpoint identity plus peer relationship because Handles may
be personalized; affiliation epoch is global because primary Station may not
be. Lower epoch is stale, equal epoch with different state is equivocation,
and a higher epoch with a missing or mismatched parent is a gap or fork. None
is resolved by arrival order, Station time, expiry, or highest-value
selection. Retry over a new Route retains logical Message and Protected Intent
and uses endpoint deduplication to prevent a second authorized effect.

A successful Station operation remains only a Station Signal. Reliable
Exchange cannot promise exactly-once effects or delivery through a malicious,
unavailable, partitioned, or censoring Station. It specifies observable
transitions and persistence obligations without prescribing a database, queue,
retry scheduler, or local execution architecture.

The evidence state machine distinguishes:

1. **Station Received**, a non-authoritative transport hint;
2. **Endpoint Accepted**, a checkpoint-covered Endpoint statement that the
   protected record was durably accepted and deduplicated; and
3. **Effect Completed**, a checkpoint-covered Endpoint statement that the
   referenced local effect completed.

Every ordinary user-intent Message and each Endpoint-authored affiliation,
Route, verification, acceptance, or effect statement that advances peer-visible
state has a Protocol-Line-defined canonical Transferable Statement projection.
An Evidence Checkpoint signs a bounded sorted unique set of those statement
digests together with the exact Protocol Line, signer and counterparty Endpoint
identities, and signing Identity-state digest. The projection excludes session,
protection frame, ciphertext, retry, Route carriage, and Station state,
so retry, re-protection, session renewal, Route replacement, and Station
migration do not change evidence identity.

The join is fail-closed and precedes finality. A statement or checkpoint may
arrive first, but unmatched material remains within immutable pending-count,
pending-byte, and pending-window bounds and causes no application delivery or
peer-state transition. Loss retries the same canonical signed checkpoint
idempotently. A checkpoint is self-authenticating and never creates a
confirmation or another checkpoint, closing recursive control traffic.
Single-statement checkpoints preserve progress; bounded batches amortize
identity context, signature bytes, framing, verification, and radio wakeups.

The transferable package consists of checkpoint, disclosed statements, and the
bounded Endpoint Identity continuity material needed to resolve evidence-purpose
keys. A current Station, Route, session, capability cache, or directory cannot
be the permanent key authority. Successful verification attributes exact
statements to an authorized Endpoint key state. It does not prove human intent,
statement truth, legal responsibility, trusted time, uncompromised keys, or a
counterparty statement never signed. A malicious peer cannot be forced to make
a future acceptance or effect statement, and silence is never evidence.

Session authentication, handshake proof, Station Signal, and Station signature
retain their narrower roles and cannot be presented as transferable Endpoint
authorship. The [Transferable Evidence Checkpoint Algorithm
Decision](docs/algorithm-decisions/transferable-evidence-checkpoint.md) now
closes the canonical projection, digest and signature set, identity
continuity, checkpoint-before-finality, vector, and resource procedure. The
linked Evidence and Reliable Exchange sources close those definitions without
making a runtime or delivery claim.

### 7. Station-facing carrier and delivery

The station-facing contract treats endpoint packets as opaque. Endpoint
implementations execute the pinned Pairwise Protection, Generic Messaging, and
Reliable Exchange contracts and place the resulting protected record directly
in the Transport Profile's raw binary body. The Transport Profile selects the
outer parser and places the short-lived opaque Delivery Handle in its request
target. The station-facing layer defines bounded opaque carriage, minimum
routing, bounded store-and-forward for an offline receiving Endpoint,
failure-closed input handling, and non-authoritative Station Signals.

An idempotent `AFFILIATE` operation accepts an exact descriptor digest and
opaque identity-bound commitment and returns `affiliationNotAfter` plus the
Station affiliation signature. An asynchronous `RESERVE` presents that same
commitment and returns `serviceUntil`, a private Delivery Handle, and
`stationServiceSignature`. The Route signature covers the descriptor,
commitment, Transport Profile, Handle, and service bound. A service bound later
than either descriptor expiry or matched affiliation expiry is invalid rather
than silently capped; a valid Route may be shortened by `routeNotAfter`.

The approved target has no JSON Outer Envelope, sender-supplied transport
Envelope identifier, or absolute `expiresAt` body field. It exposes to a
Station during packet submission only a short-lived opaque Delivery Handle,
the actual body length
inherent in Transport Profile framing, and transport information required for
the next action. AFFILIATE and asynchronous RESERVE expose only the bounded
commitment, descriptor/profile context, operation identity, and Station-issued
validity/signature values needed for those control actions; they do not expose
the nonce opening, Endpoint identity, or complete affiliation set. There is no independent `packetLength` field or duplicate
length authority. A future byte-stream profile may define a bounded native
length prefix as framing, not as a generic message field. This decision leaves
minimum packet capacity and optional larger packet capabilities to separate
Transport Profile work. Attachment chunking and selective recovery remain
Endpoint-protected Generic Messaging and Reliable Exchange semantics; a
Transport Profile may bound opaque packets but cannot regrid an attachment or
reinterpret its recovery state. The target
does not expose Endpoint identity, Generic Message class, application
namespace, logical Message identity, confirmation state, or verification
state. First-contact delivery specializes the same Delivery Handle as a
non-enumerable, unlinkable, purpose-scoped, short-lived, single-use routing
capability rather than adding a stable address or independent token field.
The handle authorizes only a bounded routing attempt; Endpoint-protected
handshake data validates identity and invitation purpose. The fixed storage
window is profile semantics and requires no request field.

The current Protocol Line Candidate defines Generic Messaging, Reliable
Exchange, delivery-handle semantics, identity, discovery, and the HTTPS
Transport Profile through their closed manifests, registries, schemas, CDDL,
bounds, and definition-level corpora. It requires Pairwise Protection for any
future executable composition, but that mandatory capability remains
`PARTIAL` with no active Profile, wire, or corpus.

### 8. Transport Profiles

A Transport Profile is a named carrier contract for bounded protected
packet submission, store-and-forward, retrieval, routing, raw-body framing,
and failure semantics. The current Protocol Line defines an
HTTPS-over-TLS-1.3 mandatory baseline. Its exact profile identity, certificate
and name validation, HTTP version, methods, paths, framing, bounds, retry,
replayable-operation restrictions, response classification, and failure
handling are closed by the Transport Profile sources.

The mandatory profile accepts a conformant opaque packet for bounded
store-and-forward and make it retrievable by the target Endpoint when sender
and receiver are not simultaneously online. Its contract bounds retention,
packet and queue-facing work, defines typed rejection and ambiguous outcomes,
and prevents retry amplification. A conforming Station implements
these observable semantics, but an Endpoint's adversary model still assumes
the Station may violate them by dropping, delaying, replaying, suppressing, or
misreporting packets. Station possession never advances protected Endpoint
state; Reliable Exchange remains authoritative until Endpoint-controlled
evidence arrives.

The storage window is one exact Transport Profile constant, not a request
field. A Station unable to honor it rejects the submission before acceptance.
After acceptance, the fixed window is a conformance obligation, while Endpoint
security still assumes a malicious Station may discard early or retain a copy
longer. Protected Endpoint acceptance time remains independent.

The baseline submission response is one Transport-Profile-native typed
outcome: accepted, rejected, transient failure, or ambiguous. It has no
standalone receipt field, response-body token, or pollable receipt resource.
For an HTTP profile, the outcome belongs to native response status semantics;
another carrier must define one equivalent native mechanism. Exact carrier
codes and retry mapping are defined by the profile. Polling or cancellation
may introduce a Station-generated resource handle only through a separate
field decision and cannot turn that handle into Endpoint evidence.

Transport encryption is defense in depth and can reduce exposure on one hop;
it does not replace Pairwise Protection or create Endpoint Confirmation.
HTTP versions, direct paths, relays, and future carriers must not change
Generic Messaging or Reliable Exchange meaning. Internal broker, database,
queue, and product API identifiers are forbidden from becoming federation
contracts.

The baseline deliberately favors latency, bandwidth, allocation, battery, and
operational simplicity over traffic-shape concealment. A Station, carrier, or
outside observer can correlate actual protected-packet length, emission time,
frequency, route, and relationship activity. No profile in the approved vision
adds discretionary traffic-shaping bytes, artificial delay, synthetic
messages, or mandatory periodic keepalive, and no anonymity or unlinkability
claim follows from Pairwise Protection. Runtime execution and operation belong
to downstream owners.

### 9. Capability versioning and source closure

Pairwise Protection, Generic Messaging, Group Collaboration, Reliable
Exchange, and Transport Profiles evolve as separately versioned capabilities
with independent source closures, definition-level corpora, and adversarial
cases. One capability's source closure never closes another.
A Protocol Line manifest binds one closed reviewed composition, its
minimum-safe policy, handshake transcript binding, and session lock. Mixed-line
execution, component fallback, translators, and dual wires are forbidden. The
algorithm records, capability identifiers, field schemas, CDDL, machine
corpora, and generated bundle form one definition graph.

## Cryptographic definition boundary

LicoArc owns cryptographic composition, profile identifiers, algorithms,
parameters, encodings, key schedules, transcript and associated-data bindings,
state transitions, failure behavior, minimum-safe lifecycle, normative resource
bounds, and source-derived vectors. It does not own or select language
providers. A downstream provider must execute the pinned definition and cannot
mint identifiers, choose a different suite, reinterpret results, or negotiate
on an Endpoint's behalf.

## Repository architecture

This repository contains Protocol Layer authorities and verifiable protocol
data, not runtime implementation code. Only directories with current
authoritative content are created:

```text
spec/
  README.md
  v1/
    manifest.json
    requirement-registry.schema.json
    relay/
      envelope.schema.json
      field-registry.json
      field-registry.schema.json
      governance.policy.json
      requirements.json
conformance/
  v1/
    relay/
      manifest.json
      valid.json
      invalid.json
artifacts/
  v1/
    licoarc.bundle.json
docs/
  adrs/
  conformance/
  examples/
  field-decisions/
  protocols/
  plans/        # ignored local drafts
tests/
tools/
```

Specifications are grouped by capability. Schemas, field classifications,
normative requirement registries, policies, definition-level conformance
material, generated artifacts, explanatory documentation, and public field
reviews remain distinct authorities. Local research is untracked. Empty future
`transport/` or `crypto/` trees are not created before they have owned content.

## Artifact pipeline

The approved target separates two representations. Governance and release
sources are restricted JSON canonicalized with JCS, validated by JSON Schema,
content-addressed through OCI, authorized with DSSE, and distributed under
TUF-style threshold metadata. Endpoint runtime sources are closed CDDL and
deterministic CBOR with compact unsigned-integer labels and definite lengths;
Station submission carries raw `protectedPacket` bodies. The
two source families meet only through the closed Protocol Line manifest and
cannot substitute for or translate one another.

```text
spec/vN/manifest.json
        │
        ├── spec/vN/<capability>/*
        └── conformance/vN/<capability>/*
                         │
             tools/generate-artifact.mjs
                         │
             artifacts/vN/licoarc.bundle.json
                         │
               tests/conformance.test.mjs
```

The source manifest is explicit, versioned, and embedded into the bundle. For
v1, both manifest and bundle declare exact wire ID `licoarc.protocol-line.v1` and
lifecycle `Candidate`. The bundle digest binds those identity fields, its
artifact version, digest algorithm, manifest, machine specifications, policies,
requirement source bindings and evidence mappings, and conformance corpus.
Source-integrity checks regenerate and compare this exact artifact.

## Status authority

This architecture describes the durable definition and component boundaries.
Current definition facts are maintained only in [`docs/STATUS.md`](docs/STATUS.md).

## Dependency policy

Normative definitions may adopt stable public standards when LicoArc records
the exact required semantics. Downstream repositories own every implementation
dependency. No dependency, provider, implementation, audit, or local research
record enters the normative LicoArc source closure or defines protocol meaning.
