# LicoArc Status

## Definition authority

This protocol-definition repository owns implementation-neutral protocol
meaning only. The current
`licoarc.protocol-line.v1` source projection is `Candidate` with definition
status `PARTIAL`; it is not executable, session-eligible, publication-eligible
or Published.

| Definition area | Current state |
| --- | --- |
| Protocol Line lifecycle and fail-closed selection | Specified |
| Pairwise Protection | Open/partial; zero active Profiles or wire schemas |
| Security claims, adversaries and proof bindings | Registered; mandatory Pairwise claims unproved |
| Endpoint identity and continuity | Candidate definition complete |
| Generic Messaging and attachments | Candidate definition complete |
| Bounded Group Collaboration Profile v1 | Candidate definition complete |
| Reliable Exchange and Evidence Checkpoints | Candidate definition complete |
| HTTPS Transport Profile | Candidate definition complete |
| Federation governance semantics | Candidate definition complete |

The Pairwise Protection blockers are the open Hybrid AKE and Double Ratchet
Algorithm Decisions, their independent Message Field Decisions and the absent
formal bindings. No earlier Candidate construction remains an active authority.

## Tracked source closure

`spec/protocol-lines.json` separates lifecycle from definition status and owns
generation, minimum-safe selection, eligibility, immutability and retirement
policy. `spec/protection-profiles.json` owns active Profile admission and
withdrawn identifier tombstones. `spec/v1/` and `conformance/v1/` contain the
current versioned source closure; `artifacts/v1/licoarc.bundle.json` is its
deterministic partial-Candidate projection.

Source-integrity verification proves only that this tracked definition graph and the
generated artifact agree. It does not prove a cryptographic claim or complete
an open protocol definition.

`docs/references/` remains ignored local research and is not part of the
tracked definition graph.

## Ownership boundary

Language implementations, Providers, Endpoint or Station runtime behavior,
interoperability execution, device measurements, fuzzing results, audits,
packages, publication channels, deployment, support and operation close in
their owners. They cannot advance or block a LicoArc definition, change
protocol bytes, fill a missing formal binding, or make this Candidate
Published.
