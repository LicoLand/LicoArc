# Lico Arc Protocol Definition Status

This document is the authority for current LicoArc definition status. English
is normative. Product intent is defined in `PRODUCT.md`, vocabulary and
invariants in `CONTEXT.md`, and exact machine-readable meaning in `spec/` and
`conformance/`.

LicoArc is a protocol-definition repository. It does not track or gate on any
language implementation, provider selection, executable interoperability,
runtime or device result, audit, package, publication channel, deployment,
support, operation, or product integration. Those facts close only in their
own repositories or delivery channels and cannot advance or block a LicoArc
definition.

## Definition authority

| Scope | Status |
| --- | --- |
| Domain model and repository boundary | defined |
| Decision lifecycle | defined |
| Canonical field inventory | defined |
| Protocol Line composition and lifecycle | Candidate definition complete |
| Pairwise Protection profiles | Candidate definition complete |
| Endpoint identity, discovery, transparency, affiliation, and migration | Candidate definition complete |
| Generic Messaging and attachments | Candidate definition complete |
| Group Collaboration | Candidate definition complete |
| Reliable Exchange and Evidence Checkpoints | Candidate definition complete |
| HTTPS Transport Profile | Candidate definition complete |
| Federation governance and certification semantics | Candidate definition complete |

The current line remains a mutable `Candidate`. “Complete” above means the
declared implementation-neutral definition is closed across its formal text,
schemas, registries, policies, bounds, source manifests, definition-level
positive and negative corpus, and generated artifact. It makes no downstream
delivery claim.

## Tracked source closure

The tracked definition graph consists of:

- durable intent and protocol documents;
- Algorithm and Message Field decision records;
- versioned schemas, CDDL, registries, policies, bounds, and manifests;
- positive and negative definition-level conformance corpora; and
- the deterministic generated Protocol Line bundle.

Repository checks prove only internal consistency of that graph: declared
inputs, schema/registry alignment, decision inventory closure, corpus binding,
manifest digests, and deterministic artifact generation.

`docs/references/` is ignored local research material. It is not a normative
input, tracked document, link target, fixture, artifact source, or completion
condition.

## Ownership boundary

Downstream implementations consume one exact pinned Protocol Line without
minting identifiers or redefining semantics. Each implementation repository
owns its own dependencies, providers, executable tests, runtime validation,
interoperability claims, device evidence, audit response, packaging, release,
deployment, operation, support, and integration.

Downstream findings may motivate a new LicoArc decision when protocol meaning
must change. They never become evidence that closes this repository.
