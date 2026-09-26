# Nostr carrier envelope

| Property | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-nostr-carrier-envelope` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Bounded scope | `channel, type, digest, length, index, data` within the named outer/application composite only. |
| Authority | Canonical Field Registry, incorporated `spec/interop/v1/fields.md`, and the corresponding closed schema. |

## Necessity and alternatives

Each component has its own necessity and observer analysis in the incorporated
field table. Existing native message ids, request correlation, session
cryptography and confirmation fields are reused, not duplicated. Omission
would lose the exact action named in that row. Relay timestamps, wrapper ids,
client branding, product state, reinterpretation of a Nostr public key, or
invented native CBOR labels cannot safely substitute. Fragment count is
instead derivable and deliberately omitted; a command name is application
meaning and deliberately not added to the carrier.

## Placement and cost

No component enters a native cryptographic header or changes its algorithm.
Outer transport composites are visible only after NIP-59 decryption; protected
application composites additionally require native decryption. Relays can
still observe their actual outer routing and traffic. Exact schema, canonical
encoding, bounds, producer/consumer roles, duplication, conflict, replay,
expiry and failure rules are specified in protocol.md. Support is not consent.
Repeated or conflicting values cannot expand budgets or lower protection.
The 8 KiB fragmentation and fixed collection bounds make memory and wire
expansion explicit; Base64 is limited to the Nostr/application JSON boundary.

## Definition evidence

The authoritative field table reviews every component of this composite;
`spec/interop/v1/` contains the exact machine and prose definitions.
`conformance/interop/v1/cases.json` and
`tests/nostr-interoperability.test.mjs` cover positive, negative and boundary
behavior. The binding bundle closes these sources independently of native
cryptographic proofs. This decision does not authorize an algorithm or claim
an implemented client.
