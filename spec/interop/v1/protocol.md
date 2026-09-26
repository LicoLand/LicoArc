# Nostr interoperability and LicoArc extensions — V1

## 1. Authority and independent conformance targets

This is the unreleased initial V1 / Generation 1. Nostr is an optional transport
and ecosystem adapter. A LicoArc core Endpoint MUST work without Nostr using another
approved carrier. The durable contract in `spec/v1/reliable/continuity.md` and live
capability contract in `spec/v1/messaging/capabilities.md` are native, not Nostr-owned.
The manifest's `nativeProtocolLineId` identifies the current core definition; a
semantic change recomputes it instead of preserving unpublished obsolete bytes.

`nostr-dm` provides unmodified common NIP-17 private text interoperability.
`nostr-carrier` provides NIP-01/44-v2/59 event carriage and inbox discovery without
requiring a chat UI or kind-14 authoring. `licoarc-enhanced` uses that carrier plus
LicoArc endpoint core and this binding. Enhanced-service implementations need not
also implement standard-chat behavior. A complete user-facing compatible chat client
implements both. Each support claim names the actual target and optional features.

No official client, LicoUp workflow runtime, official relay, client allowlist or
federation membership is needed. Group collaboration, native HTTPS Station operations
and federation governance are independently scoped capabilities, not requirements on
standard Nostr relays. Nostr upstream owns its existing formats at the pinned revision.
The LicoArc binding owns only its extensions. Event carriage alone is not chat interop.

## 2. Standard private-message path

Use NIP-01 event verification and relay interaction, NIP-17 private messages, NIP-44
version 2 and NIP-59. Text is a kind 14 unsigned rumor, sealed as kind 13, gift-wrapped
as kind 1059 separately for each recipient and the sender. Preserve upstream reply,
room and timestamp-randomization behavior without LicoArc-required fields.
Verify signatures, ids, MACs, intended recipient and matching seal/rumor authors before
display; a random wrapper key is not the sender. Deduplicate by authenticated sender
and rumor id. Kind 14 content is plain text, never an executable control packet.

Retrieve the recipient's authenticated kind 10050 inbox-relay list using upstream
replacement ordering. Use user-selected/previously known discovery relays and cached
signed lists to find it; do not publish private data to discovery relays or to unrelated
NIP-65 read/write relays. Refresh on reconnection and delivery failure; absence or
conflicting/unverifiable information is inbox-unavailable, not a guessed broadcast.
Support NIP-42 on selected relays when required. A relay's limits/receipts do not prove
security, custody or delivery. NIP-11 limits inform resource admission; NIP-19/21 are
optional presentation conveniences. Keep one fetch cursor per source and an unresolved
message inventory. Creation-time-only fetching cannot establish complete catch-up.

Optional files, reactions, edits, deletion and disappearing messages need independent
implementation claims. No NIP-04 fallback is defined. Standard NIP-44 is not claimed to
provide forward secrecy, post-compromise recovery or post-quantum protection. A
user-selected business expiry/deletion is not evidence that every remote copy disappeared.

## 3. Enhanced framing

Publish only kind 1059 gift wraps for durable enhanced work. The authenticated inner
rumor is application kind 44900 with exactly `[["t","licoarc.v1"],["p",recipientPubkey]]`
and canonical JSON carrier content. Kind 44900 is experimental and unallocated upstream,
NOT an approved NIP. Require kind and exact namespace; unknown values are unsupported,
not chat or instructions. NIP-78 is private app storage, not this interchange. Do not
publish a bare extension rumor or seal. Outer tags never expose channel, capabilities,
Endpoint identity or protected content. Enhanced data is wrapped only for the authorized
remote account; device history synchronization needs its own authorization.

The envelope has exactly `channel`, `type`, `digest`, `length`, `index`, `data`.
`channel` is a fresh 128-bit pairing/transport reference, not a conversation or an
authenticator. `type` selects the native deterministic-CBOR endpoint-identity,
user-authority, prekey-bundle, first-packet, session-accept or raw protected-record
header-CBOR || ciphertext || tag. Native type-specific bounds still apply.

Hash the complete original bytes with SHA-256, split into consecutive 8192-byte
fragments, and encode each fragment in canonical padded standard Base64. Derive
fragment count from length; all non-final fragments are full-sized, the last has the
exact remainder. Preserve original protected bytes; a matching hash is not authentication.
The event must fit the local maximum and selected relay's smaller limit. Refusal cannot
authorize weaker encryption, unrelated relays or another recipient.

Reassembly keys include authenticated seal author, recipient, channel, type and digest.
Accept any part order; identical parts coalesce, conflicting parts reject without
altering accepted parts. Reserve declared bytes against quotas before allocation.
Hot reassembly bounds limit one working set, not logical lifetime. Persist accepted
parts/spool references or guarantee retained recovery custody before reclaiming hot
state. There is no age-based assembly failure or pairing expiry. Native authentication,
revocation, consumed-prekey and replay checks remain mandatory on complete objects.

Same-attempt retry uses the stored native packet and Gift Wraps. A later attempt may
make fresh outer wraps of the SAME protected object for late-upload/relay compatibility.
No fresh native nonce is required merely to rewrap; fresh native reprotection, when
needed, follows core continuity and keeps the exact logical intent. Rewrapping never
creates a new authorization or business request. Ephemeral 21059 is not used for
accepted durable tasks; another explicitly declared transient capability can use it.

## 4. Asynchronous pairing and identity-only binding

Nostr accounts and LicoArc user/Endpoint keys are distinct namespaces. Never reinterpret
or silently derive one from the other. One account shared by devices is not a device
roster, legal identity or execution authority. Every Endpoint retains independent keys.

Persist a user/standing-policy-approved pairing with fixed initiator and responder
accounts. Exchange identity and user-authority records, including missing predecessors,
then an exact signed active prekey pair. Validate native continuity, possession, peer
trust and signatures. Both parties may be offline between ANY steps without cancelling
this intent. Persist exact answers before transmission, replay them after restart.
Local quota pressure pauses new work, not already accepted pairing state. Responding
to unsolicited pairing requires local policy. Public discovery materials contain no
application request; they do not acquire post-quantum metadata confidentiality.

Follow native atomic paired-prekey redemption, first-packet and SessionAccept rules.
Clock-based prekey expiration is not part of this revised Candidate. Consumed/revoked
material is never reused; acquire fresh material when necessary without losing the
conversation/request. Only after native confirmation and protected authority admission
may identity binding and live capability messages be accepted as control.

An identity binding is a protected Generic Message event, contentType 1279328257, with
canonical JSON per binding.schema.json: binding semantic id, channel, fixed accounts,
native session-context digest and persistent `conversation`. The conversation reference
is agreed within an already approved peer/Group scope; it grants no new membership.
Verify exact values against the authenticated native session, outer account context
and local association. Binding mismatch affects that association, not unrelated work.

The binding contains NO capability list. Its immutable identity fields may not be
rewritten inside a session. Tool changes, capability availability and permission
changes use independent protected live updates and NEVER trigger rebinding. A key or
account replacement is a different security event requiring approved continuity and a
safe session; the existing user-visible conversation and logical work survive it.

Identity binding acknowledgment can use the digest of role-ordered identity records
under `LICOARC-NOSTR-V1/AGREEMENT\0`. This is a session-control fact, not a field in the
business request identity. It cannot force a new request when a session changes.

Application packets received before binding remain in a durable native inbox with
`binding-pending` disposition and no execution. Commit retained payload/disposition
with native replay/ratchet state; never consume a key and lose the only payload.
There is no expiry of this accepted work. Quota refusal happens before native commit,
retaining ciphertext custody. When binding succeeds, list candidates and apply normal
receipt/authorization rules; remove pending custody only in a successful durable handoff.

## 5. Live capabilities and collaboration

Use the native live capability record/page messages on existing sessions. Each authorized
conversation gets relevant updates; roles distinguish a requester who understands the
interface from a provider with the tool. Offline repair, removal records, exact interface
digests, generation/revision ordering and scoped disclosure follow capabilities.md.
No global frozen intersection is part of the cryptographic or identity handshake.

A protected Generic Message with contentType 1279328258 carries canonical JSON
`{conversation,capability,payload}`; payload is Base64 application bytes, capability is
id+definition. The protected intent contains this stable content, not a session-specific
agreement. Generic kind, messageId, relatesTo, attachment and group identities keep their
meaning. Target/authorization and actual body/result grammar belong to the independently
published application contract; any client implementing it can participate.

Receive validation checks authenticated scope, closed structure and payload bounds.
It does NOT require permission to execute. Durably store a request as waiting-approval or
unsupported when appropriate; store responses, progress and cancellation facts against
their existing request. The action boundary separately checks current invocation/provider
compatibility, target and authorization. A stale advertisement cannot authorize an effect.
Unknown capabilities never dispatch to a tool, but need not destroy the whole conversation.

## 6. Path selection and evidence

Every send has a locally authorized requirement: standard-chat, enhanced-message or
enhanced-collaboration. The adapter may report unavailable; the core queues accepted
intent for a later approved path. Never silently copy an enhanced task into kind 14,
NIP-04, plaintext, another recipient or an unrelated relay. Switching equally protective,
authorized carriers is not downgrade and does not create new work.

NIP-59 does not hide all recipient routing, IP/authentication, traffic, size or timing.
No relay deletion, unconditional availability, honest-client-code or automatic historical
key recovery guarantee is made. Standards and the native cryptographic primitive choices
are reused, not reinvented. New composition/continuity semantics require their own proof
review and real-client qualification. Synthetic tests and deterministic models are not
production crypto, storage or interoperability evidence. V1 revision changes must update
content identities, source-closed artifacts and website pins together.
