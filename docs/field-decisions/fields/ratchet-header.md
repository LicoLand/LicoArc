# Field Review: Ratchet Header

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-ratchet-header` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A real DH ratchet requires authenticated ratchet-key, previous-chain-length and message-number semantics; none receives an active label or wire before `ALG-core-v1-double-ratchet` closes. |

## Question

Which transmitted ratchet coordinates are necessary for asynchronous
out-of-order delivery, bounded skipped-key handling and replay rejection under
the exact Core v1 Double Ratchet?

## Role in communication

The receiving Endpoint uses the authenticated header to select and advance
the exact ratchet state. Transport order and a generic epoch/counter cannot
replace it.

## Field model and trade-offs

Widths, visibility, bounds, wrap rules, skipped-key indexing, replay state and
invalid-input behavior remain coupled to the open Algorithm Prototype.

## Visibility and trust

Visible coordinates leak traffic shape and session progress. The final
Profile must authenticate them and state the residual metadata budget.

## Decision history

The former epoch/direction/counter record was withdrawn because it did not
encode the claimed DH ratchet transition.

## Definition evidence

The definition status is `PARTIAL`; field necessity is recorded but no
interoperable value or placement is active.
