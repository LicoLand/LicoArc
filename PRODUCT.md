# Lico Arc Protocol Product

Lico Arc Protocol is LicoLand's implementation-neutral Protocol Layer. It is
the sole authority for the protocol meaning used by the three-entity Core
Domain Model defined in [`README.md`](README.md#core-domain-model).

## Product promise

LicoArc defines immutable, independently implementable Protocol Lines through
which Endpoints can establish authenticated protected sessions, exchange
bounded messages and attachments, recover reliable delivery state, collaborate
in Groups, produce transferable Endpoint evidence, and participate in neutral
federation governance while treating every Station as untrusted.

Endpoint authority over identity continuity, key custody, plaintext, peer
acceptance, approval, effects, and final evidence is absolute. A Station has
only defined transport authority. Network membership supplies an
interoperability context and no endpoint trust decision.

## Current Protocol Line

The current source graph defines one line:

- wire locator: `licoarc.protocol-line.v1`;
- lifecycle: `Candidate`;
- definition status: `COMPLETE`;
- new-session eligibility: `true`;
- publication eligibility: `false`;
- translation policy: forbidden; and
- nine mandatory capabilities, each `COMPLETE`.

The mandatory capabilities are:

1. Protocol Foundation;
2. Identity;
3. Pairwise Protection;
4. Generic Messaging;
5. Reliable Exchange;
6. HTTPS Transport;
7. Group Collaboration;
8. Transferable Evidence; and
9. Federation Governance.

The line includes one active indivisible `stable-core` Protection Profile. It
uses paired X25519 and ML-KEM-768 one-time prekeys under one monotonic sequence,
dual Ed25519 and ML-DSA-65 authentication, transcript-bound support selection
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
identifiers, generation, selection rules, and session rules. Lifecycle,
publication metadata, proof-tool output, and artifact digests are excluded
from those semantic projections to avoid circular identity.

## Protocol boundaries

The Canonical Field Registry owns every admitted field and exclusion. Runtime
records use bounded deterministic CBOR; governance material uses restricted
canonical JSON. Unknown core fields, duplicate labels, aliases, trailing
bytes, ambiguous versions, incomplete identities, and downgrade-selected
input fail closed without state advance.

Reliable Exchange defines protected intent, stable logical identities,
bounded retries, confirmations, attachment recovery, terminal failure, and
restart convergence. It does not guarantee delivery through an unavailable,
censoring, or malicious Station.

Group Collaboration defines bounded Endpoint membership, versioned state,
authorized state transitions, per-member projections, partial failure, and
aggregate results. A Group is not a fourth domain entity, and Station or
product permissions never authorize Group state.

Transferable Evidence binds exact statements and checkpoints to one selected
Endpoint identity state and the exact Protocol Line identity. It does not
prove human intent, statement truth, trusted time, legal responsibility,
uncompromised custody, Station honesty, or guaranteed delivery.

Federation Governance defines threshold-governed membership, compatibility
certification, revocation, abuse advisories, recovery, and equivocation-safe
state. It never overrides final Endpoint admission or makes a service a
protocol authority.

## Lifecycle and separation of claims

`Candidate` identifies mutable reviewed definition sources. `COMPLETE` means
the repository-owned admission closure is satisfied. `sessionEligible: true`
permits authenticated selection for new sessions under the exact current
machine policy. `publicationEligible: false` means no publication action is
authorized by this definition state.

Definition, publication, implementation, executable interoperability, audit,
deployment, support, and operation are separate claims. Only the definition
and its deterministic source-integrity verification close here. Every other
claim belongs to its downstream owner and cannot advance, block, or reinterpret
the LicoArc definition.

Published bytes, if later authorized by a publication channel, are immutable.
A semantic change requires a new content identity and generation. Endpoints
select the unique highest common authenticated eligible generation and lock a
session to it. Fallback, component negotiation, Station selection of protocol
meaning, substitution, and cross-line translation are forbidden.

The Profile registry retains exactly two withdrawn identifier allocations as
non-reusable tombstones. They carry no active semantics, wire, parser,
implementation, or compatibility behavior.

## Repository authority

Machine-readable authority lives under `spec/` and `conformance/`; the
generated bundle lives under `artifacts/`. Human-readable protocol projections
live under `docs/protocols/`. [`docs/STATUS.md`](docs/STATUS.md) projects the
current manifest without becoming a second authority.

Implementation code, private runtime state, Providers, storage, infrastructure,
packaging, publication channels, deployment, support, and operation are outside
this repository's product boundary.
