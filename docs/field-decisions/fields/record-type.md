# Field Review: Record Type

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-record-type` |
| Decision status | `RETIRED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-record-type-evidence-checkpoint`. |
| Current conclusion | Retired: the prior closed union omitted an independently signed evidence state machine and left ordinary Endpoint statements transferable only by a separate optional mechanism. |

## Question

Could the earlier protected-record union remain complete after transferable
Endpoint attribution became a mandatory protocol property?

## Role in communication

The sending Endpoint produced the discriminator and the receiving Endpoint
dispatched the authenticated record. The retired value set identified protocol
form but had no distinct record for mandatory transferable evidence.

## Contribution to LicoArc's final vision

Retiring a protected-record union without `evidenceCheckpoint` prevents Endpoint statements from remaining session-authenticated but non-transferable.

## Field model and trade-offs

The retired enum was `handshake`, `affiliationUpdate`, `message`,
`confirmation`, `routeUpdate`, or `verification`. It prevented parser ambiguity
but could not dispatch the new self-authenticating checkpoint.

## Visibility and trust

The discriminator affected security interpretation and remained protected by
Endpoint authentication. That session protection was not transferable to an
independent verifier, which is the gap closed by the successor.

## Alternatives

- Keep evidence as an optional Generic Message: rejected because an application
  could omit or reinterpret the protocol guarantee.
- Add inline signatures to every existing record: rejected for repeated wire
  and mobile public-key cost.
- Add one closed checkpoint state machine: selected by the successor.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because the missing LicoArc-owned parser and
state-transition distinction is self-contained.

## Decision history

The field was admitted to prevent ambiguous parsing and cross-type confusion.
The Endpoint-wide affiliation redesign added `affiliationUpdate` as a separate
state machine. LicoArc review on 2026-08-03 retired this exact value set after
mandatory transferable Endpoint attribution required a dedicated
self-authenticating state machine. `FLD-record-type-evidence-checkpoint`
preserves every prior value and adds the only successor value.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
