# Architecture Decision Records

ADRs record durable definition-source decisions and link to their current
authority. Pending proposals stay in ignored local plan material, never in
tracked documents.

An ADR does not open or approve an Algorithm Decision or Message Field
Decision. Those changes first follow the
[LicoArc Decision Lifecycle](../DECISION-LIFECYCLE.md); an ADR may document the
result only after the applicable decision is reflected in its formal and
machine-readable definition authorities and source-integrity checks agree.

| ADR | Decision | Status |
| --- | --- | --- |
| [0001](0001-immutable-versioned-artifacts.md) | Versioned, content-addressed candidate artifacts with publication-time immutability | Current definition sources agree |

The [three-entity Core Domain Model](../../README.md#core-domain-model) is an
approved product invariant, but no new ADR is indexed until a corresponding
durable definition-source decision exists.
