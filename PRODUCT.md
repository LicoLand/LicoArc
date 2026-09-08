# Lico Arc Protocol Product

Lico Arc Protocol is LicoLand's implementation-neutral Protocol Layer. It is
the sole authority for the protocol meaning used by the three-entity Core
Domain Model defined in [`README.md`](README.md#core-domain-model).

## Product promise

LicoArc defines immutable, independently implementable Protocol Lines through
which Endpoints can establish authenticated protected sessions, exchange
bounded messages and attachments, recover reliable delivery state, collaborate
in Groups, authorize multiple independent devices and recover user authority,
and participate in neutral federation governance while treating every Station
as untrusted.

Endpoint authority over identity continuity, key custody, plaintext, peer
acceptance, approval, effects, and authenticated confirmations is absolute.
Each independently key-holding device is its own Endpoint with independent
keys and sessions. A Station has only defined transport authority, has no user
or device roster, and cannot select an authority state. Network membership
supplies an interoperability context and no endpoint trust decision.

## Current Protocol Line

The current source graph defines one line:

- wire locator: `licoarc.protocol-line.v1`;
- lifecycle: `Candidate`;
- definition status: `COMPLETE`;
- generation: `1`;
- new-session eligibility: `true`;
- publication eligibility: `false`;
- translation policy: forbidden; and
- eight mandatory capabilities, each `COMPLETE`.

The mandatory capabilities are:

1. Protocol Foundation;
2. Identity;
3. Pairwise Protection;
4. Generic Messaging;
5. Reliable Exchange;
6. HTTPS Transport;
7. Group Collaboration; and
8. Federation Governance.

The line includes one active indivisible `stable-core` Protection Profile. It
uses paired X25519 and ML-KEM-768 one-time prekeys under one monotonic sequence,
dual Ed25519 and ML-DSA-65 authentication, transcript-bound fixed context
and confirmation, exact atomic paired redemption, and a bounded classic
X25519 Double Ratchet. Missing either prekey component is terminal; components
cannot be reserved, negotiated, reused, or downgraded independently.

## Definition admission

A complete Protocol Line is admitted only when all of the following agree:

- every mandatory capability has a complete semantic source manifest;
- every active Profile is complete and eligible;
- all stable positive security claims are proved and have the required
  source-owned formal bindings;
- every mandatory capability and active Profile has its complete declared
  positive and negative conformance corpus;
- Profile and Protocol Line content identities recompute from their named,
  non-circular semantic projections;
- all schemas, registries, policies, bounds, labels, lifecycle records, and
  source manifests form one closed tracked graph; and
- deterministic artifact generation reproduces the checked bundle.

Profile identity includes its semantic sources, stable claim identifiers, and
stable nonclaim identifiers. Protocol Line identity includes the ordered
mandatory capability semantic identities, Profile identities, stable claim
identifiers, generation and session rules. Lifecycle,
publication metadata, proof-tool output, and artifact digests are excluded
from those semantic projections to avoid circular identity.

## Protocol boundaries

The Canonical Field Registry owns every admitted field and exclusion. Runtime
records use bounded deterministic CBOR; governance material uses restricted
canonical JSON. Unknown core fields, duplicate labels, aliases, trailing
bytes, ambiguous encodings, incomplete identities, and substituted
input fail closed without state advance.

Reliable Exchange defines protected intent, stable logical identities,
bounded retries, confirmations, attachment recovery, terminal failure, and
restart convergence. It does not guarantee delivery through an unavailable,
censoring, or malicious Station.

Identity defines a self-certifying user authority reference, predecessor-bound
authority snapshots, explicit management and recovery transitions, and a
bounded set of independently proven Endpoint devices. Recovery can replace
lost authority and revoke compromised devices atomically. Device authorization
does not establish peer trust, identify one legal human, or create a directory.

Pairwise establishment binds the initiating and responding Endpoint-state
digests beside the corresponding user-authority-state digests. The authority
snapshots do not contain peer authority digests, so the binding is acyclic.
A matching protected authority payload must validate before application
admission. Every device retains separate Endpoint keys and session state.

Group Collaboration defines bounded Endpoint membership, versioned state,
authorized state transitions, per-member projections, partial failure, and
aggregate results. A Group is not a fourth domain entity, and Station or
product permissions never authorize Group state.

Reliable finality advances only from the exact authenticated confirmation sent
by an authorized Endpoint session. Endpoint Accepted requires the matching
confirmation; Effect Completed additionally requires its authenticated success
and result binding. Station receipts, queue state, leases, timestamps, and
delivery claims remain transport hints.

Federation Governance defines threshold-governed membership, compatibility
certification, revocation, abuse advisories, recovery, and equivocation-safe
state. It never overrides final Endpoint admission or makes a service a
protocol authority.

## Lifecycle and separation of claims

`Candidate` identifies mutable reviewed definition sources. `COMPLETE` means
the repository-owned admission closure is satisfied. `sessionEligible: true`
permits new sessions under the fixed initial V1 definition. `publicationEligible: false` means no publication action is
authorized by this definition state.

Definition, source-integrity verification, publication, implementation,
executable interoperability, audit, deployment, support, and operation are
separate claims. This repository closes only the modeled definition and its
deterministic source-integrity verification. Formal proofs cover the declared
ideal model under their stated assumptions; they do not prove SDK code,
Provider behavior, device custody, interoperability, deployment, or operation.
Independent SDKs own their implementations and local verification, including
any behavior they have not implemented.

LicoArc has not been released. Its sole protocol is V1 / Generation 1. The
fixed Protocol Line and Protection Profile content identities are authenticated
through the handshake, and every session stays bound to that exact definition.
Candidate changes replace the current sources, implementations, and documents
in one pass. Publication remains a separate, explicitly authorized action.

## Repository authority

Machine-readable authority lives under `spec/` and `conformance/`; the
generated bundle lives under `artifacts/`. Human-readable protocol projections
live under `docs/protocols/`. [`docs/STATUS.md`](docs/STATUS.md) projects the
current manifest without becoming a second authority.

Implementation code, private runtime state, Providers, storage, infrastructure,
packaging, publication channels, deployment, support, and operation are outside
this repository's product boundary.
