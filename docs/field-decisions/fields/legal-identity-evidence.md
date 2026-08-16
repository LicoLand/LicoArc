# Field Review: Person, Account, Device, or Legal Identity in Evidence

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-legal-identity-evidence` |
| Decision status | `REJECTED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Evidence binds a cryptographic Endpoint identity only; it carries no embedded person, account, device, or legal identity claim. |

## Question

Should a transferable checkpoint identify a natural person, service account,
physical device, or legal subject in addition to the Endpoint?

## Role in communication

Such a field would ask LicoArc to validate an identity system and legal meaning
outside the pairwise protocol. The checkpoint instead proves only that an
authorized key for the named Endpoint signed exact statements.

## Contribution to LicoArc's final vision

Binding evidence only to portable Endpoint identity avoids falsely converting a cryptographic key statement into proof of a person, account, device, or legal responsibility.

## Field model and trade-offs

No `userId`, `accountId`, `deviceId`, `legalIdentity`, or equivalent core field
exists. A verifier may evaluate separately disclosed claims under its own
explicit policy, but those claims neither alter checkpoint validity nor become
Station or Network authority.

## Visibility and trust

Omission prevents unnecessary identity disclosure and false legal conclusions.
It also makes the guarantee precise: cryptographic attribution to Endpoint
continuity, not proof of human knowledge, consent, truth, or liability.

## Alternatives

- Embedded person or account identifier: rejected as a new trust root and
  privacy leak.
- Station-attested identity: rejected because transport authority is limited.
- Endpoint-only evidence with separately evaluated claims: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because LicoArc deliberately does not define a
person, account, device, or legal-identity authority.

## Decision history

LicoArc review on 2026-08-03 separated technical non-repudiation from legal and
human identity claims and rejected every core field that would blur that
boundary.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
