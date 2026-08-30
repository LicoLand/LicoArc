# Lico Arc Generic Messaging and Resumable Attachments v1

Status: Candidate. This document is the normative projection of the machine
sources in [`spec/v1/messaging`](../../spec/v1/messaging/) and its
[`conformance/v1/messaging`](../../conformance/v1/messaging/) corpus. It does
not authorize publication or implementation-specific behavior.

## Boundary

Generic Messaging is the protected, application-neutral record layer between
peer Endpoints. The core is exactly six classes:

| Wire `kind` | Value | Correlation rule |
| --- | ---: | --- |
| `event` | 0 | `relatesTo` is optional except for Attachment Receive State. |
| `request` | 1 | `relatesTo` is optional. |
| `response` | 2 | `relatesTo` is mandatory. |
| `error` | 3 | `relatesTo` is mandatory. |
| `cancel` | 4 | `relatesTo` is mandatory. |
| `streamChunk` | 5 | `relatesTo` and `chunkIndex` are mandatory. |

No product command, conversation, user, account, storage object, Station
operation, or Station-to-Station operation is a Generic Message kind.
Product meaning remains in ordinary opaque `payload` bytes, ordinary
`contentType` values, and the one bounded `extensions` namespace.

## Deterministic protected record

After Pairwise Protection, a Generic Message is one deterministic definite-
length CBOR map. Map keys are the compact unsigned labels below; semantic
names are not wire strings. Tags, floating-point values, negative labels,
indefinite lengths, duplicate labels, unknown core labels, and trailing bytes
are rejected before any state transition.

| Label | Name | Type | Presence |
| ---: | --- | --- | --- |
| 0 | `messageId` | `bstr` exactly 16 octets | mandatory |
| 1 | `kind` | unsigned 0..5 | mandatory |
| 2 | `relatesTo` | `bstr` exactly 16 octets | conditional |
| 3 | `contentType` | unsigned 32-bit | mandatory |
| 4 | `payload` | `bstr` 0..262,144 octets | mandatory |
| 5 | `extensions` | map `uint32` to `bstr` | optional |
| 6 | `critical` | sorted unique `uint32[]` | optional |
| 7 | `chunkIndex` | unsigned 64-bit | conditional |
| 8 | `chunkFinal` | boolean | conditional |
| 9 | `attachmentId` | `bstr` exactly 16 octets | conditional |
| 10 | `attachments` | bounded descriptor array | optional |

`messageId` is stable across retry, restart, re-protection, and Route change.
The same identity with different protected meaning is rejected. `relatesTo`
names the exact protected Message being advanced; it is not a transport
correlation identifier.

For `streamChunk`, an attachment chunk has `attachmentId` and forbids
`chunkFinal`; a non-attachment stream has `chunkFinal` and forbids
`attachmentId`. The six core classes and all conditional fields are closed;
adding a seventh class requires a new Protocol Line.

## Payload and extensions

An ordinary Payload is an exact byte string. Lico Arc carries the supplied
bytes without parsing, compression, normalization, transcoding, or rewrite.
The complete protected packet is charged to Pairwise Protection, and each
retransmitted packet is charged to the Reliable Exchange retransmission
budget. Protected packet octets are never charged again as HTTPS carrier
overhead. A reserved Lico Arc `contentType` switches
the Payload to the one closed control grammar defined below.

Extension labels are accepted only in the application namespace
`65536..2147483647`. Labels `0..65535` and `2147483648..4294967295` are
reserved and fail closed. At most 16 extensions, each at most 4,096 bytes, are
carried. `critical` is the sole criticality declaration; each value must name
an extension member and a value must be recognized by this Protocol Line. v1
recognizes no critical extension, so a non-empty critical array is a typed
`unknown-critical-extension` terminal failure. Unknown non-critical extension
bytes remain opaque and may be ignored by an implementation that otherwise
accepts the record.

Reserved `contentType` values occupy `4294901760..4294967295`. The only v1
value is `4294901761` (`attachmentReceiveState`). Every other value in that
range is an `unknown-reserved-meaning` terminal failure. Ordinary values are
`0..2147483647` and never acquire Lico Arc semantics. Every allocated numeric
value is permanent: it is never reused or semantically reassigned. A new
meaning receives a new value, and neither application capability support nor
Protocol Line/Profile selection is encoded through `contentType`.

## Attachment declaration and fixed geometry

An attachment descriptor is a member of the immutable declaring Message's
`attachments` array:

| Label | Name | Type |
| ---: | --- | --- |
| 0 | `attachmentId` | `bstr` exactly 16 octets |
| 1 | `mediaType` | unsigned 32-bit registered token |
| 2 | `byteLength` | unsigned 0..8,388,608 |
| 3 | `contentDigest` | `bstr` exactly 32 octets |

The array has at most eight unique attachment IDs. The Protocol Line fixes
`ATTACHMENT_CHUNK_BYTES = 65,536`; a sender cannot select or negotiate a
different grid. Checked arithmetic derives all geometry before allocation:

```text
chunkCount = byteLength == 0 ? 0 : ceil(byteLength / 65,536)
chunkOffset(i) = i * 65,536
chunkLength(i) = min(65,536, byteLength - chunkOffset(i))
```

`chunkCount` must be at most `MAX_ATTACHMENT_CHUNKS = 128`. A non-final slice
has exactly 65,536 bytes; the final slice has exactly the derived remainder.
There is no transmitted chunk size, count, offset, length, per-chunk digest,
transfer ID, or resume token. The protected tuple
`(relatesTo, attachmentId, chunkIndex)` binds exactly one stable chunk
`messageId` and one immutable raw slice. A duplicate tuple is idempotent only
when both identity and bytes match; a changed identity or bytes is the typed
terminal `conflicting-chunk` outcome.

`contentDigest` is the sole whole-content integrity authority. It covers the
raw slices in ascending index order and is checked only after every derived
index and exact total length have been durably accepted. A mismatch is the
terminal `digest-mismatch` outcome. A caller supplies bounded chunk access and
a streaming digest; protocol code never requires a full attachment copy.

## Attachment Receive State

The receiver reports normal attachment progress using a protected `event`
whose `relatesTo` is the declaring Message and whose `contentType` is
`4294901761`. Its Payload is one deterministic CBOR map:

| Label | Name | Type | Presence |
| ---: | --- | --- | --- |
| 0 | `attachmentId` | ID128 | mandatory |
| 1 | `requestedChunkRanges` | bounded range array | mandatory |
| 2 | `stateUpdate` | unsigned 0..64 | mandatory |
| 3 | `outcome` | 0 pending, 1 complete, 2 cancelled, 3 failed | mandatory |
| 4 | `failureCode` | closed failure enum | conditional |
| 5 | `recoveryRound` | unsigned 0..32 | mandatory |

Each range is a map `{0 => startChunkIndex, 1 => endChunkIndexExclusive}`.
Ranges are non-empty, half-open, strictly ordered, disjoint, and non-adjacent.
There are at most `MAX_REQUEST_RANGES = 32` ranges and at most
`MAX_REQUESTED_CHUNKS = 128` covered indexes in one state. Invalid arithmetic,
ordering, overlap, adjacency, count, or coverage rejects the complete control
record; input is never silently normalized.

Non-empty ranges request one bounded selective retransmission batch. Empty
ranges are valid only after all derived indexes are durably accepted, exact
length equals `byteLength`, and `contentDigest` verifies. Empty verified state
is the sole routine success report; a successful chunk never creates a routine
Endpoint Confirmation. `complete`, `cancelled`, and `failed` are absorbing.

Every changed state uses a new `messageId`; a byte-identical duplicate state
is idempotent. `stateUpdate` and `recoveryRound` cannot decrease or reset.
Across one attachment lifetime the Endpoint enforces:

| Bound | Value |
| --- | ---: |
| `MAX_ATTACHMENT_STATE_UPDATES` | 64 |
| `MAX_ATTACHMENT_RECOVERY_ROUNDS` | 32 |
| `MAX_ATTACHMENT_RETRANSMITTED_CHUNKS` | 256 |
| `MAX_ATTACHMENT_CONTROL_BYTES` | 16,384 |
| `ATTACHMENT_RECOVERY_WINDOW` | 86,400 seconds |

Retry, reconnect, session renewal, Route change, and Station migration cannot
refresh a bound or extend the window. A lower state update is
`stale-state`; a return to an earlier counter or recovery round is
`reset-attempt`; a request after absorbing terminal state is
`terminal-reopen`. Bounds fail with typed `state-bound-exceeded`,
`recovery-round-exceeded`, `retransmission-bound-exceeded`, or
`control-budget-exceeded` outcomes. Terminal tombstones and tuple deduplication
state are retained through the recovery window; storage layout and retry
scheduling remain implementation-local.

The canonical maximum Generic Message record is 328,503 octets. The canonical
maximum Attachment Receive State is 256 octets, including its complete map,
labels, range array, and values. The lifetime control budget is exactly 64
maximum-size states, or 16,384 octets; rejected or duplicate input does not
consume that budget or mutate attachment state.

## Failure outcomes

The parser and attachment state machine use closed outcomes rather than free-
form diagnostics: `unknown-core-label`, `unknown-kind`,
`unknown-reserved-meaning`, `unknown-critical-extension`,
`non-canonical-wire`, `missing-correlation`, `invalid-geometry`,
`invalid-length`, `conflicting-chunk`, `digest-mismatch`, `stale-state`,
`reset-attempt`, `terminal-reopen`, and the bounded resource outcomes above.
`duplicateChunk` is non-terminal only for an identical tuple, Message identity,
and Payload; a conflicting duplicate is terminal.

## Conformance and privacy

The focused Node corpus in `tests/generic-messaging.test.mjs` checks exact
deterministic bytes, all six classes, ordinary opaque byte round trips,
extension and reserved-label policy, descriptor boundaries, fixed geometry,
canonical ranges, typed terminal outcomes, malformed encodings, and streaming
digest accounting. It does not inspect product Payload meaning, storage, retry
queues, Stations, or private runtime data. The conformance fixtures contain
synthetic bytes and identifiers only; no machine identity, credentials, or
backend state is part of this contract.
