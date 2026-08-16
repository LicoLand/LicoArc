# Field Review: Descriptor Sequence

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-descriptor-sequence` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `StationDescriptor.descriptorSequence` is a mandatory `uint64` that strictly increases for one `stationId`; lower or repeated conflicting values fail closed. |

## Question

What interoperable action requires this semantic field, and what exact value,
placement, visibility, and trust boundary apply?

## Role in communication

Discovery consumers compare authenticated descriptor generations to reject
rollback and conflicting reuse of a generation number.

## Contribution to LicoArc's final vision

Orders Station discovery state so Endpoints can reject rollback and
conflicting reuse for one Station identity.

## Field model and trade-offs

The field is an unsigned 64-bit integer. Its only admitted ordering is strict
increase within one `stationId`; a lower value or a repeated value carrying
different descriptor content is invalid.

## Visibility and trust

Discovery participants observe it. The number has meaning only within the
authenticated Station descriptor lineage and is not a clock, message order,
or Station-honesty signal.

## Decision history

Repository review admitted the counter on 2026-08-02 as explicit rollback
state. This explanatory history is not a second specification; only
`FIELD-REGISTRY.md` defines normative meaning.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
