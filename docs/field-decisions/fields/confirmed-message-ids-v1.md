# Field Review: Initial V1 Confirmed Message Identifiers

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmed-message-ids-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `confirmedMessageIds`, one ID per record, or unbounded batch |
| Candidate layer | Protected Endpoint Confirmation |
| Observer set | Pairwise Endpoints |
| Existing authority | Retired `FLD-confirmed-message-ids` and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [confirmation schema](../../../spec/v1/reliable/confirmation.schema.json), [labels](../../../spec/v1/reliable/labels.json), [runtime grammar](../../../spec/v1/reliable/runtime.cddl), [Reliable registry](../../../spec/v1/reliable/registry.json), and [Reliable corpus](../../../conformance/v1/reliable/cases.json) |
| Predecessor or successor | Succeeds `FLD-confirmed-message-ids`; keeps its bounded exact-set shape and removes evidence joins. |
| Current conclusion | A mandatory bounded canonical non-empty Message ID set receives one exact authenticated stage/outcome/result. |

## Question

How can compatible Message transitions share one confirmation without partial normalization or checkpoint finality?

## Role in communication

The confirming Endpoint groups eligible IDs; the sender applies the
authenticated result independently and atomically to every exact entry.

## Contribution to LicoArc's final vision

Amortizes endpoint-authenticated confirmation while preserving per-Message state.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | `ID128[1..MAX_CONFIRMATION_IDS]` |
| Presence | Mandatory |
| Values or range | Canonically sorted unique logical Message IDs |
| Canonical representation | Bounded deterministic array |
| Invalid input | Empty, duplicate, unsorted, extra, ineligible, or over-bound set rejects atomically |

## Necessity proof

Correlation cannot be derived from stage or result. One-ID records repeat
control bytes; unbounded batches amplify work. The bounded set is selected.

## Visibility and trust

Endpoint-protected and bound to the authorized sending session. No checkpoint
or Station signal is consulted.

## Alternatives

Singular predecessor and unbounded or partially accepted sets are rejected.

## Technical evaluation

Linear work and memory in one bounded group; independent stored transitions
remain idempotent and exact.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed confirmation schema, labels, runtime grammar, Reliable registry, bounds, and Reliable corpus define this field's exact initial V1 placement, encoding, transition, replay, and failure behavior.
