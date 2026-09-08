# Field Review: Explicit Padding Length

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-padding-length` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-protected-padding-absence`. |
| Current conclusion | Reject common `paddingLength` and `unpaddedLength` fields; the selected Protection Profile owns a closed, authenticated, derivable padding grammar. |

## Question

Does a common record need to declare how much padding its Protection Profile
added?

## Role in communication

The exact profile parses and authenticates its own frame, derives the inner
record boundary, and rejects invalid trailing bytes. Common Generic Messaging
does not select or measure padding.

## Contribution to LicoArc's final vision

Keeping padding length derivable inside one Protection Profile avoids duplicate size authority and spends no common wire bytes on traffic-shaping metadata.

## Field model and trade-offs

There is no common field. The exact profile fixes padding syntax, maximum
absolute bytes, maximum expansion ratio, canonical removal, and invalid-input
behavior. Any internal value remains profile-owned.

## Necessity proof

The common layer has no action requiring the value. A duplicate can disagree
with the protected frame and expose the unpadded length more directly.

## Visibility and trust

No separate length is exposed. Outer packet size remains observable and no
anonymity claim follows.

## Alternatives

- Profile-derived boundary: selected.
- Common explicit lengths: rejected as duplicate authority.
- Unbounded random padding: rejected by Protocol Line traffic budgets.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the layer and derivation question is
self-contained.

## Decision history

LicoArc review on 2026-08-03 rejected the common field and assigned the closed
padding grammar and traffic caps to each exact Protection Profile. The later
performance first decision rejected that remaining profile-owned grammar;
`FLD-protected-padding-absence` is the successor and does not rewrite this
historical rejection.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
