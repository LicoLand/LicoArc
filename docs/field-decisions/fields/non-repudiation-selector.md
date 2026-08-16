# Field Review: Per-Record Evidence Selector

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-non-repudiation-selector` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Mandatory evidence coverage is fixed by the Protocol Line and cannot be weakened by a sender-selected boolean, mode, or negotiation field. |

## Question

Should a sender select whether each attributable statement requires
transferable evidence?

## Role in communication

The proposed selector would change whether a receiver waits for a checkpoint.
That changes security and finality semantics, so it cannot be sender policy or
application preference.

## Contribution to LicoArc's final vision

Making evidence mandatory in the Protocol Line prevents a sender from downgrading attribution or adding negotiation traffic through a per-record switch.

## Field model and trade-offs

No `nonRepudiation`, `evidenceRequired`, `evidenceMode`, or equivalent field
exists. The immutable line defines which statement classes require coverage,
their pending behavior, and their attachment exclusions. An Endpoint either
conforms to that line or does not.

## Visibility and trust

Omission saves bytes and removes a downgrade bit. An extension cannot restore
the selector because that would create two finality contracts under one line.

## Alternatives

- Per-message boolean or mode: rejected as downgrade and chatter.
- Capability negotiation: rejected because complete Protocol Lines already
  express interoperable contracts.
- One immutable mandatory rule: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because LicoArc owns its security and
compatibility boundary.

## Decision history

The earlier design treated transferable evidence as explicit opt-in. LicoArc
review on 2026-08-03 retired that current semantics and rejected a selector so
uncovered tail records can never become deliverable or advance durable state.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
