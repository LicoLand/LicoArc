# Field Review: Group Members

This record preserves explanation and decision history. It is not a second
specification. Normative field semantics come only from the
[Canonical Field Registry](../../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-group-members` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Candidate spellings | `members` containing Endpoint references, incremental updates, or no field |
| Candidate layer | Protected Group Membership State |
| Observer set | Member Endpoints; hidden from Stations |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Authority targets | `spec/v1/group/` schemas, conformance corpus, and Protocol Line manifest |
| Predecessor or successor | None |
| Current conclusion | Every Group Membership State carries one mandatory canonical collection of `GroupMember` entries, bounded to `MAX_GROUP_MEMBERS = 64`; each entry names one Endpoint identity and one protocol role. |

## Question

Must a Group Membership State carry one bounded canonical collection of member
Endpoint references rather than relying on a Station, directory, incremental
update, or
local product state?

## Role in communication

The Group state author supplies the complete set; member Endpoints validate it,
derive the authorized recipient projection, reject removed members, and
aggregate per-member delivery results. Each entry is an Endpoint reference and
its protected protocol role. No Station, Network, account, human, or product
permission database can add, remove, or reorder a member.

## Contribution to LicoArc's final vision

Authorizes bounded Group collaboration from protected Endpoint references so
independent implementations can derive the same recipients without creating a
User, Device, account, Station, or fourth Group entity.

## Field model and trade-offs

`members` is a complete snapshot, not an incremental update or external lookup. A
`GroupMember` entry contains exactly one `endpointIdentityRef` (`DIGEST256`)
and one `role` value from the admitted Group Role enum. Entries are sorted by
raw Endpoint-reference bytes, unique, and bounded. The role's protocol meaning
is described by the separate Group Member Role decision; it is not a product
permission set.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | `GroupMember[1..MAX_GROUP_MEMBERS]`, where each entry contains one `DIGEST256` Endpoint reference and one `role` |
| Presence | Mandatory in every Group Membership State; a Group has at least one member |
| Values or range | `1..MAX_GROUP_MEMBERS` entries with `MAX_GROUP_MEMBERS = 64`; raw Endpoint references strictly ascending and unique |
| Canonical representation | One deterministic array of canonical member entries; no map-order or incremental-update ambiguity |
| Invalid input | Empty, above the bound, duplicate, unsorted, wrong-length, unknown-role, or conflicting entry rejects before state advance |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Authorize transitions, derive the bounded recipient set, reject removed members, and aggregate one result per member Endpoint. |
| Field-level necessity | The complete recipient and authorization set cannot be inferred from an opaque state digest, arrival history, or a Station without granting that observer membership authority. |
| Removal consequence | Without the snapshot, independent Endpoints can disagree about who may receive, send, or authorize a Group Message. |
| Existing-field evidence | `endpointIdentityRef` authenticates one Endpoint and `groupStateDigest` names one state; neither carries the complete set or per-member role. |
| Derivation | An incremental update requires an already synchronized base and cannot recover from a missing state; a directory or Station would become authoritative. |
| Lower-layer carrier | Transport routing only carries opaque packets and cannot define protected membership. |
| Existing carrier | Ordinary application Payload may describe a product relationship but cannot authorize a Protocol-Line Group transition. |
| Protected placement | The whole collection remains Endpoint-protected; Stations never observe the member set or roles. |
| Duplicate-authority risk | External membership lists, account groups, Station rooms, and product permission sets are not protocol authorities. |

## Visibility and trust

Member entries are confidential relationship data and are integrity-bound by the
Group state. A Station may route separate opaque deliveries but cannot add,
remove, reorder, or infer a member from transport behavior with protocol
authority. Endpoint validation sorts and deduplicates before allocation; any
invalid entry rejects the whole state. The Endpoint reference is stable
protocol identity only and never proves a person, device, account, ownership,
consent, or product permission.

## Alternatives

- Omit members and keep membership local: rejected because independent peers
  would have no interoperable recipient or authorization set.
- Send incremental updates only: rejected because loss or reordering of one base state makes
  recovery ambiguous and expands retained history.
- Use a Station, directory, or Network list: rejected because it creates an
  untrusted membership authority and leaks protected relationships.
- Use a commitment only: rejected because recipients still need the complete
  bounded set to project deliveries and validate sender membership.
- Carry one sorted, unique, bounded protected snapshot: selected.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It cannot
establish this field's necessity, name, placement, semantics, trust, or
lifecycle; the LicoArc-owned membership question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | Complete protected membership prevents unauthorized addition, stale removal, duplicate identity, and role confusion when combined with state succession. |
| Privacy and metadata | The set and roles remain hidden from Stations; bounded size still permits protected peers to learn Group cardinality. |
| Interoperability | Raw-byte ordering, uniqueness, entry shape, and fixed maximum are deterministic. |
| Implementation complexity | Validation is linear in the fixed maximum and can reject duplicates before allocating recipient work. |
| CPU, memory, and wire cost | At most 64 fixed-size references plus one bounded role per entry; no unbounded fan-out. |
| Evolution and downgrade | A successor state changes the complete snapshot under one Protocol-Line profile; incremental-update translation and unknown roles fail closed. |

## Decision history

LicoArc review admitted the complete protected member snapshot because recipient
projection and authorization cannot be derived from a digest, transport
observation, or product-local list. The role carried by each entry is decided
independently in `FLD-group-member-role`; this record does not define product
permissions or select the Group algorithm. The Canonical Field Registry was
updated in the same bounded change.

## Definition evidence

The definition status is `SPECIFIED`. Normative semantics remain exclusively in the linked registry, schema, policy, and protocol sources.
