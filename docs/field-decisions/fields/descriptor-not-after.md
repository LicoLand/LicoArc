# Field Review: Descriptor Not-After Time

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-descriptor-not-after` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.notAfter` is mandatory unsigned Unix seconds that bounds descriptor use; expiry never proves key deletion or Station honesty. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers stop using a descriptor after its bounded validity
window, limiting indefinite acceptance of stale Station discovery state.

## Contribution to LicoArc's final vision

Bounds the lifetime of Station discovery state so an old descriptor cannot
remain usable indefinitely after replacement or key change.

## Field model and trade-offs

The field is unsigned Unix seconds and applies only to descriptor use. It is
not message expiry, a deletion receipt, or evidence about retained keys.

## Visibility and trust

Discovery participants observe it. Consumers enforce the bound locally and
do not infer honest deletion, operation, or endpoint freshness from expiry.

## Decision history

Repository review admitted a descriptor-use bound on 2026-08-02 while keeping
deletion and honesty claims outside the field. This page is explanation and
history, not a second specification; only `FIELD-REGISTRY.md` is normative.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
