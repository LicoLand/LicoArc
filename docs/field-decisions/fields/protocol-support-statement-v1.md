# Field Review: Protocol Support Statement v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-protocol-support-statement-v1` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Replaces retired `FLD-supported-protocol-lines`; preserves no bytes. |
| Current conclusion | Endpoints must authenticate exact supported Protocol Line content identities, but no field set, encoding, bound, signature input, or placement is allocated. |

## Question

Which exact statement lets two Endpoints establish their common complete
Protocol Lines without implementation inference, component negotiation,
content-identity ambiguity, downgrade, or Station authority?

## Role in communication

Each Endpoint produces its own support input. Selection consumes only
Endpoint-authenticated exact line identities; a Station may carry or suppress
the statement but cannot add support or authorize a fallback.

## Field model and trade-offs

The catalog requires wire ID, generation, and immutable content identity as
semantic inputs. Exact collection shape, bounds, freshness, signing context,
privacy exposure, and transcript placement remain open.

## Visibility and trust

Support disclosure can fingerprint an Endpoint and modification can force a
downgrade. A future representation must minimize exposure and be authenticated
before selection can advance establishment state.

## Decision history

The earlier digest-only collection was withdrawn because it did not close
version, content identity, minimum generation, or transcript authentication.

## Definition evidence

The definition is `PARTIAL`: the required selection semantics are executable
in synthetic conformance, while no interoperable wire representation exists.
