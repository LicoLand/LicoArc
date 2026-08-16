# Field Review: Delivery Claim Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-claim-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `claimId` is a `TOKEN256`, conditionally present with items in a `CLAIM` result and mandatory in `SETTLE`, where it identifies exactly one bounded live claim. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

The claiming Endpoint returns the Station-issued claim capability during
settlement so the Station can bind the request to the bounded claim that
yielded the items.

## Contribution to LicoArc's final vision

Scopes retrieval and settlement to one bounded Station claim so unrelated
delivery work cannot be confused or combined.

## Field model and trade-offs

The value is a 32-octet unpredictable capability token. A `CLAIM` result emits
it only with returned items; every `SETTLE` request must return it. It has no
meaning outside that one bounded delivery claim.

## Visibility and trust

Only the claiming Endpoint and Station observe it. Possession authorizes only
the profile-defined settlement use and does not establish message identity,
Endpoint acceptance, or effect completion.

## Decision history

Repository review admitted a claim-scoped capability on 2026-08-02 to bind
settlement without exposing sender identity. This record is explanation and
history, not a second specification; normative semantics come only from
`FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
