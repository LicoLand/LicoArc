# Field Review: Settlement Results

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-settlement-results` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Conditional `settlementResults` returns exactly one ordered `itemId` and `settleOutcome` result for every evaluated settlement entry. |

## Question

How can the caller distinguish per-item completion, release, stale claim, and
attempt-limit results after one bounded settlement operation?

## Role in communication

The Station returns the collection only when item-level settlement was
evaluated. The Endpoint matches results to the request in request order and
uses each outcome only for Station-local retry and queue state.

## Contribution to LicoArc's final vision

Returns one ordered result for every requested settlement so the Endpoint can
reconcile bounded claim work without partial ambiguity.

## Field model and trade-offs

Explicit one-for-one results avoid all-or-nothing ambiguity and prevent
partial batch processing from disappearing behind a single success code.
Preserved order and identifiers make retry deterministic without a new
receipt resource.

## Visibility and trust

The caller and Station observe the results. They are untrusted Station Signals
and never advance protected endpoint evidence; operation idempotency is still
required when the overall result is ambiguous.

## Decision history

Closure review found that `settleOutcome` alone did not define how a batch
returned item-level state. The registry admitted `settlementResults` and
required one ordered result per evaluated request entry, rather than relying
on positional arrays with no identifiers or a pollable receipt.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
