# Lico Arc Transferable Evidence Checkpoint v1

Status: Candidate. This document is the normative projection of the machine
sources in [`spec/v1/evidence`](../../spec/v1/evidence/) and the positive and
negative corpus in [`conformance/v1/evidence`](../../conformance/v1/evidence/).
The implementation-neutral algorithm decision remains the lifecycle authority
for the construction; this profile closes its schemas, bounds, and failure
states without claiming an implementation or publication.

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

An Evidence Checkpoint carries the Protocol Line, signer and counterparty
Endpoint references, the exact signer Identity continuity-state digest, and a
non-empty sorted unique set of one to `MAX_EVIDENCE_STATEMENTS` statement
digests. The baseline signature set is exactly one `Ed25519` and one
`ML-DSA-65` signature, both with `endpoint-evidence` purpose. Unknown,
missing, repeated, surplus, malformed, or wrong-purpose signatures reject the
whole checkpoint. The signed input is deterministic CBOR prefixed by
`LP-EVIDENCE-CHECKPOINT\0` and excludes the signatures member itself.

An independent verifier resolves both signing keys through a bounded Endpoint
Identity continuity bundle. A missing predecessor, gap, rollback, fork,
revoked or wrong-purpose key, cross-line value, or conflicting identity state
is a typed rejection. A Station, Route, session, directory, timestamp, or
transport receipt cannot become permanent evidence-key authority.

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
