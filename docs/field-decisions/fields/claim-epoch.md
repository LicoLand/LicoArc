# Field Review: Delivery Claim Epoch

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-claim-epoch` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `claimEpoch` is a `uint64`, conditionally present with `claimId` in a `CLAIM` result and mandatory in `SETTLE`; a stale ownership epoch fails closed. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The Station and claiming Endpoint bind settlement to the current claim
ownership generation so a superseded claimant cannot settle stale work.

## Contribution to LicoArc's final vision

Prevents stale settlement from acting on delivery items whose bounded claim
ownership has already changed.

## Field model and trade-offs

The value is an unsigned 64-bit monotonic epoch. It accompanies a claim that
returns items and is mandatory in settlement, where it must match the current
ownership generation.

## Visibility and trust

Only the claiming Endpoint and Station observe it. The epoch is Station-local
claim concurrency state, not message ordering, Endpoint freshness, receipt,
or application evidence.

## Decision history

Repository review admitted explicit ownership generations on 2026-08-02 to
make stale settlement fail closed. This page is explanatory history, not a
second specification; only `FIELD-REGISTRY.md` defines normative semantics.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
