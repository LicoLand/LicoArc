# Field Review: Station Operation Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-operation-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `operationId` is a mandatory `ID128` for `AFFILIATE`, `RESERVE`, `SUBMIT`, `CLAIM`, and `SETTLE`, scoped to the Station, authenticated caller, operation, and fixed idempotency window; reusing it with a different canonical request yields `conflict`. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Calling Endpoints repeat a Station operation, including creation of an opaque
affiliation commitment, safely after an ambiguous carrier result. Stations
detect duplicate or conflicting requests within the fixed idempotency window.

## Contribution to LicoArc's final vision

Makes bounded Station operations idempotent so retry after ambiguity does not
create conflicting reservations, submissions, claims, or settlements.

## Field model and trade-offs

The value is a 16-octet unpredictable identifier. Equality has meaning only
inside the registry-defined Station, caller, operation, and idempotency scope.

## Visibility and trust

Only the calling Endpoint and Station need observe it. It is transport
idempotency metadata, not logical Message identity, Endpoint receipt, effect
evidence, or an authorization capability.

## Decision history

Repository review admitted a common bounded operation identity on 2026-08-02
to make retries deterministic without restoring `envelopeId`. The
Endpoint-wide affiliation redesign extended the same scoped rule to
`AFFILIATE` instead of creating another idempotency field. This record is
explanation and history, not a second specification; normative semantics come
only from `FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
