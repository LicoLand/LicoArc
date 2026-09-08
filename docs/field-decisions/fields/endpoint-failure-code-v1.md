# Field Review: Initial V1 Endpoint Failure Code

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-failure-code-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `failureCode`, free-form diagnostic, or Station error |
| Candidate layer | Protected Endpoint Confirmation |
| Observer set | Pairwise Endpoints |
| Existing authority | Retired `FLD-endpoint-failure-code` and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [confirmation schema](../../../spec/v1/reliable/confirmation.schema.json), [labels](../../../spec/v1/reliable/labels.json), [runtime grammar](../../../spec/v1/reliable/runtime.cddl), [Reliable registry](../../../spec/v1/reliable/registry.json), and [Reliable corpus](../../../conformance/v1/reliable/cases.json) |
| Predecessor or successor | Succeeds `FLD-endpoint-failure-code`; removes evidence coverage. |
| Current conclusion | A registered bounded code is required exactly for authenticated `rejected` or `failed` outcomes. |

## Question

Which minimum failure meaning is interoperable without disclosing local diagnostics?

## Role in communication

The receiving Endpoint supplies the code; the sender applies only its fixed
stage-specific retry or terminal meaning.

## Contribution to LicoArc's final vision

Makes Endpoint failure deterministic without borrowing Station authority.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Registered bounded unsigned integer |
| Presence | Required for `rejected` or `failed`; forbidden for `succeeded` |
| Values or range | Protocol-Line-owned failure registry |
| Canonical representation | Shortest deterministic unsigned encoding |
| Invalid input | Missing, surplus, unknown, or incompatible code rejects |

## Necessity proof

Outcome alone cannot distinguish retryable and terminal protocol behavior;
free-form text and Station errors have the wrong semantics.

## Visibility and trust

Endpoint-protected; it cannot carry stack traces, private policy details, or provider errors.

## Alternatives

Opaque diagnostics and universal transport codes are rejected. Bounded registry is selected.

## Technical evaluation

Constant-size field and lookup; exact registry evolution requires a successor line.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed confirmation schema, labels, runtime grammar, Reliable registry, bounds, and Reliable corpus define this field's exact initial V1 placement, encoding, transition, replay, and failure behavior.
