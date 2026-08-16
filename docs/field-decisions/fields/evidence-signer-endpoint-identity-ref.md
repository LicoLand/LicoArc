# Field Review: Evidence Signer Endpoint Identity Reference

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-signer-endpoint-identity-ref` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Every checkpoint explicitly identifies the stable Endpoint identity whose authorized evidence key signed it. |

## Question

Which portable protocol identity is cryptographically attributable for the
checkpoint after sessions, Routes, affiliations, and signing keys rotate?

## Role in communication

The signing Endpoint supplies its stable identity reference. The peer checks it
against the authenticated relationship, and a disclosed verifier resolves it
together with the exact signing identity state and signature key.

## Contribution to LicoArc's final vision

Attributes one bounded statement set to a portable Endpoint identity so verification survives session, Route, and Station migration.

## Field model and trade-offs

The field is mandatory `DIGEST256`. It is the Endpoint continuity identity, not
a signing-key identifier, current Station affiliation, account, person, or
device. Explicit carriage costs 32 octets per checkpoint but permits every
covered statement to share it.

## Visibility and trust

It is protected from Stations in transit and signed inside the checkpoint.
Disclosure intentionally makes the Endpoint identity correlatable to the
evidence holder. Verification proves only key-authorized Endpoint attribution,
not human identity, statement truth, or legal responsibility.

## Alternatives

- Use `keyId` as global identity: rejected because it is scoped to an
  authenticated identity state and rotates.
- Use current Station or Route: rejected because migration must not rewrite
  authorship.
- Repeat the stable Endpoint identity once per checkpoint: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

Matrix supplies risk evidence for binding signer
inputs and handling key changes, while its user, device, server, and key-query
authorities are rejected. LicoArc owns the Endpoint identity and verification
rules used here.

## Decision history

Portable Endpoint identity already survived Station migration in relationship
state. LicoArc review on 2026-08-03 required the same stable identity to be
explicit in each transferable checkpoint so proof verification never falls
back to a session, Route, or Station directory.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
