# Field Review: Minimum Protocol Generation v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-minimum-protocol-generation-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Protocol Line selection](../../../spec/protocol-lines.json) and the [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/FIELD-REGISTRY.md`, `spec/protocol-lines.json`, `spec/v1/manifest.json`, the Endpoint identity-continuity source, `formal/`, and `conformance/v1/foundation/` |
| Predecessor or successor | No active predecessor; replaces the withdrawn floor implication in `FLD-supported-protocol-lines`. |
| Current conclusion | Each Endpoint contributes one authenticated monotonic unsigned `minimumProtocolGeneration` floor to support selection. The floor cannot be lowered by reconnect, Station policy, implementation default, or Protocol Line fallback. |

## Question

How does each Endpoint express and preserve the lowest Protocol Line generation
it will accept so rollback and silent fallback fail closed across reconnects?

## Role in communication

Selection compares the floor from each authenticated Endpoint with every
candidate line generation after exact content identity and completeness checks.
Only a unique highest common generation at or above both floors is eligible.
A lower result, missing floor, conflicting statement, or floor rollback fails
closed without state advance.

## Contribution to LicoArc's final vision

Preserves monotonic Endpoint compatibility policy across Stations and sessions,
so an attacker cannot turn a newer accepted definition into a silent
lower-generation downgrade.

## Field model and trade-offs

| Dimension | Approved model |
| --- | --- |
| Type | Unsigned integer `minimumProtocolGeneration` owned by the Endpoint support statement. |
| Ordering | Monotonic non-decrease; a lower recovered value is typed state rollback. |
| Authentication | Endpoint-authenticated and bound to the exact support statement and transcript. |
| Reset | No reconnect, Route, Station migration, or local implementation default may reset or lower it. |
| Selection | Applied in the fixed Protocol Line filter order and compared with the peer floor. |
| Unknown values | Missing, malformed, overflowed, conflicting, or unauthenticated floors reject terminally. |

The floor expresses acceptance policy only. It does not identify a line, select a
Protection Profile, authorize a Provider, or establish freshness.

## Visibility and trust

The floor may reveal upgrade policy and can be abused for denial of service.
It is not Station authority: a carrier may suppress or replay the statement,
but cannot authoritatively change the retained Endpoint floor. Any accepted
update is covered by Endpoint identity continuity and the handshake transcript.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Reject lines below an Endpoint's explicit compatibility floor after reconnect or migration. |
| Removal consequence | A peer can silently fall back to an older complete line even when the Endpoint no longer accepts it. |
| Derivation | The floor is not derivable from the current line, route, Station descriptor, or arrival order. |
| Lower-layer carrier | Transport metadata has no Endpoint compatibility authority and cannot preserve the floor. |
| Protected placement | Keep the value in the authenticated support/continuity input; repeating it in established records duplicates authority. |
| Duplicate-authority risk | Independent local defaults, Profile lists, or Station policy would create conflicting downgrade decisions and are rejected. |

## Decision history

Repository review on 2026-08-31 adopted one Endpoint-authenticated monotonic
floor and the no-reset/no-lower rule. The exact integer encoding, state snapshot
transition, compact label, and conformance vectors are closed by the linked
machine authority.

## Decision outcome

The monotonic floor is approved as an independent field semantic. It does not
authorize any Profile independently of the complete Protocol Line.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The linked schema, persistence transition, encoding, bounds, transcript
placement, and definition-level cases close the exact floor semantics.

## Comparative evidence, never authority

Compatibility and versioning references may inform downgrade risks only; they
cannot define LicoArc's floor, trust, or lifecycle.
