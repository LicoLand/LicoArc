# Lico Arc Protocol Architecture

This document projects the implementation-neutral architecture owned by the
tracked definition graph. Exact wire and lifecycle authority remains in
`spec/`, `conformance/`, and the generated artifact.

## Authority graph

```text
decided algorithm and field semantics
             │
             ▼
closed schemas · registries · policies · bounds · labels · CDDL
             │
             ├── source-owned formal claims and proof bindings
             ├── positive and negative conformance corpora
             └── content-identity projections
             │
             ▼
Protocol Line manifest ── deterministic generation ── bundle
```

The graph is self-contained. Local research, external implementations,
runtime results, service state, publication metadata, and deployment facts are
not definition inputs.

## Composition

`licoarc.protocol-line.v1` is a `Candidate`/`COMPLETE` composition with
`sessionEligible: true` and `publicationEligible: false`. V1 / Generation 1 has a
fixed content identity and contains exactly eight mandatory capabilities:

| Capability | Primary responsibility |
| --- | --- |
| Protocol Foundation | Canonical representations, identifiers, bounds, lifecycle, fixed admission, and source closure |
| Identity | User-authorized multi-device authority and recovery, independent Endpoint continuity and keys, discovery descriptors, routes, and affiliations |
| Pairwise Protection | Authenticated establishment, sibling authority-digest binding, paired prekeys, transcript binding, confirmation, ratchet, replay, persistence, and deletion |
| Generic Messaging | Six message classes, opaque payload dispatch, attachments, and control budgets |
| Reliable Exchange | Protected intent, stable identities, authenticated Endpoint confirmations, recovery, terminal state, and restart convergence |
| HTTPS Transport | Bounded Station operations and opaque protected-packet transport |
| Group Collaboration | Bounded membership, authorized state transitions, per-member projections, and aggregate outcomes |
| Federation Governance | Membership, compatibility certification, revocation, advisories, threshold authority, and recovery |

Each capability owns an exact source manifest and conformance corpus. The line
admits no optional semantic gaps.

## Content identity and proof boundary

The `stable-core` Profile identity is SHA-256 over deterministic CBOR of the
named Profile semantic projection. The Protocol Line identity is independently
computed from its named line projection. Neither projection includes its own
identifier, publication state, proof-tool output, or source/artifact digest.

Security claims have stable identifiers. A positive claim is admitted only
when its required source-owned proof bindings agree with the claim, adversary
model, formal model, and checked authority digest. Proof execution is evidence
for this definition join; it is not implementation, device, or deployment
evidence. Stable nonclaims remain explicit and cannot be promoted by passing
tests.

The corpus join is equally strict: each mandatory capability and active
Profile declares one complete manifest whose case set, operations, source
bindings, expected results, and synthetic public material validate exactly.
Reporting identifiers and expected values never dispatch execution.

## User authority and pairwise state architecture

User authority is a predecessor-bound snapshot chain. Genesis derives the
self-certifying `userIdentityRef` from canonical management and recovery public
keys. Management transitions require the predecessor management key pair;
recovery transitions require the predecessor recovery pair and replacement-key
possession. Devices are bounded entries with independent Endpoint-state
digests, epochs, status, and possession proof. Equal-parent unequal successors
remain explicit forks. Accepting user authority never changes local peer trust.

Each Endpoint keeps independent keys and sessions. Establishment transcripts
bind both Endpoint-state digests beside the initiating and responding
user-authority-state digests. Authority snapshots do not contain the peer
authority digest, which keeps this sibling binding acyclic. Application
admission additionally requires a matching protected authority payload.
That payload carries or references matching protected Endpoint identity records
whose exact signing-key sets validate newly admitted-device possession; no
global key map or Station roster participates. After a newer accepted authority
snapshot revokes an Endpoint, its existing session cannot admit later
application records. Unchanged offline devices retain their original
admission-epoch possession proofs across unrelated successors.

Every asynchronous establishment consumes one responder-issued pair containing
one X25519 one-time prekey and one ML-KEM-768 one-time prekey under the same
monotonic sequence. Both authentication signatures, the exact Protocol Line and Profile identities, identity states, roles,
purpose, selected prekey pair, handshake material, key confirmation, and final
SessionAccept are transitively transcript-bound.

The responder validates against tentative state and atomically commits the
session, complete pair redemption, state generation, and exact replay result.
A concurrent loser receives the typed consumed result. Send and receive paths
likewise derive tentatively and commit state before emission or plaintext
release. Retry emits stored identical bytes; it never advances cryptographic
state.

The established state is a bounded classic X25519 Double Ratchet with bounded
skipped-key storage and explicit rollback and deletion semantics. Header
confidentiality, physical zeroization, and rollback detection under a fully
compromised store are not claimed.

## Messaging, reliability, and Groups

Generic Messaging supplies protected message semantics and opaque application
payloads. Reliable Exchange supplies stable protected intent and a bounded
state machine around those messages. Group Collaboration projects one logical
Group operation into bounded per-member work while retaining one versioned,
Endpoint-authorized Group state.

These layers do not inherit Station assertions. A transport acceptance is an
operational hint only. Endpoint Accepted and Effect Completed advance only
from an exact confirmation authenticated by the sending authorized Endpoint
session. Effect Completed also requires authenticated success and an exact
result digest. Attachments additionally require complete authenticated chunks
and content digest; Groups accept only an Endpoint confirmation or no result.

## Identity and governance

Identity continuity is predecessor-bound and monotonic. User authority,
Endpoint identity, discovery, routing, and Station affiliation have distinct
scopes and rollback rules. A Station carries no user/device roster, cannot
select an authority tip, and cannot create local trust.

Federation Governance is a separate mandatory capability. Threshold roots and
roles authorize exact governance transitions; membership, compatibility
certification, revocation, and abuse advisories remain distinct. Endpoint
admission remains local even when governance material validates.

## Lifecycle architecture

Definition status and lifecycle are independent. A complete Candidate may be
session-eligible while remaining publication-ineligible. Publication is a
separate channel action and cannot change defined bytes. An exact session is
locked to one line identity; downgrade, fallback, substitution, component
negotiation, dual semantics, and translation are forbidden.

## Downstream boundary

Endpoint and Station implementations own code, dependencies, entropy, key
custody, persistent storage, scheduling, local policy, packaging, and runtime
behavior. The modeled proof covers only declared formal claims under its
stated ideal assumptions; definition-level corpus execution does not establish
SDK completeness or Provider correctness. Executable interoperability, audit,
publication, deployment, support, and operation each close independently in
their owning repositories or channels. None is an input to, or blocker for,
this definition.
