# Field Review: Capability Epoch

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-epoch` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `capabilityEpoch` strictly increases for one Endpoint identity and prevents capability rollback. |

## Question

How does a peer distinguish a newer capability declaration from a replayed or
rolled-back declaration issued by the same Endpoint?

## Role in communication

The declaring Endpoint produces the epoch and the peer consumes it when
checking declaration freshness and rollback. It is security-authoritative only
as part of the authenticated declaration.

## Contribution to LicoArc's final vision

Prevents rollback to an older still-valid capability declaration for the same
Endpoint identity.

## Field model and trade-offs

The value is a mandatory `uint64`. Receivers apply its exact representation,
ordering, and invalid-input rules from the Field Registry.

## Visibility and trust

The peer may trust the value only after authenticating the declaration. A
Station may observe, replay, suppress, or delay a declaration but cannot make
an unauthenticated epoch authoritative; epochs may correlate declaration
updates.

## Decision history

The field was admitted because expiry alone cannot distinguish a rollback to a
still-unexpired declaration. It does not authorize a clock, storage design, or
signature algorithm.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
