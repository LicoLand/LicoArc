# Field Review: Attachment Media Type

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-attachment-media-type` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `mediaType` selects one registered media type without exposing it to Stations. |

## Question

How does the receiver select safe application handling for opaque attachment
bytes without content sniffing or trusting transport metadata?

## Role in communication

The sender declares the type and the receiver validates it before handing the
descriptor to application policy. The value describes attachment content; it
does not guarantee that content is safe or truthful.

## Contribution to LicoArc's final vision

Selects the exact Endpoint-side interpretation of protected attachment content
without exposing that classification to a Station.

## Field model and trade-offs

The value is a mandatory registered `uint32`. Registry assignment, presence,
and invalid-input rules come only from the Field Registry.

## Visibility and trust

The value is protected and Endpoint-authenticated but remains a sender claim
subject to receiver policy. Disclosure can reveal content category; Stations
cannot supply or override it.

## Decision history

The field was admitted because neither outer Transport Profile metadata nor byte sniffing
can safely and unambiguously type protected attachment content.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
