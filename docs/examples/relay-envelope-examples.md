# Relay Envelope Examples

All values on this page are synthetic and come from the tracked conformance
corpus; they contain no real identifiers, payloads, or endpoints.

## Valid Envelope

From [../../conformance/v2/valid.json](../../conformance/v2/valid.json):

```json
{
  "contractVersion": "fabrigent.relay.v2",
  "envelopeId": "env_000000000001",
  "mailboxId": "box_000000000001",
  "ciphertext": "synthetic-ciphertext",
  "expiresAt": "2030-01-01T00:00:00.000Z"
}
```

## Invalid Envelopes

From [../../conformance/v2/invalid.json](../../conformance/v2/invalid.json):

- `plaintext-field-is-forbidden` adds a `plaintext` field. The schema sets
  `additionalProperties: false`, so any extra field is non-conformant.
- `ciphertext-is-required` omits the required `ciphertext` field.

## How To Check

Run `npm test` from the repository root. The suite accepts every valid case
and rejects every invalid case against the schema embedded in
[../../artifacts/fabrigent-v2.json](../../artifacts/fabrigent-v2.json).
