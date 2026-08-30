# Field Review: Confirmed Message Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmed-message-id` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-confirmed-message-ids`. |
| Current conclusion | Retired: a bounded canonical `confirmedMessageIds` array replaces the singular field. |

## Question

Does a confirmation need an explicit reference to the confirmed logical Message?

## Role in communication

The predecessor correlated one confirmation to exactly one logical Message;
it never identified a transport attempt, Route, or Station receipt. The
successor correlates a bounded canonical Message set sharing one result and
forbids routine successful attachment chunks.

## Contribution to LicoArc's final vision

Retiring singular `confirmedMessageId` permits one bounded confirmation record to acknowledge several Messages sharing one result.

## Field model and trade-offs

The retired value was mandatory `ID128` field `confirmedMessageId`. The
successor is a non-empty bounded sorted unique `confirmedMessageIds` array.
Different stages, outcomes, or failure codes require separate records; invalid
or conflicting references fail closed.

## Visibility and trust

Only peer Endpoints may observe the value inside Pairwise Protection. A
Station may suppress or replay ciphertext but cannot authoritatively create or
retarget the reference. Endpoints accept it only with the confirmation's
authentication, replay checks, and relationship scope.

## Decision history

Repository review decided that endpoint confirmations require explicit
correlation and that transport identifiers cannot substitute. This detail page
records that decision; it is not a second protocol specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

LicoArc review on 2026-08-03 first admitted a chunk checkpoint. The later
compact-control review retired that checkpoint and singular wire shape, made
Attachment Receive State the sole normal chunk feedback, and moved current correlation to
`FLD-confirmed-message-ids`.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
