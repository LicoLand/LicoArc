# Algorithm Decision: Group State Evolution

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-group-state-evolution` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Group collaboration](../../PRODUCT.md#group-collaboration) and [Group Collaboration architecture](../../ARCHITECTURE.md#5-group-collaboration) |
| Authority targets | `PRODUCT.md`, `ARCHITECTURE.md`, `spec/v1/group/`, `conformance/v1/group/`, Group field decisions, and the Protocol Line manifest |
| Predecessor or successor | None |

## Question and scope

Which bounded deterministic procedure evolves protected Group Membership State
across epochs, authenticates the immediate predecessor, projects one logical
Group Message to a bounded member set, and converges under retry, duplicate
delivery, partial failure, and membership change?  The decision covers state
identity, transition authorization, epoch and fork rules, recipient
projection, and aggregation inputs.  It does not decide field admission,
introduce a fourth entity, merge Endpoint identities, or select a Provider.

## Primary lineage and Algorithm Prototype

This is a LicoArc-originated procedure.  Its primary lineage is the first
complete implementation-neutral definition in this record, identified by
`ALG-group-state-evolution` and its source-derived conformance map. RFC 9420
and RFC 8949 are comparative evidence for epoch/transcript and deterministic
encoding hazards only; neither defines LicoArc membership or roles.

The closed LicoArc Algorithm Prototype is:

1. **State identity.**  A state is the canonical tuple
   `(groupId, epoch, predecessorDigest, members, roles, transitionDigest)`.
   `groupId` and every Endpoint reference are fixed-size opaque digests.  The
   member set is sorted by raw Endpoint-reference bytes, contains no duplicate,
   and has at most 64 entries.  Role values are from the closed Candidate
   Group Profile; an unknown role rejects the state.
2. **Genesis and successor.**  Genesis uses epoch `0`, an empty predecessor,
   and one or more authorized members.  Every successor increments epoch by
   exactly one and commits the canonical predecessor digest and transition
   operation.  Transition digest is
   `SHA256("LP-GROUP-STATE\0" || canonicalStatePrefix || canonicalOperation)`.
   A missing predecessor, epoch gap, or changed predecessor rejects without
   allocating the proposed member set.
3. **Authorization.**  An operation is authored by an Endpoint in the current
   state with the role required by the transition.  Add, remove, and role
   change are distinct operations.  Removing an Endpoint immediately excludes
   it from the next member set and all subsequent recipient projections.  The
   operation's Endpoint-authenticated Evidence Checkpoint is required before
   peer-visible state advances; Group state does not invent a second evidence
   algorithm.
4. **Fork and duplicate handling.**  An exact duplicate `(predecessorDigest,
   epoch, transitionDigest)` is idempotent and returns the original state
   digest.  Two different transitions with the same predecessor and epoch are
   a fork and reject as a state advance; arrival order, Station order, and
   highest numeric value never resolve a fork.  A stale epoch is rejected and
   cannot reopen a terminal removal.
5. **Group Message projection.**  A message binds one exact state digest and
   sender Endpoint.  The canonical recipient projection is the sorted set of
   authorized members excluding the sender where the Group Profile permits;
   it has no more than 64 recipients.  Each projection receives its own
   Endpoint delivery and Evidence Checkpoint result.  Aggregate status is the
   ordered tuple of per-member results and cannot grant membership or receipt
   authority to a Station.
6. **Recovery and bounds.**  At most 128 pending transitions, 256 pending
   recipient results, and 1024 retained epoch tombstones are held per Group.
   Restart restores the last committed state and tombstones before accepting
   new transitions.  Invalid input, over-bound member sets, duplicate members,
   unauthorized role changes, and recipient amplification fail closed.

### Frozen Group Resource Contract

| Dimension | Group bound |
| --- | --- |
| Member set | `MAX_GROUP_MEMBERS = 64`; sorted unique Endpoint references |
| Epoch and operation | exactly one successor epoch through `MAX_GROUP_EPOCH = 9,007,199,254,740,991`; `MAX_GROUP_OPERATION_BYTES = 2512` |
| Pending transitions/results | `MAX_PENDING_GROUP_TRANSITIONS = 128`; `MAX_PENDING_GROUP_RESULTS = 256` |
| Tombstones | `MAX_GROUP_EPOCH_TOMBSTONES = 1024` per Group |
| Persistent state | ≤ 4 MiB per Group including state, predecessor chain, and tombstones |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Unauthenticated work | ≤ 16 KiB parse and ≤ 64 member entries before Endpoint authorization |
| Group Message control | `MAX_GROUP_MESSAGE_CONTROL_BYTES = 60` excluding opaque User Payload |
| Aggregate result | `MAX_GROUP_AGGREGATE_BYTES = 3913` for the complete canonical result |

## Necessity and alternatives

Bounded Group collaboration is part of the approved final vision while Group
remains a protected protocol object and every key holder remains an Endpoint.
Omission leaves no deterministic membership or recipient convergence rule.
Pairwise-only messaging, unbounded broadcast, Station-authoritative
membership, arrival-order conflict resolution, a fourth Group entity, and a
tree or provider-defined state machine were rejected because they violate
entity, trust, privacy, or resource boundaries.  Any different state
construction requires a successor decision and independent field decisions.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | Canonical state, exact predecessor, epoch succession, authorization, fork, and projection behavior are closed at the Prototype level. |
| Known attacks and limitations | The named attacks, misuse conditions, and residual assumptions constrain downstream implementations without becoming LicoArc delivery gates. |
| Misuse and failure behavior | Gaps, forks, duplicate members, unknown roles, unauthorized operations, and over-bounds fail closed without state advance. |
| Side channels and secret handling | Downstream implementations own provider behavior, secret erasure, runtime memory, and side-channel controls. |
| Interoperability | One exact implementation-neutral Prototype and source-derived vector map are closed. |
| CPU work by operation | The normative operation envelope is frozen. |
| Memory and stack | The normative state and allocation bounds are frozen. |
| Persistent protocol state | Committed state, predecessor chain, result deduplication, and tombstones are bounded. |
| Energy by operation and transition | Downstream-owned; no runtime measurement is part of this definition. |
| Capability and handshake wire bytes | Group capability declarations and the Candidate Group identifier remain bounded by the Protocol Line. |
| Established-record and control wire bytes | Group context and aggregate expansion are bounded above. |
| Work and allocation before peer authentication | Parser and member count are bounded before authorization. |
| Agility, downgrade, replacement, and retirement | One Group Profile binds the state procedure; a semantic change requires a successor decision and profile identity. |

## Source-derived conformance material

The official RFC 9420 and RFC 8949 material supplies comparative epoch,
transcript, canonical-order, duplicate, and indefinite-length cases.  The
LicoArc Prototype derives positive, negative, boundary, and adversarial cases:
genesis; valid add/remove/role change; exact duplicate; stale epoch; missing
predecessor; gap; fork; concurrent successor; removed-member replay; duplicate
or unsorted member; maximum and over-maximum membership; unauthorized role;
recipient projection; partial delivery; aggregation; restart; tombstone
capacity exhaustion; and attacker-selected fan-out.  Expected digest and outcome classes
are defined by the Prototype and listed in
`source-vectors.md`, never by a
Provider output.

## Decision outcome

`OPEN → READY → DECIDED` was closed independently in this bounded change.  The
explicit decision adopts the canonical Group state procedure, fork/duplicate
rules, recipient projection, and resource contract as durable LicoArc intent.
The seven Group Message Field Decisions remain independent and are linked from
the machine field registry. The complete Candidate Group Profile, deterministic
CBOR grammar, JSON schemas, bounds, labels, source manifest, and positive and
negative corpus are now specified in
[`spec/v1/group/`](../../spec/v1/group/) and
[`conformance/v1/group/`](../../conformance/v1/group/). Residual risks are
concurrent authorization races, equivocation, stale tombstone recovery,
recipient amplification, and downstream semantic divergence.

## Definition evidence

The definition status is `SPECIFIED`. The implementation-neutral Prototype, parameters, failure behavior, resource bounds, and source-derived conformance material are closed by the linked normative authorities.

## Comparative evidence, never authority

RFC 9420 and RFC 8949 are comparative lineage only; they cannot define
LicoArc membership, roles, fields, trust, or state transitions.
