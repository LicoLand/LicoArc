# Fabrigent Documentation

This directory is the canonical index of Fabrigent's formal documentation.
It records implemented and verified facts about the federation contract, the
governance policy, the artifact pipeline, and repository operation.
Proposals, plans, and unverified conclusions stay in ignored local material
under `docs/plans/`, never in tracked documents.

## Project Documents

| Topic | Document |
| --- | --- |
| Product definition | [../PRODUCT.md](../PRODUCT.md) |
| Contribution process | [../CONTRIBUTING.md](../CONTRIBUTING.md) |
| Code of conduct | [../CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) |
| Security policy | [../SECURITY.md](../SECURITY.md) |
| Changelog | [../CHANGELOG.md](../CHANGELOG.md) |
| License | [../LICENSE](../LICENSE) |

## Formal Documents

| Topic | Document |
| --- | --- |
| Repository and release operations | [RUNBOOK.md](RUNBOOK.md) |
| Version and compatibility policy | [COMPATIBILITY.md](COMPATIBILITY.md) |
| Repository entity and configuration layout | [ENTITY-CONFIG-LAYOUT.md](ENTITY-CONFIG-LAYOUT.md) |
| Architecture of the artifact pipeline | [architecture/overview.md](architecture/overview.md) |
| Artifact and conformance verification | [functionality/artifact-and-conformance-verification.md](functionality/artifact-and-conformance-verification.md) |
| Relay envelope contract v2 | [protocols/relay-envelope-v2.md](protocols/relay-envelope-v2.md) |
| Relay envelope contract v1 | [protocols/relay-envelope-v1.md](protocols/relay-envelope-v1.md) |
| Synthetic envelope examples | [examples/relay-envelope-examples.md](examples/relay-envelope-examples.md) |
| Architecture decision records | [adrs/README.md](adrs/README.md) |
| ADR 0001: immutable versioned artifacts | [adrs/0001-immutable-versioned-artifacts.md](adrs/0001-immutable-versioned-artifacts.md) |
| ADR 0002: bind artifact interpretation metadata | [adrs/0002-bind-artifact-interpretation-metadata.md](adrs/0002-bind-artifact-interpretation-metadata.md) |

## Documentation Rules

- Document only implemented, verified facts. Every technical fact has one
  canonical authority in `contracts/`, `policies/`, `conformance/`,
  `artifacts/`, or a formal document; other documents reference it.
- Update formal documentation in the same change that alters the capability
  or boundary it describes.
- Examples must be synthetic and privacy-safe.
- Local plans (`docs/plans/`), reports (`docs/reports/`), caches (`cache/`),
  and build outputs (`build/`) are ignored and must never be tracked.
