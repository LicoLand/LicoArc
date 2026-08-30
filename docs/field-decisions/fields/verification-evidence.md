# Field Review: Verification Evidence

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-verification-evidence` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | A protected, method-bound evidence value is required for interoperable peer-verification transitions, without carrying local trust policy or private UI state. |

## Question

What evidence must peers exchange or bind so they can validate one exact
peer-verification method?

## Role in communication

Endpoints produce and validate evidence under the identified method and bind
the accepted result to the authenticated relationship and verification epoch.
Endpoint products remain responsible for local approval and operation policy.

## Contribution to LicoArc's final vision

Carries bounded protected verification input while preserving the Endpoint's
exclusive authority to decide local peer trust.

## Field model and trade-offs

The approved semantic value is bounded method-specific evidence that cannot
directly set local peer-verification state. Protocol Line v1 admits no
verification-method registry or evidence field allocation; exact bounds,
interpretation, bindings, representation, and invalid-input behavior remain
successor-definition work.

## Visibility and trust

Evidence must be endpoint-authenticated and protected from Stations. It may be
sensitive, linkable, replayable, or usable as an identity oracle, so each
method must minimize disclosure and bind scope, audience, freshness, and
purpose. Receiving evidence does not compel local trust.

## Decision history

Repository review decided that verification transitions need exact,
method-bound interoperable evidence while local decisions stay outside the
wire. This detail page is not a second protocol specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

## Definition evidence

The definition status is `PARTIAL`. The necessity and trust boundary are
decided, but no Protocol Line v1 evidence bytes or wire allocation exists.
