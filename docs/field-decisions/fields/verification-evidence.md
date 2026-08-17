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

The value is mandatory bounded byte string field `verificationEvidence`. It is
input to local verification and cannot directly set local peer-verification
state. Exact bounds, method-specific byte interpretation, transcript and
identity bindings, canonical representation, and invalid-input behavior
remain specification gaps.

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

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
