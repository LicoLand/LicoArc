# Lico Arc Transferable Evidence Checkpoint v1

Status: Candidate. This document is the normative projection of the machine
sources in [`spec/v1/evidence`](../../spec/v1/evidence/) and the positive and
negative corpus in [`conformance/v1/evidence`](../../conformance/v1/evidence/).
The implementation-neutral algorithm decision records the durable construction;
the machine sources close its schemas, bounds, failure states, proof bindings,
and corpus. This complete mandatory capability makes no implementation or
publication claim.

## Transferable Statement projection

A Transferable Statement is authored by an Endpoint and contains the exact
Protocol Line, author and counterparty Endpoint references, the signer's exact
Identity continuity-state digest, stable logical Message identity, exact User
Payload bytes, and peer-visible semantic meaning. Attachment statements also
commit the complete descriptor and its whole-content `contentDigest`.

The canonical statement tuple is projected to deterministic CBOR and prefixed
with `LP-EVIDENCE-STATEMENT\0`; its digest is SHA-256 of those exact bytes.
Session lookup IDs, protection frames, ciphertext, retry attempts, Route and
Station carriage, transport handles, timing, and local storage identifiers
are excluded. Re-protection, reconnect, Route replacement, Station migration,
and retransmission therefore do not rewrite a statement digest.

The closed statement kinds are `userIntent`, `endpointAccepted`,
`effectCompleted`, `attachmentDeclared`, `attachmentVerified`,
`groupMemberResult`, and `confirmation`. A checkpoint is self-authenticating:
it cannot be represented as a statement and cannot require another
confirmation or checkpoint.

## Evidence Checkpoint

An Evidence Checkpoint carries the Protocol Line content identity, signer and counterparty
Endpoint references, the exact signer Identity continuity-state digest, and a
non-empty sorted unique set of one to `MAX_EVIDENCE_STATEMENTS` statement
digests. The baseline signature set is exactly two entries in registry order:
the content-addressed Ed25519 signature Profile followed by the
content-addressed ML-DSA-65 signature Profile. Both carry
`endpoint-evidence` purpose. `keyProfileId` and `keyId` are exact 32-byte
`DIGEST256` values; algorithm names are not runtime selectors. Ed25519 uses an
exact 64-byte canonical signature and ML-DSA-65 an exact 3,309-byte canonical
signature. Unknown, missing, repeated, reordered, surplus, malformed,
non-canonical, or wrong-purpose signatures reject the whole checkpoint. The
signed input is deterministic CBOR prefixed by
`LP-EVIDENCE-CHECKPOINT\0` and excludes the signatures member itself.

An independent verifier resolves both signing keys through a bounded Endpoint
Identity continuity bundle. It validates genesis and every exact successor
through the bound state before resolving either key. Each selected state
carries the canonical Identity transition, continuity proof, Endpoint
signature, exact evidence-purpose signing-key records, Profile IDs, and raw
public verification bytes. Key lookup is scoped to that state. The verifier
then checks purpose, active state, Profile equality, exact public-key length,
canonical public-key encoding, exact signature length, canonical signature
encoding, and finally the signature. A missing predecessor, gap, rollback,
fork, revoked/recovery or wrong-purpose key, Profile mismatch, cross-line
value, or conflicting identity state is a typed rejection with no partial
state mutation. A Station, Route, session, directory, timestamp, or transport
receipt cannot become permanent evidence-key authority.

All CDDL collections have explicit cardinalities. The deterministic-CBOR
maximum is 4,760 bytes for a checkpoint, 524,549 bytes for one statement,
1,841,831 bytes for the complete 64-state Identity bundle, and 2,371,144 bytes
for a one-statement verification package containing its checkpoint and bundle.
[`bounds.json`](../../spec/v1/evidence/bounds.json) stores the exact positive
component totals used to derive those values; it contains no unevaluated
relationship strings, sender-selected trade, or inherited Foundation ceiling.

## Checkpoint-before-finality join

A statement and its checkpoint may arrive in either order. An unmatched
statement or checkpoint is retained only in bounded pending count, bytes, and
pending-window state. It is not delivered to the application and cannot
advance peer-visible durable state. Once every digest, statement projection,
identity binding, signature, and bound has validated, the pair is joined in one
atomic state transition. The join is idempotent; an identical retransmission
of the same signed checkpoint returns the existing result.

Pending exhaustion, endpoint-local expiry, orphan mismatch, invalid signature,
identity rollback, and checkpoint loss are bounded outcomes. Loss retransmits
the same canonical signed bytes; unsigned fallback is forbidden. The pending
window is an endpoint-local expiry event and is not trusted wall-clock
evidence. Retry, restart, session renewal, Route change, Station migration,
and replay cannot reset or extend it.

## Attribution limits

Successful verification attributes the exact disclosed statement bytes to an
authorized Endpoint key state under continuity evidence. It does not prove a
natural person's intent, statement truth, trusted wall-clock time,
uncompromised key custody, legal responsibility, counterparty cooperation,
Station honesty, or guaranteed delivery. Absence of a statement is never
evidence of its inverse. Session authenticators, ratchet tags, handshakes,
Station receipts, and Station signatures retain their narrower roles and
cannot be presented as transferable Endpoint authorship.

## Conformance and privacy

The focused suite [`tests/reliable-evidence.test.mjs`](../../tests/reliable-evidence.test.mjs)
checks exact projection bytes, deterministic digest and signature inputs,
identity continuity, sorted sets, checkpoint ordering, restart snapshots,
pending exhaustion and expiry, invalid evidence, attachment and Group
projections, and terminal limits. Corpora contain synthetic bytes and bounded
failure classes only; they contain no private keys, plaintext runtime rows,
timestamps, user identity, or legal evidence.
