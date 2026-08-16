# Field Review: Station Service Signature

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-station-service-signature` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | Route service signature, route certificate, handle proof |
| Candidate layer | Transport Profile and protected Route |
| Observer set | Reserving Endpoint and Station; peer Endpoints after protected projection |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | Canonical Field Registry; future Transport Profile, Route schema, signature profile, and conformance corpus |
| Predecessor or successor | None |
| Current conclusion | Every asynchronous Route under a current Endpoint-wide affiliation requires a Station-authenticated, identity-bound, time-bounded route commitment; it never becomes identity, trust, availability, or delivery evidence. |

## Question

What proof prevents an Endpoint from fabricating an arbitrary B-shaped Route
under a valid B affiliation when B never issued that private capability?

## Role in communication

On an accepted asynchronous `RESERVE`, Station B signs the exact descriptor
digest, `affiliationCommitment`, Transport Profile, Delivery Handle, and
service upper bound. The Endpoint authenticates the Route Update and binds it
to the global affiliation state. The peer verifies that B accepted the global
commitment and issued this private Route. Neither signature delegates Endpoint
authority to B.

## Contribution to LicoArc's final vision

Proves that a Station issued one exact finite Route capability under a current
affiliation without authenticating the Endpoint or guaranteeing delivery.

## Field model and trade-offs

The global Affiliation Update makes A-to-B relationship succession explicit.
This field completes its private routing projection: B's signature proves that
B issued the exact Route for the same identity-bound affiliation commitment.
Migration therefore retires A globally and introduces B Routes without A's
consent or a Station-qualified Endpoint identifier.

The signature's exact scope and expiry keep the Station outside Endpoint
identity and local peer acceptance. The field does not use the word
“guaranty” normatively because even a certified Station may drop, delay,
replay, censor, or misreport traffic.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `Signature` containing admitted `keyId` and `signatureValue` fields |
| Presence | Mandatory in an accepted asynchronous `RESERVE` result and every Route; forbidden for `firstContact` Handles |
| Values or range | One signature verifiable by a signing key in the exact descriptor named by `stationDescriptorDigest` |
| Canonical representation | Domain-separated deterministic encoding of `stationDescriptorDigest`, `affiliationCommitment`, `transportProfileId`, `deliveryHandle`, and `serviceUntil`; the signature field itself is excluded |
| Invalid input | Missing field, unknown key/profile, wrong descriptor, altered covered value, invalid signature, or expired service commitment fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Prove that a current affiliated Station issued this exact private Route capability. |
| Field-level necessity | A bearer Delivery Handle is opaque and its possession alone does not let an offline peer verify which Station issued the exact handle/profile/expiry tuple before attempting transport. |
| Removal consequence | An Endpoint can combine a valid affiliation with an unissued or stolen Handle/profile/expiry tuple. |
| Existing-field evidence | Descriptor signatures authenticate generic Station discovery; they are not specific to one reserved route capability. |
| Derivation | A peer cannot derive a Station signature from a descriptor, handle, transport response, or Endpoint authentication. |
| Lower-layer carrier | The accepted reservation result transports the signature to the reserving Endpoint, but only the protected Route transports it to the remote peer. |
| Existing carrier | Station Signals, operation outcomes, and descriptor signatures have different scope and cannot be reinterpreted as this commitment. |
| Protected placement | The peer copy remains protected so other Stations do not learn the relationship or handle. |
| Duplicate-authority risk | The signature covers exactly the Route commitment; any outer or Station-mutable duplicate is forbidden. |

## Visibility and trust

The issuing Station and reserving Endpoint observe the reservation tuple. A
peer observes it only under Endpoint protection; unrelated Stations see
neither the signed tuple nor the complete affiliation set. The issuing Station
signature is transferable evidence only of its own issuance of that bounded
capability. It does not authenticate the Endpoint, user, device, message, or
route update; does not prove availability, queue state, deletion, receipt, or
effect; and cannot advance or resolve `routeEpoch`. A compromised Station can
issue false commitments under its own key or refuse service, but it cannot
replace the Endpoint-authenticated route snapshot.

## Alternatives

- Endpoint authentication and affiliation signature alone were rejected for
  Route issuance because neither covers a private Delivery Handle.
- Descriptor signature reuse was rejected because the descriptor is generic
  discovery state and contains no Delivery Handle or service expiry.
- A Station receipt or successful `RESERVE` outcome without a portable
  signature was rejected because a peer cannot verify it and it remains a
  mutable operation signal.
- Station signature over `endpointIdentityRef` was rejected because it would
  expose stable Endpoint identity to the Station and tempt identity-authority
  inference.
- Old-Station transfer approval was rejected because it creates migration
  veto power.
- `providerId`, `networkId`, and a public account or mailbox identifier remain
  rejected because none proves this exact Station-issued capability.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- Matrix shows the operational cost of coupling
  account and device identity to a homeserver namespace; LicoArc keeps the
  Station signature outside Endpoint identity and local peer acceptance.
- TUF supplies evidence for exact signed scope,
  key resolution, versioning, expiry, and rollback checks without donating its
  repository trust model.
- MLS supplies evidence that authenticated protocol
  state and an untrusted Delivery Service can remain separate; no MLS group or
  membership semantics are adopted.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Prevents an Endpoint from fabricating a Station-acknowledged route tuple; cannot guarantee service behavior. |
| Privacy and metadata | Protected peer projection avoids public relationship graphs; the issuing Station still knows its opaque handle and reservation. |
| Interoperability | Requires one exact signature profile, domain separator, covered tuple, key-purpose rule, and failure behavior. |
| Implementation complexity | Adds Station signing, Endpoint persistence, peer verification, key rotation, expiry, and negative cases. |
| CPU, memory, and wire cost | One bounded signature per Route and one verification before route admission; route count remains bounded. |
| Evolution and downgrade | Unknown or retired key/signature profiles fail closed; new profiles require new exact semantics rather than provider-selected substitution. |

## Decision history

LicoArc review first admitted a signature over the minimum Route tuple.
Threat review then separated global affiliation into
`stationAffiliationSignature` and added `affiliationCommitment` to this Route
signature. The two signatures now have disjoint authorities: affiliation
acceptance versus private capability issuance. Exact signature-profile and
key-purpose selection remain separate decisions.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
