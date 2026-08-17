# Field Review: Group Message Context

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-group-message-context` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | protected `groupStateDigest`, repeated Group and epoch context, or derived context |
| Candidate layer | Protected Generic Message |
| Observer set | Member Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/v1/group/` Message schema, conformance corpus, and Protocol Line manifest |
| Predecessor or successor | None |
| Current conclusion | A logical Group Message carries one mandatory protected `groupStateDigest` that binds it to one exact Group Membership State; `groupId`, epoch, members, and roles are resolved from that retained state and are not repeated in the Message. |

## Question

Which protected value must bind one logical Group Message to the exact Group
Membership State under which its sender and bounded recipients are authorized?

## Role in communication

The sending Endpoint selects the digest of the retained Group Membership State
and includes it in the protected Generic Message. Each recipient resolves the
digest against its accepted state chain, verifies that the sender is a current
member under that state, and derives the same recipient projection. A Station
may carry separate per-member packets but cannot interpret, alter, or authorize
the Group context.

## Contribution to LicoArc's final vision

Binds one protected logical message to the exact Group state that authorizes its
sender and recipients while avoiding repeated membership metadata and Station
visibility.

## Field model and trade-offs

`groupStateDigest` is the digest of the complete canonical Group Membership
State, including its `groupId`, epoch, predecessor, member entries, and roles.
It is a Message-level context field, not a second Group identifier or a
transport correlation handle. The existing protected `messageId` remains the
logical Message identity; this digest supplies Group authorization context.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` |
| Presence | Mandatory in every Group Message; absent from non-Group Generic Messages |
| Values or range | Exactly the digest of one accepted Group Membership State; one context per logical Group Message |
| Canonical representation | The selected Protocol Line's deterministic digest over the complete canonical Group Membership State |
| Invalid input | Missing, wrong length, unknown state, stale or forked state, cross-Group state, or sender not present in that state rejects the Message |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Reject cross-Group and cross-epoch replay and derive one deterministic per-member delivery projection for a logical Group Message. |
| Field-level necessity | Session identity, `messageId`, and local current state do not prove which historical Group state authorized this Message; one exact state binding is required. |
| Removal consequence | A delayed Message could be accepted under a newer or unrelated membership state, allowing removed members or wrong recipients to receive it. |
| Existing-field evidence | `groupId` names a Group and `groupEpoch` orders states, but neither detects same-epoch forks; repeating all membership fields would duplicate authority and wire bytes. |
| Derivation | A receiver cannot derive the sender's intended state from arrival time, Route, Station, or current local state when packets are delayed or reordered. |
| Lower-layer carrier | Transport routing and operation IDs carry no protected Group authorization semantics. |
| Existing carrier | `messageId` is stable logical identity and `relatesTo` is response or stream relation; neither can carry a state authorization digest without scope confusion. |
| Protected placement | The digest is inside the Endpoint-protected Generic Message and hidden from Stations. |
| Duplicate-authority risk | Repeated `groupId`, epoch, member list, or product room identifier in the Message is forbidden; the state digest is the sole context binding. |

## Visibility and trust

The context is confidential and authenticated under Pairwise Protection. A
Station can suppress, duplicate, or route a packet to the wrong Handle, but
recipient validation rejects a digest that is unknown, stale, forked, or not
authorized for the sender. The digest binds state bytes only; it does not
create membership, receipt, product permission, or human identity authority.

## Alternatives

- Omit Group context and use current local state: rejected because delayed
  Messages can cross an epoch or membership removal.
- Repeat `groupId`, epoch, member set, and roles: rejected as duplicate
  authority and avoidable protected wire expansion.
- Carry only `groupId` and epoch: rejected because same-epoch fork state is
  not distinguished.
- Derive context from `messageId`, session, Route, or Station operation:
  rejected because each has a different owner and can change independently.
- Carry one protected digest of the complete authorized state: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It cannot
establish this field's necessity, name, placement, semantics, trust, or
lifecycle; the LicoArc-owned Group Message binding question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Exact state resolution prevents cross-Group, stale epoch, removed member, and same-epoch fork substitution before delivery. |
| Privacy and metadata | Only a fixed-size digest is visible to protected peers; Stations never see membership or role bytes. |
| Interoperability | One digest projection, mandatory Group placement, and deterministic rejection are unambiguous. |
| Implementation complexity | One digest lookup against bounded retained Group state; no duplicate member-set parsing per recipient. |
| CPU, memory, and wire cost | Constant 32-octet context per logical Message and bounded state lookup; per-member projection remains separately bounded. |
| Evolution and downgrade | The digest projection is tied to the Protocol Line; translators and context from a mixed Protocol Line are forbidden. |

## Decision history

LicoArc review selected one protected `groupStateDigest` as the smallest Group
Message context that prevents state substitution without repeating the Group
snapshot. The decision is independent of `ALG-group-state-evolution`: the
algorithm record describes state behavior but cannot admit a Message field.
The Canonical Field Registry was updated in the same bounded change.

## Definition evidence

The definition status is `SPECIFIED`. Normative semantics remain exclusively in the linked registry, schema, policy, and protocol sources.
