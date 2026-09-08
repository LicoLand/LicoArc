# Lico Arc Protocol Documentation

This directory indexes LicoArc's formal protocol-definition documents.
The [README Core Domain Model](../README.md#core-domain-model) owns the exact
three-entity model; `PRODUCT.md` owns durable intent; `ARCHITECTURE.md` owns
implementation-neutral boundaries; and `STATUS.md` reports definition
maturity and the independent downstream-claim boundaries.

The [Canonical Field Registry](../spec/FIELD-REGISTRY.md) is the sole
normative field inventory. The [Decision Lifecycle](DECISION-LIFECYCLE.md)
governs the independent [Algorithm Decision](algorithm-decisions/README.md)
and [Message Field Decision](field-decisions/README.md) workspaces. Decision
records explain history but never replace formal or machine-readable
authorities.

## Project documents

| Topic | Document |
| --- | --- |
| Core domain model | [README](../README.md#core-domain-model) |
| Product goal and boundary | [PRODUCT.md](../PRODUCT.md) |
| Domain language | [CONTEXT.md](../CONTEXT.md) |
| Definition status | [STATUS.md](STATUS.md) |
| Architecture | [ARCHITECTURE.md](../ARCHITECTURE.md) |
| Decision lifecycle | [DECISION-LIFECYCLE.md](DECISION-LIFECYCLE.md) |
| Algorithm decisions | [algorithm-decisions/README.md](algorithm-decisions/README.md) |
| Field decisions | [field-decisions/README.md](field-decisions/README.md) |
| Canonical field registry | [spec/FIELD-REGISTRY.md](../spec/FIELD-REGISTRY.md) |
| Specification index | [spec/README.md](../spec/README.md) |
| Source-integrity checks | [conformance/verification.md](conformance/verification.md) |
| Initial V1 identity authority | [protocols/identity-v1.md](protocols/identity-v1.md) |
| Confirmation-driven finality | [protocols/reliable-exchange-v1.md](protocols/reliable-exchange-v1.md) |
| Repository operations | [RUNBOOK.md](RUNBOOK.md) |

## Definition boundary

- LicoArc tracks normative prose, schemas, CDDL, registries, policies, bounds,
  manifests, definition-level corpora, decisions, and deterministic artifacts.
- `docs/references/` is ignored local research. No tracked source links to,
  reads, embeds, or requires it.
- Plans, reports, caches, build output, and raw verification material remain ignored.
- Language implementations, providers, executable interoperability, device
  validation, audits, packaging, publication channels, deployment, support,
  operation, and product integration close only downstream.
- Repository checks prove tracked definition-source consistency only.

Formal documents change with their owning definition. Examples remain
synthetic and privacy-safe.
