# Field Review: Aggregated Confirmed Message Identifiers

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmed-message-ids` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-confirmed-message-id`; no successor. |
| Current conclusion | `confirmedMessageIds` is a bounded canonical non-empty array of Messages sharing one confirmation stage, outcome, and failure code when present. |

## Question

How can one protected confirmation advance several compatible Messages without
one control record per Message?

## Role in communication

The confirming Endpoint groups Messages that reached the same stage and
outcome. The sender applies the record independently and idempotently to each
listed identity. Messages with different stages, outcomes, or failure codes
must use separate confirmations. The complete confirmation is one Transferable
Statement and must be covered by a valid Evidence Checkpoint before any listed
Message advances.

## Contribution to LicoArc's final vision

Amortizes Endpoint evidence across a bounded canonical Message set so confirmation traffic does not require one protected record per successful Message.

## Field model and trade-offs

The field is mandatory `ID128[1..MAX_CONFIRMATION_IDS]`, sorted by unsigned
byte order with no duplicates. Unknown, conflicting, unsorted, repeated, or
input exceeding the bound rejects the complete confirmation. Routine successful
attachment chunks are not listed; attachment progress uses Attachment Receive
State. The shared record amortizes framing and authentication tag cost without
merging the independently stored state of the named Messages.

## Necessity proof

Each Message still needs exact correlation, but sharing equal result metadata
removes repeated frames, tags, stage, and outcome bytes. A bounded array avoids
unlimited fan-out.

## Visibility and trust

The list is Endpoint-authenticated and hidden from Stations. One invalid
identity cannot be silently dropped because partial normalization would make
peers apply different evidence. Session authentication alone is operational;
the checkpoint signature supplies independent Endpoint attribution.

## Alternatives

- One identifier per confirmation: retired for unnecessary control traffic.
- Unbounded arrays or bitmaps: rejected for resource amplification.
- Bounded canonical identifiers sharing one result: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned evidence
correlation and wire-budget question is self-contained.

## Decision history

The predecessor admitted singular confirmation correlation. LicoArc review on
2026-08-03 selected bounded aggregation, retained independent per-Message state
effects, updated the Field Registry, and retired the singular wire shape. The
transferable-evidence review kept the compact list and required its complete
confirmation statement to be checkpoint-covered before finality.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
