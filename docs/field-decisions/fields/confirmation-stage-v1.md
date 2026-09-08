# Field Review: Initial V1 Confirmation Stage

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-stage-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `confirmationStage`, universal receipt stage, or inferred progress |
| Candidate layer | Protected Endpoint Confirmation |
| Observer set | Pairwise Endpoints |
| Existing authority | Retired `FLD-confirmation-stage-compact` and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [confirmation schema](../../../spec/v1/reliable/confirmation.schema.json), [labels](../../../spec/v1/reliable/labels.json), [runtime grammar](../../../spec/v1/reliable/runtime.cddl), [Reliable registry](../../../spec/v1/reliable/registry.json), and [Reliable corpus](../../../conformance/v1/reliable/cases.json) |
| Predecessor or successor | Succeeds `FLD-confirmation-stage-compact`; removes checkpoint-before-transition. |
| Current conclusion | One mandatory enum `endpointAccepted | effectCompleted` applies to the bounded Message ID set. |

## Question

Which Endpoint-owned stage advances without confusing transport success or requiring evidence coverage?

## Role in communication

The receiving Endpoint declares its own stage; the sender advances only on the
exact valid protected confirmation. Station Received stays transport-only.

## Contribution to LicoArc's final vision

Separates Endpoint finality from malicious Station signals.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Closed enum |
| Presence | Mandatory |
| Values or range | `endpointAccepted`, `effectCompleted` |
| Canonical representation | Protocol-Line-fixed unsigned labels |
| Invalid input | Unknown, regressive, premature, or outcome-inconsistent value rejects |

## Necessity proof

Effect completion cannot be inferred from durable acceptance or transport
success. Collapsing stages makes retries unsafe.

## Visibility and trust

Endpoint-protected and authenticated; a peer may lie about its own state, but a
Station cannot authoritatively advance it.

## Alternatives

Universal receipts, timers, and checkpoint joins are rejected. The two exact
Endpoint stages are selected.

## Technical evaluation

Constant-size field and deterministic monotonic reducer semantics.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed confirmation schema, labels, runtime grammar, Reliable registry, bounds, and Reliable corpus define this field's exact initial V1 placement, encoding, transition, replay, and failure behavior.
