# Field Review: `<conceptual-name>`

This record preserves explanation and decision history. It is not a second
specification. For a decided or rejected field, normative semantics and
disposition come only from the
[Canonical Field Registry](../../spec/FIELD-REGISTRY.md).

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-<slug>` |
| Decision status | `OPEN`, `READY`, `DECIDED`, `REJECTED`, or `RETIRED` |
| Definition status | `NOT-SPECIFIED`, `PARTIAL`, or `SPECIFIED` |
| Candidate spellings | `<names or non-field carriers>` |
| Candidate layer | `<Transport Profile / Outer Envelope / Pairwise Protection / Reliable Exchange / Generic Message>` |
| Observer set | `<Endpoint / Station / carrier / outside observer>` |
| Existing authority | `<Canonical Field Registry link for decided or rejected scope; none while OPEN>` |
| Authority targets | `<Canonical Field Registry / versioned schema / conformance paths>` |
| Predecessor or successor | `<decision ID or none>` |
| Current conclusion | `<one bounded sentence>` |

## Question

State the exact decision. Separate whether the information exists semantically
from whether it needs a named wire field.

## Role in communication

Name the producer, every consumer, the operation performed, and whether the
value is security-authoritative, a transport hint, or opaque application data.

## Contribution to LicoArc's final vision

State one direct contribution to the
[LicoArc final protocol vision](../../PRODUCT.md#final-protocol-vision). For an
admitted field, name the exact Endpoint, Station, or Network outcome it makes
possible. For a rejected, replaced, or profile-owned value, name the vision
property preserved by its absence or relocation. Do not cite or name a
product, repository, implementation, language, library, Provider, deployment,
external protocol, or reference implementation in this section.

## Field model and trade-offs

Describe the field's semantic model and the security, privacy,
interoperability, resource, complexity, and evolution costs of the selected
representation. These costs inform the LicoArc-owned choice but cannot create
field necessity by convenience or familiarity.

### Value model

| Property | Finding |
| --- | --- |
| Semantic type | Enum, bounded integer, identifier, byte string, text, structure, or derived observation |
| Presence | Required, optional, conditional, or not a field |
| Values or range | Closed enum, numeric bounds, byte bounds, grammar, or unresolved |
| Canonical representation | Exact encoding or unresolved |
| Invalid input | Rejection, ignore, transport failure, or unresolved |

Do not treat UTF-8, Base64URL, JSON, CBOR, or a language-native type as the
semantic value unless the protocol actually needs that representation.

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Which exact interoperable action cannot proceed without it? |
| Field-level necessity | Why must this be a field at the proposed layer and placement rather than only a semantic value? |
| Removal consequence | What fails if the field is absent, excluding current Candidate, implementation, fixture, or test expectations? |
| Existing-field evidence | If already present, what proves continued necessity independently of its current existence and removal cost? |
| Derivation | Can the receiver derive it unambiguously? |
| Lower-layer carrier | Can the Transport Profile, request target, media type, or framing carry it? |
| Existing carrier | Can an already admitted field carry the same meaning without ambiguity or duplicate authority? |
| Protected placement | Can it be hidden or endpoint-authenticated instead of Station-visible? |
| Duplicate-authority risk | Could another layer carry a conflicting copy? |

The field has no presumption of inclusion or retention. If no required action,
field-level necessity, and removal consequence are demonstrated, reject the
field. Existing Candidate bytes, tests, examples, implementation effort, and
compatibility cost for unpublished bytes do not satisfy this burden.

## Visibility and trust

Document confidentiality, integrity, replay, suppression, retention,
correlation, and downgrade effects for every observer. State what a malicious
Station can change and what endpoints are permitted to infer.

## Alternatives

Compare omission, derivation, existing-field reuse, lower-layer carriage,
protected carriage, and each plausible representation. Include the simplest
no-field option.

## Comparative evidence, never authority

External material in this section is bounded comparison or risk evidence
only. It cannot establish this field's necessity, name, placement, semantics,
trust, or lifecycle; every resulting decision remains wholly LicoArc-owned.

Keep protocol references and research local and untracked. Record only the
self-contained comparison conclusion needed to explain the LicoArc choice;
do not link to, mirror, or require local research material. If no comparison
is needed, state that the LicoArc-owned question is self-contained.

## Technical evaluation

| Dimension | Assessment |
| --- | --- |
| Security | |
| Privacy and metadata | |
| Interoperability | |
| Implementation complexity | |
| CPU, memory, and wire cost | |
| Evolution and downgrade | |

## Decision history

For `OPEN`, list the unresolved protocol-definition questions. For `READY`,
show that every shared and field-specific definition criterion is closed. For
`DECIDED` or `REJECTED`, give the exact outcome, rationale, approval record,
authority link, rejected alternatives, and predecessor or successor.

## Definition evidence

Record the exact normative scope closed by the linked authorities and any
remaining ambiguity under the
[LicoArc Decision Lifecycle](../DECISION-LIFECYCLE.md). Downstream
implementation or validation evidence is not recorded here.
