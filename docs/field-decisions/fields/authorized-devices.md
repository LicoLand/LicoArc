# Field Review: Authorized Devices

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-authorized-devices` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `authorizedDevices`, device list, Endpoint roster, or account devices |
| Candidate layer | User Authority State |
| Observer set | Endpoints validating device authorization |
| Existing authority | Existing Endpoint reference/state-digest semantics and approved Endpoint confirmation intent |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | Reuses Endpoint reference and Endpoint-state digest semantics; no account-device or association-claim compatibility. |
| Current conclusion | A mandatory bounded canonical collection names every active or retained-revoked Endpoint authority entry in the snapshot. |

## Question

How does a peer determine which distinct Endpoint states are authorized now and
which named authorizations were revoked?

## Role in communication

The authority-state signer publishes complete entries; validators compare the
whole successor roster and reject silent additions, removals, or rewrites.

## Contribution to LicoArc's final vision

Authorizes multiple distinct Endpoints without merging them or trusting an
infrastructure device list.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Bounded canonical `AuthorizedDevice` collection |
| Presence | Mandatory and non-empty |
| Values or range | Unique Endpoint reference/state-digest entries with status, epochs, and possession proof |
| Canonical representation | Deterministic order by Endpoint reference and state digest |
| Invalid input | Duplicate, unsorted, over-bound, inconsistent, or silently changed entries reject |

## Necessity proof

One Endpoint identity cannot express concurrent authorization or atomic recovery
replacement. A Station/account list has the wrong authority. Complete bounded
roster state is required for deterministic validation.

## Visibility and trust

Protected from Stations; the roster is sensitive and linkable. Authorization
does not merge Endpoint identities or set local peer trust.

## Alternatives

Increment-only events complicate bounded catch-up and current-state validation;
unbounded history creates lifetime resource caps. A complete bounded snapshot
with successive bounded catch-up batches is selected.

## Technical evaluation

Linear validation and memory in one bounded snapshot; exact-set comparison
prevents silent roster changes and duplicate entries.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
