# Field Review: Protocol Line Identifier at Session Establishment

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protocol-line-id-session-binding` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-protocol-line-id`; no successor. |
| Current conclusion | `protocolLineId` is mandatory in authenticated session establishment and inherited by established records rather than repeated in each record. |

## Question

Where must the exact Protocol Line be named without repeating an immutable
32-octet value throughout an established session?

## Role in communication

Each Endpoint states and authenticates the selected line during session
establishment. Both peers lock that value with the complete transcript and use
the retained session binding for every later record. A record that cannot
resolve one exact binding fails closed.

## Contribution to LicoArc's final vision

Carries one complete immutable interoperability choice during authenticated session establishment, then lets established records inherit it without repeating 32 octets.

## Field model and trade-offs

The value remains mandatory `DIGEST256` in a handshake record. It is forbidden
in established data and control records because the authenticated session
already supplies the value. Reconnect without retained safe session continuity
performs a new handshake instead of copying an untrusted per-record selector.

## Necessity proof

The handshake must select one exact line, but no interoperable action requires
the same value after the session lock. Repetition creates wire cost and a
second opportunity for mismatch without adding authority.

## Visibility and trust

The value is Endpoint-authenticated and never selected by a Station, Route,
Provider, or application Payload. Session lookup cannot override transcript
validation.

## Alternatives

- Repeat the identifier in every record: rejected as redundant and ambiguous.
- Infer it from transport: rejected because a carrier is not Endpoint
  protocol authority.
- Bind it once in the handshake and inherit it: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

External material is unnecessary because the LicoArc-owned session binding
and overhead question is self-contained.

## Decision history

The original record admitted the identifier but left established-record
presence inconsistent with its handshake role. LicoArc review on 2026-08-03
selected one authenticated handshake occurrence and an inherited session
binding, updated the Field Registry, and retired the broader predecessor.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
