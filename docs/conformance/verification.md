# Definition Source Integrity

This document describes deterministic checks over the tracked protocol
definition. They establish only definition and source-integrity facts.

## Current admission target

The canonical manifest defines `licoarc.protocol-line.v1` as
`Candidate` / `COMPLETE`, with `sessionEligible: true` and
`publicationEligible: false`, V1 / Generation 1. It binds
exactly eight complete capabilities, one
complete active `stable-core` Protection Profile, 23 stable positive security
claims, no missing definitions, and no blockers.

## Closed source graph

`spec/v1/manifest.json` declares the Protocol Line content identity,
capability source manifests, Profile catalog, security claim set, field
registry digest, fixed admission and lifecycle facts, and allowed source roots.
Undeclared files and symbolic links are rejected.

Each capability source manifest declares its schemas, registries, policies,
bounds, labels, runtime grammar where applicable, and exact source digest.
`conformance/v1/manifest.json` binds the matching capability and Profile
corpus manifests. Every corpus uses one source-bound `cases.json` envelope
containing synthetic positive and negative cases with an exact operation ID,
input context, and expected result.

The conformance engine dispatches only through the declared generic operation
registry. A case ID is reporting metadata, and an expected value is compared
only after execution; neither can select behavior. Private-key material,
implicit aliases, undeclared source input, and runtime data are rejected.

## Content identities

The active Profile identity is recomputed from
`ProtectionProfileSemanticProjectionV1`. The line identity is recomputed from
`ProtocolLineSemanticProjectionV1`. Both use deterministic CBOR and SHA-256.
The projections include semantic source bytes and stable semantic identifiers,
while excluding self-identifiers, lifecycle and publication state, proof-tool
output, formal-binding metadata, and artifact/source digests. This keeps the
identities content-bound and non-circular.

Complete admission requires every mandatory capability semantic identity,
every active Profile identity, every stable claim, and every declared corpus
to agree. Missing, extra, incomplete, unproved, mismatched, or circular input
fails admission.

## Source-bound proofs

`formal/licoarc-core-v1.spthy` owns the symbolic Core model. Source-derived
formal bindings connect stable claim IDs to the exact model, lemma, authority
path, JSON pointer, and digest. Every proved claim must have every required
binding kind; non-proved claims must have none.

The pinned Tamarin contract proves and replays the theory, then validates all
named lemmas and bindings. A prover exit status alone is insufficient. The
model treats the declared hybrid construction, classic ratchet, signatures,
authenticated transitions, bounds, and atomic durable commit as ideal
operations. Computational primitive security and downstream resource behavior
remain outside this proof.

The explicit Profile nonclaims are ongoing post-quantum post-compromise
recovery, physical zeroization, ratchet-header confidentiality, rollback
detection under a fully compromised store, and third-party-verifiable session
authentication. The model establishes only its named idealized protocol
claims. It does not establish SDK code correctness, Provider behavior, key
custody, representative-device behavior, or interoperability.

## Artifact integrity

`tools/generate-artifact.mjs` embeds every declared source exactly once in
sorted order and computes the Candidate bundle deterministically. The artifact
has no timestamp, host, account, process, absolute-path, dependency-graph, or
runtime-state input. In-memory regeneration must match
`artifacts/v1/licoarc.bundle.json` byte for byte.

## Commands

| Command | Definition-only evidence |
| --- | --- |
| `npm run artifacts:check` | Checked bundle equals deterministic regeneration |
| `npm run formal:generate` | Formal constants and bindings match normative sources |
| `npm run formal:check` | Pinned proof, replay, claim, binding, and digest closure |
| `npm test` | Schema, registry, corpus, identity, lifecycle, projection, and source-closure tests |
| `npm run verify` | Artifact staleness check plus the complete repository test suite |

These commands do not establish publication, downstream implementation,
executable interoperability, audit, deployment, support, or operation. The
independent TypeScript, Rust, and Go repositories must separately admit and
execute the exact bundle; their focused decoders, authority validators,
session gates, confirmation reducers, and corpus executors do not by
themselves establish product integration or production operation.
