# Algorithm Decision: Transferable Evidence Checkpoint (Retired)

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-transferable-evidence-checkpoint` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | Historical Candidate record only |
| Authority targets | None |
| Predecessor or successor | Succeeded by [`ALG-confirmation-driven-finality`](confirmation-driven-finality.md); no checkpoint, proof, or compatibility path survives Generation 1. |

## Question and scope

This record formerly considered a construction that mapped Endpoint-authored
logical records into canonical transferable statements, bounded digest sets,
identity-authorized signatures, and checkpoint-before-finality joins.

## Historical Algorithm Prototype

The retired proposal projected covered records into deterministic-CBOR
statements, hashed bounded sorted statement sets, and required Ed25519 and
ML-DSA-65 Endpoint signatures over a line-bound checkpoint. A verifier would
have resolved the signing keys through bounded identity continuity and joined
statements with checkpoints atomically before application finality.

The proposal also bounded checkpoint bytes, pending joins, identity history,
and unauthenticated parsing. These details describe the removed design only.
They impose no current wire, state, validation, resource, or implementation
requirement and are not an Algorithm Prototype for V1 / Generation 1.

## Retirement reason

Transferable content attribution was not required by the authorized initial
V1 goal. Its pending join delayed ordinary application admission and made
checkpoint suppression a finality dependency. The successor uses exact
protected Endpoint confirmations bound to an authorized session, with no
transferable checkpoint, statement-digest exchange, compatibility reader, or
fallback.

The former Evidence Profile sources, fields, corpus, generated projections,
resource contract, and identifiers were removed together. None remains
available as current authority, a vector source, or a reusable allocation.

## Source-derived conformance material

None. The former checkpoint cases were removed with the definition.

## Decision outcome

The formerly decided checkpoint composition is retired. Current finality is
defined only by [`ALG-confirmation-driven-finality`](confirmation-driven-finality.md)
and its linked normative sources. This page remains independent historical
decision evidence.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This page records retirement only
and supplies no active normative definition or Protocol Line input.

## Comparative evidence, never authority

COSE, RFC 8032, RFC 5869, FIPS 204, and RFC 8949 were comparative lineage for
the retired proposal. They do not define current LicoArc fields, state, trust,
or finality.
