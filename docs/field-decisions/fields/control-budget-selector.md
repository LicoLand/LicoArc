# Field Review: Sender-Selected Control Budget

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-control-budget-selector` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject sender-selected `overheadBudget`, `ackMode`, `retryBudget`, and traffic-shaping preference fields; the exact Protocol Line fixes interoperable maxima. |

## Question

May a sender negotiate how much control traffic, retry, acknowledgement, or
traffic shaping the peer must accept?

## Role in communication

Each exact Protocol Line supplies closed upper bounds. An Endpoint may apply a
stricter local resource policy and fail explicitly, but no peer field can
raise work or create a budget-negotiation exchange.

## Contribution to LicoArc's final vision

Keeping overhead budgets Protocol-Line-owned prevents senders from increasing control traffic or creating negotiation chatter.

## Field model and trade-offs

There is no field. Budget exhaustion produces the line's typed terminal or
retryable result. Unknown private headers or extensions cannot restore a
selector.

## Necessity proof

The values are already fixed by the chosen line. A selector adds bytes,
downgrade paths, and attacker controlled work without enabling a missing
action.

## Visibility and trust

No resource preference becomes linkable metadata. Local quotas remain local
and cannot silently change wire meaning.

## Alternatives

- Fixed line maxima with stricter local refusal: selected.
- Sender integer, class, or mode: rejected.
- Open negotiation: rejected for chatter and downgrade complexity.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned resource authority
question is self-contained.

## Decision history

LicoArc review on 2026-08-03 rejected all sender selectors after derivation,
amplification, downgrade, and local-policy cases were closed.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
