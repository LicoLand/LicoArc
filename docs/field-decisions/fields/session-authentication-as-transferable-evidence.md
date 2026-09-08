# Field Review: Session Authentication as Transferable Evidence

This record preserves explanation and decision history. It is not a second
specification; normative disposition comes only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-session-authentication-as-transferable-evidence` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | None. |
| Current conclusion | Session authentication, handshake state, and Station signals cannot be presented as independently verifiable Endpoint authorship. |

## Question

Can an existing ratchet tag, session authenticator, handshake proof, or Station
operation result eliminate the independent evidence signature?

## Role in communication

Those values authenticate live protocol processing or transport operations to
their intended participants. They do not give an independent verifier a unique
Endpoint-authored signature over the transferable statement.

## Contribution to LicoArc's final vision

Keeping symmetric session authentication and Station signals outside transferable proof prevents another holder of session keys or a carrier from being misrepresented as independently verifiable Endpoint authorship.

## Field model and trade-offs

No common alias converts a ratchet tag, session authenticator, transcript value,
Station signature, queue receipt, or transport result into evidence. Their
original operational roles remain unchanged; Evidence Checkpoint signatures
provide the separate transferable property.

## Visibility and trust

A peer may be able to create or verify symmetric session values, while a
Station controls its own transport statements. Neither authority can be
silently elevated into proof that the other Endpoint authored a disclosed
statement.

## Alternatives

- Reuse live session authentication: rejected as non-transferable and
  role-ambiguous.
- Reuse Station signatures: rejected because they cover only bounded Station
  commitments.
- Independent Endpoint evidence signatures: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only.

No external evidence is required because the distinction between LicoArc
session, Station, and Endpoint evidence authorities is self-contained.

## Decision history

LicoArc review on 2026-08-03 made the prior implicit distinction normative and
rejected every compatibility alias that would present operational
authentication as transferable attribution.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
