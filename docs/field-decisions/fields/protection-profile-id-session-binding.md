# Field Review: Protection Profile Identifier at Session Establishment

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protection-profile-id-session-binding` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-protection-profile-id`; no successor. |
| Current conclusion | `protectionProfileId` is transcript-bound during session establishment and inherited by established records. |

## Question

How does a session retain one complete Protection Profile without carrying the
same profile identifier on every protected record?

## Role in communication

Both Endpoints authenticate one complete profile selection in the handshake.
The retained session state then supplies algorithms, framing, bounds, failure
rules, and lifecycle to established records.

## Contribution to LicoArc's final vision

Selects and transcript-binds one complete Endpoint protection contract once per session so established records avoid repeated suite identifiers without weakening downgrade resistance.

## Field model and trade-offs

The field remains mandatory `DIGEST256` in session establishment and forbidden
as a repeated established-record member. A profile change requires a new
authenticated session transition; a per-record value cannot switch it.

## Necessity proof

Selection cannot be inferred from implementation or transport, but after the
session lock the exact value is already authenticated and derivable.

## Visibility and trust

The identifier is trusted only as part of the complete Endpoint-authenticated
transcript. Neither a Station nor a cryptographic Provider may choose it.

## Alternatives

- Repeat it per record: rejected as redundant downgrade surface.
- Negotiate algorithms independently: rejected as an unsafe open product.
- Bind one whole profile at session establishment: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External material is unnecessary because the LicoArc-owned complete-profile
and session-overhead question is self-contained.

## Decision history

The predecessor admitted a complete profile identifier. LicoArc review on
2026-08-03 narrowed its wire occurrence to authenticated session establishment
and retired the repeated-record scope.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
