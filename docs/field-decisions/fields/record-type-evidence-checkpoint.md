# Field Review: Record Type with Evidence Checkpoint

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-record-type-evidence-checkpoint` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Common Pairwise `recordType` successor withdrawn; the complete Evidence capability owns its checkpoint object independently. |
| Current conclusion | No common Protected Record enum or `evidenceCheckpoint` value is active. |

## Preserved requirement

Transferable Evidence must have deterministic, self-authenticating dispatch and
must not recurse through confirmations or checkpoints. The stable Evidence
schemas and signatures own that behavior.

## Retirement rationale

The Candidate enum coupled Evidence to a false common Pairwise record wire.
Removing it does not change the independently complete Evidence capability.

## Definition evidence

The common discriminator is `NOT-SPECIFIED`; Evidence remains independently
complete.
