# Field Review: Generic Message Content

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-content` |
| Decision status | `RETIRED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Predecessor or successor | Succeeded by `FLD-content-user-intent`. |
| Current conclusion | Retired: the successor renames ordinary content to `payload`, preserves exact user bytes, and limits LicoArc parsing to its control Payloads. |

## Question

Where does a Generic Message carry application content without importing
product semantics into LicoArc or exposing plaintext to a Station?

## Role in communication

The predecessor used `content` for both ordinary application bytes and
LicoArc-owned structures. The successor names the field `payload`: ordinary
bytes and raw attachment slices pass unchanged to the peer application, while
only reserved Control Payloads receive protocol grammar validation.

## Contribution to LicoArc's final vision

Retiring protocol interpretation of ordinary `content` leaves user Payload semantics outside LicoArc while retaining closed validation for LicoArc control structures.

## Field model and trade-offs

The retired value was mandatory `content: bstr[0..MAX_CONTENT_BYTES]`. The
successor is `payload: bstr[0..MAX_PAYLOAD_BYTES]`; ordinary bytes are opaque
and unchanged. An attachment chunk's bytes must still match its derived index
and expected length, while an Attachment Receive State Control Payload must
decode canonically. Current behavior comes only from the Field Registry.

## Visibility and trust

Content is hidden from Stations by Pairwise Protection and authenticated to
the receiving Endpoint. Size and timing may remain observable; no outer
plaintext, logging, or transport interpretation is authorized.

## Decision history

The field was admitted as the application-neutral payload carrier. Product
commands, approvals, UI events, and local effects remain outside LicoArc.

LicoArc review on 2026-08-03 closed its attachment roles without adding
`chunkData` or a second recovery body field: `contentType` supplies the exact
grammar and this existing protected byte string carries it. The later
Payload-authority review retired this broad scope and assigned current meaning
to `FLD-content-user-intent`.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
