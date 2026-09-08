# Field Review: Compact Aggregated Confirmation Outcome

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-outcome-compact` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-confirmation-outcome`; succeeded by `FLD-confirmation-outcome-v1`. |
| Current conclusion | Retired: Generation 1 keeps bounded Endpoint outcomes but removes checkpoint coverage. |

## Question

How can equal Endpoint results share one compact record without losing
per-Message state or creating attachment acknowledgement traffic?

## Role in communication

The receiving Endpoint states one result for every listed Message. The sender
applies it independently to each identity. Different failure codes or outcomes
must be split into separate records. No result advances until the complete
confirmation statement joins a valid Evidence Checkpoint.

## Contribution to LicoArc's final vision

Shares one Endpoint-authenticated result across a bounded Message set without turning Station success or attachment chunk arrival into final evidence.

## Field model and trade-offs

The closed mandatory enum remains `succeeded | rejected | failed`. The result
is valid only for the separately declared stage and canonical identity list.
`succeeded` is forbidden for routine attachment chunk confirmation; verified
empty Attachment Receive State remains attachment completion.

## Necessity proof

An Endpoint result is still required, but equal outcomes can be represented
once. Per-chunk success does not add information when recovery state already
expresses missing work and final completion.

## Visibility and trust

The value is Endpoint-protected. With a valid covering checkpoint it attributes
the confirming Endpoint's bounded claim to an authorized Endpoint key state;
it never upgrades a Station outcome or independently proves the claim true.

## Alternatives

- Repeat one result per Message: retired for avoidable control bytes.
- Infer result from transport: rejected as an authority violation.
- Share one result over a bounded canonical set: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned result and
aggregation question is self-contained.

## Decision history

The predecessor admitted explicit Endpoint outcomes and later assigned every
successful attachment chunk a checkpoint. LicoArc review on 2026-08-03 kept
the closed outcome set, selected bounded grouping, removed routine per-chunk
success, and retired the broader predecessor. The transferable-evidence review
retained the values and made the complete confirmation, rather than this enum
alone, the mandatory signed statement.

## Definition evidence

The retired definition is `NOT-SPECIFIED`; its successor owns initial V1 semantics.
