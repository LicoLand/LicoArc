# Field Review: Group Member Role

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-group-member-role` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `role`, a product permission set, or no field |
| Candidate layer | Protected Group Membership State member entry |
| Observer set | Member Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/v1/group/` schemas, conformance corpus, and Protocol Line manifest |
| Predecessor or successor | None |
| Current conclusion | Every protected `GroupMember` entry carries one mandatory closed role: `member` or `state-authority`; the role authorizes only Protocol-Line Group state transitions and recipient projection. |

## Question

Does each admitted member Endpoint need a protected protocol role that lets
peers authorize Group state transitions without standardizing product
permissions?

## Role in communication

The Group state author assigns one role to each member entry. Endpoints use the
role to determine whether an authenticated transition author is allowed to add,
remove, or change roles and whether a sender is a current member. `member` is a
regular participant; `state-authority` is the only role eligible for the
Protocol-Line state-transition operations. Neither role grants a product,
account, human, Station, or Network permission.

## Contribution to LicoArc's final vision

Makes protected Group state-transition authorization deterministic while
keeping product permissions and human or device identity outside the three
protocol entities.

## Field model and trade-offs

`role` is a closed per-entry enum. It is carried with the Endpoint reference so
an entry cannot be copied into another state without its authorization meaning.
Only two protocol roles are admitted: `member` and `state-authority`. A future
Protocol Line may assign compact integer labels, but it cannot add aliases or
silently reinterpret either value. Product-specific actions remain ordinary
namespaced Payload.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | Closed enum `member \| state-authority` |
| Presence | Mandatory once for every `GroupMember` entry |
| Values or range | Exactly one of the two labels; no multi-role, free-form, or product-defined values |
| Canonical representation | Protocol-Line-owned compact unsigned enum label inside the canonical member entry |
| Invalid input | Missing, unknown, duplicate, aliased, or role value incompatible with the transition rejects the complete Group state or transition |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Let member Endpoints agree which current member may authorize a Group state transition and which protected sender projection is valid. |
| Field-level necessity | One shared protocol authorization distinction is required; local policy cannot produce the same interoperable accept/reject result for peers. |
| Removal consequence | Every member would be indistinguishable for transition authorization, forcing a Station, sender order, or product permission set to become an implicit authority. |
| Existing-field evidence | `members` supplies Endpoint references but no authorization distinction; `groupStateDigest` binds state but cannot say which member may advance it. |
| Derivation | Deriving authority from member order, first member, account identity, Station, or arrival order is unstable and creates hidden authority. |
| Lower-layer carrier | Transport operations and receipts cannot authorize protected Group state transitions. |
| Existing carrier | Ordinary Payload can carry product instructions, but cannot determine Protocol-Line state advancement without ambiguity. |
| Protected placement | The role remains inside the protected member entry and is authenticated with the Group state. |
| Duplicate-authority risk | Product permission names, user/device labels, Station roles, and Network membership are forbidden substitutes. |

## Visibility and trust

Only member Endpoints see roles in protected state. A Station cannot grant or
remove `state-authority`, and an Endpoint cannot elevate itself by sending an
unknown or conflicting role. Unknown values, duplicate entries, and a role
change not authorized by the predecessor state fail closed before state
advance. The role is protocol authorization input only; it is not a human
status, account permission, ownership claim, consent, trust result, or receipt.

## Alternatives

- Omit the role and treat every member equally: rejected because authorized
  state transitions then have no interoperable protocol selector.
- Derive the role from list order, genesis author, or Endpoint key label:
  rejected because the derivation is mutable, ambiguous, or crosses the identity
  boundary.
- Carry a general permission set or product role string: rejected as an
  unbounded product authority outside LicoArc.
- Let a Station or Network assign roles: rejected because transport cannot
  become protected Group authority.
- Use the closed two-value protocol enum in each member entry: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It cannot
establish this field's necessity, name, placement, semantics, trust, or
lifecycle; the LicoArc-owned protocol-role question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | A closed role prevents unknown-role and unauthorized elevation ambiguity; predecessor authorization remains required. |
| Privacy and metadata | Roles are hidden from Stations but visible to Group members who already share protected state. |
| Interoperability | Two exact values, no aliases, and fail-closed unknown handling are deterministic. |
| Implementation complexity | Constant-size enum validation per bounded member entry. |
| CPU, memory, and wire cost | One compact label per member; no general permission language or unbounded permission set. |
| Evolution and downgrade | New role semantics require a successor Protocol Line and cannot be silently accepted by older peers. |

## Decision history

LicoArc review admitted the minimal `member | state-authority` enum because the
Group state algorithm requires an interoperable authorization distinction, but
rejected product permission sets and identity claims. This Message Field Decision does
not select the Group algorithm; `ALG-group-state-evolution` remains an
independent decision. The Canonical Field Registry was updated in the same
bounded change.

## Definition evidence

The definition status is `SPECIFIED`. Normative semantics remain exclusively in the linked registry, schema, policy, and protocol sources.
