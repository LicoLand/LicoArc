# Field Review: Session Accept

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-session-accept` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | Explicit responder key confirmation is required before mutual establishment, but its values, authentication and wire remain unallocated until the AKE construction closes. |

## Question

Which exact responder-produced values prove possession of the session-derived
key and bind mutual establishment to the session, transcript and responder
identity without becoming transferable evidence?

## Role in communication

The initiator may mark a session mutually established only after validating
the future key-confirmed record. Station acceptance is never a substitute.

## Field model and trade-offs

Candidate values include the session reference, transcript digest and
responder Endpoint reference, but this review allocates none of them.

## Visibility and trust

The value is Endpoint-to-Endpoint confirmation and is not Station authority,
user approval, effect completion or legal evidence.

## Decision history

The old Candidate had no closed confirmation wire and is withdrawn.

## Definition evidence

The definition status is `PARTIAL`; the required action is known, while exact
values and placement await the decided AKE.
