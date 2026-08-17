# Field Review: Capability Digest Session Binding

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-digest-session-binding` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Candidate placement replaced by open `FLD-protocol-support-statement-v1` and `FLD-handshake-transcript-v1`. |
| Current conclusion | The former mandatory handshake `capabilityDigest` is not allocated. |

## Preserved requirement

An Endpoint must never establish against unresolved or unauthenticated
capability meaning. Exact complete Protocol Line content identity, rather than
a loose capability mix, is the selection boundary.

## Retirement rationale

The Candidate field allocated a digest before declaration structure,
content-identity scope, and transcript authentication were decided. No digest
width, object, label, or inheritance rule survives.

## Definition evidence

The definition is `NOT-SPECIFIED`; this record supplies no current wire.
