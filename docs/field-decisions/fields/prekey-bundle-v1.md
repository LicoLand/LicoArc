# Field Review: Prekey Bundle v1

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-prekey-bundle-v1` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Pairwise Protection architecture](../../../ARCHITECTURE.md#3-pairwise-protection) and the [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/FIELD-REGISTRY.md`, `spec/v1/protection/`, `spec/v1/protection/registry.json`, `formal/`, `conformance/v1/protection/`, and `spec/v1/manifest.json` |
| Predecessor or successor | Supersedes the withdrawn Candidate bundle scope; no retired bundle bytes or fallback are preserved. |
| Current conclusion | One canonical responder bundle carries one paired X25519 and ML-KEM-768 one-time prekey under the exact line/Profile and dual identity-signing bindings. Both prekeys are redeemed atomically with the session; no component or reusable-prekey fallback exists. |

## Question

Which exact values must an Endpoint bind into one offline prekey statement so
identity continuity, Protocol Line support, capability state, classical and
post-quantum key material, validity, freshness and authentication cannot be
substituted or downgraded?

## Role in communication

The responder produces the bundle and the initiator validates it before
establishment. A Station may carry, suppress, or replay public bundle bytes but
cannot choose a prekey mode, extend validity, authorize use, or make the
statement authoritative.

## Contribution to LicoArc's final vision

Makes asynchronous establishment available only through one exact
Endpoint-authenticated hybrid pair while preserving initial forward-secrecy
semantics and fail-closed interoperability under offline inventory.

## Field model and trade-offs

| Bundle member | Approved semantic |
| --- | --- |
| Protocol Line | Exact DIGEST256 line content identity; textual line names remain locators only. |
| Protection Profile | Exact DIGEST256 Profile content identity selected by the line; no independent Profile negotiation. |
| Responder identity | Exact identity-state digest plus both identity signing-key references. |
| Pair sequence | One globally monotonic, non-reusable sequence with a persistent high-water mark. |
| Classical prekey | One 32-byte raw X25519 public key, one-time and paired to the same sequence. |
| Post-quantum prekey | One 1,184-byte ML-KEM-768 encapsulation key, one-time and paired to the same sequence. |
| Validity | Bounded issuance validity for bundle eligibility; expiry does not reserve or delete a pair. |
| Authentication | Ed25519 and ML-DSA-65 signatures over the canonical bundle projection. |

A bundle is not a menu. Missing or exhausted inventory for either member of
the pair is terminal. Publication and receipt do not reserve a pair. The
responder keeps a bounded active-pair map and persistent sequence high-water
state; a sequence at or below high water is a permanent non-reusable tombstone.

## Visibility and trust

The public bundle may be visible to a Station as carriage material, but private
key material and identity-local state are never disclosed. The initiator and
responder authenticate the canonical bundle and bind it into the handshake
transcript. A Station receipt, timestamp, inventory claim, or deletion claim
cannot substitute for Endpoint validation.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Start one authenticated asynchronous hybrid session while the responder is offline. |
| Removal consequence | Without the paired statement, peers can substitute components, reuse a prekey, or silently lose one security layer. |
| Derivation | The pair sequence, public values, and content identities are not derivable from a carrier handle or implementation state. |
| Lower-layer carrier | A Station can carry bytes but cannot authorize the paired security transition. |
| Protected placement | Bundle metadata is authenticated as establishment input; private key material remains Endpoint-local. |
| Duplicate-authority risk | Separate classical/PQ inventories, reusable fallbacks, or independent Profile selectors would permit mismatched or downgraded sessions and are rejected. |

## Decision history

Repository review on 2026-08-31 adopted the paired-one-time bundle, exact
standard lengths, dual signatures, monotonic pair sequence, bounded active map,
and atomic compare-and-commit redemption. This decision supersedes the
previous incomplete Candidate bundle without retaining its wire or
compatibility path.

## Decision outcome

The paired bundle and its atomic redemption semantics are approved. The
Canonical Field Registry, compact labels, schemas, and vectors close the
selected bundle without admitting a fallback.

## Definition evidence

The decision status is `DECIDED` and the definition status is `SPECIFIED`.
The linked canonical encoding, labels, bounds, state machine, formal bindings,
and conformance material close the exact paired-bundle semantics.
