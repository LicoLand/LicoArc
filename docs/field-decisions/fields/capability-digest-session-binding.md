# Field Review: Capability Digest at Session Establishment

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-digest-session-binding` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-capability-digest`; no successor. |
| Current conclusion | `capabilityDigest` identifies one authenticated declaration in the handshake and is inherited by the established session. |

## Question

How can capability selection remain exact while avoiding repeated declaration
digests on every record?

## Role in communication

Each Endpoint supplies the digest of its exact bounded declaration during
session establishment. The transcript binds both declarations and the
selection; established records use the retained binding.

## Contribution to LicoArc's final vision

Binds session establishment to each exact capability declaration while allowing established records to inherit that binding instead of repeating it.

## Field model and trade-offs

The value is mandatory `DIGEST256` in the handshake and forbidden as a
repeated established-record field. A peer that lacks the referenced
declaration must obtain and validate that bounded declaration before the
handshake can complete; it cannot accept an unresolved digest.

## Necessity proof

The exact declaration must enter negotiation, but after transcript acceptance
the session can derive it. Repetition supplies no new security fact.

## Visibility and trust

Digest equality can correlate declaration reuse, so it remains inside
Endpoint-authenticated establishment and is not Station authority.

## Alternatives

- Copy full declarations per record: rejected for wire and signature cost.
- Repeat the digest per record: rejected as redundant.
- Bind once and retain session state: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned declaration
binding and amortization question is self-contained.

## Decision history

The predecessor admitted a compact declaration reference. LicoArc review on
2026-08-03 closed the missing occurrence rule: handshake only, then inherited
session context. The broad predecessor scope is retired.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
