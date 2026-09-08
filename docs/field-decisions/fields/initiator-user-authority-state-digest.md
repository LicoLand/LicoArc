# Field Review: Initiator User Authority State Digest

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-initiator-user-authority-state-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `initiatorUserAuthorityStateDigest` or inferred local authority |
| Candidate layer | Handshake transcript and SessionAccept context |
| Observer set | Pairwise Endpoints; hidden from Stations |
| Existing authority | Existing handshake transcript and Endpoint-state binding decisions |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [handshake schema](../../../spec/v1/protection/handshake.schema.json), [SessionAccept schema](../../../spec/v1/protection/session-accept.schema.json), [labels](../../../spec/v1/protection/labels.json), [runtime grammar](../../../spec/v1/protection/runtime.cddl), [formal bindings](../../../spec/v1/security/formal-bindings.json), and [protection corpus](../../../conformance/v1/protection/cases.json) |
| Predecessor or successor | Extends initial V1 transcript context; no generation-1 digest alias. |
| Current conclusion | The transcript explicitly binds the initiating Endpoint's complete accepted user-authority-state digest beside its Endpoint-state digest. |

## Question

Which exact user authority context authorizes the initiating Endpoint for this session?

## Role in communication

Both Endpoints authenticate the value in the transcript and require a matching
valid protected authority payload before application admission.

## Contribution to LicoArc's final vision

Prevents an authorized Endpoint state from being replayed under a different user authority.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Mandatory |
| Values or range | Exact canonical accepted initiator authority-state digest |
| Canonical representation | 32 raw octets in the fixed transcript role position |
| Invalid input | Missing, substituted, unresolved, forked, or payload-mismatched value rejects |

## Necessity proof

Endpoint-state identity alone does not prove user-level device authorization;
local inference would let peers bind different authority snapshots.

## Visibility and trust

Transcript-authenticated and protected from Stations; it authorizes session
admission but does not set peer trust.

## Alternatives

Embedding the peer digest in authority state creates recursion; implicit local
selection permits mismatch. Explicit transcript binding is selected.

## Technical evaluation

Constant-size wire and digest comparison; role separation prevents swapping.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed handshake, SessionAccept, protection-label, runtime, formal-binding, and protection-corpus sources define this role-bound initial V1 session value.
