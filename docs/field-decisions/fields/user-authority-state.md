# Field Review: User Authority State

This record preserves explanation and decision history. Normative semantics
come only from the Canonical Field Registry and initial V1 machine sources.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-user-authority-state` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `userAuthorityState`, account record, device list, or local-only state |
| Candidate layer | Identity authority control; protected when delivered to a peer |
| Observer set | Authorizing Endpoints and the peer Endpoint receiving protected authority context |
| Existing authority | Explicit initial V1 user direction |
| Authority targets | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md), [identity schema](../../../spec/v1/identity/identity.schema.json), [labels](../../../spec/v1/identity/labels.json), [runtime grammar](../../../spec/v1/identity/runtime.cddl), [identity policy](../../../spec/v1/identity/identity.policy.json), and [identity corpus](../../../conformance/v1/identity/cases.json) |
| Predecessor or successor | Replaces incomplete single-Endpoint continuity and active association-claim source shapes; preserves rejected `FLD-endpoint-association-claim` as history only. |
| Current conclusion | One bounded signed snapshot carries the complete current user-authorized Endpoint authority context. |

## Question

Must peers receive one complete authority snapshot rather than infer current
device authority from a Station, directory, caller label, or partial updates?

## Role in communication

The user-authorized predecessor keys produce the snapshot; an Endpoint validates
it before accepting a device as an application-record sender. It is security
authority for Endpoint admission, never proof of peer trust or human identity.

## Contribution to LicoArc's final vision

Carries portable, recoverable Endpoint authority without assigning identity or
consistency authority to a Station.

## Field model and trade-offs

| Property | Finding |
| --- | --- |
| Semantic type | Closed bounded structure |
| Presence | Mandatory in an authority payload; protected payload is required before application admission |
| Values or range | One complete genesis or successor snapshot; bounds apply per snapshot or catch-up batch, never across the authority lifetime |
| Canonical representation | Protocol-Line-pinned deterministic encoding |
| Invalid input | Reject without authority or application-state mutation |

## Necessity proof

Partial fields, local labels, and transport state cannot establish which keys
and Endpoints share one current predecessor. A complete snapshot is the least
ambiguous carrier and permits digest identity, atomic recovery, and explicit
sibling detection.

## Visibility and trust

Peer delivery is endpoint-protected. A Station may suppress or replay bytes but
cannot author a valid state. A valid state authorizes named Endpoints only and
does not set local trust.

## Alternatives

Local-only state cannot interoperate; a mutable account list or Station roster
creates external authority; unbounded event replay creates lifetime resource
coupling. The selected complete bounded snapshot supports successive bounded
catch-up batches.

## Technical evaluation

Security fails closed on incomplete or ambiguous authority; metadata is hidden
from Stations; canonical closed structure ensures interoperability; work and
memory are linear in one bounded snapshot; generation replacement removes the
old identity/association wire rather than translating it.

## Decision history

The implementation selected this field on 2026-09-08 to realize the
authorized Endpoint confirmation outcome.

## Definition evidence

`DECIDED` and `SPECIFIED`: the Canonical Field Registry and the closed identity schema, labels, runtime grammar, policy, and identity corpus define this field's exact initial V1 placement, encoding, bounds, validation, and failure behavior.
