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

The value is mandatory `uint64` field `verificationEpoch`. It strictly
increases within the Endpoint relationship and prevents verification replay.
Initialization, advancement, reset, recovery, rollover, conflict behavior,
and encoding remain specification gaps.

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

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
