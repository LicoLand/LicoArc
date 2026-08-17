# Field Review: Previous Descriptor Digest

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-previous-descriptor-digest` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.previousDescriptorDigest` is a conditionally mandatory `DIGEST256`, omitted only for the first descriptor; every successor identifies its immediate predecessor. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers use the digest link to verify continuity between adjacent
descriptors instead of accepting an unlinked higher sequence in isolation.

## Contribution to LicoArc's final vision

Binds every Station descriptor successor to its exact predecessor so
replacement cannot silently fork or skip authenticated discovery history.

## Field model and trade-offs

The value is the 32-octet digest of the immediate predecessor. Absence is
valid only for the first descriptor in the Station lineage.

## Visibility and trust

Discovery participants observe it. The link supports authenticated continuity
but does not make a directory or Station an Endpoint trust authority.

## Decision history

Repository review admitted predecessor binding on 2026-08-02 to make lineage
replacement and rollback detectable. This page records explanation and
history, not a second specification; normative semantics live only in
`FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
