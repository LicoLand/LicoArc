# Field Review: Route Epoch

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-route-epoch` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Authenticated private Route state requires a relationship-scoped epoch that starts at one, advances by exactly one, and never resets across Station migration or continuity-preserving Endpoint key rotation. Global affiliation has its own Endpoint-wide epoch. |

## Question

How does an Endpoint order authenticated route declarations without trusting
Station time or arrival order?

## Role in communication

The Endpoint route authority advances the epoch when replacing its private
route snapshot. A consuming peer compares it with the last accepted state and
its predecessor digest. The scope is one stable
Endpoint identity and peer relationship so relationship-specific Delivery
Handles do not create false cross-peer equivocation.

## Contribution to LicoArc's final vision

Orders relationship-specific Route snapshots so stale or conflicting private
routing state cannot become current after migration or reconnect.

## Field model and trade-offs

The value is mandatory `uint64` field `routeEpoch`. It starts at one and each
accepted successor equals the previous value plus one. It never resets on
Station replacement, route expiry, reconnect, or an Endpoint key rotation
that proves continuity. Lower values are stale; equal values with different
logical Route Updates conflict; a gap or predecessor mismatch fails closed.
Rollover handling and canonical integer encoding remain specification gaps.

## Visibility and trust

Every observer of the route declaration may see the epoch and correlate
updates. Authentication gives integrity but not freshness by itself; a
Station can suppress newer state. Endpoints must combine it with retained
last-accepted state and expiry.

## Decision history

Repository review decided that rollback-resistant route replacement cannot be
derived from Station timestamps or delivery order. The later portable
Station-affiliation review fixed the initial value, exact increment, peer
relationship scope, and no-reset rule and paired this field with
`previousRouteUpdateDigest`. Threat review then separated the global
`affiliationEpoch` so personalized Handles cannot redefine the current primary
Station. This detail page is not a second protocol
specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
