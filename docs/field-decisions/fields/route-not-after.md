# Field Review: Route Not-After

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-route-not-after` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Authenticated route declarations require an Endpoint-selected upper validity bound distinct from the Station-selected signed `serviceUntil`; effective use ends at the earliest applicable bound. |

## Question

How is the latest acceptable use time for authenticated route state
communicated?

## Role in communication

The route authority sets the bound, and consuming Endpoints stop initiating
new use after it under the protocol's clock and skew rules. The value limits
route validity; it does not prove deletion, availability, delivery, or
Endpoint freshness.

## Contribution to LicoArc's final vision

Lets an Endpoint bound use of its complete Route snapshot independently of
Station-issued capability expiry and message freshness.

## Field model and trade-offs

The value is mandatory unsigned-Unix-seconds field `routeNotAfter`. The
Endpoint chooses it to bound use of the complete route set. Each Route also
carries an independently validated Station-signed `serviceUntil`; effective
use ends at the earlier of those two values. A `serviceUntil` later than its
descriptor or affiliation validity is invalid rather than capped.
Allowed horizon, clock skew, boundary comparison, canonical encoding, and
invalid-input behavior remain specification gaps.

## Visibility and trust

Route observers may correlate expiry schedules. Authentication protects the
declared value, but a Station can suppress refreshes or retain old material.
Endpoints must fail closed after expiry and must not treat Station time as the
authority for the comparison.

## Decision history

Repository review decided that epochs alone cannot bound indefinite use of a
suppressed route declaration. The portable Station-affiliation review kept
this Endpoint-selected bound and added a separate Station-selected service
bound rather than collapsing two authorities. This detail page is not a
second protocol specification. The sole field semantics authority is
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md), and it wins over
any conflicting explanation here.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
