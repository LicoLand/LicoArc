# Field Review: Confirmation Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-id` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `confirmationId`, transport receipt ID, or derived record digest |
| Candidate layer | Protected Endpoint Confirmation |
| Observer set | Pairwise Endpoints |
| Existing authority | Explicit initial V1 confirmation direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [confirmation schema](../../../spec/v1/reliable/confirmation.schema.json), [labels](../../../spec/v1/reliable/labels.json), [runtime grammar](../../../spec/v1/reliable/runtime.cddl), [Reliable registry](../../../spec/v1/reliable/registry.json), and [Reliable corpus](../../../conformance/v1/reliable/cases.json) |
| Predecessor or successor | No field-decision predecessor; generation-1 bytes lacked an admitted decision record. |
| Current conclusion | Every protected Endpoint Confirmation carries one unpredictable `ID128` replay identity. |

## Question

Which value makes exact confirmation retry idempotent and changed-content reuse detectable?

## Role in communication

The confirming Endpoint generates it; the sender stores its exact authenticated
content binding. Exact replay is idempotent and unequal reuse rejects.

## Contribution to LicoArc's final vision

Provides bounded replay-safe Endpoint finality without carrier authority.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Unpredictable `ID128` |
| Presence | Mandatory |
| Values or range | 16 octets; equality scoped to the authorized sending Endpoint session context |
| Canonical representation | Raw 16 octets |
| Invalid input | Missing, malformed, or unequal reuse rejects without state advance |

## Necessity proof

Logical Message IDs identify effects, not retries of a grouped confirmation.
Transport IDs have the wrong authority; deriving from content prevents distinct
legitimate repetitions. One explicit ID is required.

## Visibility and trust

Endpoint-protected; it is correlation state, not proof of acceptance by itself.

## Alternatives

Transport receipt, local counter, and bare digest are rejected. Unpredictable
bounded identity is selected.

## Technical evaluation

Constant-size wire and bounded deduplication per active retention window; exact
content comparison prevents substitution.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed confirmation schema, labels, runtime grammar, Reliable registry, bounds, and Reliable corpus define this field's exact initial V1 placement, encoding, transition, replay, and failure behavior.
