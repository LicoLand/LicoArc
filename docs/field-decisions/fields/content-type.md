# Field Review: Content Type

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-content-type` |
| Decision status | `RETIRED` |
| Definition status | `NOT-SPECIFIED` |
| Candidate spellings | media type, schema identifier, application namespace, `contentType` |
| Candidate layer | Generic Message inside protection |
| Observer set | Peer Endpoints |
| Existing authority | [Canonical Field Registry](../../../spec/FIELD-REGISTRY.md); this record explains the decision and is not a second field specification. |
| Predecessor or successor | Succeeded by `FLD-content-type-user-intent`. |
| Current conclusion | Retired: the successor keeps a compact dispatch token but removes LicoArc authority over ordinary application Payload schemas. |

## Question

What identifies the syntax and interpretation of opaque application content
without importing product command names or making the Station a content
router?

## Role in communication

The receiving Endpoint uses the value for compact dispatch after Pairwise
Protection and Generic Message validation. The successor leaves ordinary
application decoding entirely at the application boundary; LicoArc validates
only the discriminator itself and reserved Control Payload grammars.

## Contribution to LicoArc's final vision

Retiring LicoArc interpretation of ordinary application `contentType` preserves compact dispatch while returning Payload schema authority to the application boundary.

## Field model and trade-offs

| Dimension | Assessment |
| --- | --- |
| Security | Prevents parser confusion when authenticated; unknown or unsupported types must fail predictably. |
| Privacy and metadata | Protected placement hides application classification from Stations. |
| Interoperability | A governed registry avoids product-local aliases and media-type parsing divergence. |
| Implementation complexity | Text media types reuse libraries; numeric registries reduce bytes but need tooling. |
| CPU, memory, and wire cost | Small relative to content; parameter parsing can add complexity. |
| Evolution and downgrade | Type and version precedence must prevent an old decoder from accepting new semantics. |

## Necessity proof

| Test | Finding |
| --- | --- |
| Required action | Select the correct decoder when more than one application content format is permitted. |
| Removal consequence | Content becomes ambiguous or one implicit global format is frozen forever. |
| Derivation | Unsafe from content sniffing and impossible for encrypted Station carriage. |
| Lower-layer carrier | Transport Profile content metadata describes the outer carrier body, not protected application content. |
| Protected placement | It changes endpoint interpretation and must be authenticated and hidden. |
| Duplicate-authority risk | Outer media type, Generic Message type, and application content type have different layers and can conflict. |

## Value model

The value remains a registered unsigned 32-bit integer. In the retired scope,
every entry selected a LicoArc-owned decoder and schema. The successor reserves
exact entries for LicoArc Control Payloads while treating every ordinary
application entry as an opaque dispatch token whose schema is not LicoArc
authority. Stations cannot observe or route on either form.

## Alternatives

- One mandatory application-content encoding per Protocol Line, eliminating
  the field but limiting reuse.
- Standard media type string.
- Compact registry label mapped by the Protocol Line.
- Product-specific command name, rejected because it is not a syntax or
  interoperable content contract.
- Content sniffing, rejected for ambiguity and security.

## Comparative evidence, never authority

External material below is bounded comparison or risk evidence only. It
cannot establish this field's necessity, name, placement, semantics, trust,
or lifecycle; every resulting decision remains wholly LicoArc-owned.

- COSE content type
  identifies payload content and recommends it when structure is ambiguous.
- HTTP media types distinguish transported representation but apply at a
  different layer.
- MCP method names select operations rather than
  content serialization and
  therefore are not a direct substitute.
- Matrix event types combine room event semantics
  and content dispatch, a
  broader server-visible model than LicoArc intends.

## Decision history

The original decision admitted a protected discriminator but left its
representation open. The Canonical Field Registry selected a mandatory
registered `uint32`; the future governed registry must bind each value to one
exact schema and lifecycle without importing product commands into the core.

LicoArc review on 2026-08-03 closed the need for two LicoArc-owned content
semantics for resumable attachments without adding a Message kind or allowing
an application-defined chunk grammar. A later overhead and Payload-authority
review on the same date retired the broader application-schema scope in favor
of `FLD-content-type-user-intent`.

## Definition evidence

The definition status is `NOT-SPECIFIED`. This historical record supplies no active normative definition; any successor or replacement owns its complete definition independently.
