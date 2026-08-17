# Lico Arc Reliable Exchange v1

Status: Candidate. This document is the normative projection of the machine
sources in [`spec/v1/reliable`](../../spec/v1/reliable/) and the positive and
negative corpus in [`conformance/v1/reliable`](../../conformance/v1/reliable/).
It does not authorize publication, a database, a queue implementation, or an
application effect.

## Boundary and guarantees

Reliable Exchange is the Endpoint-protected state layer between Generic
Messaging and application-owned effects. It carries one stable Protected
Intent and logical Message identity through an at-least-once path whenever a
conforming path is available. A Station may receive, drop, delay, replay,
reorder, suppress, or misreport a packet; a Station signal is only an
untrusted transport hint and never advances Endpoint Accepted or Effect
Completed.

The profile deliberately does not promise exactly-once local effects,
guaranteed Station delivery, trusted time, a retry scheduler, or a storage
engine. The application receives a bounded idempotency input and owns effect
idempotency. Reusing an idempotency input for different canonical meaning is a
terminal conflict.

## Stable intent and retry

The Protected Intent digest covers the stable logical Message identity,
application idempotency input, exact User Payload bytes, content type, and
peer-visible meaning (plus any complete attachment or Group projection
commitment). A retry with the same Route reuses the exact protected packet
bytes. A Route change may re-protect the same Protected Intent and produces a
new transport packet, but it cannot create a second authorization or effect.
Restart restores the serializable snapshot before processing new input; it
never discovers a retired state root and never resets a retry, Route,
confirmation, attachment, or evidence lifetime bound.

Each event is validated against the complete immutable current snapshot before
one atomic new snapshot is committed. The tagged states are data, not a class
hierarchy: outbox states are `created`, `in-flight`, `ambiguous`, `accepted`,
`completed`, `cancelled`, and `failed`; inbox states additionally include
`new`, `pending-evidence`, and `effect-pending`. A same-identity, same-bytes
replay is idempotent. The same identity with a different protected meaning is
`intent-conflict` and cannot mutate state.

`ambiguous` records preserve the intent for a caller-selected retry. A
`terminal` result is absorbing until its bounded tombstone retention ends;
attempts to reopen it are rejected. Retry, reconnect, session renewal, Route
replacement, Station migration, and replay do not refresh any fixed counter
or window. Bounds include retry transmissions, Route migrations, transitions,
pending messages, terminal tombstones, and persisted snapshot bytes.

## Endpoint confirmation and effects

One Endpoint confirmation has one stage, one outcome, one optional failure
code, and one sorted unique `confirmedMessageIds` array. The array is bounded
by `MAX_CONFIRMATION_IDS`; different stages or outcomes require separate
confirmation identities. A duplicate confirmation is accepted only when its
canonical bytes match. A different result for one confirmation identity is a
terminal `confirmation-conflict`.

The stages remain distinct:

1. Station Received is a non-authoritative hint.
2. Endpoint Accepted is a checkpoint-covered Endpoint statement that the
   protected record was durably accepted and deduplicated.
3. Effect Completed is a checkpoint-covered Endpoint statement that the
   caller-owned local effect completed.

Endpoint Accepted and Effect Completed cannot be advanced from a Station
receipt, queue possession, lease, timestamp, or Station signature. The
Reliable Exchange machine does not execute or deduplicate application effects;
it supplies the idempotency input and records the Endpoint result.

## Attachments and Group projections

Attachment recovery reuses Generic Messaging's fixed chunk grid and bounded
Receive State. A non-empty range request is selective recovery feedback; a
successful chunk does not generate a routine confirmation. Empty ranges are
valid only after exact length and whole-content digest verification, and the
final empty verified state requires an Evidence Checkpoint before attachment
completion advances. Completion, cancellation, and failure are absorbing.

Group delivery keeps one stable projection identity per recipient. Results are
sorted by recipient Endpoint reference and are independently `pending`,
`delivered`, `rejected`, or `failed`. The aggregate is `complete` only when all
members are delivered, `failed` only when every member is terminal and none is
delivered, and `partial` otherwise. Station results cannot supply a member's
Endpoint evidence or change the aggregate.

## Conformance and privacy

The focused suite [`tests/reliable-evidence.test.mjs`](../../tests/reliable-evidence.test.mjs)
checks deterministic CBOR, exact stable intent and packet retry behavior,
Route migration, application idempotency conflict, confirmations, attachment
recovery, Group partial failure, restart snapshots, typed terminal outcomes,
and the adversarial corpus. Fixtures contain only synthetic bytes and bounded
reason classes. No scheduler, storage layout, plaintext runtime data, Station
queue state, or application command meaning is part of this profile.
