# Field Review: Compact Aggregated Confirmation Stage

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-stage-compact` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-confirmation-stage`; no successor. |
| Current conclusion | One `confirmationStage` applies to every identity in a bounded confirmation group; routine attachment chunk success is excluded, and the confirmation requires Evidence Checkpoint coverage before transition. |

## Question

How does one compact confirmation preserve Endpoint Accepted and Effect
Completed authority without creating per-chunk attachment chatter?

## Role in communication

The confirming Endpoint assigns one stage to a bounded set of Messages. Each
listed Message independently reaches that stage. Attachment Receive State,
not routine successful chunk confirmation, reports attachment progress. The
confirmation's canonical statement must join a valid checkpoint before the
stage becomes durable peer-visible evidence.

## Contribution to LicoArc's final vision

Shares one authority-separated confirmation stage across a bounded Message set while keeping attachment progress on compact recovery state.

## Field model and trade-offs

The mandatory enum remains `endpointAccepted | effectCompleted`. All listed
Messages must be eligible for the same transition. A successful
`endpointAccepted` confirmation for an attachment `streamChunk` is forbidden;
exceptional attachment rejection or failure may still identify the offending
Message through the separately declared outcome.

## Necessity proof

Stage separation remains necessary, while repeating it for equal outcomes is
not. Attachment chunk durability is receiver checkpoint state and need not
produce one reverse Message per chunk.

## Visibility and trust

Only a valid Endpoint-authored confirmation covered by an Evidence Checkpoint
can advance these stages. Station outcomes and session authentication without a
checkpoint remain insufficient.

## Alternatives

- One stage value per Message record: valid but wasteful.
- Collapse Station and Endpoint stages: rejected as authority confusion.
- Share one stage over a bounded Message set: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned evidence-stage and
control-traffic question is self-contained.

## Decision history

The predecessor separated Endpoint stages but later acquired a routine
per-chunk checkpoint scope. LicoArc review on 2026-08-03 preserved the two
stages, added bounded grouping, moved normal attachment progress to receive
state, and retired the broader predecessor. The transferable-evidence review
kept the enum unchanged and added a cross-record checkpoint before finality
obligation rather than repeating signatures in this field.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
