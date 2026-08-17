# Field Review: Extension Criticality

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-extension-criticality` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Candidate spellings | `critical`, understood-required list, critical flag |
| Candidate layer | Protected headers and Generic Message extensions |
| Observer set | Peer Endpoints |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Current conclusion | Optional protected `critical` is a bounded `uint32[]`; every value names a member of `extensions`, and an unknown critical extension fails closed. |

## Question

How does a sender declare that an extension must be understood so a receiver
cannot silently ignore semantics that change security or application meaning?

## Role in communication

The receiver validates extension names against the selected Protocol Line and
either processes all declared critical semantics or rejects the record. The
field does not make an extension trustworthy; endpoint authentication still
does that.

## Contribution to LicoArc's final vision

Makes unsupported security-relevant extensions fail closed instead of being
silently ignored or stripped during protocol evolution.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Prevents stripping and silent-ignore downgrade when authenticated and uniquely represented. |
| Privacy and metadata | Protected placement hides extension capability from Stations; negotiation can still fingerprint endpoints. |
| Interoperability | Duplicate, unknown, ordering, and namespace rules need negative vectors. |
| Implementation complexity | A central list is easy to validate; per-field flags fit typed structures but can be missed. |
| CPU, memory, and wire cost | Small list and lookup cost; bounded extension counts are necessary. |
| Evolution and downgrade | This mechanism is itself the primary safe-evolution control and must never be optional for critical semantics. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Distinguish safely ignorable extensions from semantics required for correct processing. |
| Removal consequence | Old implementations can accept a message while ignoring a security- or meaning-changing field. |
| Derivation | Cannot be inferred reliably from unknown extension names or values. |
| Lower-layer carrier | Transport criticality cannot describe protected message extensions. |
| Protected placement | The declaration and extension values must share endpoint-authenticated context. |
| Duplicate-authority risk | Per-field flags plus a critical list can disagree; one model is required per layer. |

## Value model

The admitted representation is a bounded array of registered unsigned 32-bit
extension labels. Every label must exist in the sibling `extensions` map;
duplicates and unknown critical labels fail closed. Unknown non-critical
extensions may be ignored according to the selected Protocol Line.

## Alternatives

- Explicit authenticated list of labels that must be understood.
- Critical flag adjacent to each extension.
- Every extension critical, safest but prevents forward-compatible optional
  metadata.
- Every extension ignorable, rejected because it permits semantic downgrade.
- No extensions in the first closure, which may defer but not eliminate the
  design.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- COSE `crit`
  requires named protected header parameters to be understood.
- JWE `crit`
  provides a similar protected-header mechanism.
- TLS extensions use per-extension negotiation and
  specify failure behavior,
  but their handshake context is different from Generic Message content.
- Matrix's open event content often relies on
  clients ignoring unknown fields;
  that convention is insufficient for security-changing LicoArc semantics.

## Decision history

The original decision fixed fail-closed behavior but left representation open.
The Canonical Field Registry selected one protected bounded `uint32[]` whose
members must exist in `extensions`; this removes per-entry flag and duplicate
container alternatives. The future Protocol Line still fixes concrete bounds
and the governed extension registry.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
