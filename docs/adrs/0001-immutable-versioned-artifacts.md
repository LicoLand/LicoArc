# ADR 0001: Content-Addressed Candidate Definitions

Status: current, implemented, and source-integrity verified.

## Context

Independent Endpoint, Station, verifier, and tooling implementations need one
exact protocol meaning without importing one another's code. A mutable label
alone cannot identify those semantics.

## Decision

- Capability definitions live under `spec/v1/` with explicit source manifests;
  definition-level corpora live under matching `conformance/v1/` paths.
- `spec/v1/manifest.json` composes the exact mandatory capabilities, Profile
  identities, stable security claims, lifecycle policy, and allowed source
  closure for `licoarc.protocol-line.v1`.
- Protection Profile and Protocol Line identities are SHA-256 digests of named,
  deterministic, non-circular semantic projections.
- `artifacts/v1/licoarc.bundle.json` is generated deterministically from the
  declared tracked graph and binds its exact embedded sources.
- Candidate source changes require identity recomputation and artifact
  regeneration. A later Published definition, if independently authorized,
  is immutable; a semantic change receives a new identity and generation.

Publication is a separate channel action and cannot change or complete the
definition.

## Verification

- [`../../spec/v1/manifest.json`](../../spec/v1/manifest.json) owns the current
  composition and source closure.
- [`../../tools/generate-artifact.mjs`](../../tools/generate-artifact.mjs)
  performs deterministic generation and comparison.
- [`../conformance/verification.md`](../conformance/verification.md) describes
  corpus, proof, content-identity, and artifact admission.
- [`../STATUS.md`](../STATUS.md) projects the resulting lifecycle and definition
  status.

## Consequences

- A wire locator without the matching content identity is insufficient.
- Source-integrity checks prove agreement within this repository's definition
  graph, not downstream implementation or delivery.
- The two withdrawn Profile identifiers retained by the registry are
  non-reusable allocation tombstones only; they retain no executable behavior.
