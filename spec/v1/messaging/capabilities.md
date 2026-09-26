# Live application capabilities — V1

## Scope and records

Capability state is an Endpoint-authenticated protected application control stream,
independent of identity binding, cryptographic session, transport and conversation
lifetime. Updating a capability MUST update every existing authorized affected
conversation and its local subscribers without rebinding or reconnecting. Online
peers receive updates promptly; offline peers repair state after reconnection. No
protocol can promise instantaneous delivery across an unavailable network.

A record has `issuer`, `audience`, `generation`, `revision`, `capability`, `role`,
`availability`. The closed schema is capability.schema.json. `issuer` is the stable
Endpoint reference. `audience` is an approved protected conversation/scope reference,
not a public account profile. `capability` contains a namespaced interface id and
its exact semantic definition digest. `role` is `invoke` or `provide`.
`availability` is `available`, `unavailable`, or `removed`.

The key is (issuer,audience,capability.id,capability.definition,role). A complete
record replaces the previous state of THAT key only. Revisions strictly increase
per key under one issuer-controlled generation. Equal revision/equal bytes is a
duplicate; equal revision/different bytes is a conflict, not last-arrival-wins.
Older revisions never restore removed capabilities. A newer complete record may
skip intermediate revisions because it contains the full current state for that
key, not an unverified partial patch. Removal is an explicit authenticated record.

A generation is a 128-bit unpredictable reference authorized by the current issuer
identity chain. It is not a session id. Changing generation requires authenticated
retirement of its predecessor and complete state synchronization; old generations
remain rejected by a persistent frontier. It does not rebind conversations. Restored
backups cannot reuse an earlier revision sequence. Numeric overflow does not wrap.

## Roles and dispatch

An invoking client need not have the providing tool installed. It must understand
how to encode the request/interpret the result; the provider must implement the exact
interface. Compatibility is invoke/provide matching on interface id+definition, not
possession of identical local tools. Multiple interface versions can coexist.
A tool implementation update without a public semantic change does not change the
interface digest. Definitions own their own types and effect semantics; core does
not contain LicoUp's tool catalogue.

Presence, supported interface, current availability and permission are separate.
Only the first three are described here. Availability can change while a task runs.
A new capability or a matching digest never grants execution rights. Current permission
is checked at the action boundary. Revocations take precedence over new invocations;
old tasks retain their original semantic contract but not revoked permissions.
Ordinary tool retirement leaves accepted work intact until its owner completes it,
explicitly rejects further execution or arranges an authorized handoff.

Receipt validation stores authenticated requests/results/progress/cancels even when
execution is not approved. Unknown interfaces may be durably classified unsupported
rather than interpreted as a tool. Only a request entering the actual execution gate
requires the invoke/provide match, current availability and execution authorization.
Responses/progress/cancel acknowledgments bind existing work; they do not ask for a
new tool execution grant. Do not parse ordinary Nostr chat as control data.

## Propagation, repair and bounded work

The protected Generic Message `event` contentType 1279328259 carries one capability
record as canonical JSON. ContentType 1279328260 carries a capability-page record.
These values are owned here, not by the Nostr adapter. No capability metadata,
configuration, credentials or internal endpoints are exposed in public tags.
Only authorized audiences receive the appropriate projection; local permissions and
service endpoints are not copied wholesale. Notify incremental subscribers for changed
keys only; do not rebuild every conversation or use an LLM to maintain the index.

Missing complete records may be recovered by paging a snapshot. Each page carries
issuer, audience, generation, snapshot id (a SHA-256 root of the ordered canonical
record list), index, count and at most 64 records. Each record is complete, and records
are sorted lexicographically by the canonical JSON encoding of the tuple key
using ASCII byte order, never locale collation. There is no 64-capability total limit. Page count is a
representational bound, not permission to allocate that many pages upfront. Durable
quota admission, one-page-at-a-time processing and spill apply.

Pages may arrive in any order and are idempotent. Reject conflicting pages for one
snapshot. Do not publish a partial snapshot as a complete list or infer removals from
an incomplete fetch. Verify total pages, canonical order/unique keys and the root before
marking repair complete. A snapshot must include retained removal records until a
mutually established retirement frontier makes their absence unambiguous. On completion,
merge records by per-key revision, retaining any newer live update received during the
fetch. Omission never means deletion; even a complete snapshot cannot revoke by omission.
A receiver missing an issuer generation requires its authenticated generation transition.

Prioritize authorization/security and capability-control updates over replaceable
progress traffic, with fair bounded queues so neither control nor payload starves.
Repeated state notifications can be coalesced to the newest authenticated per-key
state; accepted tasks and immutable result evidence cannot be coalesced away.

## Generation and repair wire requests

ContentType 1279328262 is an `event` with the closed generation transition
`{issuer,audience,previous,next}`. It is authenticated under the current authorized
issuer Endpoint session; it can only retire the accepted previous generation for
that issuer/audience, never another Endpoint's state. Same previous/different next
is a conflict. Duplicate committed transitions are idempotent. Missing predecessors
remain pending and request the authenticated transition chain; no time limit applies.

ContentType 1279328263 is a Generic Message `request` with
`{issuer,audience}` for a fresh snapshot, or additionally `snapshot` and sorted unique
`indexes` (one to 64 per request) to repair specific pages. These two optional fields
must occur together. A provider validates the sender's audience permission before
replying with protected page messages correlated by the existing relatesTo field.
If the requested immutable snapshot is unavailable, return the typed generic error
and a current snapshot offer; never pretend a different snapshot is the same one.
On reconnection, peers may proactively push the latest authorized snapshot. Fresh
snapshots preserve removal frontiers and do not rewind concurrent live updates.
Generation retirement hides all prior-generation capability offers immediately,
while retaining their historical records; repairs never rebind the conversation.
