# Field Review: Evidence Protocol Line Identity

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-protocol-line-id` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Transferable evidence repeats `protocolLineId` because an independent verifier cannot inherit a live session binding. |

## Question

Which immutable protocol meaning lets a peer or later verifier reconstruct the
statement projection, digest input, signature input, and failure rules?

## Role in communication

The signing Endpoint places the selected line identity in each checkpoint. The
peer verifies equality with the established session; a disclosed verifier uses
the same value to resolve the complete evidence contract offline.

## Contribution to LicoArc's final vision

Makes each disclosed checkpoint independently interpretable under one immutable Protocol Line without relying on a live session, Station, or implementation.

## Field model and trade-offs

The field is mandatory `DIGEST256`. Repeating 32 octets is deliberate here:
session inheritance saves bytes for ordinary records, but an exported proof
must remain self-describing after session state disappears. An unknown,
retired, mismatched, or ambiguous line fails closed.

## Visibility and trust

The value is hidden from Stations in transit and signed as part of the
checkpoint. It identifies protocol meaning, not a Network, deployment, or
implementation. Disclosure reveals the line used but grants no new authority.

## Alternatives

- Inherit the pairwise session: rejected because third-party verification would
  depend on unavailable mutable state.
- Infer from signature algorithm or encoding: rejected as ambiguous downgrade.
- Carry the exact immutable line identity: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because Protocol Line authority and exported
evidence closure are wholly LicoArc-owned.

## Decision history

Ordinary established records previously removed repeated line identity to save
traffic. LicoArc review on 2026-08-03 admitted this evidence-only repetition
because transferability changes the observer from a live peer to an independent
verifier and therefore changes the derivability test.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
