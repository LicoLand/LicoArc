# Definition Source Integrity

This document describes deterministic integrity checks over tracked protocol
definitions. The executable authorities are
[`tools/generate-artifact.mjs`](../../tools/generate-artifact.mjs),
[`tests/candidate-integration.test.mjs`](../../tests/candidate-integration.test.mjs),
and [`tests/conformance.test.mjs`](../../tests/conformance.test.mjs).

## Closed Candidate source set

`spec/v1/manifest.json` is the sorted Protocol Line source manifest. It binds
the current wire identity, Candidate lifecycle, minimum-safe capability
versions, governance and runtime source families, bounds registry, handshake
binding, session lock, and forbidden translation policy. Its nine capability
records bind one source digest and one version per capability.

`conformance/v1/manifest.json` closes the same set with explicit capability
registries, policies, schemas, requirement paths, vectors, positive and
negative corpora, raw source digests, and per-capability source-map digests.
The generator rejects missing, extra, symlinked, non-JSON/non-CDDL, stale,
mutated, mixed-line, fallback, or downgraded inputs.

## Artifact integrity

`npm run artifacts:check` regenerates the tracked Candidate bundle in memory
and fails if the checked-in bytes differ. The artifact contains the two
manifests and every declared source exactly once. Its SHA-256 digest covers
artifact version, wire identity, lifecycle, digest algorithm, and the sorted
embedded source map. Generation has no timestamp, host, account, process,
absolute path, dependency-graph, or runtime-state input.

The integration test generates the replacement bundle twice and requires byte
identity, then checks the artifact with `--check`. It also exercises omission,
mutation, extra-source, mixed-line, fallback, and downgrade mutations in
isolated temporary fixtures.

## Conformance corpus

Every capability conformance manifest declares its positive and negative
corpus paths, case IDs, and Candidate lifecycle. The conformance test checks
that corpus IDs are unique and exactly match their manifest, that positive
and negative IDs are disjoint, that both vectors are source-bound, and that
each registry remains Candidate. CDDL values are required to be UTF-8,
newline-terminated, and free of carriage returns and NUL bytes.

## Integrity boundary

The checks above prove source closure, manifest and registry bindings,
definition-level corpus closure, deterministic generation, and artifact
integrity. They do not consume or report downstream implementation or delivery
facts.

## Commands

| Command | Behavior |
| --- | --- |
| `npm run artifacts:generate` | Rewrite the bundle from the closed Candidate sources |
| `npm run artifacts:check` | Fail if the tracked bundle is stale |
| `npm test` | Run conformance, source-closure, projection, and repository tests |
| `npm run verify` | Artifact check plus the complete repository test suite |
