# Field Review: Endpoint Identity Reference at Session Establishment

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-identity-session-binding` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-endpoint-identity`; no successor. |
| Current conclusion | `endpointIdentityRef` is mandatory in authenticated identity and session establishment, while established records inherit the identity binding. |

## Question

Where must portable Endpoint identity appear without repeating a stable
32-octet reference on every record?

## Role in communication

Each Endpoint signs its stable identity reference in its capability declaration
and authenticates that reference during handshake and continuity transitions.
Session state binds both roles and supplies those identities to all established
records, affiliation state, and Route state.

## Contribution to LicoArc's final vision

Authenticates portable Endpoint identity during session establishment and continuity transitions while established records inherit the binding across Station and Route changes.

## Field model and trade-offs

The value remains mandatory `DIGEST256` in the signed capability declaration
and authenticated handshake identity binding. It is not repeated in
established records. Affiliation and Route state use the retained identity as
canonical context rather than copying an extra field.

## Necessity proof

Peer authentication requires the reference, but a validated session already
derives it. Repetition increases traffic and correlation without improving
continuity.

## Visibility and trust

The reference remains hidden from Stations. A Delivery Handle, Route,
location, device label, or Provider cannot replace it.

## Alternatives

- Repeat it on every record: rejected as redundant stable metadata.
- Infer it from Station affiliation: rejected because service does not own
  identity.
- Bind it in authenticated establishment and inherit it: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External evidence is unnecessary because the LicoArc-owned identity and
session-amortization question is self-contained.

## Decision history

The predecessor decided portable Endpoint identity. LicoArc review on
2026-08-03 preserved that authority while moving repeated established-record
occurrences into inherited session context, and retired the broader scope.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
