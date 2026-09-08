# Field Review: Generic Message Extensions

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-extensions` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `extensions` is the sole container for non-core semantics, with bounded names and aggregate bytes. |

## Question

Where can product-neutral evolution data be carried without opening the fixed
Generic Message core or permitting shadow core fields?

## Role in communication

The sender supplies registered or namespaced values and the receiver applies
the registry's criticality and ownership rules. Extensions cannot redefine
core fields or become implicit product commands.

## Contribution to LicoArc's final vision

Allows bounded namespaced evolution without expanding the fixed core or
permitting product-local semantics to redefine common fields.

## Field model and trade-offs

The value is an optional bounded `map<uint32,bstr>`. Name assignment,
uniqueness, criticality, aggregate bounds, and unknown-extension behavior come
only from the Field Registry.

## Visibility and trust

Extensions are protected and Endpoint-authenticated because they may affect
message interpretation. They can still increase size and fingerprint product
capabilities; Stations cannot supply trusted extension semantics.

## Decision history

The field was admitted as the single evolution container, avoiding open top-
level members and duplicate authority while retaining fail-closed criticality.

## Definition evidence

The definition status is `SPECIFIED`. The Canonical Field Registry and linked machine-readable authorities close this record’s exact active semantics.
