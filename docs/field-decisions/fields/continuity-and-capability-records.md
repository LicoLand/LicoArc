# Continuity and capability records

| Property | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FIELD-continuity-and-capability-records` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Scope | Stable conversation reference, per-interface capability state, update repair, confirmation facts and removal of message-lifetime limits. |

## Necessity and alternatives

`conversation` names the persistent protected collaboration scope independently
of transient transport/channel/session ids. It is 128 random bits scoped to the
approved peer or Group; it grants no identity or execution permission.

Capability state needs an authenticated issuer and authorized audience, interface
id and exact definition digest, a role (invoke/provide), an independently increasing
revision, and availability (available/unavailable/removed). The record is a complete
replacement for that tuple, not a patch whose missing predecessors must be guessed.
A state digest binds the bytes. Snapshot id/root, page index and final page count
permit bounded repair without treating an incomplete page as a deletion.

These records remain inside Endpoint protection. No new public social-graph tag,
secret, provider credential, tool configuration or endpoint address is introduced.
Per-record and per-page bounds limit hostile allocations, not the total number of
capabilities, conversations or the duration of a user's accepted work. Removing a
capability sends an authenticated tombstone, never an implicit list omission.

Do not repeat message/task/attachment identities already supplied by the Generic
Messaging and Reliable Exchange layers. Session identity is used to authenticate a
particular receipt but is excluded from its stable semantic confirmation identity.
Transport expiry and retry counts are not wire authority to cancel accepted work.

## Values, visibility and cost

Canonical protected JSON uses the closed schemas under messaging and interop.
References are lowercase hex; revisions are positive safe integers with explicit
no-wrap recovery (new authenticated stream generation, not conversation rebinding).
A capability record is bounded to 4 KiB; repair pages contain at most 64 records.
Implementations page and spill durable state rather than impose 64 total abilities.
A local quota can refuse new custody before acknowledgment, not delete old custody.

## Definition evidence

`spec/v1/reliable/continuity.md`, `spec/v1/messaging/capabilities.md`,
`spec/v1/messaging/capability.schema.json`,
`spec/v1/messaging/capability-page.schema.json`, and
`spec/interop/v1/binding.schema.json` and `collaboration.schema.json`.

## Group resolution and confirmation identity

Protected Group resolution owns `group`, `base`, `forks`, `proposal` in
`spec/v1/group/resolution.schema.json`. A base identity is necessary to determine
the authorized voters; forks identify the conflicting states; proposal binds the
complete proposed successor. All values are protected, not relay metadata. Votes
use existing authenticated Endpoint messages, not a new key or signature scheme.

The existing confirmationId remains 16 bytes, now derived from the exact Endpoint
and confirmation meaning rather than a session or random id. No new identity field
is added. Prekey `validFrom` / `validUntil` are removed: active-pair inventory and
authenticated revocation own admission. Their old CBOR labels 8 and 9 are not reused.
Two maximum nine-byte integers plus their labels are removed from the prekey and
first-packet bounds; signature primitive sizes are unchanged.

Capability generation uses the necessary issuer/audience/previous/next fields for
authenticated anti-rollback succession. The repair request uses issuer/audience
and optional paired snapshot/indexes to identify missing immutable pages. Existing
Generic Message ids/relatesTo carry request correlation; no duplicate request id,
TTL, transport id or extra signature is introduced. Exact schemas are owned by
`spec/v1/messaging/capability-generation.schema.json` and `capability-sync.schema.json`.
