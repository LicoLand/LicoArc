# Field Review: Evidence Signing Identity State Digest

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-signing-identity-state-digest` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | A checkpoint pins the exact Endpoint Identity state that authorizes its evidence-signing keys and profiles. |

## Question

Which exact identity history state lets an independent verifier resolve a
checkpoint key across authorized rotation, revocation, recovery, fork, and
compromise handling?

## Role in communication

The signer identifies the Endpoint Identity state under which every checkpoint
signature key has evidence-signing purpose. The peer or later verifier obtains
that state and its bounded continuity proof independently and rejects any
unresolved or unacceptable history.

## Contribution to LicoArc's final vision

Pins the exact identity-key authorization state needed to verify evidence across key rotation without repeating public keys in every checkpoint.

## Field model and trade-offs

The field is mandatory `DIGEST256`. It refers to one immutable identity state;
the checkpoint does not duplicate public keys or continuity chains. That saves
wire bytes but makes a complete, portable identity-resolution bundle a required
verification dependency. Rotation does not rewrite old evidence.

## Visibility and trust

The digest is protected in transit and signed in the checkpoint. A current
Station, Route, session, capability cache, or unverified directory response
cannot replace the referenced state. Missing, rolled-back, forked, expired,
revoked, wrong-purpose, or policy-rejected state fails closed.

## Alternatives

- Repeat public keys and history in every checkpoint: rejected for wire and
  mobile storage cost.
- Resolve only the latest key state: rejected because later rotation would make
  historical evidence ambiguous.
- Pin one state digest and carry continuity material in the verification bundle:
  selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

Matrix supplies comparison evidence for key
hierarchies, key-change handling, and sender binding. Its server-provided user,
device, and key-list state is rejected as LicoArc authority.

## Decision history

LicoArc review on 2026-08-03 rejected verification by bare `keyId` because that
identifier is scoped to an authenticated identity context. The review admitted
one exact state digest so transferable evidence remains resolvable through
Endpoint-controlled continuity after migration and key rotation.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
