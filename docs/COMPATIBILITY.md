# Lico Arc Protocol Compatibility Policy

## Versioning model

Lico Arc Protocol defines versioned contract lines. Each line has an
explicit manifest under `spec/`, capability-grouped schemas, field and
requirement registries, and policies,
matching `conformance/` corpora, and a generated content-addressed bundle
under `artifacts/`. Only an explicitly Published Protocol Line is immutable.
The current repository line is the Candidate
`licoarc.protocol-line.v1` definition. See [`STATUS.md`](STATUS.md) for its
definition status.

## Forward compatibility

No version of Lico Arc Protocol has been published. Until an explicitly
authorized publication produces a Published Protocol Line, all Candidate
sources, schemas, field and requirement registries, policies, corpora, and generated artifacts may
change without forward compatibility. Consumers that evaluate a Candidate
snapshot pin its exact artifact digest and must not assume that a future
Candidate or Published Line will accept the same wire input.

After publication, forward compatibility is not guaranteed across major
version boundaries. A consumer of a Published v1 Protocol Line has no
compatibility claim against a future v2 Protocol Line. Each major version
defines its own closed wire contract, conformance corpus, and consumer
artifact. Consumers migrate explicitly and reject any contract version they
did not pin.

## Rules

- Candidate sources and generated artifacts may change through reviewed source
  changes and deterministic regeneration. An exact digest pins one Candidate
  snapshot; it does not make the Candidate line immutable.
- A Published Protocol Line is immutable. Corrections and extensions ship as a
  new version.
- Implementations pin an exact artifact and verify its `digest` before
  relying on its contents. In `v1`, SHA-256 binds the canonical
  `artifactVersion`, `wireId`, `lifecycle`, `digestAlgorithm`, and embedded
  sources.
- Consumers must treat `additionalProperties: false` as normative: an
  envelope with unknown fields is non-conformant.
- Consumers must satisfy every stable requirement ID in the pinned Protocol
  Line. Each requirement is bound to its owning source facts and mapped
  exactly once to common executable conformance evidence.
- The governance policy's required capabilities are the minimum wire behavior
  a conformant station-facing carrier supports; forbidden authority capabilities must never
  appear. Storage, retry, lease, acknowledgement, quota, cleanup, and service
  availability remain implementation-defined.
- Implementations are not required to vendor or load the LicoArc bundle at
  runtime. Wire compatibility is independent from repository and release
  cadence.

## Compatibility targets

- The complete v1 compatibility definition covers the protocol
  Line covering the protocol foundation, identity continuity and transparency,
  both indivisible Pairwise Protection suites, Generic Messaging and large
  attachments, bounded Group collaboration, Reliable Exchange and mandatory
  Evidence Checkpoints, the HTTPS Transport Profile, multi-root governance and
  certification. Compatibility is defined by the exact pinned Protocol Line,
  not by a particular implementation or delivery result.
- The defined carrier has no JSON Outer Envelope. Transport
  routing carries one short-lived opaque Delivery Handle, the raw binary body
  carries one bounded protected packet, and no sender-supplied transport
  Envelope identifier or absolute body expiry is present. Its exact semantics
  are defined by the [Canonical Field Registry](../spec/FIELD-REGISTRY.md),
  Transport Profile, schemas, and corpora.
- First contact reuses a purpose-scoped, short-lived, single-use specialization
  of that Delivery Handle and adds no independent invitation-token field.
  Its lifecycle constants, Transport Profile, and protected handshake bindings
  are part of the pinned Protocol Line.
- Pairwise Protection exposes a mandatory baseline and a separately
  complete high-assurance suite. Each exact profile identity, asynchronous
  prekey construction, KEM, traditional and post-quantum signatures, handshake
  and transcript, key schedule, ratchet, sender-metadata protection, record
  framing, associated data, freshness, replay,
  downgrade, reset, retirement, Protocol Overhead, and normative resource
  semantics form one atomic compatibility contract. Independent components are
  never negotiated as an open Cartesian product.
- Signed capability declarations select the strongest complete common profile
  allowed by both endpoints, bind both declarations and the selection into the
  handshake transcript, and lock the result for the session. No common
  mandatory baseline is a closed failure, not permission to downgrade.
  `protocolLineId`, `protectionProfileId`, applicable `capabilityDigest` values,
  and `endpointIdentityRef` occur in authenticated establishment and are
  inherited, not repeated, by established records.
- Generic Messaging compatibility is agreement on application-neutral
  `event`, `request`, `response`, `error`, `cancel`, and `streamChunk`
  records; compact `contentType` dispatch; exact opaque User Payload;
  immutable attachment descriptors; Protocol-Line-fixed chunk geometry;
  raw-byte chunk Payload; Attachment Receive State; closed Control Payload
  encoding, bounds, correlation, and namespaced extension behavior. LicoArc
  does not parse, compress, normalize, or rewrite ordinary User Payload. Product command
  names, storage layout, user-interface events, approval rules, and local
  effects are not protocol compatibility.
- Group Collaboration compatibility is agreement on a protected bounded Group
  Membership State, exact state succession, member Endpoint references,
  admitted protocol roles, Group Message context, bounded per-member
  at-least-once delivery, explicit partial failure, and aggregate Endpoint
  evidence. A Group is not a core entity, and a protected Endpoint Association
  Claim cannot merge identities or prove a human, device, account, ownership,
  consent, or trust relationship.
- Reliable Exchange compatibility is agreement on Protected Intent and
  Message identity, exact-envelope retry, route-change rules, idempotency
  conflict, stable attachment-root and chunk identity, bounded aggregate
  Endpoint Confirmation, Attachment Receive State as the sole normal progress
  and verified-completion path, bounded canonical requested ranges,
  descriptor-derived completion, lifetime state-update, recovery-round,
  retransmission and control-byte maxima, restart and Route-migration recovery,
  a fixed non-refreshable recovery window, absorbing completion and failure, and typed failure
  semantics. It never means exactly-once effects, unbounded file size, or
  guaranteed Station delivery.
- Transferable Evidence compatibility is agreement on the distinct
  `evidenceCheckpoint` record, exact Protocol Line, signer and counterparty
  Endpoint identities, signing Identity-state resolution, canonical
  Transferable Statement projections, domain-separated digests, bounded sorted
  statement sets, exact signature-profile set, checkpoint-before-finality,
  bounded out-of-order pending joins, idempotent retry, no recursive evidence,
  attachment-root exclusion from per-chunk signing, and one checkpoint for the
  final empty receive state after complete-content verification. It provides
  technical Endpoint attribution only and never implies human intent, statement truth,
  trusted time, uncompromised keys, legal responsibility, or guaranteed peer
  cooperation. A session authenticator, Station signal, time field, per-record
  selector, or extension alias cannot create a compatible alternative.
- Protocol Overhead compatibility is agreement on compact integer labels and
  enums, canonical byte accounting, and every immutable declaration,
  handshake, established-record, control, confirmation, evidence statement,
  evidence signature, pending join, retry, attachment-recovery, and
  Transport Profile bound. The first transmission of ordinary User Payload is
  excluded; retransmitted Payload is included. A self-reported length,
  compression selector, sender-selected budget, evidence selector, or idle
  keepalive cannot create an alternative compatible form.
- A Transport Profile changes only bounded station-facing protected-packet
  carriage and transport failure semantics. It cannot change Pairwise Protection, Generic
  Messaging, Reliable Exchange, endpoint identity, or confirmation meaning.
  The planned mandatory baseline is HTTPS over
  TLS 1.3 with bounded Station store-and-forward for an
  offline receiving Endpoint; no formal profile identity, bound, or wire
  contract exists yet. Station storage remains non-authoritative, and Endpoint
  retry continues until protected Reliable Exchange evidence advances state.
  The profile uses one fixed storage window for accepted submissions and no
  sender-supplied TTL, duration, or retention-class field; inability to honor
  the window is a pre-acceptance rejection. It also fixes one per-operation
  overhead bound. The baseline adds no discretionary traffic-shaping bytes,
  artificial delay, synthetic messages, presence traffic, or periodic
  keepalive. Actual protected-packet length, timing, frequency, route, and
  relationship activity remain observable residual metadata; no anonymity,
  unlinkability, or traffic-analysis-resistance claim is made.
- Pairwise Protection, Generic Messaging, Group Collaboration, Reliable
  Exchange, the Evidence Profile, and Transport Profiles have separate
  capability versions and definition-level corpora. A Protocol Line
  manifest binds one closed compatible set with a minimum-safe policy,
  handshake digest binding, and session lock; compatibility of
  one never implies compatibility or verification of another. Mixed-line
  execution, component fallback, translators, dual wires, and permanent
  bridges are incompatible.
- Governance compatibility uses restricted JCS-canonical JSON and closed JSON
  Schema for manifests, policies, registries, and release inputs, with OCI,
  DSSE, and TUF distribution and authorization controls. Endpoint runtime wire
  compatibility instead uses closed CDDL and deterministic CBOR with compact
  integer labels and raw `protectedPacket` bodies. Neither representation is a
  compatibility form of the other.
- Federation and publication governance requires multiple independent roots
  and threshold authorization. No single operator, Station, Network Host,
  signer, or artifact service is sufficient, and each Endpoint retains final
  local trust and admission authority.
- Every protection or transport profile must remain versioned and replaceable
  under continuous adversarial strengthening, reject unknown, retired, or
  downgrade-selected input, and provide an explicit minimum-safe-version
  policy. Compatibility never grants a Station cryptographic authority.
- A product-local preview profile, wire, fixture, or state machine is
  non-authoritative historical implementation evidence or a proposal with no
  admission presumption. Adoption requires an independently justified and
  decided LicoArc-owned Candidate. Permanent product-specific dual-wire,
  aliases, translators, or state authorities are not compatibility guarantees.
- Within a Published Protocol Line, every manifest-declared schema, field or
  requirement registry, policy, and corpus source is immutable; the artifact
  digest is the integrity proof. Candidate bytes are not covered by that
  guarantee.
- Across versions, no wire-level compatibility is implied. Consumers migrate
  explicitly and reject any contract version they did not pin.

## Toolchain

The generator and tests require Node.js 22 or newer, as declared in
[../package.json](../package.json). The toolchain is a maintainer concern
only; consumers need only the artifact JSON.

LicoArc checks only that its repository-owned schemas, registries, policies,
corpora, manifests, artifacts, and digests describe one internally consistent
Protocol Line definition. These source-integrity checks make no implementation,
runtime, interoperability, publication, or delivery claim.
