# Field Review: Station Identifier

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.stationId` is a mandatory `DIGEST256`, derived from Station identity material and independent of host, URI, Provider, and every Endpoint; both StationAffiliation and Route resolve it through `stationDescriptorDigest` instead of duplicating it. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery participants use `stationId` to keep one Station identity stable
across listener, hosting, and Provider changes without treating a location as
identity. Peer Endpoints resolve primary and alternate affiliations through
each `StationAffiliation` descriptor; relationship Routes independently use
the same identity path. A-to-B migration therefore names both Stations without
a duplicate Station field.

## Contribution to LicoArc's final vision

Provides stable Station identity across host, listener, and operator changes
without coupling Endpoint identity to a location or Provider.

## Field model and trade-offs

The value is exactly the mandatory 32-octet content digest defined by the
registry. Its derivation input and canonical processing remain specification
work; this page does not add either.

## Visibility and trust

Discovery participants observe the value. It identifies a Station only under
authenticated descriptor validation and never establishes Endpoint identity,
federation membership, or local admission.

## Decision history

Repository review admitted a location-independent Station identifier on
2026-08-02 to prevent discovery retargeting through URI or Provider changes.
The portable Station-affiliation review retained this descriptor-owned field
and rejected duplicate Affiliation- or Route-level `stationId` values that
could disagree with it.
This record explains that decision and its history; it is not a second
specification. Normative semantics come only from `FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
