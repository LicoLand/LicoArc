# Changelog

All notable changes to Lico Arc Protocol's contracts, policies, conformance corpora,
and artifacts are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/). Published contract lines are
immutable; this file records repository-level change history.

A version heading, package version, generated bundle, or changelog entry is
not protocol publication evidence. The `v1` line remains Candidate; see
[`docs/STATUS.md`](docs/STATUS.md).

## [Unreleased]

### Security

- Make station receipts, leases, clocks, and queue state explicitly
  non-authoritative; endpoints retain authenticity, integrity, freshness,
  replay, and final-receipt decisions.
- Add the candidate v1 bundle line, binding interpretation metadata into its
  content digest while keeping storage, retention, mailbox, and operational
  quota policy outside the protocol authority.
- Validate every relay-envelope schema field in the conformance harness,
  including opaque identifiers, ciphertext size, and RFC 3339 date-times.

### Added

- Establish `spec/FIELD-REGISTRY.md` as the sole active logical field
  authority, with a closed table of admitted fields and excluded, replaced,
  or profile-owned values. Every row now links to one field-specific page for
  role, direct contribution to the LicoArc final vision, visibility,
  alternatives, comparative evidence, decision history, and definition
  evidence; machine-readable sources cannot override that registry.
- Make every field decision vision-first and implementation-neutral. Products,
  repositories, deployments, Providers, languages, and external protocols can
  supply proposals or bounded evidence but cannot establish field purpose,
  necessity, placement, semantics, trust, or lifecycle. Add consumer-neutral
  naming and authority-attribution gates so those dependencies cannot return
  as unlinked prose.
- Reject an independent first-contact token field. First contact reuses one
  purpose-scoped, short-lived, single-use Delivery Handle for routing while
  Endpoint-protected handshake data retains identity and invitation authority.
- Select one Transport-Profile-native typed submission outcome and reject a
  standalone Station receipt field, token, response-body receipt, or pollable
  receipt resource from the baseline. Polling or cancellation must justify a
  future Station-generated handle independently.
- Add the LicoArc-owned resumable large-binary attachment model: immutable
  descriptor roots, Protocol-Line-fixed chunk geometry, stable protected chunk
  identity, bounded canonical requested ranges as the sole normal recovery and
  verified-completion feedback, descriptor-derived completion, lifetime
  recovery-traffic bounds, and a fixed non-refreshable recovery window.
  Make completion and terminal failure absorbing. Reject attachment
  `chunkFinal`, selectable chunk size, duplicate count, offset, length, digest,
  transfer token, single resume cursor, and file-sized bitmap fields.
- Define exact application-supplied `payload` bytes as User Payload outside
  LicoArc interpretation and compression. Define canonical Protocol Overhead
  accounting, compact integer wire labels, session-inherited stable bindings,
  bounded aggregate confirmations, silent idle relationships, and immutable
  handshake, record, control, retry, recovery, and carrier budgets.
  Add a hard implementation-neutral Resource Contract for every future Protection
  Profile and open separate algorithm decisions for the baseline suite,
  high-assurance suite, and transferable Evidence Checkpoint construction.
- Freeze the performance-first privacy boundary: reject the protected
  size-bucket proposal, remove profile-owned traffic-shaping grammar and
  budgets, and document actual outer length, timing, frequency, route, and
  correlation as residual metadata. The mandatory profiles add no
  discretionary traffic shaping, artificial delay, synthetic messages, or
  mandatory keepalive.
- Add the approved Group collaboration intent without changing the exact
  three-entity model. Independently key-holding devices are separate
  Endpoints; Group is a protected versioned object with bounded per-member
  delivery. Open the Group state-evolution Algorithm Decision and the minimal
  field reviews without admitting them to the active Field Registry.
- Separate restricted JCS/JSON governance artifacts from deterministic
  CBOR/CDDL Endpoint runtime wire data, require a closed Protocol Line
  composition with minimum-safe handshake binding and session lock, and adopt
  multi-root threshold governance with final Endpoint-local trust.
- Replace the prior deniable-by-default, opt-in evidence intent with mandatory
  bounded Evidence Checkpoints. Add portable signer and counterparty Endpoint
  identity binding, exact signing Identity-state binding, canonical
  Transferable Statement digests, bounded signature sets,
  checkpoint-before-finality, bounded pending joins, idempotent retry, and
  attachment-root batching without per-chunk signatures. Require one checkpoint
  for the final empty verified receive state before attachment completion. Reject inline
  per-record signatures, session or Station authentication as transferable
  proof, self-asserted evidence time, evidence selectors, explicit evidence
  identifiers, and person, account, device, or legal identity fields. Open a
  separate algorithm decision for the exact Evidence Profile and retain honest
  limits around human intent, truth, time, key compromise, peer cooperation,
  and legal effect.
- Reject an independent `packetLength` field from the approved target carrier.
  Transport Profile framing owns the actual encoded-body boundary; packet-size
  capacity remains separate profile work, while Endpoint-protected attachment
  chunking and selective recovery belong to Generic Messaging and Reliable
  Exchange.
- Reject sender-supplied per-submission TTL, retention duration, and retention
  classes. The planned Transport Profile instead fixes one storage window and
  requires a Station unable to honor it to reject before acceptance.
- Require the planned mandatory Transport Profile to provide bounded Station
  store-and-forward for an offline receiving Endpoint while keeping Station
  storage, acceptance, queue state, and retrieval non-authoritative to
  Reliable Exchange and final receipt.
- Approve the target station-facing carrier shape: no JSON Outer Envelope, a
  Transport-Profile-owned parser selector and short-lived routing target, one
  bounded protected packet as the raw binary body, no sender-supplied
  transport Envelope identifier, and no absolute `expiresAt` body field.
  Retention remains a separate field decision.
- Make every message field bear its own inclusion and continued-retention
  burden. Existing Candidate schemas, tests, examples, implementation effort,
  and unpublished compatibility cost no longer count as necessity evidence;
  an unnecessary field must be rejected or removed through its field decision.
- Keep protocol references as ignored local research, remove tracked links and
  source dependencies on them, and require every tracked decision to remain
  self-contained.
- Establish README as the single authority for the core domain model: a
  user-controlled Endpoint is the sole runtime security and privacy authority,
  untrusted Stations provide opaque carriage, and a Network provides
  LicoArc-recognized federation interoperability without becoming an Endpoint
  trust root. Other formal documents now reference that model instead of
  defining additional domain entities.
- Add a non-normative Field Decision Workspace with one review per discovered
  candidate, a closed total inventory, cross-field industry facts, and a
  mandatory admission template covering necessity, value space, trust,
  alternatives, source protocols, and technical cost.
- Add one canonical full Decision Lifecycle with independent Algorithm and
  Message Field Decision tracks, stable record identities, shared decision
  gates, track-specific admission gates, and independent decision and
  definition states. Source-integrity checks are not a lifecycle state;
  downstream implementation and delivery facts never close a decision. Add
  the Algorithm Decision Workspace and migrate all existing field records to
  the definition-only lifecycle metadata.
- Make TypeScript, Go, and Rust implementation closure independent in their
  owning repositories and remove real-world validation, interoperability
  execution, audit, packaging, publication, deployment, support, operation,
  and product integration from LicoArc completion.
- Declare exact wire ID `licoarc.relay.v1` and lifecycle `Candidate` in the v1
  manifest and generated bundle, and bind both fields into the deterministic
  artifact digest.
- Add a closed machine-readable relay field registry and schema, classify the
  current five members into logical Outer Header and Outer Body regions, make
  their Station visibility and non-authority explicit, and verify exact
  schema-to-registry and human-table consistency.
- Add a shared closed Requirement Registry Schema and eight stable relay
  obligations, bind every obligation to its owning schema, field, or policy
  facts, map each exactly once to executable conformance evidence, and verify
  the human requirement-table projection.
- Make LicoArc protocol development and verification repository-complete by
  binding every Candidate to its declared source closure and owner-scoped
  verification.
- Define the endpoint-protected, untrusted-Station policy scenario and enforce
  its relay-only portion: no dedicated `plaintext` member, closed-envelope
  rejection, and non-authoritative Station receipts. The relay Candidate does
  not validate the contents of the `ciphertext` string.
- Make global, continuous adversarial pressure the permanent station threat
  model and require continuous strengthening, cryptographic agility, reviewed
  open standards, downgrade resistance, failure-closed behavior, and zero
  station security authority.
- Define every algorithm through an implementation-neutral Algorithm
  Prototype before any downstream dependency selection. Downstream language
  repositories independently own provider choice, executable validation, and
  delivery closure, and may adopt only dependencies equivalent to the pinned
  Prototype or equivalents with semantics-preserving
  security hardening; treat every behavior-changing “safer” implementation as
  a separately reviewed algorithm variant.
- Required public documentation set: product definition, contributing guide,
  code of conduct, security policy, and a formal `docs/` tree covering
  architecture, functionality, protocol, examples, runbook, compatibility,
  entity layout, and decision records.
- Local-only asset boundaries: `docs/plans/`, `docs/reports/`, `cache/`, and
  `build/` are ignored and must never be tracked.

## [0.1.0 candidate snapshot] - 2026-07-25

This heading records repository history only. It is not evidence that
`licoarc.relay.v1` was published.

### Added

- Initial `v1` federation contract line: the opaque relay envelope schema
  `licoarc.relay.v1` (`spec/v1/relay/envelope.schema.json`).
- Relay governance policy `licoarc.relay-governance.v1` with required,
  forbidden, and explicitly implementation-defined capabilities
  (`spec/v1/relay/governance.policy.json`).
- Synthetic valid and invalid conformance corpora (`conformance/v1/`).
- Content-addressed bundle artifact `artifacts/v1/licoarc.bundle.json` with a
  SHA-256 digest over the canonical sources.
- Artifact generator and checker (`tools/generate-artifact.mjs`), npm
  verification scripts, and the conformance test suite.
