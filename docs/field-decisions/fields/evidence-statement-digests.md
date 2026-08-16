# Field Review: Evidence Statement Digests

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-statement-digests` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | One bounded canonical digest list commits the exact transferable projections of several Endpoint statements under a single checkpoint signature set. |

## Question

How can LicoArc make Endpoint statements independently attributable without
copying full Payloads into evidence or attaching one signature to every record?

## Role in communication

The signer computes each digest from one complete Protocol-Line-defined
transferable statement projection. The peer joins statements and checkpoints in
bounded pending state before delivery or state transition. A disclosed verifier
recomputes the same digests from the revealed statements.

## Contribution to LicoArc's final vision

Amortizes independently verifiable Endpoint attribution across a bounded canonical statement set while preserving exact User Payload and state-transition meaning.

## Field model and trade-offs

`statementDigests` is mandatory
`DIGEST256[1..MAX_EVIDENCE_STATEMENTS]`, sorted by unsigned byte order with no
duplicates. Each domain-separated digest covers the exact Protocol Line,
signer, counterparty, record form, semantic fields, and ordinary User Payload.
It excludes session lookup, protection frames, ciphertext, retry,
Route, and Station carriage so re-protection and migration do not change
evidence identity.

An attachment declaration's canonical statement includes its descriptor,
`byteLength`, and complete `contentDigest`; the disclosed attachment bytes can
therefore be checked without signing every chunk. Routine attachment chunks and
non-empty receive-state updates do not get individual checkpoints. The final
empty receive state, emitted only after complete-content verification, is a
Transferable Statement and requires one checkpoint before attachment completion
advances. A non-attachment stream without an authenticated complete-content
root must evidence its user-intent statements in bounded batches.

## Visibility and trust

Digests and checkpoint context are hidden from Stations in transit. A digest
alone is not authorship, delivery, time, or truth evidence; it becomes
attributable only inside a valid checkpoint. Unknown projection, missing
statement, mismatch, duplicate, non-canonical order, or input beyond a bound fails
closed and cannot be silently normalized.

## Alternatives

- Copy full statements into the checkpoint: rejected for duplicated Payload
  traffic.
- One inline signature per statement: rejected for public-key and framing cost.
- An undefined tree root: rejected because leaf, tree, disclosure, and
  duplicate semantics would add unresolved complexity.
- A bounded sorted digest list: selected for simple linear verification and
  predictable memory.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

COSE supplies comparison evidence that detached
content and externally authenticated context require an application-defined,
unambiguous construction. LicoArc does not adopt its object layout, headers, or
algorithm registry and defines its own statement projection.

## Decision history

LicoArc review on 2026-08-03 selected a bounded digest list over per-record
signatures and an unspecified tree commitment. It also closed the tail gap:
covered statements have no application or peer-state effect until both the
statement and valid checkpoint are present, while loss permits idempotent
checkpoint retransmission rather than unsigned fallback.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
