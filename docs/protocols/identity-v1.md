# Lico Arc Protocol identity and transparency v1

Status: Candidate specification. This document projects the machine-readable
contract in [`spec/v1/identity/identity.schema.json`](../../spec/v1/identity/identity.schema.json),
the bounds and observer policy in
[`identity.policy.json`](../../spec/v1/identity/identity.policy.json), and the
numeric runtime authority in
[`labels.json`](../../spec/v1/identity/labels.json). The closed source set is
owned by
[`source-manifest.json`](../../spec/v1/identity/source-manifest.json), with the
focused corpus in [`conformance/v1/identity/`](../../conformance/v1/identity/).
It does not claim an Endpoint runtime, private-key custody, local trust policy,
user-interface behavior, hosted directory, or publication of a Published
Protocol Line.

## Boundary and stable identity

The only identity authority in this capability is the Endpoint. An
`endpointIdentityRef` is a stable, opaque 32-byte identity reference. It is
authenticated during Endpoint establishment and continuity processing, then
retained by the Endpoint and its peer relationships. It is never constructed
from, or qualified by, a Station, Station descriptor, domain, Provider,
account, device, listener, listener location, Network, directory, or Delivery
Handle. Those values are either lower-layer transport inputs or protected
protocol context and cannot become an identity alias.

This contract describes public references and authorization state, not private
keys or their custody. Each signing-key record carries a scoped 32-byte
`keyId`, a 32-byte content-addressed `keyProfileId`, its purpose and state, and
the exact raw public verification bytes. The Profile registry fixes Ed25519 at
32 public-key bytes and 64 signature bytes, and ML-DSA-65 at 1,952 public-key
bytes and 3,309 signature bytes. A digest-only key, algorithm name, variable
length encoding, private seed, private key, or Provider-native object is not a
signing key. Key generation, private storage, deletion, Provider choice, and
local approval remain outside the Protocol Layer.

Runtime records use only the compact unsigned labels and enums in
`labels.json`. Text field names, transition names, purpose names, key-state
names, and algorithm names are governance projections and are forbidden as
runtime wire values. Unknown or duplicate numeric labels and unknown enum
values reject the complete record without mutation.

## Station descriptor identity and lineage

A `stationDescriptor` is the sole machine-defined Station discovery object.
Its `stationId` is
`SHA-256("LICOARC-V1/STATION-ID\0" || stationIdentitySeed)`, where the seed is
32 unpredictable bytes generated once, never transmitted, and never derived
from a host, URI, Provider, Endpoint, or signing key. A Station key identifier
is `SHA-256("LICOARC-V1/STATION-KEY-ID\0" || stationId || keyProfileId ||
publicKey)`. These derivations keep Station identity stable while listeners,
operators, and admitted signing keys change.

The descriptor contains one to four listeners, one to four signing keys, zero
to four certification references, and one to four signatures. All four
collections are strictly ordered by their deterministic-CBOR encodings and
reject duplicates. A listener contains one exact Transport Profile content
identity and one canonical ASCII HTTPS absolute URI of at most 128 UTF-8
octets. The URI has a lowercase scheme and DNS host (or canonical IP literal),
and no user information, query, fragment, port, or dot segment. It is a
location only and never contributes to `stationId`.

Descriptor sequence `1` is genesis and omits `previousDescriptorDigest`.
Every later descriptor keeps the same `stationId`, has a sequence strictly
above the retained high-water value, and names the complete predecessor digest.
Lower sequence is rollback; equal sequence with unequal content is a fork;
equal sequence with equal content is replay. None mutates retained state.
Expiry can stop descriptor use but never lowers the retained high-water mark.

The descriptor content digest is
`SHA-256("LICOARC-V1/STATION-DESCRIPTOR\0" || deterministicCBOR(descriptor))`,
including `signatures`. Each signature instead covers
`"LICOARC-V1/STATION-DESCRIPTOR/SIGN\0" || deterministicCBOR(descriptor
without signatures)` and has exact purpose `station-descriptor`. Genesis must
have a signature from a listed key; a successor must have at least one
signature from a predecessor-authorized key. Closed-schema, canonical order,
validity, key/profile, and signature validation all complete before atomic
replacement. Certification references remain bounded local-policy inputs and
never become a mandatory federation root.

## Three independent chains

Identity continuity, Endpoint-wide Station affiliation, and relationship Route
state are three separate bounded chains. Each has a genesis at epoch `1`,
successors at exactly the retained high-water epoch plus one, and a digest of
the immediate logical predecessor. Every chain retains its own scope:

| Chain | Scope | Epoch | Predecessor | State digest |
| --- | --- | --- | --- | --- |
| identity | one stable Endpoint | `identityEpoch` | `previousIdentityStateDigest` | `stateDigest` |
| affiliation | one Endpoint-wide snapshot shared by peers | `affiliationEpoch` | `previousAffiliationUpdateDigest` | `stateDigest` |
| Route | one Endpoint and one peer relationship | `routeEpoch` | `previousRouteUpdateDigest` | referenced affiliation `stateDigest` plus Route logical state |

The exact closed record grammar, including transition fields and observer
inputs, is in the schema and CDDL. State is bounded by the policy registry:
64 records per chain, four signing keys, four Stations in an affiliation
snapshot, four Route candidates, and at most eight inputs in each transparency
category. A parser also rejects records larger than `MAX_RECORD_BYTES`, one
verification input larger than `MAX_VERIFICATION_EVIDENCE_BYTES`, public keys
or signatures beyond their exact Profile size, and values beyond the declared
epoch and byte bounds. No Foundation limit or sender-selected value extends a
capability bound.

### Validation and atomic replacement

For an incoming successor an Endpoint first validates the complete closed
record, scope, identity, epoch, predecessor digest, canonical logical digest,
continuity proof, transition-specific rules, cross-chain references, and all
bounds. Only after every check succeeds does it replace the retained
high-water state in one atomic operation. A failed candidate cannot partially
replace keys, affiliation entries, Routes, or evidence state.

The following outcomes are deterministic and do not depend on delivery order:

- epoch `1` with a predecessor, or an epoch greater than one without one, is
  invalid;
- a gap, overflow, or predecessor mismatch is rejected without mutation;
- a lower epoch is rollback and is rejected without mutation;
- an equal epoch with a different logical digest is a fork/equivocation and is
  rejected without selecting either view;
- an equal epoch and equal digest is a replay. It may be observed as a
  duplicate, but never advances state or refreshes expiry;
- a continuity failure is not a migration. The material represents a new
  Endpoint and requires explicit re-pairing;
- restart restores the retained high-water marks before accepting any new
  record. Expiry does not reset them.

Station timestamps, directory ordering, witness arrival, gossip arrival,
network labels, and local wall-clock ordering are not chain selectors.
Station or directory availability cannot fill a missing successor or repair a
fork. A bounded catch-up may deliver a sequence, but every edge is still
validated in order before one atomic commit.

### Identity rotation, revocation, and recovery

An identity successor keeps the same `endpointIdentityRef` and increments the
identity chain. `rotation` introduces an authorized replacement key state;
`revocation` marks the affected key identifier unusable for its declared purpose;
and `recovery` is an explicit, predecessor-bound transition with bounded
witness inputs. A recovery never resets the epoch or rewrites old evidence.
The Endpoint resolves which keys and purposes are acceptable. An old key,
revoked key, Station signature, or directory observation cannot authorize a
new identity state on its own.

Signature verification first resolves the exact continuity state, then the
`keyId` within that state. It requires the field-specific key purpose, an
acceptable active state, equality of the signature and key `keyProfileId`, the
Profile's exact public-key and signature lengths, canonical Profile encodings,
and finally cryptographic verification. This order prevents length guessing,
trial parsing, Provider algorithm selection, or a key from another state or
purpose from becoming authority. Every failure leaves the retained chain and
key state unchanged.

Continuity-preserving rotation leaves the Endpoint identity, affiliation
high-water, Route high-water, protected sessions where their profile permits,
and stable protected intent unchanged. If the proof cannot be resolved, the
receiver does not silently migrate state to a replacement identity.

## Endpoint-wide affiliation

An `affiliationUpdate` is one atomic Endpoint-wide snapshot. An empty
`stationAffiliations` array means explicitly unaffiliated. When non-empty, the
first unique entry is the sole current primary Station and later entries are
bounded alternates. Every peer must receive the same logical snapshot for an
epoch; two different same-epoch snapshots are equivocation rather than
per-peer personalization.

Each `stationAffiliation` contains only:

- `stationDescriptorDigest`, the exact authenticated Station descriptor whose
  Station identity and signing key are resolved;
- a fresh 32-byte `affiliationNonce` retained by the Endpoint and disclosed to
  peers only inside protection;
- `affiliationCommitment`, a domain-separated identity-bound digest over the
  Endpoint identity, Protocol Line, resolved Station identity, and nonce;
- finite Station-selected `affiliationNotAfter`; and
- `stationAffiliationSignature` over that descriptor digest, commitment, and
  finite bound.

The Station receives only the opaque commitment and operation context during
`AFFILIATE`. It does not receive the stable Endpoint identity, nonce opening,
or complete affiliation set. The signature proves only that this Station
accepted one finite identity-bound service commitment. It does not prove
Endpoint identity, peer trust, honesty, availability, retention, delivery,
receipt, acceptance, or an application effect. A Station cannot choose the
primary, advance the affiliation epoch, veto migration, or resolve a fork.

Migration from Station A to Station B first advances the global affiliation
chain to a B-containing snapshot (an overlap snapshot is permitted), then
advances each affected peer Route chain to the new `stateDigest`. A is not
asked to release, approve, forward, delete, or authorize the migration.

## Private relationship Routes

`routeUpdate` is scoped to one stable Endpoint and one peer. It carries one
exact `affiliationStateDigest`; every Route must resolve to a Station and
commitment in that accepted affiliation snapshot. A Route is an ordered
attempt-preference list, not global Station authority. Local Endpoint policy
chooses attempts; list order cannot replace the global primary/alternate
semantics.

Each asynchronous Route contains the exact Station descriptor digest,
affiliation commitment, Transport Profile identifier, opaque 32-byte
`deliveryHandle`, finite Station `serviceUntil`, and a
`stationServiceSignature`. The signature covers the descriptor, commitment,
profile, handle, and service bound. It is evidence of one finite Station-issued
capability only. A `firstContact` Handle is never eligible in a Route and
never receives a Route service signature.

The Endpoint-selected `routeNotAfter` is distinct from Station `serviceUntil`
and affiliation `affiliationNotAfter`; effective use ends at the earliest
applicable bound. Expiry can stop use but cannot lower a Route high-water mark,
select a fork, or reset the chain. A new Route after migration is a successor
under the new affiliation digest. If an old Station is unavailable, the
Endpoint can still validate and publish the B successor; old-Station approval
is not a protocol precondition.

## First contact and peer verification

First contact specializes the same Delivery Handle with `handleClass`
`firstContact`. It is short-lived, scope-bound, audience-bound, and
single-use. There is no independent invitation token or stable address. The
protected handshake carries the `invitationBinding` digest of the complete
invitation context, including its purpose and audience; a Station-visible
Handle does not authenticate either Endpoint or the invitation.

The first protected relationship begins with Endpoint-local
`peerVerificationState` `unverified`. Protocol Line v1 allocates no
Verification Record fields or method registry. A transparency bundle may carry
a bounded authenticated digest input tagged `verificationRecord`, but v1 does
not parse it or change local peer trust from it. No received field, Station
receipt, directory result, witness, or handshake success directly sets local
trust. A replayed first-contact submission fails single-use validation and
must not upgrade or downgrade local verification.

## Discovery and transparency

`discoveryInput` represents one bounded authenticated observation from a
directory, witness, gossip source, or Station. A `transparencyBundle` carries
bounded arrays of witness, gossip, discovery, Station-signature, and
Verification-Record inputs. These values may expose a conflicting state,
missing predecessor, unauthorized rotation, revocation, or recovery claim,
but they cannot select the Endpoint's chain tip or its local trust state.

Split views are surfaced as conflicts. The Endpoint compares each input with
its retained identity, affiliation, and Route high-water marks and either
accepts a fully validated successor or retains the current state. It never
chooses the first, newest-by-arrival, highest Station timestamp, directory
answer, or majority source as a substitute for Endpoint continuity.

An `associationClaim` is a protected, bounded, non-authoritative statement
from one Endpoint about other Endpoint references. It cannot merge identities
or prove a person, account, device, ownership, consent, peer trust, or Group
membership. Such a claim remains an input to recipient-local policy.

## Conformance closure

The identity corpus is split into positive records and adversarial cases. It
covers schema closure and bounds; genesis and exact successor transitions;
restart; gap, fork, replay, rollback, and split-view handling; continuity
preserving rotation; explicit revocation and recovery; Station migration with
an unavailable old Station; first-contact single-use and unverified state;
Station-visible observer limits; and non-authoritative discovery,
transparency, and association inputs. The focused executable evidence is:

```text
node --test tests/identity.test.mjs
```

Passing this focused suite is conformance evidence for these Candidate source
paths only. It does not claim a runtime implementation, private-key custody,
local policy, service operation, or Published Protocol Line.
