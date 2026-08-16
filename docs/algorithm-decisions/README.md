# Algorithm Decision Workspace

This directory is the public, non-normative decision workspace for
implementation-neutral algorithms. It is governed by the
[LicoArc Decision Lifecycle](../DECISION-LIFECYCLE.md) and is independent from
the [Message Field Decision Workspace](../field-decisions/README.md).

An Algorithm Decision selects or rejects one algorithm, composition, or
bounded procedure and records its exact LicoArc Algorithm Prototype. It cannot
add, remove, place, or encode a wire field. A `DECIDED` record links durable
intent; `SPECIFIED` means its exact normative definition is closed in tracked
LicoArc sources.

Dependencies, language providers, implementation work, executable
interoperability, device results, audits, packages, releases, deployment, and
support belong to downstream owners and are not recorded as LicoArc decision
evidence.

## Record rule

- Use [the template](TEMPLATE.md).
- Name a record `<slug>.md` and give it ID `ALG-<slug>`.
- Keep one algorithm or indivisible composition decision per record.
- Keep local research untracked and non-normative.
- Derive expected results from the Prototype, never from provider output.
- Update this inventory with every added, renamed, superseded, or retired
  record.

## Complete current inventory

Four decisions define the baseline protection suite, high-assurance
protection suite, transferable Evidence Checkpoint, and Group state evolution.
The size-bucket proposal is rejected because the performance-first definition
contains no traffic-shaping padding.

| Decision ID | Question | Decision status | Definition | Record |
| --- | --- | --- | --- | --- |
| `ALG-baseline-pairwise-protection-suite` | Which complete mandatory composition satisfies the normative resource contract? | `DECIDED` | `SPECIFIED` | [baseline-pairwise-protection-suite.md](baseline-pairwise-protection-suite.md) |
| `ALG-high-assurance-pairwise-protection-suite` | Which complete high-assurance composition satisfies its normative resource contract? | `DECIDED` | `SPECIFIED` | [high-assurance-pairwise-protection-suite.md](high-assurance-pairwise-protection-suite.md) |
| `ALG-protected-size-bucket-schedule` | Should a mandatory profile add a deterministic size-bucket schedule? | `REJECTED` | `NOT-SPECIFIED` | [protected-size-bucket-schedule.md](protected-size-bucket-schedule.md) |
| `ALG-transferable-evidence-checkpoint` | Which canonical digest and signature construction provides bounded transferable Endpoint attribution? | `DECIDED` | `SPECIFIED` | [transferable-evidence-checkpoint.md](transferable-evidence-checkpoint.md) |
| `ALG-group-state-evolution` | Which bounded deterministic procedure evolves protected Group membership state? | `DECIDED` | `SPECIFIED` | [group-state-evolution.md](group-state-evolution.md) |
