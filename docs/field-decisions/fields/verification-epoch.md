# Field Review: Verification Epoch

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-verification-epoch` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Endpoint-authenticated peer-verification state requires an epoch to reject rollback and stale evidence replacement. |

## Question

How are successive verification-state assertions ordered without relying on a
Station, Provider, or wall-clock arrival order?

## Role in communication

An Endpoint advances the epoch for the applicable peer-verification state,
and its peer compares it with retained accepted state. The epoch orders state;
it does not itself prove identity, user approval, or evidence validity.

## Contribution to LicoArc's final vision

Orders protected verification records so stale or replayed evidence cannot
roll back the peer relationship's verification process.

## Field model and trade-offs

The approved semantic value is a relationship-scoped monotonic epoch. Its
initial value, exact successor and recovery rules, bound, encoding, and
method-transition interaction are not allocated by Protocol Line v1, so no v1
parser accepts a `verificationEpoch` field.

## Visibility and trust

The value must be endpoint-authenticated and should remain protected because
changes reveal relationship activity. A Station can suppress newer protected
state but cannot authoritatively advance or reduce the epoch. Endpoints must
retain sufficient state to detect rollback.

## Decision history

Repository review decided that verification changes need protocol ordering
independent of transport order. This detail page is not a second protocol
specification. The sole field semantics authority is
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md), and it wins over
any conflicting explanation here.

## Definition evidence

The definition status is `PARTIAL`. The necessity and trust boundary are
decided, but the value is outside Protocol Line v1 until a successor authority
closes its exact method, state, encoding, failure, and corpus semantics.
