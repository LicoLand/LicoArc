# Field Review: Evidence Identifier

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-id` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Checkpoint idempotency identity is derived from complete canonical signed bytes; no transmitted `evidenceId` exists. |

## Question

Is an independent random checkpoint identifier, or one assigned by the sender,
necessary for retry or evidence disclosure?

## Role in communication

A derived digest lets peers deduplicate exact checkpoint retransmission and lets
verification packages name the same immutable object without another authority.

## Contribution to LicoArc's final vision

Deriving checkpoint identity from its complete canonical signed bytes preserves idempotency without another transmitted identifier or conflict surface.

## Field model and trade-offs

`evidenceId` is not a field. The Protocol Line defines a domain-separated digest
of the complete canonical checkpoint including signatures. Equal bytes derive
equal identity; a changed field or signature derives a different checkpoint.

## Visibility and trust

The derived value need not consume wire bytes or be trusted as sender input. It
is an object identity only and does not add authorship, time, or ordering.

## Alternatives

- Random identifier: rejected as extra state and collision handling.
- Sender-assigned sequence: rejected as a second ordering authority.
- Canonical digest derivation: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because the checkpoint already has complete
canonical signed bytes.

## Decision history

LicoArc review on 2026-08-03 rejected the explicit field after determining that
all required equality and retry behavior is deterministic from the signed
object itself.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
