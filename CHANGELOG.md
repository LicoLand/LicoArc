# Changelog

All notable definition-source changes are recorded here. A changelog entry is
not publication, implementation, interoperability, audit, deployment, support,
or operation evidence.

## Unreleased

### Changed

- Complete the `licoarc.protocol-line.v1` Candidate definition with all nine
  mandatory capabilities: Protocol Foundation, Identity, Pairwise Protection,
  Generic Messaging, Reliable Exchange, HTTPS Transport, Group Collaboration,
  Transferable Evidence, and Federation Governance.
- Admit the indivisible `stable-core` Protection Profile with paired X25519 and
  ML-KEM-768 one-time prekeys, dual Ed25519 and ML-DSA-65 authentication,
  transcript-bound selection and confirmation, and bounded X25519 Double
  Ratchet semantics.
- Bind Profile and Protocol Line identities to named non-circular semantic
  projections; exclude lifecycle, publication state, proof-tool output, and
  artifact metadata from semantic identity.
- Close source-owned security accounting, formal proof bindings, mandatory
  capability/Profile conformance corpora, deterministic generation, and
  content-identity verification.
- Set the current machine projection to `Candidate` / `COMPLETE`,
  `sessionEligible: true`, and `publicationEligible: false`.
- Preserve exactly two withdrawn Profile identifier allocations as
  non-reusable registry tombstones without compatibility behavior.
- Synchronize the English and Simplified Chinese public projections and the
  formal status, lifecycle, architecture, product, and protocol documents.

### Boundary

The repository completes only implementation-neutral definition and
source-integrity verification. Publication and every downstream execution or
delivery claim remain independent.
