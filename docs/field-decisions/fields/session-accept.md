# Field Review: Session Accept

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-session-accept` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Pairwise Protection architecture](../../../ARCHITECTURE.md#3-pairwise-protection) and the [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/FIELD-REGISTRY.md`, `spec/v1/protection/`, `spec/v1/protection/registry.json`, `formal/`, `conformance/v1/protection/`, and `spec/v1/manifest.json` |
| Predecessor or successor | Replaces the withdrawn Candidate confirmation scope; preserves no old session identifier or confirmation wire. |
| Current conclusion | The responder emits one transcript-bound SessionAccept authenticated by a full 32-byte HMAC-SHA-256. The initiator reaches ESTABLISHED only after verification; Station acceptance is never a substitute. |

## Question

Which exact responder-produced values prove possession of the session-derived
key and bind mutual establishment to the session, transcript and responder
identity without becoming transferable evidence?

## Role in communication

The responder creates SessionAccept only in the atomic session/prekey commit.
The initiator validates the canonical context and full HMAC before changing
from FIRST-PACKET-COMMITTED/AWAITING-ACCEPT to ESTABLISHED. An exact committed
replay returns identical bytes; a conflicting redemption returns typed
consumed, and neither path permits fallback.

## Contribution to LicoArc's final vision

Provides explicit mutual key-possession confirmation for asynchronous
establishment while retaining Endpoint authority and separating session
authentication from transferable evidence or Station operation outcomes.

## Field model and trade-offs

| Value | Approved semantic |
| --- | --- |
| Confirmation context | Exact Protocol Line/Profile content identities, transcript digest, responder identity state, paired sequence, and committed session context. |
| Authentication | Full HMAC-SHA-256 output of exactly 32 bytes; no truncation or algorithm menu. |
| Canonical form | Deterministic CBOR/context projection with a distinct NUL-terminated SessionAccept domain. |
| State transition | Only a verified accept reaches initiator ESTABLISHED; responder is ACCEPT-COMMITTED/ESTABLISHED in the redemption transaction. |
| Replay | Exact committed replay is idempotent and returns the same accept; changed input cannot reuse the commitment. |
| Failure | Invalid, mismatched, unauthenticated, stale, or over-bound accept leaves prior state unchanged and returns typed terminal failure. |

SessionAccept proves control of the session-derived key for this handshake
only. It is not an EvidenceCheckpoint, user approval, effect completion,
Station receipt, legal identity, or transferable signature.

## Visibility and trust

The accept is Endpoint-to-Endpoint confirmation. A Station may carry, suppress,
or replay it but cannot authoritatively accept a session or reveal which
primitive failed. The transcript and identity bindings prevent substitution or
cross-session replay.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Prevent the initiator from treating a one-way first packet or Station receipt as mutual establishment. |
| Removal consequence | The initiator can enter ESTABLISHED without responder key possession, or peers can disagree on the session context. |
| Derivation | A Station outcome, first packet, or local timer cannot prove responder possession of the derived key. |
| Lower-layer carrier | Transport acknowledgement does not bind the responder key, transcript, or identity. |
| Protected placement | SessionAccept remains handshake-specific and is not repeated in established records or evidence checkpoints. |
| Duplicate-authority risk | Per-record MACs, Station signatures, or transferable signatures would conflate confirmation with evidence and are rejected. |

## Decision history

Repository review on 2026-08-31 adopted the full HMAC-SHA-256 confirmation,
transcript/context binding, exact replay idempotency, atomic commit, and
no-Station-authority rule. The exact labels, byte projection, schema, and
vectors are closed by the linked machine authority.

## Decision outcome

The SessionAccept confirmation semantics are approved as an independent field
decision. It does not allocate a generic `sessionId` or common record field,
and it does not become transferable evidence.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The linked canonical bytes, labels, schema, bounds, formal bindings, vectors,
and registry/source closure close the exact confirmation semantics.
