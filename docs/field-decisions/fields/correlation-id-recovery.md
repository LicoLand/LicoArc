# Field Review: Correlation Reference with Attachment Recovery

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-correlation-id-recovery` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-correlation-id`; no successor. |
| Current conclusion | `relatesTo` remains the only protected correlation field and is additionally mandatory on a LicoArc Attachment Receive State `event`, where it names the Message containing the attachment descriptor. |

## Question

Can resumable attachment transfer reuse the declaring Message identity, or
does recovery require a second correlation namespace?

## Role in communication

The producing Endpoint places the declaring Message's `messageId` in
`relatesTo`. The peer uses that direct reference to resolve the exact
descriptor before accepting chunks, requested ranges, or completion. The
field never refers to a Station operation, connection, Route, or local file.

## Contribution to LicoArc's final vision

Binds responses, failures, cancellation, streams, and attachment receive state
to exact protected Messages so recovery survives asynchronous delivery without
a transport correlation namespace.

## Field model and trade-offs

The field remains one conditional `ID128`. It is required for `response`,
`error`, `cancel`, `streamChunk`, and a LicoArc Attachment Receive State
`event`. Attachment uses must reference the Message that contains the matching
descriptor. An unknown target, a target without the named attachment, a cycle,
or a cross-Protocol-Line reference fails closed.

Reusing the declaring Message identity avoids a second transfer graph and
keeps resolution bounded. The receiver must retain enough descriptor state to
resolve an active transfer; storage layout and lookup indexes remain local.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Resolve one attachment manifest after interruption, restart, re-protection, or Route migration. |
| Field-level necessity | The state Message must name an earlier protected Message under asynchronous and out-of-order delivery. |
| Removal consequence | Concurrent attachment transfers cannot bind recovery state to one manifest deterministically. |
| Derivation | Arrival order, connection identity, and current Route cannot identify the declaring Message. |
| Existing carrier | The admitted `messageId` is reused directly through `relatesTo`; no second namespace is needed. |
| Protected placement | The relationship graph remains hidden from Stations and Endpoint-authenticated. |

## Visibility and trust

Only peer Endpoints observe the value after protection. A Station may delay or
suppress the state Message but cannot retarget it without rejection. Replayed
Message identity is handled by Pairwise Protection and Reliable Exchange
deduplication; relation validity never proves attachment completion.

## Alternatives

- Reuse `relatesTo` with the declaring `messageId`: selected.
- Add `transferId`, `resumeToken`, connection ID, or Route ID: rejected as
  duplicate, unstable, or externally visible authority.
- Infer the target from arrival order: rejected under concurrency and retry.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned identity and
asynchronous-correlation question is self-contained.

## Decision history

The question advanced from `OPEN` to `READY` after omission, duplicate
identity, protected placement, replay, resource, and migration cases were
closed. LicoArc review on 2026-08-03 selected direct reuse of `relatesTo`,
updated the Field Registry in the same bounded change, and moved this successor
to `DECIDED`. `FLD-correlation-id` is retained as retired history.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
