# Field Review: Capability Valid Until

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-valid-until` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | The withdrawn Candidate Capability Declaration is replaced by `FLD-protocol-support-statement-v1`; no predecessor bytes survive. |
| Current conclusion | The former declaration-level `validUntil` field is withdrawn. The Protocol Support Statement has no expiry field. |

## Question

How did the withdrawn Candidate Capability Declaration bound its authorized
lifetime?

## Role in communication

The predecessor declaration proposed an absolute lifetime. The active line
does not parse or accept it. Support selection instead uses authenticated
content identities and persistent minimum-generation state.

## Contribution to LicoArc's final vision

Avoids retaining a clock-dependent predecessor field while preserving exact
authenticated line selection and downgrade resistance.

## Field model and trade-offs

No active value, clock model, representation, label, placement, or invalid
input rule exists for a support-statement expiry. The separately specified
prekey-bundle `validUntil` is purpose-scoped prekey eligibility and is not a
successor or compatibility form for this field.

## Visibility and trust

No retired value is trusted or exposed by the active line. A Station may
delay, replay, or suppress a support statement but cannot create support,
lower the persistent generation floor, or establish Endpoint freshness.

## Decision history

The field was admitted before the current support object and downgrade state
were closed. It was retired with the Candidate Capability Declaration; no old
label, bytes, expiry semantics, or fallback survives.

## Definition evidence

The definition is `NOT-SPECIFIED`. This record is history only and allocates
no current field or compatibility contract.
