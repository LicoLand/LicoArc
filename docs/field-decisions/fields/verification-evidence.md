# Field Review: Verification Evidence

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-verification-evidence` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Retired without successor; Generation 1 defines user authority and leaves peer trust local. |
| Current conclusion | No verification-evidence field is active. |

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

The definition is retired and `NOT-SPECIFIED`; this record remains history only.
