# Fabrigent Relay Envelope v2

The normative machine-readable authority is
[../../contracts/v2/relay-envelope.schema.json](../../contracts/v2/relay-envelope.schema.json),
identified by `fabrigent.relay.v2`. This document is its human-readable
projection.

## Envelope

The closed object requires `contractVersion`, `envelopeId`, `mailboxId`,
`ciphertext`, and `expiresAt`. Identifiers use the URL-safe opaque identifier
pattern and are 16 to 128 characters. Ciphertext is non-empty and limited to
1048576 characters. `expiresAt` is an RFC 3339 date-time. Unknown fields are
forbidden.

## Governance

The normative policy is
[../../policies/v2/relay-governance.json](../../policies/v2/relay-governance.json).
It declares the relay untrusted, forbids encryption, decryption, key custody,
plaintext inspection, host permission authority, and client runtime
coordination, and fixes these limits:

| Limit | Value |
| --- | ---: |
| `maxCiphertextBytes` | 1048576 |
| `maxEnvelopeRetentionSeconds` | 86400 |
| `maxLeaseSeconds` | 86400 |
| `maxMailboxEnvelopes` | 1000 |
| `maxMailboxes` | 1000 |
| `maxRelayEnvelopes` | 10000 |

The versioned conformance corpus is under
[../../conformance/v2/](../../conformance/v2/). The immutable bundle is
[../../artifacts/fabrigent-v2.json](../../artifacts/fabrigent-v2.json).
