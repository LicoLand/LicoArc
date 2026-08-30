# Field Review: Listener Endpoint URI

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-uri` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `Listener.endpointUri` is a mandatory bounded absolute URI that supplies a connection location only; changing it cannot change `stationId`. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers use the URI with its paired Transport Profile to locate a
Station listener and attempt a connection.

## Contribution to LicoArc's final vision

Locates a Station listener without allowing hosting or address changes to
redefine Station or Endpoint identity.

## Field model and trade-offs

The field is one canonical HTTPS absolute URI of at most 128 UTF-8 octets,
without user information, query, fragment, or a non-default port. HTTPS
Transport v1 resolves its authority and path while Station identity remains
independent.

## Visibility and trust

Discovery participants observe the location, so it is correlatable metadata.
It is not Station identity, Endpoint identity, certificate authority, or a
proof that the listener is honest or available.

## Decision history

Repository review admitted a location-only absolute URI on 2026-08-02 and
kept Station identity independent of it. This record is explanatory history,
not a second specification; only `FIELD-REGISTRY.md` defines normative
semantics.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
