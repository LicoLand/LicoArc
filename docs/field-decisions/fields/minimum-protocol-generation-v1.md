# Field Review: Minimum Protocol Generation v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-minimum-protocol-generation-v1` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | No active predecessor. |
| Current conclusion | Selection requires authenticated monotonic minimum-generation inputs, but their state, update, recovery, encoding, and placement remain unallocated. |

## Question

How does each Endpoint express and preserve the lowest Protocol Line generation
it will accept so rollback and silent fallback fail closed across reconnects?

## Role in communication

Selection filters common lines against both authenticated floors before
choosing the unique highest eligible generation. An implementation default or
Station policy cannot lower either floor.

## Field model and trade-offs

No integer width, label, storage transition, continuity rule, reset rule, or
wire location is selected. These details must align with Identity continuity
and the future support statement and transcript.

## Visibility and trust

The floor can reveal upgrade state and can cause denial of service when
modified. A future form must authenticate it and define recovery without a
lower-generation fallback.

## Decision history

The requirement emerged when Protocol Line selection was separated from the
withdrawn digest-only Candidate declaration.

## Definition evidence

The definition is `PARTIAL`: catalog selection models the monotonic floor, but
no interoperable field or persistence transition is active.
