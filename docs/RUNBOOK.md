# Lico Arc Protocol Runbook

Operational procedures for maintaining the Lico Arc Protocol contract line and its
artifacts. All commands run from the repository root and require Node.js 22
or newer.

## Verify The Repository

```sh
npm run verify
```

This runs `npm run artifacts:check`, which fails unless every tracked bundle
matches its canonical sources, and `npm test`, which runs the conformance
and source-integrity tests. The tests check schemas, registries, declared
source bindings, requirement-to-corpus mappings, decision inventories,
definition-level positive and negative cases, documentation projections, and
the generated bundle. They establish only internal agreement among tracked
definition sources; they do not validate an implementation, a runtime,
interoperability execution, device behavior, audit result, or delivery state.

## Regenerate The Bundle Artifact

Run after any change to `spec/v1/manifest.json` or a source listed by it:

```sh
npm run artifacts:generate
```

The generator (`tools/generate-artifact.mjs`) reads the explicit manifest and
regenerates its configured bundle. The v1 digest binds artifact version,
wire ID, lifecycle, digest algorithm, the manifest, and all listed sources.
Commit a newly generated Candidate artifact only with the Candidate sources
that produced it. Candidate bytes may change and receive a new digest through
review and regeneration. Never mutate or hand-edit a Published artifact.

## Define A New Contract Version

1. Create `spec/v2/manifest.json`, the capability directories below
   `spec/v2/`, and the matching corpora below `conformance/v2/`; never mutate
   a published version.
2. Give the manifest an exact wire ID, lifecycle `Candidate`, a new artifact
   version, output path, and explicit ordered source list.
3. Extend the generator to select the new manifest, regenerate, and verify.
4. Update [COMPATIBILITY.md](COMPATIBILITY.md), the protocol document under
   `docs/protocols/`, and [../CHANGELOG.md](../CHANGELOG.md) in the same
   change.

## Diagnose A Failing Artifact Check

`npm run artifacts:check` fails when a canonical source changed without
regenerating the bundle. Regenerate, review the resulting diff, and rerun
`npm run verify`. If the failure persists, the artifact was edited by hand;
restore it with `npm run artifacts:generate`.
