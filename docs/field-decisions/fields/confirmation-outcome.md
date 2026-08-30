# Field Review: Confirmation Outcome

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-confirmation-outcome` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [`FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-confirmation-outcome-compact`. |
| Current conclusion | Retired: the successor shares one outcome over a bounded Message set and removes routine successful attachment chunk confirmation. |

## Question

Which endpoint-authenticated result must a confirmation communicate?

## Role in communication

The receiving Endpoint reports the applicable Reliable Exchange result, and
the sender advances only the corresponding endpoint state. The value never
upgrades a Station response into Endpoint Accepted or Effect Completed. The
successor shares one outcome over a bounded Message set and permits an
attachment chunk only for exceptional rejection or failure.

## Contribution to LicoArc's final vision

Retiring routine per-chunk success outcomes preserves Endpoint result authority while eliminating one reverse control record per attachment chunk.

## Field model and trade-offs

The value is mandatory field `confirmationOutcome`, closed to `succeeded`,
`rejected`, or `failed`. Its meaning applies at the separately declared
confirmation stage. This predecessor's routine successful chunk scope is
retired. Transition, conflict, encoding, and invalid-input rules remain
specification gaps.

## Visibility and trust

The value is protected between peer Endpoints. Stations have no authority to
produce it or infer application completion from transport activity. Endpoints
must reject unauthenticated, replayed, impossible, or regressive outcomes.

## Decision history

Repository review decided to represent endpoint outcome explicitly and keep
its producer and trust domain separate from transport results. This detail
page is decision evidence, not a second protocol specification.
[`spec/FIELD-REGISTRY.md`](../../../spec/FIELD-REGISTRY.md) is the sole field
semantics authority and wins over any conflicting explanation here.

LicoArc review on 2026-08-03 first admitted per-chunk success as a checkpoint.
The later compact-control review retired that behavior and moved
current grouped outcomes to `FLD-confirmation-outcome-compact`.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
