# Field Review: Initial V1 Confirmation Outcome

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-outcome-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `confirmationOutcome`, transport status, or inferred result |
| Candidate layer | Protected Endpoint Confirmation |
| Observer set | Pairwise Endpoints |
| Existing authority | Retired `FLD-confirmation-outcome-compact` and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [confirmation schema](../../../spec/v1/reliable/confirmation.schema.json), [labels](../../../spec/v1/reliable/labels.json), [runtime grammar](../../../spec/v1/reliable/runtime.cddl), [Reliable registry](../../../spec/v1/reliable/registry.json), and [Reliable corpus](../../../conformance/v1/reliable/cases.json) |
| Predecessor or successor | Succeeds `FLD-confirmation-outcome-compact`; removes checkpoint coverage. |
| Current conclusion | One mandatory enum `succeeded | rejected | failed` applies to every Message in the bounded confirmation. |

## Question

Which exact Endpoint result drives the stage transition independently of Station outcomes?

## Role in communication

The receiving Endpoint reports the outcome; the sender requires exact
authentication and applies its stage-specific result rules.

## Contribution to LicoArc's final vision

Lets peer Endpoints converge on a bounded result without carrier authority.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Closed enum |
| Presence | Mandatory |
| Values or range | `succeeded`, `rejected`, `failed` |
| Canonical representation | Protocol-Line-fixed unsigned labels |
| Invalid input | Unknown or stage/failure/result-inconsistent value rejects |

## Necessity proof

Stage does not encode success or failure; transport status cannot substitute.
An explicit closed result is required.

## Visibility and trust

Endpoint-protected and authenticated; it reports peer state but is not public proof.

## Alternatives

Boolean success loses rejection/failure meaning; free-form results leak and
diverge. The three-value enum is selected.

## Technical evaluation

Constant-size field with deterministic conditional checks.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed confirmation schema, labels, runtime grammar, Reliable registry, bounds, and Reliable corpus define this field's exact initial V1 placement, encoding, transition, replay, and failure behavior.
