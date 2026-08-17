# Field Review: Relay Format Discriminator

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-relay-format` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `contractVersion`, `format`, media type parameter, negotiated Transport Profile |
| Candidate layer | Transport Profile selector and endpoint-authenticated protection context |
| Observer set | Endpoint, Station, carrier |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the replacement decision and is not a second field specification. |
| Authority targets | Future Transport Profile selector and Pairwise Protection authenticated context |
| Predecessor or successor | None |
| Current conclusion | The Transport Profile selects the outer parser without a structured-body `contractVersion`; the authoritative Protocol Line and Protection Profile remain endpoint-authenticated. |

## Question

How does a receiver select the exact parser and lifecycle record without
allowing a Station to choose or downgrade the Endpoint's protection semantics?

## Role in communication

A transport receiver may need a discriminator before it can parse an incoming
unit. Endpoint security also needs an exact Protocol Line and Protection
Profile, but that selection must be authenticated and cannot inherit authority
from a Station-visible transport token.

## Contribution to LicoArc's final vision

Separates outer parser dispatch from Endpoint-authenticated protocol selection
so a Station-visible carrier choice cannot downgrade protected meaning.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Necessary dispatch must be separated from authenticated profile selection to prevent downgrade authority. |
| Privacy and metadata | A fixed format token leaks little; a detailed capability token leaks implementation or feature information. |
| Interoperability | A closed registry gives independent implementations the same deterministic rejection behavior. |
| Implementation complexity | Duplicate inner and outer identifiers create mismatch rules and extra test cases. |
| CPU, memory, and wire cost | Small; parser confusion cost is more important than bytes. |
| Evolution and downgrade | Highest-risk dimension; exact precedence and retirement rules are mandatory. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Select one exact outer framing/parser and reject unknown input. |
| Removal consequence | Ambiguous framing if the Transport Profile supplies no equivalent discriminator. |
| Derivation | Possible when a dedicated endpoint, media type, or negotiated channel pins one format. |
| Lower-layer carrier | A Transport Profile media type, path, negotiated selector, or framed carrier can carry it. |
| Protected placement | The Protocol Line and Protection Profile must also be endpoint-authenticated inside the handshake or protected packet. |
| Duplicate-authority risk | High: an outer version and protected version can disagree or enable downgrade. |

## Value model

The outer parser selector belongs to the Transport Profile and is not copied
into a structured body. Its exact endpoint, media type, parameter, or negotiated
representation remains to be specified. The authoritative Protocol Line and
Protection Profile are separately bound by Endpoint-authenticated protection;
unknown, retired, downgrade-selected, or mismatched values fail closed.

## Alternatives

- No field: pin the parser through the selected Transport Profile.
- Media type or request target: visible but outside the protected packet.
- Self-describing binary tag: compact, but still transport-visible.
- A protected Protocol Line identifier only: authoritative to endpoints, but
  insufficient if the carrier cannot find the initial parser.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- MCP transports
  preserve one JSON-RPC message format while transport selection remains
  separate. This supports separation but does not solve adversarial downgrade.
- MLS media type registration
  permits an external version parameter while specifying that the embedded
  protocol version takes precedence.
- TLS 1.3 binds
  version negotiation into the handshake transcript rather than trusting a
  carrier hint.
- Matrix room versions select event rules, but
  its room and homeserver model
  is not a LicoArc trust authority.

## Decision history

After its admission evidence closed and the record reached `READY`, repository
review approved the bounded placement decision on 2026-08-01: the
outer parser is selected by the Transport Profile, `contractVersion` is not a
structured-body field, and transport-visible dispatch never overrides the
Endpoint-authenticated Protocol Line or Protection Profile.

Definition remains partial until the first Transport Profile selects the
exact external discriminator and the Pairwise Protection contract closes the
authenticated identifier, precedence, mismatch, downgrade, and retirement
rules.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
