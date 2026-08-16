# Field Review: Endpoint Association Claim

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-endpoint-association-claim` |
| Decision status | `REJECTED` |
| Definition status | `NOT-SPECIFIED` |
| Candidate spellings | protected Endpoint Association Claim or opaque Payload |
| Candidate layer | Protected Generic Message or Group state input |
| Observer set | Explicitly selected peer Endpoints |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Ordinary namespaced `message.payload`; no claim schema or registry field |
| Predecessor or successor | None |
| Current conclusion | A dedicated Endpoint Association Claim field is rejected; any product or relationship assertion remains ordinary namespaced opaque Payload and is never protocol-authoritative. |

## Question

Does LicoArc require a protected field that one Endpoint associates itself
with one or more other Endpoints without asserting shared identity or control?

## Role in communication

No protocol role consumes a dedicated claim. If an application needs to share a
relationship assertion, the author may place its opaque, namespaced bytes in
the existing protected `message.payload`; recipients apply local policy and
may ignore, reject, or retain it. No field may merge Endpoint identities or
set Group membership, trust, consent, account control, or product permission.

## Contribution to LicoArc's final vision

Rejecting a dedicated association field preserves independent Endpoint
identity and keeps relationship assertions non-authoritative, while ordinary
protected Payload remains available for application scoped collaboration.

## Field model and trade-offs

No common field value model is admitted. `message.payload` already carries
exact opaque User Payload bytes under Endpoint protection and has no LicoArc
authority over ordinary application namespaces. A dedicated claim would need
subjects, issuer, scope, expiry, revocation, disclosure, and consent semantics;
without one exact protocol action those additions would create an identity and
authority surface that the three-entity model deliberately excludes.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | Not a LicoArc field; ordinary namespaced opaque `message.payload` remains available |
| Presence | No dedicated presence or required field |
| Values or range | Application namespace and bounds remain the existing Payload contract; LicoArc does not define claim values |
| Canonical representation | The existing Payload bytes and Generic Message encoding; no claim grammar or alias |
| Invalid input | Invalid or unwanted application Payload is handled by recipient local policy; it cannot alter protocol state or identity |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | No interoperable protocol action beyond carrying an application assertion and letting each recipient apply local policy was identified. |
| Field-level necessity | Opaque protected Payload already carries that assertion without making LicoArc interpret or authorize it. |
| Removal consequence | Removing a dedicated field does not prevent protected application exchange; it prevents only an unjustified common authority. |
| Existing-field evidence | `message.payload` is the admitted exact-byte carrier and already supports namespaced product or relationship data. |
| Derivation | Local policy, not protocol derivation, decides whether an assertion has meaning or effect. |
| Lower-layer carrier | Transport and Station operations are inappropriate because claims are relationship data and must not become carrier authority. |
| Existing carrier | The existing protected Payload is sufficient and less exposed than a common claim field. |
| Protected placement | Payload is endpoint-protected; no additional common claim placement is necessary. |
| Duplicate-authority risk | A field would invite conflict with Endpoint identity, Group membership, product permission, account, device, or Station assertions. |

## Visibility and trust

Opaque Payload remains hidden from Stations by Endpoint protection. Recipients
must treat any claim-like bytes as untrusted application input; replay,
suppression, retention, and correlation are handled by local policy and the
ordinary Message lifecycle. A Payload cannot merge identities, advance Group
state, grant trust, establish consent, or prove shared human identity.

## Alternatives

- Admit a common Endpoint Association Claim field: rejected because no exact
  protocol action requires one and its issuer, revocation, and authority model
  would be incomplete.
- Keep an application assertion in namespaced opaque Payload: selected because
  it preserves useful protected exchange without protocol interpretation.
- Keep all association state local: allowed when no disclosure is needed.
- Place the claim in a Station, Network, account, or directory record: rejected
  because none can own Endpoint identity or local policy.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It cannot
establish this field's necessity, name, placement, semantics, trust, or
lifecycle; the LicoArc-owned association question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Rejection prevents an underspecified claim from becoming identity merge, trust, consent, or membership authority. |
| Privacy and metadata | No new common identifier or subject list is exposed; applications choose their own protected disclosure. |
| Interoperability | Existing opaque Payload has a closed transport contract; no claim grammar or cross-implementation semantics are required. |
| Implementation complexity | No claim parser, registry, revocation state, or compatibility path is added. |
| CPU, memory, and wire cost | No duplicate field or mandatory claim metadata; Payload bytes remain application-owned. |
| Evolution and downgrade | A future protocol-level action would require a successor Message Field Decision; it cannot smuggle a claim through an alias or extension. |

## Decision history

LicoArc review rejected the dedicated field because opaque protected Payload
already carries any application assertion and no protocol-level action requires
LicoArc to interpret or authorize association. The rejection preserves the
three-entity model and does not prevent local application policy. The
Canonical Field Registry records `message.payload` as the sole owner in this
bounded change; no association claim schema or field is admitted.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This record creates no active normative protocol definition.
