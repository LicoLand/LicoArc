# Field Review: Attachment Identifier with Recovery State

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-id-recovery` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeds `FLD-attachment-id`; no successor. |
| Current conclusion | The same Message-scoped `attachmentId` is mandatory in its descriptor, each attachment chunk, and each Attachment Receive State; no independent transfer identifier exists. |

## Question

How do chunks and recovery state select one attachment when the declaring
Message may contain several descriptors?

## Role in communication

The declaring Endpoint assigns the identifier. Both Endpoints use it only
with the declaring `messageId` to index immutable chunk and receive-state
facts. It is not a content address, storage path, retrieval locator, bearer
credential, or globally meaningful identity.

## Contribution to LicoArc's final vision

Keeps descriptor, protected chunks, and receive-state reconciliation on one
Message-scoped attachment identity without creating a transport locator or
second transfer identifier.

## Field model and trade-offs

The semantic type remains `ID128`. It is mandatory in an
`AttachmentDescriptor`, conditionally mandatory on its attachment
`streamChunk` Messages, and mandatory inside Attachment Receive State. Every
use must resolve under the exact Message named by `relatesTo`. Unknown,
duplicate, ambiguous, or cross-Message use fails closed.

The stable attachment root is the declaring `messageId` plus `attachmentId`
under one Protocol Line and peer relationship. Route, Station, session,
protection frame, retry attempt, and local storage names are excluded from
that identity.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Select one descriptor, chunk grid, and recovery state among bounded sibling attachments. |
| Field-level necessity | Each chunk and state object needs a compact protected selector within the declaring Message scope. |
| Removal consequence | A multi-attachment Message cannot correlate chunks or recovery state unambiguously. |
| Derivation | Content digest is not identity and equal files may have distinct attachment semantics. |
| Existing carrier | Reuse of the admitted `attachmentId` avoids a new transfer identifier. |
| Duplicate-authority risk | A separate transfer ID, token, locator, or storage key could disagree with the descriptor. |

## Visibility and trust

The value is Endpoint-protected and hidden from Stations. Equality is
meaningful only inside the declaring Message; reuse elsewhere grants no
authority. A Station can correlate outer traffic shape but cannot read or
rewrite the attachment identity.

## Alternatives

- Reuse `attachmentId` in every attachment-specific protected structure:
  selected.
- Use content digest: rejected because integrity identity and attachment
  instance identity are different.
- Add a transfer ID or resume token: rejected as duplicate authority.
- Use local file, Route, or Station identifiers: rejected as non-portable.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned attachment scope
and recovery identity question is self-contained.

## Decision history

The question advanced from `OPEN` to `READY` after identifier reuse,
multi-attachment ambiguity, privacy, migration, and duplicate-authority cases
were closed. LicoArc review on 2026-08-03 selected the single Message-scoped
identity, updated every active placement in the Field Registry, and moved this
successor to `DECIDED`. `FLD-attachment-id` is retained as retired history.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
