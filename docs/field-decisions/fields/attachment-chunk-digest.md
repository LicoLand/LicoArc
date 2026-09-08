# Field Review: Per-Chunk Attachment Digest

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-chunk-digest` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Reject a common attachment `chunkDigest`; Endpoint protection authenticates each chunk Message and descriptor `contentDigest` authenticates complete reassembly. |

## Question

Does each protected attachment chunk require a second transmitted integrity
value?

## Role in communication

Pairwise Protection authenticates the chunk's complete Message identity,
relation, attachment identity, index, content type, and bytes. After all
chunks exist, `contentDigest` verifies the exact raw-byte sequence committed
by the descriptor.

## Contribution to LicoArc's final vision

Using Endpoint protection for each chunk and `contentDigest` for the complete
attachment avoids redundant digest metadata without weakening integrity.

## Field model and trade-offs

There is no common field. A chunk that fails Endpoint authentication is
rejected before attachment state changes. The same attachment root and index
with different authenticated bytes is a terminal conflict. Local storage may
use private checksums, but they are not protocol fields or peer evidence.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Detect modified chunks and incorrect final reassembly. |
| Field-level necessity | None; admitted protection and final digest already cover both scopes. |
| Removal consequence | No protocol integrity check is removed. |
| Derivation | Per-message authentication result and final digest verification are existing facts. |
| Duplicate-authority risk | A chunk digest can select a second algorithm, disagree with protected bytes, or expose equality metadata. |

## Visibility and trust

Rejecting the field avoids another equality signal even inside protected
history. Stations still observe traffic shape but never receive an attachment
digest. Local corruption detection and storage repair remain Endpoint-local.

## Alternatives

- Existing Message authentication plus final digest: selected.
- Common per-chunk digest: rejected as redundant.
- Profile-specific authenticated construction: remains inside the selected
  Protection Profile and does not create this field.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

No external evidence is required because the LicoArc-owned integrity-layer
question is self-contained.

## Decision history

Omission, common digest, and protection-owned alternatives were closed during
`OPEN`. Existing integrity authorities made the field redundant and
potentially conflicting, so LicoArc review on 2026-08-03 moved it directly to
`REJECTED` and recorded the active owners in the Field Registry.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
