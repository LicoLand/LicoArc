# Field Review: Record Type with Evidence Checkpoint

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-record-type-evidence-checkpoint` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-record-type`; no successor. |
| Current conclusion | `recordType` includes a distinct self-authenticating `evidenceCheckpoint` state machine alongside the existing protected record forms. |

## Question

How does a receiver dispatch mandatory transferable Endpoint evidence without
content sniffing, application-defined control payloads, or recursive evidence?

## Role in communication

The signing Endpoint selects `evidenceCheckpoint`; the peer parses and verifies
that closed record before allowing covered statements to have their assigned
effect. A disclosed verifier uses the record's independent signature rather
than the live session.

## Contribution to LicoArc's final vision

Selects a distinct signed evidence state machine so Endpoint-attributable statements cannot be confused with session-only derivative records, application payloads, or Station signals.

## Field model and trade-offs

The mandatory closed enum is `handshake`, `affiliationUpdate`, `message`,
`confirmation`, `evidenceCheckpoint`, `routeUpdate`, or `verification`. The
checkpoint form is self-authenticating and is forbidden from requiring a
confirmation or another checkpoint. One extra enum value preserves deterministic
dispatch and avoids the larger Generic Message wrapper.

## Visibility and trust

The discriminator remains Endpoint-protected in transit. Only the checkpoint's
independent signatures are transferable; an outer parser value, Station signal,
or application `contentType` cannot create the state machine.

## Alternatives

- Application control content: rejected because it would make a core guarantee
  optional and application-defined.
- Inline signatures on every record: rejected for repeated public-key cost.
- A distinct closed record state machine: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because the discriminator and authority-layer
question is wholly LicoArc-owned.

## Decision history

The predecessor supplied closed dispatch for all earlier protected forms.
LicoArc review on 2026-08-03 retained those forms, added exactly one
`evidenceCheckpoint` successor value, and prohibited evidence recursion so the
new attribution requirement has one protocol-owned parser and stopping rule.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
