# Lico Arc Protocol Product

Lico Arc Protocol is LicoLand's **Protocol Layer**: the external,
implementation-neutral authority for secure endpoint exchange,
station-facing delivery, and federation governance across independently
operated human-agent collaboration spaces.

The canonical domain model contains exactly **Endpoint**, **Station**, and
**Network**. Their definitions, communication relationship, authority, and
privacy boundaries are owned only by the
[README Core Domain Model](README.md#core-domain-model); this product document
does not redefine them.

As the Protocol Layer, it owns protocol meaning: wire identifiers and
contracts, lifecycle states, closed schemas, policies, definition-level
conformance corpora, content-addressed protocol artifacts, and deterministic
governance rules. It is the sole authority for those materials. Each Protocol
Line is defined and deterministically generated from repository-owned sources.

The Protocol Layer is a definition authority, not a runtime or delivery tier.
It does not implement endpoint or station runtimes, hold
endpoint secrets, execute endpoint effects, operate a network, or define
implementation-local storage, packaging, deployment, and operation.

Downstream implementation and delivery facts belong only to their owning
repositories and channels. Repository vocabulary is defined in
[`CONTEXT.md`](CONTEXT.md).

## Product promise

Within the [Core Domain Model](README.md#core-domain-model), the protocol
defines how peer Endpoints establish authenticated sessions, protect messages,
advance ratchet state, bind authenticated context, reject stale or replayed
messages, retry without changing the protected intent, and produce
endpoint-authenticated confirmation plus transferable Endpoint attribution
across a Network.

These are approved Protocol Layer responsibilities. Endpoint products execute
a pinned Protocol Line; they do not become a second authority for its wire,
cryptographic, session, or reliable-exchange meaning.

Station and Network authority and privacy limits are inherited from the
[Core Domain Model](README.md#core-domain-model), not redefined here.

Reliable exchange means deterministic endpoint recovery and authenticated
evidence when communication succeeds. It never means that a malicious,
unavailable, partitioned, or censoring station is guaranteed to deliver.

## Final protocol vision

LicoArc defines immutable, independently implementable and independently
verifiable Protocol Lines through which any conforming Endpoint can exchange
protected information with another conforming Endpoint across any compatible
Network using independently operated, untrusted Stations. Endpoint authority
over identity continuity, keys, plaintext, peer acceptance, approval, effects,
and final evidence remains absolute; Station authority remains limited to the
exact transport commitments defined by the Protocol Line; Network authority
remains limited to interoperability context.

The final protocol is portable across Endpoint and Station implementations,
repositories, products, languages, libraries, Providers, deployment models,
account systems, storage engines, and hosted services. None of those may
define a field, algorithm, state transition, error, trust decision, lifecycle,
or compatibility meaning. They may implement the protocol or submit evidence
and proposals, but every semantic change must be independently justified,
decided and specified from LicoArc-owned sources.

Every admitted field must make one necessary, explicit contribution to this
vision. Every excluded or profile-owned value must preserve a named vision
property by remaining absent or at its correct layer. Comparative protocols,
standards, libraries, and implementations are evidence only; they cannot be
the purpose of a LicoArc field or fill a missing part of its semantics.

## First release target

The first complete Protocol Line targets the full approved collaboration
closure: independent Endpoints establish authenticated sessions; exchange the
six Generic Message classes, opaque Payloads, resumable large binary
attachments, and mandatory transferable evidence; and perform bounded Group
collaboration through untrusted Station carriage. The same line includes the
HTTPS baseline, identity continuity and transparency, and closed governance
and certification semantics.

The [Canonical Field Registry](spec/FIELD-REGISTRY.md) is the sole authority
for exact field names, objects, semantic types, presence, visibility, and
excluded or profile-owned dispositions. Field names below summarize that
registry and cannot independently extend or reinterpret it.

- The outer envelope contains no plaintext field.
- A mandatory baseline Pairwise Protection suite fixes one complete
  asynchronous-prekey, ratchet, hybrid-authentication, sender-metadata, size,
  freshness, replay, and downgrade contract; a separately complete
  high-assurance suite strengthens its post-quantum parameters and continuous
  post-quantum recovery. Each suite defines exact implementation-neutral
  resource and wire bounds.
- Signed capability declarations select the strongest complete common
  Protection Profile, bind that selection into the authenticated handshake
  transcript, and lock it for the session. No common baseline fails closed.
- First contact establishes a protected but `unverified` peer channel.
  LicoArc carries protected Verification Records and evidence; each Endpoint
  derives and retains its own peer-verification state and decides which
  sensitive or side-effecting actions to block until separate verification.
- Endpoint Identity is the stable first segment and never contains a Station,
  domain, Provider, account, device, listener, or Delivery Handle. A separate
  Endpoint-wide Affiliation Update states the sole current primary and bounded
  alternate Station service relationships consistently across every peer.
  Relationship Route Updates then supply private Delivery Handles under that
  exact state, so migration does not change identity or reset security state.
- Generic Messaging defines the fixed application-neutral core record classes
  `event`, `request`, `response`, `error`, `cancel`, and `streamChunk`, plus
  an immutable attachment descriptor, protected attachment chunks, and
  Attachment Receive State without standardizing a product command catalog,
  storage engine, or user experience. Ordinary Payload is exact user intent:
  LicoArc authenticates and carries it but never parses, compresses, or rewrites
  it.
- Every independently key-holding device or isolated runtime is a distinct
  Endpoint. A Group is a protected versioned protocol object, not a fourth
  entity. Its bounded member set contains Endpoint references; Group Messages
  bind one exact membership state and are projected through bounded
  per-member Endpoint delivery with aggregate results. A protected Endpoint
  Association Claim is non-authoritative and cannot merge identities or prove
  a human, device, account, ownership, consent, or trust relationship.
- Durable endpoint outboxes and inboxes provide at-least-once retry semantics,
  a stable logical Message identity, endpoint deduplication, application
  idempotency inputs, bounded aggregate confirmation, selective requested
  ranges, restart recovery, and bounded out-of-order processing. Attachment
  Receive State, not routine per-chunk success confirmation, is the normal
  attachment feedback path. Reconnection,
  re-protection, session renewal, Route migration, and Station migration do
  not re-identify or regrid an active attachment.
- Semantic field names are not sent as text. Exact Protocol Lines use compact
  integer labels and enums, bind immutable line, profile, capability, and
  Endpoint identity values once during session establishment, and place hard
  numeric limits on handshake, established-record, control, retry,
  attachment-recovery, evidence, and Transport Profile overhead. Idle
  relationships emit no mandatory LicoArc keepalive or presence traffic, and
  the mandatory profiles add no discretionary traffic-shaping bytes,
  artificial delay, or synthetic messages.
- Station Received, Endpoint Accepted, and Effect Completed are three distinct
  evidence states. Every ordinary user-intent Message and every Endpoint-authored
  record that advances peer-visible affiliation, route, verification,
  acceptance, or effect state is covered by a mandatory bounded, signed
  Evidence Checkpoint before delivery or transition. Session authentication or
  a Station signal cannot substitute for that transferable evidence.
- A mandatory HTTPS-over-TLS-1.3 Transport Profile carries the same protected
  exchange semantics without becoming an endpoint identity, encryption, or
  receipt authority.
- The mandatory Transport Profile supports bounded Station store-and-forward
  when the receiving Endpoint is offline. A conforming Station provides the
  capability, but Endpoints continue to assume that an untrusted Station may
  drop, delay, replay, suppress, or misreport stored packets. The sending
  Endpoint retains Reliable Exchange responsibility until protected Endpoint
  evidence advances the message state.
- The approved target station-facing carrier has no JSON Outer Envelope. Its
  Transport Profile selects the outer parser, carries a short-lived opaque
  Delivery Handle in transport routing, and carries one bounded protected
  packet as the raw binary body. Non-conformant transport input is rejected.
- Governance and release artifacts use restricted JCS-canonical JSON with
  JSON Schema and content-addressed OCI, DSSE, and TUF controls. Endpoint
  runtime wire data uses deterministic CBOR described by closed CDDL, compact
  integer labels, definite lengths, and the raw `protectedPacket`; governance
  JSON is never an alternative Endpoint wire.
- An accepted asynchronous Delivery Handle is projected to a peer only inside
  a protected Route together with a Station-selected service upper bound and a
  Station signature over the exact descriptor, identity-bound affiliation
  commitment, Transport Profile, handle, and bound. A `firstContact` Handle is
  never eligible for a Route.
  That signature proves only issuance of a finite route capability; it does
  not authenticate the Endpoint or guarantee availability, retention,
  delivery, acceptance, or effect.
- During packet submission, a Station sees only that Delivery Handle, the
  actual body length inherent in Transport Profile framing, and transport
  information required for the next action. `AFFILIATE` and asynchronous
  `RESERVE` separately expose the minimum opaque affiliation commitment,
  descriptor/profile context, and finite Station-selected bounds required to
  issue signed service state; they never expose `endpointIdentityRef`, its
  nonce opening, or the complete affiliation set. LicoArc adds no independent
  `packetLength` field or other duplicate
  statement of that body length. This decision does not select a universal
  Transport Profile packet maximum. Endpoint-protected attachment chunking is
  separately owned by Generic Messaging and Reliable Exchange: the exact
  Protocol Line fixes one chunk grid, while each Transport Profile must admit
  its resulting bounded protected packets. The Station receives
  no sender-supplied transport Envelope identifier. The Transport Profile
  defines one fixed storage window rather than accepting a sender-supplied TTL,
  retention duration, or retention class; an absolute `expiresAt` body field
  is also excluded. A Station that cannot honor the fixed window rejects the
  submission before acceptance.
  First contact specializes that same Delivery Handle as unlinkable,
  purpose-scoped, short-lived, and single-use; it adds no independent
  invitation or first-contact token field. The handle authorizes only one
  bounded routing attempt, while Endpoint-protected handshake data validates
  identity and invitation purpose.
- Station signals remain operational hints rather than endpoint evidence.
- Each submission receives one Transport-Profile-native typed outcome:
  accepted, rejected, transient failure, or ambiguous. The baseline adds no
  standalone Station receipt field, response-body token, or pollable receipt
  resource. A future polling or cancellation capability must independently
  prove the need for a Station-generated resource handle.
- Endpoint implementations hold private keys and execute every cryptographic,
  persistence, approval, and local-effect transition required by the protocol.

An outer-envelope-only Candidate can establish the carrier foundation, but
cannot by itself satisfy this complete definition target.


## Capability ownership model

The first complete endpoint-exchange line keeps five interoperable capabilities
separate:

- **Pairwise Protection** owns each exact complete protection-profile
  identifier, reviewed suite, endpoint-authenticated handshake, transcript
  and downgrade binding, key schedule, ratchet and rekey transitions,
  associated-data contract, freshness, replay, reset, retirement semantics,
  and the numeric implementation-neutral Resource Contract. Endpoint implementations
  own private keys, entropy, protected runtime state, provider selection, and
  execution of those semantics.
- **Generic Messaging** owns application-neutral protected record classes,
  correlation and compact content-type dispatch, closed control encodings,
  bounds, and extension behavior. It carries exact opaque User Payload; it does
  not own or transform ordinary Payload semantics, nor does it own
  product-specific commands, agent adapters, approval policy, user-interface
  behavior, conversation history, or local effects.
- **Group Collaboration** owns protected Group Membership State, Group Epoch
  evolution, bounded member Endpoint references, protocol roles, Group Message
  context, bounded per-Endpoint delivery, and aggregate partial-failure
  semantics. It does not create a Group entity, merge Endpoint identities, or
  standardize product commands and permissions.
- **Reliable Exchange** owns Protected Intent and stable logical Message
  identity, at-least-once and exact-envelope retry, endpoint deduplication,
  route-change behavior, durable logical outbox and inbox transitions,
  application idempotency input and conflict, endpoint-authenticated
  acceptance and completion confirmation, and explicit transient, ambiguous,
  and terminal failure semantics. It also owns aggregate-confirmation and
  attachment-recovery traffic bounds. It does not prescribe a database,
  queue, retry scheduler, or local execution architecture.
- **Transport Profile** owns bounded submission and retrieval semantics for
  protected packets over one named carrier. Transport encryption cannot change
  protected-message meaning and never establishes endpoint
  identity, authenticity, freshness, replay status, or final receipt.

Identity and transparency supply authenticated endpoint and profile inputs to
Pairwise Protection. Portable Station affiliation and route migration supply
separate Endpoint-authenticated service state to Reliable Exchange. These
remain independently versioned capabilities so that a directory, Station,
product, or preferred network cannot silently become the endpoint trust
authority.

## Defined protocol design

This section records durable, approved definition intent. Definition maturity
is reported in [`docs/STATUS.md`](docs/STATUS.md); downstream delivery facts
are outside this repository.

The four Algorithm Decisions are now independently `DECIDED`: [baseline
Pairwise Protection](docs/algorithm-decisions/baseline-pairwise-protection-suite.md),
[high-assurance Pairwise Protection](docs/algorithm-decisions/high-assurance-pairwise-protection-suite.md),
[Group state evolution](docs/algorithm-decisions/group-state-evolution.md),
and [Transferable Evidence Checkpoint](docs/algorithm-decisions/transferable-evidence-checkpoint.md).
Their implementation-neutral Prototypes, source-derived vectors, and numeric
resource contracts are closed durable intent.

### Artifact, wire, and Protocol Line composition

Governance, certification, policy, registry, manifest, and release inputs use
a restricted JSON profile canonicalized with JCS and validated by closed JSON
Schema. Immutable distribution and authorization use content-addressed OCI,
DSSE, and TUF materials. These artifacts are review and distribution inputs;
they never become Endpoint runtime messages.

Endpoint runtime records use Protocol-Line-pinned deterministic CBOR described
by closed CDDL, compact unsigned-integer labels, definite-length values, and
raw `protectedPacket` Transport Profile bodies. Semantic registry names are
documentation only and are not transmitted as text. This approved split does
not allocate a new identifier, schema, or Candidate in the current migration.

A Protocol Line manifest is a closed compatible composition of independently
versioned capabilities. It declares exact identities, source closures,
minimum-safe policy, lifecycle, and retirement. Capability declarations and
the selected composition are bound into the authenticated handshake and
locked for the session. There is no component-wise fallback, mixed-line
session, translator, dual wire, or permanent bridge. Retirement removes the
superseded mutable line, implementation path, corpus, and compatibility entry
in one complete migration; already Published bytes remain immutable.

### Complete protection suites

Pairwise Protection defines two complete, indivisible suite levels. A
consumer selects one whole suite; it cannot negotiate an open Cartesian
product of KEM, signature, ratchet, sender-metadata, framing, or transport
components. The two algorithm decisions close the composition reflected in
the formal profile and machine-readable sources.

| Requirement | Mandatory baseline suite | High-assurance suite |
| --- | --- | --- |
| Asynchronous establishment | Signal/PQXDH-like asynchronous prekeys | Signal/PQXDH-like asynchronous prekeys with the stronger complete post-quantum parameter set |
| Session evolution | Double Ratchet | ML-KEM Braid integrated through a Triple Ratchet for continuous post-quantum key evolution |
| Post-quantum KEM | ML-KEM-768 | ML-KEM-1024 |
| Endpoint authentication | one reviewed traditional signature together with ML-DSA-65 | one reviewed traditional signature together with ML-DSA-87 |
| Sender metadata | sealed-sender-style protection is mandatory | sealed-sender-style protection is mandatory |
| Ordinary record work | bounded symmetric ratchet, key derivation, and authenticated encryption; no per-record signature or full asynchronous KEM | bounded symmetric ratchet, key derivation, and authenticated encryption; continuous post-quantum transitions occur only at profile-bounded epochs |
| Resource contract | exact CPU-work, memory, state, wire, and unauthenticated-work bounds | independent exact bounds; high assurance cannot borrow the baseline envelope |
| Traffic metadata | no discretionary traffic-shaping bytes, artificial delay, or synthetic messages; outer length and timing remain residual metadata | the same performance-first rule; stronger cryptography does not create an anonymity or traffic-analysis-resistance claim |

The selected exact construction is recorded in the [baseline Algorithm
Decision](docs/algorithm-decisions/baseline-pairwise-protection-suite.md):
X25519 plus ML-KEM-768, Ed25519 plus ML-DSA-65, HKDF-SHA-256,
ChaCha20-Poly1305, asynchronous prekeys, transcript-locked Double Ratchet,
sealed sender metadata, and bounded fail-closed replay and deletion rules.
The [high-assurance Algorithm Decision](docs/algorithm-decisions/high-assurance-pairwise-protection-suite.md)
selects X25519 plus ML-KEM-1024, Ed25519 plus ML-DSA-87, and a continuous
ML-KEM Braid/Triple-Ratchet state with its own bounds. Local lineage research
is untracked and cannot replace LicoArc authority.

The decisions freeze the Prototype, vector origin, and numeric resource
contract. One exact combination enters a Candidate definition only when its
formal profile identifier, closed machine specification, definition-level
conformance corpus, and generated Candidate artifact are created together.
Implementation, runtime validation, review, packaging, and publication are
downstream concerns and do not change that definition state.

### Capability selection and session lock

Endpoints publish signed, bounded, expiring capability declarations containing
only complete supported Protection Profiles and their lifecycle constraints.
Selection chooses the strongest mutually supported complete profile allowed by
both endpoints' minimum-safe policy. The two declarations, chosen profile,
roles, endpoint identities, handshake purpose, and Protocol Line enter
the authenticated handshake transcript. The result is locked for the session:
no mid-session component substitution, silent fallback, or downgrade is
permitted. If the endpoints have no common mandatory baseline profile,
establishment fails closed.

The handshake carries and authenticates `protocolLineId`,
`protectionProfileId`, each applicable `capabilityDigest`, and
`endpointIdentityRef` once. Established records inherit those immutable
bindings and reject their repetition. Removing four stable 32-octet values
from the ordinary record path does not weaken their authority or continuity.

### Identity transparency and first contact

Identity Transparency defines non-enumerable proofs for endpoint keys,
profile commitments, authorized rotations, revocations, and recovery events.
Independent witnesses and endpoint gossip detect split views without turning
one directory, witness, Station, or product into a trust root. A rotation must
prove continuity from the last accepted endpoint state. When continuity
cannot be established, the peer is a new Endpoint and requires explicit
re-pairing.

First contact may create a protected channel whose Endpoint-local
peer-verification state begins as `unverified`. LicoArc defines protected,
replay-resistant Verification Records and evidence inputs, but no peer-supplied
field can directly set local trust. Each Endpoint applies its own local policy
to protected but unverified relationships and decides which operations require
accepted QR, short-authentication-string, or trusted-identity evidence.

### Portable Station affiliation and route migration

Endpoint Identity and Station affiliation are separate protocol segments. A
stable `endpointIdentityRef` survives Station replacement. An
Endpoint Affiliation Update is one global atomic snapshot: its first
`StationAffiliation` is the sole primary Station, later unique Stations are
alternates, and empty means explicitly unaffiliated. `affiliationEpoch` starts
at one, advances by exactly one, and each successor binds the immediate
canonical predecessor. Every peer must receive the same logical state for one
epoch; different same-epoch states are Endpoint equivocation.

The Station-facing `AFFILIATE` operation receives an opaque
`affiliationCommitment`, exact descriptor digest, and idempotent operation ID.
The commitment is a randomized digest of Endpoint identity, Protocol Line,
stable `stationId`, and an Endpoint-held nonce. The Station sees only the
commitment and signs it with a finite `affiliationNotAfter`; peers receive the
nonce under protection and recompute the binding. This prevents copying B's
statement to another Endpoint identity without exposing that identity to B.

Relationship-scoped Route Updates remain separate because Delivery Handles
may be private to one peer. Each names one exact `affiliationStateDigest` and
contains only Routes whose Station identity and commitment occur in that
state. Each Route also carries B's separate signature over its descriptor,
affiliation commitment, Transport Profile, asynchronous Delivery Handle, and
`serviceUntil`. Route order is attempt preference, never global affiliation
authority.

A migration from A to B first advances the global snapshot from `{A}` to
`{B}` or through the overlap `{B,A}`, then advances each peer Route chain to
the new affiliation digest and B-issued Handles. Endpoint identity, global and
relationship high-water marks, sessions where the Protection Profile permits,
and stable Protected Intent remain intact. B must accept the new commitment;
A is not asked to release, approve, forward, delete, or otherwise authorize
the move. A Station, directory, timestamp, arrival order, expiry, `networkId`,
or `providerId` cannot select or reset either state chain.

### Generic messaging, reliability, and transferable evidence

The Generic Message core is closed to `event`, `request`, `response`, `error`,
`cancel`, and `streamChunk`, plus an attachment descriptor. Product semantics
use namespaced extensions and ordinary `contentType` values and remain opaque
to the Protocol Layer. The mandatory `payload` byte string is exact User
Payload: LicoArc authenticates and carries it without parsing, compression,
normalization, or rewrite. Only reserved LicoArc control `contentType` values
select protocol-owned bounded grammars. The first bounded interoperability
closure includes resumable large binary attachments as immutable descriptors
plus Endpoint-protected raw-byte chunks. Station-to-Station protocol
semantics remain outside this endpoint protocol.

The exact Protocol Line fixes one attachment chunk size rather than accepting
a sender-selected field. The declaring Message plus `attachmentId` identifies
the attachment; `chunkIndex` adds immutable chunk identity and binds exactly
one stable chunk `messageId` and raw-byte slice. A different Message identity
or Payload under that tuple is terminal. `byteLength` derives count, offset,
and final length, while `contentDigest` is the sole whole-attachment integrity
and completion authority. Attachment chunks never carry `chunkFinal`, count,
offset, length, per-chunk digest, transfer ID, or resume token fields.
The declaring Message's Transferable Statement commits the complete descriptor
and its `contentDigest`, so ordinary attachment chunks and non-empty recovery
updates do not each pay for a separate Evidence Checkpoint. The final empty
receive state that reports complete-content verification is a Transferable
Statement and requires one checkpoint before attachment completion advances.

The receiving Endpoint can send protected Attachment Receive State bound to
the declaring Message. A bounded canonical `requestedChunkRanges` set requests
only needed indexes after interruption or restart. Empty state is valid only
after every chunk and exact length are durably accepted and the final digest
verifies. The exact Protocol Line fixes `MAX_ATTACHMENT_BYTES`,
`ATTACHMENT_CHUNK_BYTES`, `MAX_ATTACHMENT_CHUNKS`, `MAX_REQUEST_RANGES`, and
`MAX_REQUESTED_CHUNKS`. It also fixes lifetime maxima for state updates,
recovery rounds, retransmitted chunks, and attachment control bytes. No
successful chunk produces a routine Endpoint Confirmation. Non-empty Receive
State requests a bounded missing batch; empty verified Receive State is the
sole routine success report. Exceptional chunk rejection or failure may still
use a confirmation. Successive bounded state Messages can request further
missing batches only while every lifetime bound remains available.
Sender and receiver preserve payload checkpoints through the fixed
`ATTACHMENT_RECOVERY_WINDOW`, and preserve terminal results and deduplication
tombstones until that window ends. Retry, restart, session renewal, Route
change, Station migration, and replay cannot reset or extend that window, and
stale state cannot reopen a terminal attachment. This makes recovery selective
without making storage layout, retry scheduling, or Station queue state
protocol authority.

Reliable Exchange uses at-least-once transmission and delivery semantics when
a conforming path is available. A stable logical Message identifier survives
retry; endpoints deduplicate that identity, while applications receive an
idempotency input and remain responsible for idempotent effects. Route changes
advance the authenticated predecessor chain and may allocate a new transport
unit without creating a second logical Message or authorizing a second effect.
One bounded canonical `confirmedMessageIds` array can share one stage, outcome,
and failure code across Messages with the same result. Different results use
separate records, preserving per-Message evidence while amortizing framing,
protection tags, and result metadata.

User Payload size is controlled only by the application within the exact line
bound and is not a protocol optimization target. LicoArc Protocol Overhead is
all required wire bytes other than the first transmission of those ordinary
Payload bytes; retransmitted Payload counts as overhead. Every exact Protocol
Line fixes separate maxima for capability declarations, handshakes,
established-record expansion, control records and transitions, confirmations,
retries, attachment recovery, Evidence Checkpoint statements,
signatures, encoded bytes, pending state, and Transport Profile operations.
Canonical byte accounting enforces the maxima, so no self-reported length,
compression selector, acknowledgement mode, evidence selector, retry budget,
or traffic-shaping preference is sent.

Evidence has three non-substitutable stages:

1. **Station Received** — a non-authoritative transport hint.
2. **Endpoint Accepted** — a checkpoint-covered Endpoint statement that the
   protected record was durably accepted and deduplicated.
3. **Effect Completed** — a checkpoint-covered Endpoint statement that the
   application completed the referenced local effect.

An Evidence Checkpoint is a distinct protected record containing the exact
Protocol Line, signer and counterparty Endpoint identities, the signer's exact
Identity continuity-state digest, a bounded sorted unique set of canonical
Transferable Statement digests, and the line-required signature set. The
statement projection includes exact User Payload and state-transition meaning
but excludes session lookup, protection framing, ciphertext, retry,
Route, and Station carriage. Re-protection, reconnect, Route replacement, and
Station migration therefore do not rewrite evidence.

The protocol closes the unsigned-tail failure: a covered record may arrive
before or after its checkpoint, but it remains within immutable pending-count,
pending-byte, and pending-window bounds and cannot be delivered to an
application or advance peer-visible durable state until both validate. Loss
allows idempotent retransmission of the same signed checkpoint, never unsigned
fallback. A single-statement checkpoint guarantees progress; larger bounded
batches amortize identities, signature bytes, framing, and mobile public-key
work. A checkpoint is self-authenticating and never confirms or evidences
itself.

This is Technical Non-Repudiation with a deliberately exact limit: a disclosed
checkpoint, statements, and bounded Endpoint Identity continuity bundle let an
independent verifier attribute those exact statements to the authorized
Endpoint key state. They do not prove a natural person's intent, statement
truth, legal responsibility, trustworthy wall-clock time, uncompromised key
custody, or a counterparty statement that was never signed. A malicious or
unavailable Endpoint cannot be forced to produce a future acceptance or effect
statement; absence of evidence never becomes evidence. Session authenticators,
ratchet tags, handshakes, Station receipts, and Station signatures cannot be
silently reinterpreted as transferable Endpoint proof.

The [Transferable Evidence Checkpoint Algorithm Decision](docs/algorithm-decisions/transferable-evidence-checkpoint.md)
now closes the implementation-neutral projection, SHA-256 digest set,
Ed25519 plus ML-DSA-65 signature set, identity-continuity resolution,
checkpoint-before-finality join, pending-state limits, and source-derived
vectors. The Evidence Profile schema and definition-level corpus close its
machine-readable protocol meaning.

### Group collaboration

Group collaboration reuses the six Generic Message classes, opaque Payload,
attachments, Reliable Exchange, and mandatory Evidence Checkpoints. A Group
is a protected versioned object whose bounded members are Endpoints. Every
independently key-holding participant is therefore a separate Endpoint even
when one person controls several of them; no User, Device, or Group entity is
added to the core domain model.

The [Group State Evolution Algorithm Decision](docs/algorithm-decisions/group-state-evolution.md)
now closes the canonical `(groupId, epoch, predecessorDigest, members, roles,
transitionDigest)` procedure, exact-successor and fork rules, bounded
recipient projection, and resource contract.  The corresponding Group Message
Field Decisions remain independent; no Group field may enter the active Field
Registry, schema, CDDL, Candidate, or conformance corpus until those field
records decide their own questions.

One logical Group Message is projected into bounded per-member Endpoint
deliveries. Reliable Exchange remains at least once for each member, with
Endpoint deduplication, explicit partial failure, and bounded aggregation of
member results and Evidence Checkpoints. A Station never becomes a Group
member, membership authority, ordering authority, or group-key authority.

An Endpoint Association Claim may later carry a protected, non-authoritative
association among Endpoints. Recipients apply local policy; the claim cannot
merge Endpoint identities or prove shared human identity, device ownership,
account control, consent, trust, or product permissions. Product actions and
permission vocabularies continue as namespaced opaque Payload.

### Transport, visible metadata, and endpoint state

The mandatory baseline Transport Profile is HTTPS over TLS 1.3. It defines
certificate and name validation, method and path semantics, framing, bounds,
retry, replayable-operation restrictions, response classification, and failure
handling. TLS protects one carrier hop and never replaces Pairwise Protection.

The baseline also provides bounded store-and-forward for an offline receiving
Endpoint. LicoArc will specify the observable submission, bounded retention,
retrieval, deletion transition, typed failure, and Station Signal semantics;
the Station chooses its storage engine, scheduling, and local quota policy.
Station acceptance or queue possession is never Endpoint acceptance, final
receipt, freshness, replay rejection, or proof of deletion. The sending
Endpoint keeps its durable outbox and retry responsibility until protected
Endpoint evidence advances Reliable Exchange state.

The profile fixes one mandatory storage window for every accepted submission.
There is no per-submission TTL, retention duration, or retention-class field.
A Station that cannot honor the fixed window rejects before acceptance; after
acceptance, conformance requires the window even though Endpoint threat models
still assume a malicious Station may violate it. Endpoint-protected acceptance
time remains separate and cannot be inferred from the Station window.

The HTTPS baseline is deliberately performance-first. It adds no
discretionary traffic-shaping bytes, artificial emission delay, synthetic
messages, or mandatory periodic keepalive. A Station, carrier, or outside
observer may correlate actual packet lengths, timing, frequency, routes, and
relationship activity. Pairwise Protection preserves content security, not
anonymity, unlinkability, or traffic-analysis resistance.

The approved future station-facing carrier is not a JSON Outer Envelope. The
selected Transport Profile owns its parser discriminator and request target;
the request target carries a short-lived opaque Delivery Handle, while the raw
binary body carries exactly one bounded protected packet. There is no
sender-supplied transport Envelope identifier, absolute `expiresAt` body
field, or per-submission TTL. The Transport Profile instead fixes one storage
window for accepted submissions. First contact uses no independent token
field: the Delivery Handle is specialized as unlinkable across scopes, bound
to one purpose and audience, short-lived, single-use, expiring, and
non-enumerable. It authorizes routing only; the protected handshake validates
Endpoint identity and invitation purpose.

LicoArc specifies protocol-visible key deletion points, anti-rollback
transitions, and hard bounds for skipped-message keys, replay state,
transparency proofs, capability declarations, prekeys, and caches. Endpoint
implementations enforce those obligations while retaining ownership of user
history, backup, local retention, user interaction, storage-engine choice, and
cleanup scheduling. A provider is replaceable implementation plumbing: no
provider name, endpoint, certificate, plugin, or vendor identifier becomes
protocol data, Endpoint identity, or a trust root.

Pairwise Protection, Generic Messaging, Group Collaboration, Reliable
Exchange, and Transport Profiles have separate capability versions, source
closures, and definition-level corpora. A Protocol Line manifest binds one
reviewed compatible composition; no capability inherits another's version.

### Governance definition

Governance uses multiple independent roots and threshold authorization so no
single operator, Station, Network Host, artifact service, signer, or committee
member can define federation or Protocol Line truth alone. Threshold-approved
artifacts are bounded, expiring, rollback-resistant, content-addressed, and
independently reviewable. Transparency and consistency evidence expose
equivocation, rotation, revocation, compromise, and recovery, while each
Endpoint retains the final local trust and admission decision.

LicoArc defines the authorization semantics and signed objects. Applying those
semantics to a publication or federation is a downstream governance action,
not a repository closure condition.

## Protocol Layer scope

Lico Arc Protocol owns only implementation-neutral protocol semantics and
their verifiable data:

- the normative Pairwise Protection profile registry, including cipher-suite
  identifiers, handshake and transcript rules, ratchet state transitions,
  authenticated associated data, freshness, replay, rekey, reset, downgrade,
  retirement semantics, protocol-overhead bounds, and normative resource
  envelopes;
- the six Generic Messaging core record identities, immutable attachment
  descriptor, protected chunk and receive-state semantics, closed encodings,
  User Payload boundary, bounds, correlation, and namespaced
  application-extension rules;
- protected Group collaboration semantics, including bounded membership
  state, Endpoint members, epoch succession, roles, Group Message context,
  per-member Reliable Exchange, partial failure, and aggregate evidence;
- reliable exchange semantics, including intent and message identifiers,
  at-least-once and exact protected-envelope retransmission, endpoint
  deduplication, application idempotency inputs and conflict handling,
  aggregate confirmations, resumable attachment checkpoints and requested
  ranges, durable endpoint
  outbox and inbox transitions, three-stage authenticated evidence, and
  explicit ambiguous and terminal failure states;
- the single station-facing outer protocol and its version lifecycle;
- federation identifiers, discovery, capability negotiation, and
  compatibility rules;
- named Transport Profiles, an HTTPS-over-TLS-1.3 mandatory baseline,
  station-neutral carrier semantics, and explicit limits on Station authority;
- the restricted JCS/JSON governance-artifact representation and deterministic
  CBOR/CDDL Endpoint runtime-wire representation;
- federation membership, certification, revocation, committee, and
  governance-bundle rules;
- implementation-neutral definition-level conformance material; and
- immutable, content-addressed Protocol Line representation.

## Authority boundary

- Normative schemas, policies, manifests, registries, conformance corpora,
  lifecycle records, and generated protocol artifacts are owned here.
- A Protocol Line definition is internally closed only by its declared source
  integrity checks: schema, registry, policy, corpus, deterministic generation,
  and digest consistency.
- The three core domain entities and their trust boundaries are defined only
  by the [README Core Domain Model](README.md#core-domain-model). Their runtime
  code, private state, infrastructure, deployment, and operation are not
  Protocol Layer components.
- Endpoint products may contribute proposals, but
  a product-local profile, wire format, state machine, fixture, or compatibility
  path is never a normative Lico Arc input unless it is deliberately specified,
  reviewed, and specified through a LicoArc-owned Protocol Line.
- internal brokers, databases, queues, object stores, deployment platforms,
  blockchain,
  tokens, and global total order are not mandatory wire authorities.

## Trust partition

The authoritative trust partition is the
[README Core Domain Model](README.md#core-domain-model). Product capabilities
must not add a fourth entity or delegate an Endpoint's runtime security or
privacy authority.

## Official network boundary

The authoritative Network definition and non-authority boundary are in the
[README Core Domain Model](README.md#core-domain-model). A named hosted network
is only an operational realization or convenience entry and does not create a
new LicoArc entity type.

## Security evolution mandate

Every protection-related protocol decision assumes globally distributed,
coordinated, adaptive, and persistently hostile stations. Protocol evolution
must prefer reviewed standards and independent implementations, minimize
metadata, fail closed, resist downgrade, and keep profiles replaceable.

This is a continuing engineering mandate, not a promise of absolute security.
Lico Arc Protocol owns exact, versioned cryptographic profiles and their safe
transition semantics; it must select reviewed standards, define source-derived
vectors, and close exact definition-level conformance cases rather than
inventing cryptography.
Endpoint implementations own key material, entropy, protected state, and
execution. Stations remain outside the endpoint security authority, and no
protocol profile may turn a station acknowledgement into proof of endpoint
receipt or effect completion.

## License

Repository source and specifications use GPL-3.0-or-later. See
[`LICENSE`](LICENSE).
