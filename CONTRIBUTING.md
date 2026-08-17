# Contributing To Lico Arc Protocol

Lico Arc Protocol is a protocol and policy authority. Changes here redefine what
every implementation must follow, so contributions are held to deterministic,
reviewable, and privacy-safe standards.

## Ground Rules

- Never commit real user data, secrets, endpoints, or runtime material.
  Examples and fixtures must be synthetic.
- Keep the repository boundary: versioned implementation-neutral protection
  profiles and definition-level corpora belong here, but endpoint cryptographic
  implementation, keys, entropy, protected runtime state, provider code, and
  key-custody material do not. Station implementation, storage, product APIs,
  and runtime operations also remain outside this repository.
- Preserve the exact **Endpoint**, **Station**, and **Network** entity set and
  authority boundaries defined by the
  [README Core Domain Model](README.md#core-domain-model). New capabilities,
  implementation roles, and governance actors must not become additional core
  domain entities or redefine that model in another document.
- Preserve the first complete Protocol Line target: two Endpoints exchange an
  end-to-end protected message across a Network using untrusted Station
  carriage, malformed station-facing transport input is rejected, and Station
  receipts never prove final delivery. Current relay-only
  checks must not be reported as proof that the `ciphertext` string is
  encrypted.
- Treat all stations as globally coordinated, adaptive, and continuously
  hostile. Protection-related changes must strengthen the boundary, preserve
  cryptographic agility and downgrade resistance, use reviewed open standards
  instead of custom cryptography, and fail closed.
- Protocol and policy changes are versioned. Do not mutate a published
  version directory in place; add a new version instead. See
  [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md).
- Apply the canonical [LicoArc Decision Lifecycle](docs/DECISION-LIFECYCLE.md)
  before every algorithm or message-field update. Algorithm Decisions and
  Message Field Decisions are independent; a change affecting both requires
  two records, and neither record inherits the other's status. Do not edit an
  outcome authority before creating or updating the
  applicable decision record.
- Before adding, renaming, moving, or removing protocol data, update the
  [Field Decision Workspace](docs/field-decisions/README.md). Each conceptual
  field has one review covering necessity, values, visibility, alternatives,
  self-contained comparative context, and technical cost. Only the record's bounded decision scope may
  advance; `OPEN` and `READY` are not authority to add a wire field.
- Apply the same admission burden to every existing Candidate field. Current
  schema presence, tests, examples, implementation effort, and compatibility
  cost for unpublished bytes do not justify retention; if necessity is not
  demonstrated, decide removal through the field lifecycle.

## Workflow

1. Create a branch with a meaningful prefix such as `feature/` or `fix/`.
2. Classify every proposed algorithm or field change into its independent
   decision track. Create or update the applicable decision record and closed
   workspace inventory before changing an outcome authority.
3. Complete the shared and track-specific admission gates. Promote only an
   explicitly `DECIDED` conclusion into the owning formal authority.
4. Make the change. Schema, field-registry, requirement-registry, and policy
   edits go in the applicable version or capability directory under `spec/`;
   definition-level corpus and requirement-to-corpus mappings go in the matching
   `conformance/` directory. Update the version manifest when adding or
   removing a canonical source.
5. Regenerate the bundle with `npm run artifacts:generate`.
6. Run `npm run verify` and make sure the artifact check and all tests pass.
7. Update each decision record's definition evidence and the formal
   documentation that owns the changed fact in the same change, and add a
   [CHANGELOG.md](CHANGELOG.md) entry.
8. Open a pull request against `main`.

## Verification Commands

- `npm run artifacts:check` — the tracked artifact matches its canonical
  sources.
- `npm test` — schema, field-registry, requirement-registry, source-binding,
  requirement-to-corpus, documentation-projection, decision-lifecycle and
  workspace closure, corpus, and
  policy conformance tests.
- `npm run verify` — both of the above.

## License

Contributions are licensed under GPL-3.0-or-later, the repository license.
