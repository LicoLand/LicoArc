# Field Review: Capability Epoch

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-epoch` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | The withdrawn Candidate Capability Declaration is replaced by `FLD-protocol-support-statement-v1` and `FLD-minimum-protocol-generation-v1`; no predecessor bytes survive. |
| Current conclusion | The former `capabilityEpoch` field is withdrawn. Persistent `minimumProtocolGeneration` owns the current downgrade floor with different semantics. |

## Question

How did the withdrawn Candidate Capability Declaration distinguish a newer
declaration from replay or rollback?

## Role in communication

The predecessor declaration proposed a per-declaration epoch. The active line
does not parse or accept it. Instead, an Endpoint persists the authenticated
`minimumProtocolGeneration` high-water floor before selection or emission.

## Contribution to LicoArc's final vision

Preserves downgrade resistance without retaining a second declaration-order
coordinate or compatibility path.

## Field model and trade-offs

No active value, range, representation, label, placement, or reset rule exists
for `capabilityEpoch`. It is not an alias for
`minimumProtocolGeneration`.

## Visibility and trust

No retired epoch is trusted by the active line. A Station may replay, suppress,
or delay a support statement but cannot lower the Endpoint's authenticated
persistent minimum-generation floor.

## Decision history

The field was admitted before line generation, support entries, and persistent
minimum-generation state were closed. It was retired with the Candidate
Capability Declaration; the successor state reuses no old label, bytes, or
ordering semantics.

## Definition evidence

The definition is `NOT-SPECIFIED`. This record is history only and allocates
no current field or compatibility contract.
