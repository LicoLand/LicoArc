# Field Review: Independent Attachment Transfer Token

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-transfer-token` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject an independent `transferId` or `resumeToken`; the protected declaring `messageId` plus `attachmentId` is the sole attachment root. |

## Question

Does recovery require a new identifier or bearer token in addition to the
declaring Message and attachment identities?

## Role in communication

Both Endpoints resolve chunks and receive state under the exact declaring
Message and attachment descriptor. No Station, Route, connection, storage
object, or token issuer participates in attachment identity.

## Contribution to LicoArc's final vision

Reusing the declaring `messageId` and `attachmentId` keeps recovery identity
stable without adding a bearer token or globally linkable transfer namespace.

## Field model and trade-offs

There is no field. The attachment root is scoped to one Protocol Line, peer
relationship, declaring `messageId`, and `attachmentId`. Its chunks add only
`chunkIndex`. Route and session change may re-protect and redeliver those
facts but cannot translate or rename them.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Resolve one attachment across retry and migration. |
| Field-level necessity | None; the admitted protected identities already do so. |
| Removal consequence | No action or ambiguity is introduced. |
| Derivation | Exact from `relatesTo` and `attachmentId`. |
| Duplicate-authority risk | A token can disagree, leak through outer routing, become a bearer credential, or survive beyond its attachment. |

## Visibility and trust

No extra identifier is exposed to either Station or peer history. Existing
protected identities remain visible only to peer Endpoints; outer traffic
shape remains a residual correlation channel.

## Alternatives

- Reuse declaring Message and attachment identities: selected.
- Random transfer ID: rejected as a duplicate namespace.
- Resume token: rejected as unnecessary bearer authority.
- Station or Route resource handle: rejected because carrier migration must
  not change attachment identity.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned identity and
duplicate-authority question is self-contained.

## Decision history

Existing-identity, random-identifier, bearer-token, and carrier-handle
alternatives were closed during `OPEN`. The existing tuple already supports
the required action, so LicoArc review on 2026-08-03 moved the duplicate field
directly to `REJECTED` and recorded the active identity owner in the Field
Registry.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
