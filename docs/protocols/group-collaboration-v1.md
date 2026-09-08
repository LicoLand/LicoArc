# Lico Arc Protocol v1 — Bounded Group Collaboration Profile

This document projects the machine-readable Bounded Group Collaboration
Profile v1. It is one max-64 per-member projection construction, not the
permanent or exclusive architecture for future large groups. The
normative source closure is [`spec/v1/group/`](../../spec/v1/group/) and its
positive and negative corpus is [`conformance/v1/group/`](../../conformance/v1/group/).
The profile is a complete Candidate definition closed by the tracked normative sources
and definition-level corpus named above. `licoarc.group-collaboration.v1` is
the stable capability and wire locator; the enclosing Protocol Line is bound
by a `DIGEST256` content identity selected outside this profile. This is the
complete mandatory Group capability in the Candidate line composition. The
enclosing line is `COMPLETE` and session-eligible but not publication-eligible;
this capability makes no implementation or interoperability claim.

## Boundary and trust

Endpoint, Station, and Network remain the only core entities. Station is never protocol authority. A Group is a
protected versioned object, not a User, Device, account, room service, Network
membership, or fourth entity. Every independently key-holding participant is
an Endpoint reference. Group state, roles, message context, and results are
inside Endpoint protection; a Station carries opaque packets and has no
membership, ordering, group-key, receipt, or state-transition authority.
Product permissions, command catalogues, and application identity assertions
remain outside this profile. An application assertion may use ordinary
namespaced opaque `message.payload`, which recipients treat as local-policy
input only.
Product permission remains an application decision carried only as opaque Payload.

## Canonical representation

Governance sources use restricted JSON. Endpoint runtime records use
deterministic CBOR with unsigned integer map labels, shortest definite lengths,
raw byte strings, no tags, no floats, no indefinite lengths, no duplicate or
unknown labels, and no trailing bytes. Member Endpoint references are exactly
32 opaque bytes and are sorted by raw bytes. Role is the closed enum `member`
or `state-authority`. The canonical maxima are 2,551 bytes for a Group state,
2,512 bytes for a genesis transition, 60 bytes of Group Message control and
length-prefix overhead (payload octets excluded), and 3,913 bytes for a
maximum aggregate. The payload itself remains bounded by
`MAX_GROUP_PAYLOAD_BYTES`.

The Group state digest is:

```
SHA-256("LICOARC-GROUP-STATE\\0" || canonical Group Membership State)
```

The state tuple is `(groupId, groupEpoch, previousGroupStateDigest,
members, transitionDigest)`. `groupId` is one fixed opaque 32-byte value
created at genesis and repeated unchanged. `transitionDigest` is the
algorithm-owned commitment to the protected transition input; it does not
create product authority or a new field decision.

## State and transitions

Genesis is epoch `0`, omits `previousGroupStateDigest`, and contains one to
`MAX_GROUP_MEMBERS` canonical unique member entries, including at least one
`state-authority`. Every successor is validated against the complete accepted
immediate predecessor before its member collection is copied. Its epoch is
exactly predecessor plus one, its group identifier and predecessor digest must
match, and its author must be a `state-authority` in that predecessor snapshot.
The only operations are:

- `add`, which names a new Endpoint and its closed role;
- `remove`, which names an existing Endpoint and cannot leave an empty Group
  or remove the final state authority; and
- `role`, which changes one existing Endpoint between the two closed roles and
  cannot demote the final state authority.

Transition authorization is derived only from the exact predecessor state and
its role. Station order, Station receipts, arrival order, highest numeric
epoch, Network membership, product permissions, and human or device identity
never authorize a transition. Unknown fields, roles, operations, duplicate or
unsorted members, missing or present-on-genesis predecessor digests, cross-
Group values, epoch gaps, rollback, overflow, and over-bound input fail
closed before state advance.

Two transitions with the same predecessor digest and next epoch are handled
without arrival-order selection. An identical canonical transition is an
idempotent duplicate and returns the original state digest. A different
transition is a fork and is rejected. A missing immediate predecessor is a
gap; an old epoch is stale. A removed Endpoint cannot replay a transition or a
Group Message to reopen a terminal removal.

## Group Messages and projection

A Group Message contains the existing protected logical `messageId`, one
mandatory `groupStateDigest`, and opaque Payload bytes. It does not repeat
`groupId`, epoch, members, roles, Station handles, or product permission. The
sender Endpoint supplies the authenticated session context; a receiver
resolves the exact retained state digest and rejects unknown, stale, forked,
cross-Group, or sender-ineligible context.

One logical message produces one projection per canonical member other than
the sender. Projection recipients are sorted by Endpoint-reference bytes and
are bounded by `MAX_GROUP_PROJECTIONS` (64). Each projection has a stable
`projectionId`:

```
first16(SHA-256("LICOARC-GROUP-PROJECTION\\0" || groupStateDigest ||
                messageId || recipientEndpointRef))
```

Per-member delivery remains at-least-once. A retry reuses the same logical
Message and projection identities; a projection with different protected
meaning is a conflict. Station acceptance, queue possession, ordering, or
receipt is never an Endpoint confirmation.

## Partial failure and aggregation

Each projection has one bounded result: `pending`, `delivered`, `rejected`, or
`failed`. Terminal rejection and failure carry one closed failure code. A
result with `endpoint-confirmation` authority is accepted only when the exact
confirmation comes from the protected authorized Endpoint session; a Station
result is rejected as `station-authority`. Duplicate identical results are
idempotent and conflicting results fail closed.

Aggregation emits one deterministic result tuple in recipient byte order.
Missing results are represented as `pending`. The aggregate outcome is
`complete` when every member is delivered, `failed` when no member is
delivered and every member is terminal, and `partial` otherwise. Counts are
bounded by the projection set and do not grant membership, receipt, or effect
authority.

## Restart and bounds

The retained protocol state is limited to the current high-water state,
bounded predecessor state, member tombstones, and per-member projection
results. Restart restores that state before new input; it never discovers or
imports a retired product or legacy Group root. `MAX_PENDING_GROUP_TRANSITIONS`
is 128, `MAX_PENDING_GROUP_RESULTS` is 256, and
`MAX_GROUP_EPOCH_TOMBSTONES` is 1024. Retry, reconnect, Route or Station
change, and restart never reset or extend any bound. A parser rejects
attacker-selected arrays, maps, raw bytes, and operation records before an
unbounded allocation. Group-owned record and per-member bounds are separate
from Protocol Line cross-capability totals; a rejected or duplicate input
consumes neither budget nor state. Endpoint-local admission remains outside
Group state, and no Station, Network, or product permission can extend a
bound.

## Conformance

The focused executable contract is
[`tests/group-collaboration.test.mjs`](../../tests/group-collaboration.test.mjs).
It binds genesis, add/remove/role transitions, predecessor authorization,
duplicate/fork/gap/stale/replay handling, removal, maximum and malformed
inputs, stable projection, partial failure, aggregation, restart convergence,
canonical CBOR, and the three-entity trust boundary to the profile and corpus.
