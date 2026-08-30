# Field Review: Supported Protocol Lines

This record preserves retired Candidate decision history. It is not a wire
specification.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-supported-protocol-lines` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Replaced by the specified `FLD-protocol-support-statement-v1`; preserves no bytes. |
| Current conclusion | The former `supportedProtocolLines` digest collection is withdrawn. |

## Preserved requirement

Support cannot be inferred from transport, product, or implementation
identity. Active selection consumes only Endpoint-authenticated exact Protocol
Line content identities. A Station cannot add support or authorize fallback.

## Retirement rationale

The Candidate collection allocated `DIGEST256` entries before wire ID,
generation, content identity, minimum-generation state, privacy bounds, and
transcript binding were closed. No value model, ordering, bound, encoding, or
placement survives. Those questions belong to
`FLD-protocol-support-statement-v1`.

## Definition evidence

The definition is `NOT-SPECIFIED`. This record is governance history only and
allocates no current field, compatibility contract, or fallback.
