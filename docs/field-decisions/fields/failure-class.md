# Field Review: Station Failure Class

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-failure-class` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A non-accepted Station result conditionally requires `failureClass`, a closed enum of `invalidRequest`, `unsupportedProfile`, `targetUnavailable`, `packetTooLarge`, `capacityUnavailable`, `rateLimited`, `conflict`, or `internalUnavailable`. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Calling Endpoints classify a non-accepted Station operation result without
depending on free-form, implementation-specific error text.

## Contribution to LicoArc's final vision

Classifies one Station operation failure deterministically while keeping
transport outcomes separate from Endpoint acceptance and effect.

## Field model and trade-offs

The value is exactly one of the eight registry-listed classes. It is absent
for accepted results and cannot be extended through an unknown core value.

## Visibility and trust

The calling Endpoint and Station observe it. The class is a Station Signal
about the current operation only; it cannot prove Endpoint receipt, final
delivery, or application effect.

## Decision history

Repository review admitted a closed privacy-minimal failure vocabulary on
2026-08-02. This record is explanation and history, not a second
specification; normative semantics come only from `FIELD-REGISTRY.md`.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
