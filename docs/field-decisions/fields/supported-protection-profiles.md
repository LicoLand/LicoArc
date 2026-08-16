# Field Review: Supported Protection Profiles

This record preserves explanation and decision history. It is not a second
specification; normative field semantics come only from the Field Registry.

## Review state

| Item | Value |
| --- | --- |
| Decision track | `MESSAGE-FIELD` |
| Decision ID | `FLD-supported-protection-profiles` |
| Decision status | `DECIDED` |
| Definition status | `PARTIAL` |
| Existing authority | [Field Registry](../../../spec/FIELD-REGISTRY.md) |
| Current conclusion | `supportedProtectionProfiles` lists complete Protection Profiles admitted by the declared Protocol Lines. |

## Question

Which complete Protection Profiles may participate in endpoint-authenticated
selection?

## Role in communication

The declaring Endpoint produces the set and the peer uses it with both
Endpoints' minimum-safe policy. It never advertises independently combinable
cryptographic components.

## Contribution to LicoArc's final vision

Declares complete admissible protection contracts so peers select a common
safe profile without negotiating loose algorithm combinations.

## Field model and trade-offs

The value is a mandatory `DIGEST256[1..MAX_PROFILES]` collection. Uniqueness,
ordering, and unknown-value behavior come only from the Field Registry.

## Visibility and trust

The set is authoritative only after declaration authentication and transcript
binding. Modification or suppression can downgrade or deny service; disclosure
can fingerprint Endpoint capabilities.

## Decision history

The field was admitted to support selection of one indivisible reviewed
profile while rejecting unsafe Cartesian-product negotiation.

## Definition evidence

The definition status is `PARTIAL`. Only the scope recorded by this decision and its linked normative authorities is defined; any remaining normative ambiguity requires a successor decision before entering the protocol definition.
