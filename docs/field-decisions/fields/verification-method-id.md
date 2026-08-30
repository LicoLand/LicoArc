# Field Review: Verification Method Identifier

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-verification-method-id` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Verification evidence requires a protocol-owned method identifier so peers interpret the evidence under one exact method contract. |

## Question

How does protected verification evidence identify the method that defines its
meaning and validation?

## Role in communication

The Endpoint producing or recording evidence names the exact protocol method,
and its peer dispatches only to that pinned method's validation rules. A
Provider, application, Station, or user interface cannot mint or reinterpret
the identifier.

## Contribution to LicoArc's final vision

Selects one exact verification procedure so peers interpret evidence
consistently without letting the evidence set trust by itself.

## Field model and trade-offs

The approved semantic value is a content identity selecting one exact
verification procedure. Protocol Line v1 admits no verification-method
registry or field allocation; procedure identity, retirement, encoding, and
unknown-value behavior remain successor-definition work.

## Visibility and trust

The identifier is endpoint-authenticated and protected because method choice
can reveal relationship or user-interaction metadata. It selects validation
rules but supplies no evidence or trust by itself. Unknown or retired methods
must fail closed.

## Decision history

Repository review decided that method semantics cannot be inferred from an
evidence blob or implementation Provider. This detail page is not a second
protocol specification. [`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md)
is the sole field semantics authority and wins over any conflicting
explanation here.

## Definition evidence

The definition status is `PARTIAL`. The necessity and trust boundary are
decided, but no Protocol Line v1 method identifier or wire allocation exists.
