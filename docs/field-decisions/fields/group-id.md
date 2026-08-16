# Field Review: Group Identifier

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-group-id` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `groupId` or no field |
| Candidate layer | Protected Group Membership State |
| Observer set | Member Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/v1/group/` schemas, conformance corpus, and Protocol Line manifest |
| Predecessor or successor | None |
| Current conclusion | A Group Membership State carries one mandatory, protected `groupId` as a fixed 32-octet `DIGEST256`; the value is created at genesis and is unchanged by later state succession. |

## Question

Does protected Group state need one stable identifier distinct from its epoch,
predecessor digest, and current state digest?

## Role in communication

The Endpoint that creates a Group chooses the opaque value at genesis and
retains it with the Group state. Every member Endpoint consumes it to ensure
that a state, transition, or Group Message belongs to the same protected
collaboration object across epochs. No Station, Network, account, or other
service role creates or interprets the identifier.

## Contribution to LicoArc's final vision

Keeps one protected collaboration namespace stable across membership epochs
while every participant remains an Endpoint and Stations cannot observe or own
the namespace.

## Field model and trade-offs

`groupId` is an opaque fixed-size digest, not a name, locator, account handle,
or identity assertion. It is repeated in each Group Membership State because
the predecessor and current-state digests change on every successor. The
value is Endpoint-protected and authenticated with the containing state.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `DIGEST256` (32-octet opaque identifier) |
| Presence | Mandatory in every Group Membership State |
| Values or range | Exactly 32 octets; one value per Group; no reuse for a different Group in retained state |
| Canonical representation | The selected Protocol Line's shortest deterministic byte-string representation; no text armoring |
| Invalid input | Wrong length, conflicting value for an existing Group, or a value used to bind across Groups fails closed |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Identify the same protected Group while its membership state advances and while per-member results are retried. |
| Field-level necessity | `groupEpoch` orders states and `groupStateDigest` identifies one exact state; neither remains stable across every successor. A stable Group reference is therefore required in the state tuple. |
| Removal consequence | Without `groupId`, two independent genesis states with equal or colliding epoch and predecessor shape cannot be distinguished before their full state is resolved, and Group Messages cannot unambiguously select the intended collaboration. |
| Existing-field evidence | `endpointIdentityRef`, `messageId`, and `groupStateDigest` have Endpoint, Message, and state scopes; reusing any of them would create duplicate or incorrect authority. |
| Derivation | Deriving from a changing state digest or member set changes the Group reference on every update and cannot preserve cross-epoch identity. |
| Lower-layer carrier | Transport routing and Station operations are opaque carriage and cannot identify a protected Group. |
| Existing carrier | No admitted field has Group-wide, cross-epoch scope. |
| Protected placement | The value is carried only inside the protected Group state; Stations never receive or interpret it. |
| Duplicate-authority risk | A second Group name, Network label, account identifier, or Station handle is forbidden. |

## Visibility and trust

The value has confidentiality and integrity from Endpoint protection. A Station
may suppress or replay an opaque packet but cannot select the Group identity or
make a different Group state valid. Members retain the value with the accepted
state chain; a conflicting value for the same retained state scope rejects the
whole state. The identifier is not evidence of a person, device, account,
ownership, or membership outside the protected Group state.

## Alternatives

- Omit the value: rejected because Group-wide continuity and cross-state
  disambiguation would be ambiguous.
- Derive it from the genesis state digest: rejected because it couples a
  stable reference to a changing state construction and creates a second
  derivation rule for every implementation.
- Reuse `groupEpoch` or `groupStateDigest`: rejected because each has a
  narrower, changing scope.
- Use a Network, Station, account, or product room identifier: rejected
  because none is an Endpoint-authorized Group authority.
- Carry a random fixed-size opaque digest protected in the state: selected
  as the smallest stable, non-human-identifying reference.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It cannot
establish this field's necessity, name, placement, semantics, trust, or
lifecycle; the LicoArc-owned identifier question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Stable state scoping prevents cross-Group substitution; the value alone never authorizes membership or transitions. |
| Privacy and metadata | Endpoint protection hides the identifier from Stations and outside observers; member Endpoints may correlate it within the Group. |
| Interoperability | Fixed length, unchanged successor value, and fail-closed conflicting use are deterministic. |
| Implementation complexity | One constant-size retained value and byte comparison; no directory lookup is required. |
| CPU, memory, and wire cost | One 32-octet protected value per state; hashing and comparison are bounded. |
| Evolution and downgrade | A successor Protocol Line cannot reinterpret the value or translate an active Group state; a new line requires a new Group state. |

## Decision history

The review admitted `groupId` because Group-wide continuity cannot be derived
from the changing epoch, predecessor, or current-state digest. The decision is
independent of `ALG-group-state-evolution`: that Algorithm Decision supplies no
field status and cannot create a wire field. The registry and Candidate Group
schema were updated in this bounded change. Downstream delivery facts are not
part of this record's definition state.

## Definition evidence

The definition status is `SPECIFIED`. Normative semantics remain exclusively in the linked registry, schema, policy, and protocol sources.
