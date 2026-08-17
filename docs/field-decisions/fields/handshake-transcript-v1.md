# Field Review: Handshake Transcript v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-handshake-transcript-v1` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | The exact line, Profile, identity-continuity, support, capability, role, purpose, selected prekey, public-material, bundle and handshake bindings must be authenticated, but encoding and placement await the Hybrid AKE decision. |

## Question

Which semantic values and canonical representation must the establishment
transcript bind to reject downgrade, role confusion, unknown-key share,
prekey substitution and session-lock mismatch?

## Role in communication

Both Endpoints consume the same canonical digest for future authentication,
key derivation context and session locking. A digest never replaces validation
of each referenced statement.

## Field model and trade-offs

No digest label, wire label, signature input or domain separator is active.
Those details must follow the exact AKE construction and formal binding.

## Visibility and trust

Transcript inputs can reveal identities and capabilities; carrier visibility
must be minimized by the final construction. Only Endpoint validation is
authoritative.

## Decision history

The former Candidate transcript was withdrawn with its incomplete AKE.

## Definition evidence

The definition status is `PARTIAL`; necessity and downgrade dimensions are
recorded, while the interoperable representation remains open.
