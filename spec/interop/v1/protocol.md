# Nostr interoperability and LicoArc extensions — V1

## 1. Authority and conformance

This is the initial **V1 / Generation 1**, not a V2 migration. It defines two
independent communication paths. `nostr-dm` interoperates with any client that
implements the common NIP-17 baseline. `licoarc-enhanced` adds open endpoint
protection and collaboration semantics. Neither path requires the LicoUp
product, an official service, an official client allowlist, or LicoArc Network
membership. A Nostr relay need not implement LicoArc Station operations.

The manifest fixes the upstream NIPs at one immutable commit. The referenced
NIPs own their unmodified event, encryption and relay semantics; LicoArc owns
only the choices and extensions defined here. Supporting Nostr event carriage
alone is NOT NIP-17 interoperability. Support claims MUST name the path and
implemented optional functions. This specification does not claim that any
current client implements either path or has passed cross-client testing.

The existing native V1 definition remains a complete eight-capability
composition, including native HTTPS Transport and Federation Governance. Its
cryptographic bytes, Profile and content identity are unchanged here. The
Nostr binding is an additional **outer carrier**, not a second interpretation
of those protected bytes, an alternate cryptographic Profile, or a relaxation
of their admission. Native HTTPS restrictions and governance operations apply
when that native service is used, not to standard Nostr relays or baseline
clients. Implementations claiming the complete native line must still satisfy
its complete conformance contract. Path interoperability is a narrower claim.

The Canonical Field Registry incorporates `fields.md` for this scope. Closed
schemas constrain structure; this document supplies the cross-field rules and
state transitions. Neither a schema nor a successful source test proves a
cryptographic implementation. The binding's semantic identity is SHA-256 of
canonical JSON containing ordered `{path, source}` entries for exactly the
manifest's `semanticSources`, with JSON parsed and object keys sorted and
Markdown included as exact canonical UTF-8 text. It contains no own digest,
corpus results, implementation output or publication state: lifecycle,
definitionStatus and implementationStatus are omitted from the manifest's
semantic projection. The independent bundle digest additionally binds the
complete declared definition corpus and source manifest.

## 2. Standard private-message path

Implement NIP-01 event validation and WebSocket relay interaction, NIP-17
private messages, NIP-44 **version 2**, and NIP-59 sealing/gift wrapping. A
baseline text message is an unsigned kind 14 rumor with required id and
created_at and plain-text content; it is sealed as kind 13 and gift-wrapped
as kind 1059 separately for each recipient and the sender. Replies and room
membership use NIP-17 semantics without LicoArc-required tags or fields.

Validate event ids and signatures, encryption/MACs, intended recipient, and
that the seal author equals the rumor author before displaying plaintext.
Do not treat the random wrapper signing key as the sender. Honor the upstream
created_at randomization; wrapper timestamps are not task order or identity
freshness. Deduplicate received chat by authenticated sender and rumor id,
not by wrapper id. Unsigned rumors do not provide transferable attribution.

Resolve the recipient's authenticated latest kind 10050 inbox relay list with
NIP-01 replacement ordering. Send only to that list, not to a guessed public
relay or a profile's unrelated relay list. A missing/invalid list produces
`recipient-inbox-unavailable`, not a broadcast. A client must support NIP-42
when a selected relay requires authentication; authentication is always for
the user-approved relay. NIP-11 limits can inform admission but cannot certify
security or availability. NIP-19/21 identifiers are optional UI conveniences;
wire public keys remain the specified 32-byte x-only secp256k1 public keys.

NIP-17 files, reactions, editing, deletion and disappearing-message features
are optional and must not be advertised without their specific implementation
and interoperability evidence. No NIP-04 fallback is defined. NIP-44 is not
claimed to provide cryptographic forward secrecy, post-compromise recovery or
post-quantum protection. In particular, a disappearing-message request is not
a substitute for a ratchet or proof that every copy was deleted.

## 3. Enhanced carrier, not another chat format

Only kind 1059 gift wraps are published. Inside the authenticated seal, a
LicoArc extension rumor uses dedicated application kind **44900**, exactly
`[["t","licoarc.v1"],["p",recipientPubkey]]` as its tags, and a canonical JSON
carrier envelope as its content. The rumor otherwise follows NIP-59's unsigned
event and id rules. This kind is a LicoArc-defined, unallocated experimental
kind, **not an approved NIP or a claim of upstream allocation**. Dispatch
requires both the kind and exact namespace/tag shape. Any later upstream
allocation requires an explicit reviewed Candidate change. Unknown kinds or
namespaces are not chat, instructions or authorization.

NIP-78 kinds 78/30078 are not used: private app storage is not this cross-client
interchange. Kind 14 is never parsed as a machine command. Outer gift-wrap
metadata contains only upstream routing information, never the LicoArc channel,
object type, capabilities, Endpoint identity or application payload. Do not
publish a bare kind 44900 rumor or seal. The sender-backup copy required by
standard NIP-17 chat does not authorize another recipient for enhanced data;
enhanced wraps go only to the intended remote account. Device synchronization
is a separate user-authorized path.

The complete canonical UTF-8 Nostr event must fit MAX_EVENT_BYTES and any
smaller chosen relay limit. A refusal is a transport failure, never permission
to send plaintext, choose a weaker path or publish on unrelated relays.
Ephemeral kind 21059 is not part of this V1 binding: choosing non-retention
instead of offline delivery is a different service contract, not an automatic
optimization. No sender can force a malicious relay to erase received bytes.

## 4. Object framing and bounded reassembly

An envelope has exactly `channel`, `type`, `digest`, `length`, `index`, `data`.
`channel` is a fresh 128-bit random initiator-chosen identifier for one peer
pairing/session attempt, represented by 32 lowercase hex characters. It is a
routing hint, never a session authenticator. `type` selects one existing native
object grammar: endpoint identity record, user-authority snapshot, prekey
bundle, first packet, SessionAccept, or established protected record.

`digest` is lowercase SHA-256 of the **complete original native bytes**;
`length` is their complete byte length. Split those bytes into consecutive
8192-octet fragments. `index` is zero-based; total fragments are derived as
ceil(length/8192), never separately encoded. All non-final fragments are
exactly 8192 octets; the final fragment has exactly the derived remaining
length. `data` is canonical padded standard Base64, without whitespace, URL
alphabet or a prefix. Decoding and re-encoding must reproduce it exactly.
No native object is normalized, compressed, decrypted or re-encrypted by the
carrier. Single-fragment and fragmented objects use the same grammar.

Reassembly keys include authenticated seal author, local recipient, channel,
object type and full digest. All parts must agree on length. Identical parts
are duplicates; conflicting bytes at one index reject the fragment without cache mutation. Accept
arbitrary fragment order. Bound counts and reserve the declared total length
before allocation: at most 524288 bytes/object, 64 fragments/object, four
pending objects/peer, sixteen globally and 8388608 reserved bytes globally.
Over-bound input is rejected before allocation and native state changes.

Assembly has one 600-second local monotonic deadline from first admission;
retries and duplicate fragments do not refresh it. Expiry discards only the
carrier cache and reports incomplete transport, not native task failure or
success. Repeated reassembly never extends native reliable-exchange deadlines.
All durable native replay, inbox, request and effect state survives cache
expiry and restart. Local resource admission may be stricter and reports a
resource failure rather than weakening security.

Only complete exact-length digest-verified objects reach the indicated native
validator. A hash match is NOT authentication. Wrong signature, wrong native
line/Profile, revoked identity, prekey reuse, invalid AEAD or native replay
still rejects. Rewrapping the same object never creates a new business request.
For retry, persist and retransmit identical native bytes and already-built
gift wraps; do not advance the ratchet or regenerate identity/capability state.
Receiver native replay protection remains necessary after carrier caches expire.

## 5. Pairing, native establishment and account binding

Nostr account keys and LicoArc Endpoint/user-authority keys are **different
namespaces and key types**. Never copy, reinterpret or silently derive one
from the other. A Nostr account is not a legal identity, an Endpoint, a device
roster or authority to execute effects. Multiple devices may advertise the
same account, but every native Endpoint retains independent keys and sessions.

The carried native object is exactly the `identity-update` or
`user-authority-state` deterministic-CBOR record in
`spec/v1/identity/runtime.cddl` for `endpoint-identity` or `user-authority`,
respectively. The other four types use the same-named grammar in
`spec/v1/protection/runtime.cddl`: prekey-bundle, first-packet, session-accept,
or protected-record. The last is raw header-CBOR || ciphertext || tag, NOT an
enclosing CBOR array. The native parser remains authoritative; an envelope
type mismatch is invalid. The outer 512 KiB cap is not permission to exceed
the smaller native bound for that object.

A user-approved pairing creates a pending channel with a fixed initiator and
responder Nostr account pair. The initiator sends native endpoint-identity and
user-authority objects; accepted predecessors needed by a fresh peer travel
as separate objects of the same types. A responder that locally accepts the
pairing returns its own identity/authority material and an exact native signed
prekey-bundle. Do not manufacture a prekey, reserve one at the relay or convert
a Nostr key into a prekey. Native chain, possession, bounds, signature and
peer-trust validation is mandatory before first-packet construction/admission.
No Station directory or Nostr profile chooses the authority tip.

Missing predecessors, missing prekeys or absent peer consent keep the attempt
pending within the original 600-second pairing window. At most 32 pending
channels exist locally; expiry reports `pairing-incomplete`. A refusal or
unavailability is not evidence that the other client lacks all enhancements.
Reusing an established or closed channel for another session is forbidden.
Recipient-first-contact approval or an existing user-approved peer policy is
required before answering an unsolicited pairing. No application payload is
allowed in these discovery objects: they carry public native identity/prekey
material only. Their transport does not gain post-quantum metadata secrecy.

The initiator sends `first-packet`; the responder executes the existing atomic
paired-prekey redemption and returns the exact `session-accept`. A consumed
prekey, invalid confirmation or failure has native failure semantics; no
alternative cryptographic suite is selected. The initiator commits only after
native confirmation. Both sides next complete the native protected authority
payload admission, including the exact peer Endpoint records it requires.
Discovery data and Nostr signatures are not substitutes for that admission.

Once established, each side sends exactly one protected Generic Message of
class `event`, contentType **1279328257**, whose payload is canonical JSON
matching binding.schema.json. It contains the binding semantic digest, the
channel, the fixed initiator/responder Nostr account keys, native `sessionContextDigest` as lowercase hexadecimal, and that sender's supported application capabilities. These
are inside the native protected-record, not the cryptographic handshake.
Capabilities do not select algorithms or change the native Profile.

Each receiver checks these values against its exact native session and local
pending account/channel association AND the authenticated Nostr context. A
mismatch closes that association before application admission. Native peer
trust must have been approved independently: matching public claims alone
never establishes trust. An already approved Endpoint-to-account association
cannot be silently overwritten by a profile, new device, relay or Nostr key
rotation. A replacement requires local approval and a fresh fully bound
session. Revoked native devices remain revoked even while they control a
Nostr key. Offline clients learn revocation only when valid newer native
state arrives; no immediate global-revocation guarantee is made.

Capabilities are sorted by id, have unique ids, and pair an ASCII namespaced
id with the SHA-256 digest of its exact independent application definition.
Common capabilities are the exact id+digest intersection, not version-name
similarity. Empty intersection is valid: secure messaging capability does not
imply any shared business extension. Freeze both binding records for this
session; duplicate identical records are harmless, changed records reject.
At most 256 active channels map to native sessions. Change of account,
capabilities or binding revision requires an explicitly established new bound
channel; it never rewrites the active session or downgrades an outstanding task.

After both records validate, compute `agreement` as SHA-256 of ASCII
`LICOARC-NOSTR-V1/AGREEMENT\0` (the final character is one NUL octet), followed
by canonical JSON `[initiatorBinding,responderBinding]` in that role order.
This binds both offers and the native context, without a circular digest or
another signature. Application messages that arrive before both binding
records validate have disposition `binding-pending` and MUST NOT produce
Endpoint Accepted, effects or an execution-success confirmation. Preserve the
authenticated payload and its disposition atomically in the native durable
inbox/replay transaction: at most four such messages per channel, sixteen
globally and 8388608 payload bytes globally. The original pairing deadline
bounds pending admission and is never reset by retries. Once both bindings
validate, admit held messages through the normal authorization/reliable path;
completion order does not confer execution order on concurrent operations.

A repeated native packet retrieves its stored disposition, not a second
decryption or effect. On restart, recover both native replay state and held
payloads together; never consume a ratchet key and then lose the only pending
plaintext. Resource exhaustion or expiry records an authenticated non-success
under the native contract without a business effect. It is not a successful
receipt, a reason to replay already-consumed keys, or permission to create a
new task identity or weaker compatibility copy. Before binding, only the
native authority admission and the binding control message bypass this gate.

An `enhanced-message` uses an ordinary native Generic Message after binding;
its opaque application content type still requires a mutually understood
application definition, but need not request a business capability. An unknown
content type must be surfaced as unsupported, never dispatched as a tool.
`enhanced-collaboration` below explicitly asserts an exact business capability.

## 6. Open collaboration and explicit authorization

A protected Generic Message with contentType **1279328258** carries canonical
JSON `{agreement, capability, payload}`. `capability` is the exact agreed
id+definition descriptor, and `payload` is canonical Base64 of the opaque
application bytes (at most 262144 bytes). Generic Message kind, messageId,
relatesTo, native protected intent, cancellation, attachment identities and
Endpoint confirmations keep their existing meanings; do not invent another
request identity or promote relay `OK` to an execution result.

The agreement must match the active association and the capability must be in
the frozen intersection. Unknown capabilities/digests fail without effects.
Capability support is not consent: the Endpoint applies local approval and
execution permission for each request. Plain-text chat, a Nostr signature,
a remote Agent name or a capability advertisement never authorizes a tool.
Application definitions own their typed body and result schema. This generic
contract does not pretend to define a deployment command, shell API or the
LicoUp workflow engine. Any third-party implementation of the same published
application definition can collaborate; client branding has no authority.

Local task extraction, model selection, workflow scheduling, UI and memories
remain product behavior. They do not require a wire extension unless another
Endpoint must interpret the corresponding operation. Sending content to a
model provider is a separate authorized disclosure, not implied by peer E2EE.

## 7. Path selection and failure

Every send has an explicit locally authorized requirement: `standard-chat`,
`enhanced-message`, or `enhanced-collaboration`. Standard chat uses only the
baseline. Enhanced requests use only an established, account-bound native
session; collaboration additionally requires the exact agreed capability.
Discovery advertisements and successful relay storage are not readiness.

If an enhanced prerequisite fails, return `enhanced-unavailable`,
`binding-required` or `capability-unavailable` and retain/cancel the pending
operation according to its native contract. Never silently retry it as kind
14, NIP-04, plaintext, another recipient, another unapproved relay, or a second
compatibility copy. A separately authorized standard message is a new user
operation, not a retry of the enhanced operation. Strong and baseline
conversations may coexist with explicit per-message security labels.

## 8. Security and evidence boundary

NIP-59 hides the inner sender/type from public observers but does not hide all
routing tags, IP addresses, authentication, traffic, size or timing from the
relay. Payload E2EE is not anonymity, relay non-retention, honest client code,
or confidentiality from an authorized model provider. Native cryptographic
claims remain conditional on their own model and implementation assumptions.
Those proofs do NOT automatically cover Nostr parsing, this new binding,
fragment reassembly, account association or a concrete product integration.

Definition tests here exercise deterministic framing, routing and association
rules with synthetic public fixtures. They do not implement production Nostr
cryptography, connect real clients, audit an SDK or certify the composite.
Before a product claims interoperability, its owning repository must test
standard text/replies/group fan-out against an independent NIP-17 client;
validate real NIP-44/59 vectors and signature failures; run the enhanced path
between independent Endpoint implementations through an ordinary Nostr relay;
exercise offline delivery, duplicate/reordered/lost fragments, prekey races,
revocation, restarts and mismatched capabilities; and verify that no failure
causes a weaker copy or unauthorized effect. Record exact clients, commits,
relay configuration and results separately from this definition's status.
