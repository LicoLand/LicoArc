# Field Review: Attachment Content Digest

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-content-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `contentDigest` verifies the complete raw attachment reconstructed in ascending `chunkIndex` order and is required before terminal completion. |

## Question

How does a receiver verify that every resumed and reordered chunk reconstructs
the exact raw attachment committed by the protected descriptor?

## Role in communication

The sender computes the integrity value over complete raw attachment bytes.
The receiver verifies it only after every derived index and exact length is
durably accepted and reassembled. It binds content to the descriptor but is
not a retrieval locator, attachment identifier, per-chunk digest, or signature.

## Contribution to LicoArc's final vision

Lets an Endpoint verify that every resumed and reassembled attachment byte
matches the immutable protected descriptor before completion.

## Field model and trade-offs

The value is a mandatory `DIGEST256`. It covers the complete raw bytes in
ascending chunk order, not protected frames, padding, carrier bytes, or local
storage representation. Mismatch is terminal for the attachment identity and
must not trigger an unbounded resend loop.

## Visibility and trust

The digest is protected and Endpoint-authenticated, yet equality can correlate
identical files and may enable guessing of predictable content. A Station-
supplied digest is never authoritative; mismatch fails closed.

## Decision history

The field was admitted because per-Message protection does not prove that the
complete reconstructed file matches its descriptor. LicoArc review on
2026-08-03 closed its final recovery role and rejected a redundant per-chunk
digest; this field still does not select an algorithm independently.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
