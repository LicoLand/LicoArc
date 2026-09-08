# Field Review: Self-Reported Protocol Overhead Length

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protocol-overhead-length` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject `protocolOverheadBytes`, `controlBytes`, and similar sender-reported measurements; conformance derives overhead from exact Protocol Line bytes. |

## Question

Must a sender report how many bytes LicoArc added?

## Role in communication

Conformance tooling computes the value from canonical records, intrinsic
protection frames, Transport Profile requirements, control traffic, and
retransmitted Payload. A peer does not need the claim to process a Message.

## Contribution to LicoArc's final vision

Deriving LicoArc overhead from canonical bytes lets conformance enforce compactness without spending wire bytes on a self-reported measurement.

## Field model and trade-offs

There is no field. Every exact Protocol Line publishes byte budgets and
accounting rules that a machine can check. A value that cannot be derived is a missing
specification, not permission to trust a sender estimate.

## Necessity proof

The value changes no interoperable action and is fully derived. Transmitting
it would itself increase the measurement and create mismatch behavior.

## Visibility and trust

Protocol overhead is derived from the defined wire and is not transmitted. It
therefore exposes no additional per-message traffic metadata.

## Alternatives

- Derive exact bytes: selected.
- Sender-reported integer or class: rejected as circular and untrusted.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the accounting question is
self-contained.

## Decision history

LicoArc review on 2026-08-03 found no field-level action and rejected every
self-reported overhead variant while adding derived Protocol Line budgets to
the Field Registry.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
