# Field Review: Evidence Counterparty Endpoint Identity Reference

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-evidence-counterparty-endpoint-identity-ref` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Retired without successor; Generation 1 inherits the peer from the authenticated session. |
| Current conclusion | No evidence counterparty identity field is active. |

## Question

How is transferable evidence prevented from being replayed as a statement made
to, received from, or completed for a different Endpoint relationship?

## Role in communication

The signer identifies the other Endpoint in the pairwise context. The peer and
later verifier require that identity to match every covered statement. This is
context binding, not a restriction on who may verify evidence after disclosure.

## Contribution to LicoArc's final vision

Binds transferable evidence to the exact peer relationship so a valid statement cannot be repurposed as an assertion about another Endpoint.

## Field model and trade-offs

The field is mandatory `DIGEST256` and must differ from
`signerEndpointIdentityRef`. Repeating the counterparty once per checkpoint
allows a bounded statement set to share the cost and prevents cross-relationship
semantic substitution.

## Visibility and trust

The value is protected from Stations during carriage and covered by every
checkpoint signature. Disclosure reveals the pairwise context. It does not
grant the counterparty signing authority or prove that the counterparty made a
statement that lacks its own checkpoint.

## Alternatives

- Infer from the current session: rejected for offline evidence and migration.
- Omit the peer identity: rejected because identical statement forms could be
  repurposed across relationships.
- Bind the stable counterparty identity once per checkpoint: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because pairwise context binding and
transferability are wholly LicoArc-owned.

## Decision history

LicoArc review on 2026-08-03 admitted this field together with the signer
identity. The two roles remain distinct so evidence never infers a recipient,
acceptor, or effect producer from one signature alone.

## Definition evidence

The definition is retired and `NOT-SPECIFIED`; this record remains history only.
