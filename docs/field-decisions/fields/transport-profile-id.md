# Field Review: Transport Profile Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-transport-profile-id` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `Listener.transportProfileId` and `Route.transportProfileId` are mandatory `DIGEST256` values: a Listener selects one exact outer parser and Transport Profile without becoming endpoint identity or protection authority, while a Route prevents migration from silently changing carrier semantics. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery participants pair the identifier with a listener location, and peer
Endpoints bind it into protected route selection so both sides use the same
outer carrier semantics.

## Contribution to LicoArc's final vision

Selects one exact Station-facing carrier contract without allowing transport
choice to redefine Endpoint identity, protection, or receipt semantics.

## Field model and trade-offs

The value is the 32-octet content identity of one exact Transport Profile.
Both admitted placements use the same semantic field and do not authorize
loose feature combinations.

## Visibility and trust

The Listener placement is visible to discovery participants and the Station;
the Route placement is protected between peer Endpoints. The value selects a
carrier parser only and never selects Endpoint identity or protection trust.

## Decision history

Repository review admitted one exact profile identity in both discovery and
protected route binding on 2026-08-02. This page is explanation and history,
not a second specification; normative semantics come only from
`FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
