# Federation Governance v1 (Candidate)

This document is the normative projection of the machine-readable federation
governance contract. The current lifecycle is **Candidate**. It is reviewable
and conformance-testable, but it is not a Published Protocol Line and it does
not authorize publication, deployment, hosted operation, or an Endpoint trust
decision. `licoarc.federation-governance.v1` is the stable capability and wire
locator, while compatibility certification carries the exact enclosing line's
lowercase 64-hex `DIGEST256` content identity. Federation Governance is a
complete mandatory capability in the `COMPLETE`, session-eligible Candidate
line composition. Neither the capability nor the line is publication-eligible,
and this profile makes no implementation or operation claim.

The closed sources are:

- [`governance.schema.json`](../../spec/v1/governance/governance.schema.json)
- [`governance.policy.json`](../../spec/v1/governance/governance.policy.json)
- [`registry.json`](../../spec/v1/governance/registry.json)
- [`source-manifest.json`](../../spec/v1/governance/source-manifest.json)
- [`conformance/v1/governance/manifest.json`](../../conformance/v1/governance/manifest.json)

The source closure is the only authority. An implementation, committee, root
operator, Station, Network Host, artifact service, directory, package, or
publication mirror is an input or distribution mechanism, never a second
specification.

## Scope and non-goals

Federation Governance v1 defines deterministic offline evaluation of one
governance bundle. It covers:

1. membership statements;
2. compatibility certification for one exact Protocol Line content identity;
3. revocation statements;
4. role-scoped independent roots and thresholds;
5. content-addressed distribution metadata;
6. consistency, equivocation, rollback, expiry, rotation, and recovery; and
7. the boundary between governance evidence and local Endpoint admission.

It deliberately does not define committee actions, credentials or private
keys, signing services or accounts, network access, publication, deployment,
hosted operation, or Endpoint final trust. No governance result is an
automatic admission decision.

## Restricted representation and signature domain

All governance artifacts are UTF-8 restricted JSON. A parser rejects duplicate
member names, trailing content, invalid Unicode scalar values, non-finite
numbers, and values outside the foundation bounds. Every object in the schema
sets `additionalProperties: false`; unknown fields and unknown roles fail
closed.

The canonical representation is the restricted JCS projection: object member
names are ordered by their UTF-16/JCS order, arrays retain their declared
order, and the result has no trailing line break. SHA-256 of this projection
is a lowercase 64-character `bundleDigest`.

All governance collections and digest-bearing values are fixed by the closed
schema: roots and keys are bounded, membership/certification/revocation and
advisory records are bounded to 64 entries, observations and recovery
evidence are bounded to 16 entries, and each epoch/version is a safe integer.
These capability-owned limits cannot be raised by a sender, inherited from a
Foundation parser ceiling, or reset by retry, recovery, or a new distribution
route.

The signed metadata projection is the complete `governanceBundle` with only
`bundleDigest` and `authorizations` removed. It therefore binds the network,
epoch, every root and governance statement, the distribution metadata,
consistency observations, recovery record, Endpoint-admission boundary, and
abuse policy in one digest. A role authorization carries the same digest and
each signature uses exactly:

```text
licoarc.federation-governance.v1|<role>|<bundleDigest>
```

The signature value is opaque cryptographic evidence to be checked by the
consuming implementation. The conformance corpus uses deterministic synthetic
values only; it does not contain credentials or claim cryptographic strength.
A signature from one role cannot satisfy another role, and a signature over a
different canonical projection is invalid.

## Independent roots and thresholds

The closed role set is:

| Role | Evidence authorized | What it cannot authorize |
| --- | --- | --- |
| `membership` | `membershipStatements` | compatibility, revocation, admission, or abuse policy |
| `compatibility` | `compatibilityCertifications` | membership or Endpoint admission |
| `revocation` | `revocations` | rewriting prior membership or restoring a compromised key |
| `distribution` | OCI/DSSE/TUF distribution metadata | membership or Endpoint admission |
| `consistency` | snapshot observations and consistency evidence | selecting Endpoint trust |
| `recovery` | root rotation and compromise recovery | restoring a compromised root/key |
| `abuse` | bounded expiring abuse advisories | membership, certification, revocation, or admission |

Each role has independent root IDs. A root is represented by a digest-only
identity, a version, a validity interval, two or more key digests, and a
status. `active` roots may sign; `retired` and `compromised` roots may not.
Every root has `keyThreshold >= 2`. Every role authorization requires at
least two distinct active roots and at least two active keys from each
authorized root (four distinct root/key pairs in the v1 policy). The
authorization threshold is over independent roots, not over repeated
signatures from one root.

Consequently no one signer, root, operator, Station, Network Host, artifact
service, or committee member can authorize a bundle. Missing, duplicate,
cross-role, retired, compromised, or unauthorized signatures fail closed.
The exact authorization role set must contain each of the seven roles once.

## Governance statements and authority separation

`membershipStatements` contain only an opaque participant digest, a monotonic
membership epoch/state, a metadata digest, and validity bounds. They recognize
a participant in a federation context; they do not identify a human, account,
device, Station, or Endpoint trust relationship.

`compatibilityCertifications` bind an opaque participant digest to one exact
64-hex `DIGEST256` Protocol Line content identity and one or more capability
digests. Textual wire and contract names remain source/catalog locators and
never populate this field. Certification is compatibility evidence only; it
is not membership and never admits an Endpoint.

`revocations` name an opaque target digest, a closed privacy-minimal reason
class, an effective time, and a revocation epoch. A revocation is not a
rewriting of the earlier statement and cannot restore compromised key material.

`abusePolicy` contains only bounded advisory references, scope digests,
closed categories, expiry, and evidence digests. Protected evidence is never
included. Advisories have no membership or compatibility effect and can only
inform a local policy.

`endpointAdmission` is deliberately fixed to:

```json
{
  "authority": "endpoint-local",
  "automaticAdmission": false,
  "stationAuthority": "none",
  "networkHostAuthority": "none",
  "artifactServiceAuthority": "none"
}
```

The remaining fields identify which statements are local inputs. There is no
`endpoint-admission` governance role and no threshold can manufacture a final
Endpoint trust decision.

## Distribution binding

The `distribution` object selects a TUF-style chain without making a TUF
service a protocol authority:

```text
root(version, metadataDigest)
  -> targets(version, metadataDigest, targetPath, targetDigest,
             ociDescriptor, dsse)
  -> snapshot(version, metadataDigest, rootVersion, targetsVersion,
              targetsDigest)
  -> timestamp(version, metadataDigest, snapshotVersion, snapshotDigest,
               expiresAt)
```

The target digest equals the OCI descriptor digest. The DSSE payload digest
and signing digest equal that target digest, and the DSSE envelope digest is
the canonical digest of its remaining fields. Snapshot metadata binds the
targets metadata digest; timestamp metadata binds the snapshot metadata
digest. `consistentSnapshot` is required. Root, targets, snapshot, and
timestamp versions are monotonic against the consuming Endpoint's local
high-water state and the explicit offline `now` input. `timestamp.expiresAt`
is strict: a bundle at or after expiry is rejected.

Rollback, stale metadata, a mismatched descriptor/DSSE binding, an
inconsistent snapshot, or an expired timestamp cannot be repaired by arrival
order, a Station timestamp, a preferred mirror, or a package version.

## Consistency and equivocation

At least two independent consistency observations are required. Each observes
one snapshot version and digest and contributes only an observer digest, the
version, the observed digest, and a statement digest. Every observation must
match the bundle snapshot. A conflicting digest at one version is
**equivocation**; an explicitly asserted `splitView` is **split-view**. Both
are surfaced as digest-only evidence and rejected. No observer, directory,
Station, or service selects the preferred view.

The evidence is intentionally privacy-minimal: it does not contain endpoint
names, addresses, plaintext membership data, credentials, or runtime data.

## Evaluation, recovery, and atomic state

The deterministic evaluator uses the following fail-closed order:

1. closed instance/schema and restricted JCS parsing;
2. canonical bundle digest and exact signature scope;
3. network and epoch binding;
4. root status, key thresholds, and rotation predecessors;
5. OCI/DSSE/TUF distribution bindings;
6. snapshot consistency and independent observations;
7. explicit-now expiry and local version high-water checks;
8. every role's independent-root threshold;
9. replay classification; and
10. atomic local high-water replacement.

An exact previously accepted `bundleDigest` at the same epoch is an
idempotent replay observation and does not mutate state. A different digest at
that epoch, a lower epoch/version, a gap, a stale timestamp, a rollback, an
expired timestamp, an insufficient/partial committee, or any other rejection
also leaves local state byte-for-byte unchanged. A valid successor is
committed only after all checks pass.

`recovery.event: "none"` has no predecessor or replacement roots. A
`root-rotation` event requires the previous bundle digest, at least one
replaced and replacement root, a predecessor root digest on each replacement,
retirement of the predecessor, an active replacement with a higher root
version, and the independent recovery threshold. A
`compromise-recovery` event follows the same predecessor and recovery
threshold rules, but compromised roots remain non-signing and are recorded
only by digest. Recovery cannot reset a bundle epoch or high-water version.

## Conformance

The implementation-neutral corpus and its requirement coverage are in
[`conformance/v1/governance/manifest.json`](../../conformance/v1/governance/manifest.json).
The focused AC-010 suite exercises deterministic JCS, closed schema,
role-scoped signature domains, complete and insufficient thresholds, stale and
rollback metadata, expiry, compromised roots, rotation and recovery,
equivocation and split view, inconsistent distribution snapshots, partial
committee evidence, replay, and local Endpoint denial. Every rejected case
asserts no local-state effect.

Run the focused suite from the repository root:

```text
node --test tests/federation-governance.test.mjs
```

Passing this Candidate suite verifies only the exact source closure and
deterministic contract. It does not establish an implementation, publication,
network availability, hosted operation, or Endpoint interoperability claim.
