# Field Review: Group Epoch

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-group-epoch` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `groupEpoch` or derived order |
| Candidate layer | Protected Group Membership State |
| Observer set | Member Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/v1/group/` schemas, conformance corpus, and Protocol Line manifest |
| Predecessor or successor | None |
| Current conclusion | Each Group Membership State carries one mandatory `groupEpoch` that starts at `0` for genesis and increases by exactly one for each accepted successor; it never resets. |

## Question

Does each Group Membership State need a monotonic epoch in addition to its
predecessor binding and state digest?

## Role in communication

The Endpoint-authored Group transition supplies the next epoch and member
Endpoints compare it with their retained high-water state. The value orders
state succession, rejects rollback and gaps, and scopes Group Message
authorization to one membership generation. A Station's arrival order, clock,
receipt, or operation counter is never an epoch authority.

## Contribution to LicoArc's final vision

Gives every member Endpoint one deterministic, protected order for Group
membership succession so stale or skipped state cannot authorize a message.

## Field model and trade-offs

`groupEpoch` is a Group-scoped counter. Genesis is epoch `0`; every accepted
successor is the previous value plus one. An Endpoint retains the greatest
accepted value and rejects reset, gap, rollback, and conflicting state at the
same epoch. The counter is Endpoint-protected and carries no time meaning.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `uint64` |
| Presence | Mandatory in every Group Membership State |
| Values or range | Genesis `0`; each successor is exactly previous plus one; no reset; maximum is the unsigned 64-bit bound |
| Canonical representation | The selected Protocol Line's shortest deterministic unsigned integer |
| Invalid input | Negative, non-canonical, overflow, rollback, gap, reset, or equal epoch with different state fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Let independent member Endpoints order authenticated membership states and reject stale, skipped, or replayed transitions. |
| Field-level necessity | A predecessor digest proves which state came before but does not express numeric order, gap detection, or a retained high-water boundary. |
| Removal consequence | Without an epoch, a delayed old state can be mistaken for a current state and forks sharing one predecessor cannot be classified consistently. |
| Existing-field evidence | `descriptorSequence`, `affiliationEpoch`, and `routeEpoch` have Station, Endpoint-wide service, and peer-route scopes; none orders Group state. |
| Derivation | Arrival order, Station time, Message identity, and digest byte order are mutable or not ordered state coordinates. |
| Lower-layer carrier | Transport receipt and operation identifiers describe carriage or idempotency, not protected Group succession. |
| Existing carrier | `groupId` identifies the Group but has no order; `groupStateDigest` identifies one state but changes with every state. |
| Protected placement | The counter is carried only in the protected Group state and authenticated with its predecessor and members. |
| Duplicate-authority risk | A second Station, Network, or wall-clock counter is forbidden. |

## Visibility and trust

Only member Endpoints observe the epoch in protected state. A malicious
Station can suppress a newer state or replay an older packet but cannot make a
lower value current. Equal values with different canonical state are a fork;
gaps and rollback fail closed without allocating or applying the proposed
member set. The value is not freshness, delivery, or human-time evidence.

## Alternatives

- Omit the value and use predecessor-only succession: rejected because order,
  gap, and high-water checks become non-deterministic.
- Use arrival order or Station time: rejected because both are untrusted and
  differ between Endpoints.
- Reuse `affiliationEpoch`, `routeEpoch`, or `descriptorSequence`: rejected
  because each has a different owner and scope.
- Use a digest as an order: rejected because a digest is not monotonic.
- Use a bounded unsigned counter with exact successor rules: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It cannot
establish this field's necessity, name, placement, semantics, trust, or
lifecycle; the LicoArc-owned ordering question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Strict successor and high-water checks reject rollback, gaps, and equivocation at one epoch. |
| Privacy and metadata | Protected placement hides Group update cadence from Stations; member Endpoints can correlate changes. |
| Interoperability | Initial value, increment, overflow, and invalid-input rules are deterministic. |
| Implementation complexity | Constant-size counter and high-water comparison; no clock synchronization is required. |
| CPU, memory, and wire cost | One compact unsigned integer and constant-time comparison. |
| Evolution and downgrade | No reset or reinterpretation across reconnect, Route migration, or Protocol Line translation; a semantic change requires a successor line. |

## Decision history

LicoArc review admitted `groupEpoch` because deterministic Group ordering and
rollback rejection cannot be derived from a predecessor digest or transport
observation. This Message Field Decision is independent of
`ALG-group-state-evolution`; the algorithm record neither admits nor specifies
the wire field. The Canonical Field Registry was updated in the same bounded
change.

## Definition evidence

The definition status is `SPECIFIED`. Normative semantics remain exclusively in the linked registry, schema, policy, and protocol sources.
