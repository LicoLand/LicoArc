# Field Review: Capability Digest

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-capability-digest` |
| Decision status | `RETIRED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-capability-digest-session-binding`. |
| Current conclusion | Retired: the digest appears in session establishment and is inherited rather than repeated on established records. |

## Question

How does a handshake refer unambiguously to the exact declaration used for
selection without copying the declaration into every message?

## Role in communication

Each Endpoint produces or verifies the digest as transcript input. It binds
selection to exact declaration content but does not replace declaration
signature validation or lifecycle checks.

## Contribution to LicoArc's final vision

Retiring per-record `capabilityDigest` repetition preserves exact negotiated capability binding while removing 32 repeated octets from established records.

## Field model and trade-offs

The semantic value remains a mandatory `DIGEST256`, but this predecessor's
broad occurrence is retired. Digest construction, covered canonical bytes,
encoding, and current placement come only from the Field Registry.

## Visibility and trust

The digest may reveal equality and correlate reuse of a declaration. A Station
may replay or suppress it, but the Endpoint-authenticated handshake must reject
mismatch or substitution.

## Decision history

The field was admitted to bind compact handshake references to exact signed
declarations. It does not authorize the digest algorithm independently.
LicoArc review on 2026-08-03 retired the broad placement and assigned the
handshake-only rule to `FLD-capability-digest-session-binding`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
