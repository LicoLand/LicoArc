# Durable communication continuity — V1

This is normative for every LicoArc Endpoint and every adapter claiming durable
LicoArc delivery. Nostr is an optional adapter, not an identity, storage or
lifecycle dependency. Standard Nostr chat is a separate upstream compatibility
claim. No implementation brand, official service, local workflow engine, AI
model, operating system or database is a conformance requirement.

## 1. Four independent lifetimes

A protected conversation is a persistent, user-authorized peer or Group scope.
Its random 128-bit reference is namespaced by its authenticated origin and
membership. Connections, sessions, transport envelopes, capability revisions,
UI instances and Agent processes are not that conversation's identity.

A logical message/request and its exact protected intent survive reconnect,
route changes, key/session renewal and adapter replacement. The existing logical
message identifier and intent digest remain authoritative. A new transport
packet does not create a new task, recipient, consent or external effect.

Capability changes update existing authorized conversations; they MUST NOT
rebind identities, restart conversations or rebuild cryptographic sessions.

An accepted message, attachment, pending pairing, approval, result or dispatch
intent has NO protocol-imposed TTL, cumulative retry limit or lifetime transition
budget. Elapsed wall time, local clock changes, inactivity and cache eviction
MUST NOT cancel, delete or permanently fail accepted work. Explicit user deletion
and explicit application semantics (for example, an authorized business deadline)
are distinct from transport expiry and must be visible and recorded. A deadline
can prohibit execution without deleting the conversation or result evidence.

## 2. Admission, custody and storage

Durable acceptance means the authenticated record, its recoverable payload (or
complete retained ciphertext and required recovery material), stable identity,
disposition and anti-replay state are atomically committed before acknowledgment.
A successful transaction must survive the declared crash/restart model. Memory
queues, fetched bytes and an unverified digest are not durable acceptance.

Endpoint stored, human read, waiting for approval, executor accepted and effect
completed are distinct facts. A user need not open the interface for the device
to save incoming records. A standing authorization policy may allow an Agent to
process them without another prompt. Mere receipt never creates such a policy.

The sender owns an outbox until an authorized receiving Endpoint confirms durable
custody, or the user explicitly authorizes a different custody-risk policy. A
Station receipt reports that Station's claim only. Stations are untrusted; neither
one nor several receipts prove possession or delivery. A conforming custodian
commits before returning acceptance and retains accepted opaque items until an
authorized settlement/deletion, not a fixed age. Quota checks happen BEFORE that
commit. Refuse or backpressure new work rather than evict already accepted work.
An unapproved unsolicited sender has no entitlement to indefinite disk allocation.

Transport custody, endpoint history and task execution records are different.
A transport copy can be settled once required durable endpoint custody is confirmed;
that must not delete unread history, an unprocessed approval or result evidence.
Fetching or leasing an item is not settlement. A failed/expired claim releases its
exclusive claim, leaving the item available. Settlement is idempotent per item.
Retain an idempotent settlement outcome or a non-reusable retired handle frontier;
never resurrect an item because a five-minute operation cache was lost.

All bytes/custody and history-recovery keys need an actual owner. Delivery requires
at least one retained recoverable copy and an eventually available approved path.
The protocol cannot recover destroyed copies or force a malicious custodian to
retain data. A custody-loss event is visible and does not falsely become delivery.
At-rest keys remain Endpoint-owned; Stations retain ciphertext, not plaintext keys.

## 3. Budgets are processing budgets, not message lifetimes

Per-frame size, parser depth, cryptographic counter/nonce range and atomic-operation
bounds remain mandatory. Runtime CPU, concurrent sessions, hot caches, pending
reassembly and synchronization-page sizes are separately bounded. They do not
limit total accepted messages, attachments, conversations or capabilities over a
user's lifetime. Spill already accepted state to durable storage; refuse new
custody before acknowledgment if that storage cannot accept it.

A batch may stop after its retry/route/settlement/control budget, recording
waiting-for-connectivity or paused-resource. It resumes on a permitted scheduling
turn, connectivity change, missing-data arrival or user action. Do not spin on a
failed peer or invoke a model merely to keep a queue alive. Batch counters may
reset; business identities, replay guards and nonce counters never reset.

Transport leases and temporary unauthenticated reassembly may have implementation
chosen timeouts, but accepted fragments must either remain in a durable spool or
be reconstructible from retained custody. Incomplete input cannot occupy unlimited
RAM. No timer emits a fabricated business rejection or effect completion.

## 4. Asynchronous pairing and cryptographic recovery

Pairing is a durable user/peer-policy-approved intent. Both endpoints can alternate
online periods indefinitely. Persist each prepared first packet, tentative session,
exact acceptance and protected association before emission; resume the recorded step
when material arrives. No ten-minute round-trip requirement exists. Repeated messages
return the same committed answer. Simultaneous attempts use independent nonces and
sessions; select the lexicographically smaller mutually confirmed session-context
as the sending session after both exist, retaining other sessions while referenced
by pending receive/replay state. Selection grants no additional peer trust.

Paired one-time prekeys remain indivisible and non-reusable. Admission depends on
current accepted identity authorization and the responder's persistent active-pair
inventory, not wall-clock expiry. Replayed or consumed pairs cannot be reopened.
Prekey availability messages are not authoritative reservations. Limit hot inventory
and issuance rate; keep unresolved approved exchanges/replay answers in durable
storage. Revocation or explicit discard is an authenticated security event, not an
inactivity timeout. It may require fresh material without destroying the original
pairing/work intent. Do not discard the last recovery material for pending custody
without an explicit user-visible loss or a completed protected replacement.

A ratchet skip bound limits ONE derivation attempt. Keep not-yet-decryptable ciphertext
in the durable spool, request earlier packets/checkpoint data and process bounded
batches. Do not allocate from attacker-provided counters. When required old material
is deliberately retired, a sender retaining the original intent may produce a fresh
protected packet in a newly authenticated session, for the same authorized recipient
and business identity. Ratchet counters never rewind; old bytes are never reencrypted
with a reused key/nonce. No standard-chat fallback or second business authorization.

Restoring user authority, recoverable content and live sending state are separate.
An old backup MUST NOT be used to resume a rolled-back ratchet or executor generation.
Recover content/intent and replay frontiers, establish fresh safe sessions as needed,
and reconcile unknown external outcomes before retrying any side effect. Missing
recovery keys are not recreated by identity recovery. Capability updates never invoke
this identity/session recovery procedure.

## 5. Facts, ordering and cancellation

Authenticate each incoming confirmation with its actual sending session and verify
the expected authorized Endpoint. Its stable fact identity covers the logical message,
Endpoint, stage, outcome, failure and result binding; it excludes the current session,
route, envelope id and arrival time. Reauthentication over a replacement session does
not turn the same fact into a conflict. A confirmation identifier is the first 16 bytes of SHA-256 over ASCII
`LICOARC-RELIABLE-CONFIRMATION-V1\0` followed by canonical JSON of the complete
confirmation excluding confirmationId, plus senderEndpointRef. Absent optional
fields stay absent. The receiver recomputes it before admission. Thus an identifier
cannot be reused for different meaning, and unlimited random-id history is unnecessary. Repeated facts with different transport/confirmation ids coalesce.

An authenticated successful effect completion, with matching task/result evidence,
implies prior acceptance even if the acceptance receipt is delayed or lost. Store
completion while result content is missing; verify the digest against the actual
received result before displaying its content as verified. The caller is NOT expected
to predict the output digest before execution. Late acceptance cannot move completed
work backwards. A local timeout/resource error only changes delivery knowledge to
unknown/paused; it is not an authenticated failed effect.

Store at most the current fact per stage plus bounded explicit conflict evidence in
the hot reducer. Persist/compact confirmation-id guards separately; no clock-based
forgetting of an unresolved task. Conflicting authenticated terminal facts produce
an evidence-conflict disposition and require reconciliation; do not choose by arrival
order or automatically rerun. Unauthenticated claims neither mutate facts nor consume
permanent history. A task with known terminal facts never starts a second execution.

A cancel message is a durable request to stop, not proof that execution stopped.
The receiver atomically prevents a not-started execution or requests cooperative stop
of a running one. A cancellation acknowledgment states what actually stopped and any
known completed/partial effect. Previously completed work can still be reported after
a cancel request. A terminal disposition prohibits restarting execution, not recording
late evidence. Current revoked execution permission is rechecked at the action boundary.

## 6. Effects, devices and groups

Persist an executor admission record BEFORE invoking an external action. Its key
includes the authorized task origin/scope and stable task id; its value binds exact
intent and an explicit eligible execution target. Duplicates return existing status.
Only one holder may pass the atomic not-started -> running transition. Failure after
an external effect but before result persistence is outcome-unknown; query/reconcile
using the same external idempotency key, or require review. Do not blindly reexecute.

One person's multiple inbox copies do not grant multiple execution rights. A request
names an explicit device/Agent target or an application-defined coordinated executor
set. A failover needs an authoritative handoff/fencing mechanism checked by the effect
service, or confirmation that the previous executor did not execute. A lease expiring
alone cannot make an isolated old worker harmless. No generic exactly-once-effect
claim is made for arbitrary external systems.

Device delivery, person-level delivery policy, user-read and group-member delivery
are independent. A dormant tablet does not veto a phone's confirmed receipt unless
the sender explicitly requested all-device custody. Group membership/version checks
continue to protect authorization; historical content and current execution permission
must not be conflated. See group continuity for authenticated catch-up and conflicts.

## 7. Adapter independence and catch-up

A core Endpoint can operate without Nostr. HTTPS carriage, Nostr carriage, Group
collaboration and federation governance have separately declared conformance targets.
Adapters do not own conversation, intent, capability or final-result identity.
Switching an approved equally protective adapter is not a security downgrade.

Persist source-specific fetch progress and a stable pending-message inventory. Creation
timestamps, Nostr randomized wrapper timestamps and transport cursors are not proof
that all older messages have arrived. Catch-up combines paged history/reconciliation
with authenticated receipts and explicit unresolved ids. Late uploads and reordered
updates must not be permanently skipped by a `since lastSeenTime` optimization.
A standard Relay may not expose a receipt-independent durable cursor: use conservative
paged rescan and sender reconciliation, and do not claim stronger cross-client delivery
than both parties implement. No guessed public relay is an authorized private inbox.

Same-attempt retry reuses stored native and wrapper bytes. A later delivery attempt
may create a fresh Nostr wrapper under upstream rules for the SAME protected object;
inner/native/message deduplication remains authoritative. If a new cryptographic packet
is required, preserve the original protected intent as above. Reject altered meaning.

## 8. Evidence and review boundary

Schemas and pure reducers define behavior and exercise synthetic authentication
preconditions. They are not a storage engine, network implementation or cryptographic
proof. Every SDK must test crash points, mixed connectivity, real cryptography,
independent peer interoperability and its chosen custody/effect adapters. Changing
semantic sources invalidates old proof-admission evidence; retained prior proofs must
not be relabeled as proof of this revised Candidate. V1 names stay; content digests change.
