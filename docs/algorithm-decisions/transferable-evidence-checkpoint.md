# Algorithm Decision: Transferable Evidence Checkpoint

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-transferable-evidence-checkpoint` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Generic Messaging, Reliability, and Transferable Evidence](../../PRODUCT.md#generic-messaging-reliability-and-transferable-evidence), [Reliable Exchange architecture](../../ARCHITECTURE.md#6-reliable-exchange), and the [Canonical Field Registry](../../spec/FIELD-REGISTRY.md) |
| Authority targets | `PRODUCT.md`, `ARCHITECTURE.md`, Evidence Profile sources in `spec/v1/evidence`, identity-continuity sources, conformance corpus, and Protocol Line manifest |
| Predecessor or successor | None |

## Question and scope

Which complete implementation-neutral construction maps Endpoint-authored
logical records into canonical Transferable Statements, bounded digest sets,
identity-authorized signature inputs, and checkpoint-before-finality behavior?
The decision covers projections, digesting, signature-set checking, identity
history resolution, pending joins, and resource bounds.  It does not add or
remove fields, define legal responsibility, create trusted time, or select a
Provider.

## Primary lineage and Algorithm Prototype

The primitive lineage is `RFC-8032`, `RFC-5869`, `NIST-204`, `RFC-8949`, and
the detached-content and external-context evidence in COSE RFC 9052.
The LicoArc construction is a new procedure whose primary definition is this
record and the Canonical Field Registry's already-decided evidence field
shape.  COSE and NIST provide primitive and signature-input evidence only;
they do not define LicoArc statements, identity history, batching, or finality.

The closed LicoArc Algorithm Prototype, now specified by the Evidence Profile
source closure in `spec/v1/evidence`, is:

1. **Statement projection.**  Each covered user-intent, Endpoint Accepted,
   Effect Completed, affiliation, route, verification, and attachment-root
   statement maps to one canonical tuple `(line, statementKind, producer,
   counterparty, identityStateDigest, logicalMessageId, semanticBody,
   predecessorDigest)`.  Session IDs, ciphertext, protection frames, retry
   carriage, Station state, timing, and transport handles are excluded.  The
   tuple is encoded with deterministic CBOR and prefixed by the domain
   separator `LP-EVIDENCE-STATEMENT\0`.
2. **Digest set.**  The statement digest is SHA-256 of that prefix and
   canonical projection.  A checkpoint carries 1–32 statement digests sorted
   lexicographically by raw bytes with no duplicates.  Attachment declarations
   commit the complete descriptor and `contentDigest`; ordinary chunks and
   non-empty recovery updates are not individually checkpointed.  The final
   empty receive state that reports complete-content verification is one
   statement and requires one checkpoint.
3. **Checkpoint signature input.**  The signed bytes are deterministic CBOR of
   `LP-EVIDENCE-CHECKPOINT\0`, Protocol Line, signer Endpoint reference,
   counterparty Endpoint reference, exact signing identity-state digest, and
   the sorted statement-digest set.  The required signature set is exactly one
   Ed25519 signature and one ML-DSA-65 signature for the baseline Evidence
   Profile.  Each key must be authorized for evidence purpose by the disclosed
   identity-continuity bundle; unknown, missing, repeated, surplus, or
   wrong-purpose signatures reject the whole checkpoint.
4. **Identity continuity.**  A verifier resolves the signer key through a
   bounded chain of current identity state, predecessor digest, rotation,
   revocation, recovery, and compromise policy.  A missing or conflicting
   predecessor, rollback, fork, expired authorization, or wrong Protocol Line
   makes the evidence unverifiable.  A Station, Route, session, or directory
   cannot become the permanent key authority.
5. **Checkpoint join and finality.**  A statement and its checkpoint may
   arrive in either order.  Unmatched material is retained only in bounded
   pending state; it cannot be delivered to the application or advance
   peer-visible state.  The matching pair is joined once, atomically, and
   idempotently.  A checkpoint is self-authenticating and excluded from its own
   statement set, so it never creates recursive confirmation or another
   checkpoint.  A lost pair retransmits the same signed bytes; unsigned
   fallback is forbidden.
6. **Failure and privacy.**  Canonicalization, digest, signature, identity,
   line, purpose, and bounds are checked before state advance.  A verifier
   reports only a typed failure category to its caller and never exposes
   plaintext or private identity history to a Station.  Successful evidence
   attributes exact bytes to an Endpoint key state; it does not prove a human
   intention, statement truth, legal responsibility, trusted time, or an
   unsigned counterparty action.

### Frozen Evidence Resource Contract

| Dimension | Evidence bound |
| --- | --- |
| Statement set | `MAX_EVIDENCE_STATEMENTS = 32`; sorted, unique, non-empty |
| Signature set | `MAX_EVIDENCE_SIGNATURES = 4`; baseline requires exactly 2 |
| Checkpoint bytes | `MAX_EVIDENCE_CHECKPOINT_BYTES = 8192` |
| Pending join state | `MAX_PENDING_EVIDENCE_STATEMENTS = 128`; `MAX_PENDING_EVIDENCE_BYTES = 262144`; `EVIDENCE_PENDING_WINDOW = 60 seconds` |
| Identity history | ≤ 64 predecessor states and ≤ 4 key records per state in one portable verification bundle |
| Persistent protocol state | ≤ 1 MiB pending/deduplication state per peer, excluding caller-owned statement payload |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Unauthenticated work | Evidence is checked only after pairwise record authentication; offline disclosure parsing is capped at 64 KiB and 4 signatures before policy authorization |
| Wire amortization | One checkpoint per covered transition; at most 32 statements and 4 signatures; no recursive evidence or per-chunk signatures |

## Necessity and alternatives

Session authentication proves only that one Endpoint controlled a key during
that session; it is not independently transferable after Route, Station, or
session change.  Omitting this procedure leaves the required Endpoint
attribution and checkpoint-before-finality property undefined.  Alternatives
of one inline signature per record, optional evidence, a trusted Station
witness, an undefined tree commitment, session-MAC reuse, and no checkpoint
join were rejected because they either create unbounded overhead, lose
transferability, or grant authority to a lower layer.  A different digest,
signature, identity, or finality procedure requires a successor decision.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | Canonical projection, digest set, exact signature set, identity authorization, and before-finality join are closed at Prototype level. |
| Known attacks and limitations | The named attacks, misuse conditions, and residual assumptions constrain downstream implementations without becoming LicoArc delivery gates. |
| Misuse and failure behavior | Unknown line/profile/purpose/key, malformed projection, non-canonical set, over-bounds, pending exhaustion, and invalid signatures fail closed with no state advance. |
| Side channels and secret handling | Downstream implementations own provider behavior, secret erasure, runtime memory, and side-channel controls. |
| Interoperability | One exact implementation-neutral Prototype and source-derived vector map are closed. |
| CPU work by operation | The normative operation envelope is frozen. |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Persistent protocol state | Pending statements, checkpoints, deduplication, and identity history are capped and non-refreshable by Station migration. |
| Energy by operation and transition | Downstream-owned; no runtime measurement is part of this definition. |
| Capability and handshake wire bytes | Key-purpose authorization and identity continuity remain bounded disclosures. |
| Established-record and control wire bytes | Checkpoint, statement, signature, pending, and retransmission maxima are fixed by the Evidence Profile schemas and runtime grammar. |
| Work and allocation before peer authentication | In-transit evidence follows pairwise authentication. |
| Agility, downgrade, replacement, and retirement | Evidence Profile is indivisible and line-bound; no extension can remove required signatures or weaken finality without a successor identity. |

## Source-derived conformance material

Official RFC 8032, RFC 5869, FIPS 204, RFC 8949, and COSE detached-content
cases supply primitive and canonicalization vectors.  LicoArc-derived positive,
negative, boundary, and adversarial vectors cover empty/singleton/maximum sets,
sorted and unsorted order, duplicate and
collision-simulation, line/peer/state mismatch, wrong-purpose key, missing or
surplus signature, malformed signature, rotation, revocation, fork, rollback,
compromise policy, lost checkpoint, retry, restart, pending exhaustion,
orphan, attachment root, recursive self-reference, and final verified receive
state.  Expected digest bytes and outcome classes derive from the Prototype
formula and the vector map in
`source-vectors.md`, never from
one selected Provider.

## Decision outcome

`OPEN → READY → DECIDED` was closed independently in this bounded change. The
explicit decision adopts the canonical Transferable Statement projection,
SHA-256 digest set, dual-signature baseline, identity continuity resolution,
checkpoint-before-finality join, and numeric resource contract as durable
LicoArc intent. The Evidence Profile source closure specifies those properties
without adding a field decision. Residual protocol risks are identity rollback,
key compromise, checkpoint suppression, orphan joins, and downstream semantic
divergence.

## Definition evidence

The definition status is `SPECIFIED`. The implementation-neutral Prototype, parameters, failure behavior, resource bounds, and source-derived conformance material are closed by the linked normative authorities.

## Comparative evidence, never authority

COSE, RFC 8032, RFC 5869, FIPS 204, and RFC 8949 provide comparative lineage
only; no provider fact is definition evidence or can define LicoArc fields,
state, trust, or finality.
