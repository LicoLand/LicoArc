# Algorithm Decision: User Authority State

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-user-authority-state` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | Explicit initial V1 user direction and LicoArc Endpoint authority boundary |
| Authority targets | [Canonical Field Registry](../../spec/FIELD-REGISTRY.md), [identity schema](../../spec/v1/identity/identity.schema.json), [identity labels](../../spec/v1/identity/labels.json), [identity runtime grammar](../../spec/v1/identity/runtime.cddl), [identity policy](../../spec/v1/identity/identity.policy.json), [handshake schema](../../spec/v1/protection/handshake.schema.json), [SessionAccept schema](../../spec/v1/protection/session-accept.schema.json), [formal bindings](../../spec/v1/security/formal-bindings.json), and [identity corpus](../../conformance/v1/identity/cases.json) |
| Predecessor or successor | Replaces the incomplete single-Endpoint identity-continuity model; no legacy authority wire or imported account state survives. |

## Question and scope

How does one user-controlled authority admit, rotate, revoke, and recover a
bounded set of Endpoint states without assigning identity authority to a
Station, directory, account provider, display name, or arrival order? This
decision does not define human uniqueness, peer trust, storage, cloud access,
or a product device model; independent field decisions own transmitted values.

## Primary lineage and Algorithm Prototype

1. Derive `userIdentityRef` as SHA-256 over a fixed initial V1 domain and the
   canonical genesis management and recovery public-key material. Genesis has
   epoch zero and no predecessor.
2. Hash each state with its Protocol Line identity, user reference, epoch,
   optional exact predecessor digest, transition kind, bounded authorized-device
   entries, and management/recovery public keys; exclude authority signatures.
3. Require every successor to preserve the user reference, increment the epoch
   exactly once, and name the exact predecessor digest. Equal-parent unequal
   successors are explicit siblings; neither silently replaces the other.
4. Require management transitions to carry the predecessor-authorized Ed25519
   and ML-DSA-65 composition and preserve the recovery-key collection exactly.
   Only a recovery transition authorized by the currently admitted recovery
   composition and possession under every replacement key may rotate or remove
   recovery keys; it may atomically revoke compromised Endpoints and admit
   replacements. Recovery-authority substitution rejects without mutation.
5. Each admitted device proves possession by signing a domain-separated tuple
   of Protocol Line identity, user reference, proposed epoch, Endpoint reference,
   and independently computed Endpoint-state digest. Reject stale epochs,
   downgraded or unauthorized signers, roster changes not named by the transition,
   missing possession, and ambiguous siblings without mutating accepted state.
6. The latest complete accepted snapshot determines current authorization.
   Bounds apply to one snapshot or catch-up batch only. A verifier may process
   successive bounded batches to catch up; no lifetime rotation limit or timeout
   exists.

The session transcript binds the initiating and responding authority-state
digests beside the corresponding Endpoint-state digests. Neither authority
state contains the peer digest, preventing recursive state identity. Application
records are admitted only after the peer supplies a matching valid protected
authority payload. Authorization never sets local peer trust.

## Necessity and alternatives

Omission leaves multi-device admission and loss recovery to infrastructure or
caller labels. A single mutable key loses explicit revocation and recovery;
an account or Station list creates an external authority; a globally convergent
log adds an unnecessary online dependency. The selected signed predecessor
chain is self-contained, fork-explicit, recoverable, and locally verifiable.

## Security and technical evaluation

| Dimension | Assessment |
| --- | --- |
| Correctness and security claims | Exact predecessor, epoch, roster delta, signature, and possession checks authorize only named Endpoint states. |
| Known attacks and limitations | Key compromise can authorize bad successors; recovery replaces future authority but cannot recreate absent data or prove one-human uniqueness. |
| Misuse and failure behavior | Caller labels, Station hints, stale states, gaps, forks, silent roster edits, management changes to recovery authority, and recovery-key substitution reject without state advance. |
| Side channels and secret handling | Only public authority material and protected state are transmitted; secret custody remains Endpoint-local. |
| Interoperability | Canonical hashing, domains, transitions, key purposes, ordering, and typed failures are Protocol-Line fixed. |
| Normative CPU work bound by operation | Linear in the bounded keys and devices of one snapshot or catch-up batch. |
| Normative memory and state bounds | Bounded current snapshot, explicit sibling observations, and bounded batch input; no lifetime history cap. |
| Persistent protocol state | Latest complete accepted snapshot, its digest and epoch, plus explicit unresolved sibling state. |
| Capability and handshake wire bytes | Bounded authority digests and one bounded protected authority payload. |
| Established-record and control wire bytes | Ordinary records inherit committed authority; authority changes carry one bounded successor snapshot. |
| Work and allocation before peer authentication | Authority payload is processed only under the protected session gate. |
| Agility, downgrade, replacement, and retirement | Exact key profiles are line-bound; only the exact complete signer set is accepted. |

## Source-derived conformance material

Initial V1 cases cover genesis derivation, management update, rotation,
revocation, recovery replacement, compromised-device removal, valid catch-up,
forged possession, wrong Endpoint-state digest, stale/gapped epoch, wrong parent,
silent roster edit, signer downgrade, ambiguous siblings, transcript digest
substitution, protected-payload mismatch, and trust remaining local.

## Decision outcome

The implementation selected this construction on 2026-09-08 to realize the
authorized initial V1 authority outcome. Residual risks are authorized-key compromise,
denial by suppression, explicit unresolved forks, and loss of history that was
never retained. These do not grant infrastructure authority or justify fallback.

## Definition evidence

The algorithm is `DECIDED` and `SPECIFIED`: the linked registry, identity,
session-binding, formal-binding, and identity-corpus sources close its exact
initial V1 encoding, bounds, transitions, failures, and cases.
