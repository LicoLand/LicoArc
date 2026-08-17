# Field Review: Certification References

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-certification-refs` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.certificationRefs` is an optional bounded `DIGEST256[]` referencing immutable certification statements; endpoint policy remains final and no reference is a mandatory federation root. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery participants may resolve exact immutable certification statements
for local policy evaluation without embedding those statements in the
descriptor.

## Contribution to LicoArc's final vision

Allows bounded, independently verifiable governance evidence without making
one registry, operator, or Station a mandatory federation trust root.

## Field model and trade-offs

Each entry is a 32-octet digest reference. The collection is optional and
bounded by a fixed Protocol Line constant.

## Visibility and trust

Discovery participants observe the references, which may reveal certification
relationships. References are inputs to local policy only and never mandatory
federation roots or Endpoint admission decisions.

## Decision history

Repository review admitted optional content-addressed references on
2026-08-02 while preserving final endpoint policy. This detail page is
explanation and history, not a second specification; only
`FIELD-REGISTRY.md` is normative.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
