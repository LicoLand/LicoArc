# Field Review: Confirmation Result Digest

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-result-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `resultDigest`, opaque result, or local-only effect status |
| Candidate layer | Protected Endpoint Confirmation |
| Observer set | Pairwise Endpoints |
| Existing authority | Explicit initial V1 confirmation direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [confirmation schema](../../../spec/v1/reliable/confirmation.schema.json), [labels](../../../spec/v1/reliable/labels.json), [runtime grammar](../../../spec/v1/reliable/runtime.cddl), [Reliable registry](../../../spec/v1/reliable/registry.json), and [Reliable corpus](../../../conformance/v1/reliable/cases.json) |
| Predecessor or successor | No predecessor; replaces no evidence digest. |
| Current conclusion | `resultDigest` binds successful `effectCompleted` to the exact expected application result bytes. |

## Question

Which value prevents a success for one effect result from completing another expected result?

## Role in communication

The receiving Endpoint hashes the Protocol-Line-defined result projection; the
sender compares it with the expected digest before advancing effect completion.

## Contribution to LicoArc's final vision

Binds Endpoint effect finality to the exact result without disclosing result bytes to Stations.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Mandatory for successful `effectCompleted`; forbidden otherwise |
| Values or range | Domain-separated digest of exact result bytes/projection |
| Canonical representation | 32 raw octets |
| Invalid input | Missing, surplus, malformed, or expected-result mismatch rejects transition |

## Necessity proof

Success and Message identity do not identify result content. Repeating result
bytes costs more and may expose unnecessary data; a digest is sufficient.

## Visibility and trust

Endpoint-protected and session-authenticated. It is not transferable proof and
does not prove external-world truth.

## Alternatives

Omission permits wrong-result completion; raw result repetition is unnecessary;
an evidence digest has unrelated checkpoint semantics.

## Technical evaluation

Constant-size wire and one bounded hash; domain separation prevents cross-use.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed confirmation schema, labels, runtime grammar, Reliable registry, bounds, and Reliable corpus define this field's exact initial V1 placement, encoding, transition, replay, and failure behavior.
