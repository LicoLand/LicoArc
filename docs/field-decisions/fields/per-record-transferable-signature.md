# Field Review: Per-Record Transferable Signature

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-per-record-transferable-signature` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Inline signatures on every ordinary Message or Confirmation are rejected in favor of mandatory bounded Evidence Checkpoints. |

## Question

Must every ordinary protected record carry its own transferable signature?

## Role in communication

The proposed field would let a sender sign one record inline and a verifier
inspect it later. The same action is supplied more compactly by one checkpoint
covering a bounded canonical statement set.

## Contribution to LicoArc's final vision

Using bounded Evidence Checkpoints rather than repeated inline signatures preserves transferable Endpoint attribution without making every record pay a full public-key wire cost.

## Field model and trade-offs

No inline `messageSignature` or `confirmationSignature` exists. Single-item
checkpoints preserve immediate progress; multi-item checkpoints amortize key
identifiers, identity context, framing, signatures, and verification work.
Attachment declarations commit complete content digests without signing chunks.

## Visibility and trust

An alias in `extensions` is equally forbidden because it would create a second
evidence grammar and downgrade path. Ordinary pairwise protection remains
necessary but does not replace checkpoint signatures.

## Alternatives

- One signature per ordinary record: correct but unnecessarily expensive.
- Optional signatures: rejected because uncovered tail records could advance.
- Mandatory bounded checkpoints: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because the wire, CPU, battery, and mandatory
coverage trade-off is wholly LicoArc-owned.

## Decision history

LicoArc review on 2026-08-03 rejected repeated inline signatures while requiring
checkpoint coverage before delivery or durable transition. This is a placement
and batching decision, not permission to omit transferable attribution.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
