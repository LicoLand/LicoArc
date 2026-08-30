# Field Review: Capability Signature

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-signature` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | The withdrawn Candidate Capability Declaration is replaced by `FLD-protocol-support-statement-v1`; no predecessor bytes survive. |
| Current conclusion | The former single `signature` field is withdrawn. The specified Protocol Support Statement owns its exact dual-signature fields and coverage independently. |

## Question

How did the withdrawn Candidate Capability Declaration authenticate its
selection inputs and lifecycle bounds?

## Role in communication

The predecessor declaration proposed one generic signature. It is not parsed
or accepted by the active line. The current support statement instead carries
the exact classical and post-quantum signature values, key identifiers, and
coverage fixed by the stable-core Profile.

## Contribution to LicoArc's final vision

Preserves the requirement that Endpoint support be authenticated while
preventing a generic predecessor signature from becoming a compatibility path
around the current dual-signature construction.

## Field model and trade-offs

No active value, label, placement, bound, or encoding exists for this field.
The Protocol Support Statement has its own specified canonical coverage and
closed signature fields.

## Visibility and trust

No retired value is trusted or exposed by the current line. The support
statement's own authenticated material remains Endpoint-visible and may still
be replayed, delayed, or suppressed by a Station without gaining authority.

## Decision history

The field was admitted before the support object and its indivisible
classical/post-quantum authentication were closed. It was retired with the
Candidate Capability Declaration; the current statement reuses no field,
label, bytes, or fallback behavior.

## Definition evidence

The definition is `NOT-SPECIFIED`. This record is history only and allocates
no current field or compatibility contract.
