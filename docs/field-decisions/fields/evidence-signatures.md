# Field Review: Evidence Signatures

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-signatures` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | A bounded signature collection authenticates the complete checkpoint under the exact evidence-signing profile set selected by the Protocol Line. |

## Question

Which independently verifiable bytes turn a bounded statement commitment into
transferable Endpoint attribution while retaining algorithm agility?

## Role in communication

The Endpoint signs the canonical checkpoint with keys authorized for evidence
signing by the pinned identity state. The peer verifies before covered state can
advance; a later verifier performs the same check without session secrets.

## Contribution to LicoArc's final vision

Makes the complete bounded checkpoint transferable and independently verifiable while allowing one signature set to cover many statements under mobile resource limits.

## Field model and trade-offs

The field is mandatory `Signature[1..MAX_EVIDENCE_SIGNATURES]`. The exact
Protocol Line fixes required profiles, count, order, domain separation, and
canonical covered bytes. A collection supports an indivisible multi-signature
profile without loose algorithm negotiation. Unknown, missing, repeated,
surplus, invalid, or wrong-purpose entries reject the checkpoint.

One signature set may cover many statements, but a single-statement checkpoint
remains valid so evidence finality cannot wait forever for a full batch. Public
key work and wire size are charged to immutable evidence and mobile budgets.

## Visibility and trust

Signatures travel under pairwise protection but remain verifiable after
disclosure. They prove only that the resolved authorized Endpoint key signed the
exact checkpoint. They do not prove statement truth, human intent, wall-clock
time, uncompromised key custody, or legal responsibility.

## Alternatives

- A session MAC or ratchet tag: rejected because both peers may hold material
  capable of creating session authentication and a third party cannot resolve
  authorship from it.
- One fixed single signature field: rejected because an exact line may require
  an indivisible multi-signature profile.
- A bounded exact collection: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

COSE supplies comparison evidence for detached
signed content, multiple signers, external authenticated context, and exact
signature inputs. NIST cryptographic standards
supplies candidate signature primitive definitions only. Neither source defines
LicoArc identity, statement meaning, profile composition, batching, or legal
effect, and no external object layout is adopted.

## Decision history

LicoArc review on 2026-08-03 admitted a bounded collection rather than one
algorithm selector or per-record signature. The exact evidence signature
composition remains an independent Algorithm Decision and cannot be inferred
from these field semantics.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
