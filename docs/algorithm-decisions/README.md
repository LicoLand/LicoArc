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

The former baseline and custom high-assurance protection constructions are
retired. The Core v1 Hybrid AKE and classic Double Ratchet decisions are
decided and specified through their exact Profile, formal bindings,
conformance corpus, and Candidate Protocol Line authority.

| Decision ID | Question | Decision status | Definition | Record |
| --- | --- | --- | --- | --- |
| `ALG-baseline-pairwise-protection-suite` | Which complete mandatory composition satisfies the normative resource contract? | `RETIRED` | `NOT-SPECIFIED` | [baseline-pairwise-protection-suite.md](baseline-pairwise-protection-suite.md) |
| `ALG-core-v1-double-ratchet` | Which exact Double Ratchet construction closes Core v1? | `DECIDED` | `SPECIFIED` | [core-v1-double-ratchet.md](core-v1-double-ratchet.md) |
| `ALG-core-v1-hybrid-ake` | Which exact Hybrid AKE construction closes Core v1? | `DECIDED` | `SPECIFIED` | [core-v1-hybrid-ake.md](core-v1-hybrid-ake.md) |
| `ALG-high-assurance-pairwise-protection-suite` | Which complete high-assurance composition satisfies its normative resource contract? | `RETIRED` | `NOT-SPECIFIED` | [high-assurance-pairwise-protection-suite.md](high-assurance-pairwise-protection-suite.md) |
| `ALG-protocol-line-admission` | How is the sole initial V1 content authenticated without version policy? | `DECIDED` | `SPECIFIED` | [protocol-line-admission.md](protocol-line-admission.md) |
| `ALG-protected-size-bucket-schedule` | Should a mandatory profile add a deterministic size-bucket schedule? | `REJECTED` | `NOT-SPECIFIED` | [protected-size-bucket-schedule.md](protected-size-bucket-schedule.md) |
| `ALG-transferable-evidence-checkpoint` | Which canonical digest and signature construction provides bounded transferable Endpoint attribution? | `RETIRED` | `NOT-SPECIFIED` | [transferable-evidence-checkpoint.md](transferable-evidence-checkpoint.md) |
| `ALG-user-authority-state` | How does one user-authorized, recoverable Endpoint authority chain evolve without infrastructure authority? | `DECIDED` | `SPECIFIED` | [user-authority-state.md](user-authority-state.md) |
| `ALG-confirmation-driven-finality` | Which authenticated Endpoint confirmation advances reliable finality without transferable checkpoints? | `DECIDED` | `SPECIFIED` | [confirmation-driven-finality.md](confirmation-driven-finality.md) |
| `ALG-group-state-evolution` | Which bounded deterministic procedure evolves protected Group membership state? | `DECIDED` | `SPECIFIED` | [group-state-evolution.md](group-state-evolution.md) |
