# Field Decision Workspace

This directory is the public, non-normative workspace for deciding whether a
piece of information deserves a LicoArc wire field. It prevents a convenient
implementation shape from becoming protocol authority before its necessity,
layer, visibility, value space, and security effects have been justified.

This workspace is the Message Field Decision track governed by the canonical
[LicoArc Decision Lifecycle](../DECISION-LIFECYCLE.md). It is independent from
the [Algorithm Decision Workspace](../algorithm-decisions/README.md): a field
record cannot select an algorithm, and an algorithm record cannot admit a
field.

Nothing in this directory changes a Candidate Protocol Line. A field enters a
wire contract only after the owning formal authority is updated, closed
machine-readable sources and conformance material exist, and repository
verification passes. `OPEN` material is evidence and questions, not approved
product intent. A `DECIDED` row must point to an existing authority; its
definition state remains independent.

For the active target inventory, that formal authority is exclusively the
[Canonical Field Registry](../../spec/FIELD-REGISTRY.md). A record in this
workspace explains the field's role, direct contribution to the LicoArc final
vision, visibility, alternatives, comparative evidence, and decision history.
When a future question invalidates the registry, the registry is updated or
rebuilt first through the lifecycle and every affected explanation and
projection is migrated in the same change.

## Vision-first authority rule

Field purpose comes only from the
[LicoArc final protocol vision](../../PRODUCT.md#final-protocol-vision) and the
observable Endpoint, Station, or Network action needed to realize it. Every
active field must name that direct contribution. Every rejected, replaced, or
profile-owned value must name the vision property preserved by its absence or
relocation.

A product, repository, implementation, language, library, Provider,
deployment, schema convenience, storage layout, compatibility adapter, or
reference implementation cannot establish field necessity or retention. An
external protocol or standard may expose a risk, fact, alternative, or
algorithm lineage only after the LicoArc-owned question and necessity proof
are complete. Comparative evidence never supplies a field name, placement,
semantic value, authority, trust, failure behavior, or lifecycle.

## Lifecycle binding

Every field record uses the shared decision statuses `OPEN`, `READY`,
`DECIDED`, `REJECTED`, or `RETIRED` and reports its independent definition
status. The exact gates are defined only by the
[Decision Lifecycle](../DECISION-LIFECYCLE.md#decision-status).

A field record has ID `FLD-<file-name-without-extension>`. Its decision status
applies only to its explicitly bounded scope. If inclusion is decided while
encoding or placement remains capable of changing wire meaning, the unresolved
question must remain `OPEN` or be split into a separate record before further
work.

New field reviews must use [TEMPLATE.md](TEMPLATE.md). Comparative research
stays local and untracked; a record contains only the self-contained rationale
needed for its LicoArc-owned decision.

## Field admission rule

### Presumption and burden of proof

No candidate field has a presumption of inclusion or retention. The burden of
proof is always on the field: its review must demonstrate that one exact
interoperable action cannot be completed safely and unambiguously without the
semantic value at the proposed protocol layer and placement.

This rule applies equally to a proposed field and to a field already present
in a mutable Candidate schema, registry, corpus, artifact, implementation, or
example. Existing bytes, tests, names, implementation effort, or familiarity
are evidence of current state, not evidence of necessity. Reviewing whether an
existing Candidate field should remain is a fresh admission review.

If the required action can be completed by omission, derivation, local state,
lower-layer framing, an existing field, or a less exposed placement, the
proposed field is not necessary at that location and must be rejected or
removed. Being useful, convenient, conventional, easier to inspect, or cheaper
to preserve does not satisfy the necessity test. Among designs that do satisfy
the action, the review selects the least exposed and least semantically
duplicative representation.

The current pre-release Protocol Line provides no compatibility reason to keep
an unnecessary field. A Published Protocol Line remains immutable, but a
successor line must still omit a field whose necessity can no longer be
demonstrated.

A candidate is admitted only when its review answers all of these questions:

1. Which protocol role consumes it, and which exact interoperable action
   requires the semantic value at this layer and placement?
2. What fails if the field is absent, excluding failures caused only by the
   current Candidate, implementation, fixture, or test expecting it?
3. Can the value be derived, carried by the selected Transport Profile, kept
   local, represented by an existing field, or moved into endpoint protection?
4. Who can observe, modify, replay, suppress, retain, or correlate it?
5. Can modification change endpoint security interpretation? If yes, what
   endpoint-authenticated binding covers it?
6. Is the value an enum, bounded integer, identifier, byte string, text
   string, structure, or derived observation? What are its exact bounds?
7. Which comparison conclusion, if any, is needed to explain a risk or rejected
   trust assumption without linking to or requiring local research? A
   self-contained LicoArc decision does not require an external precedent.
8. What are the privacy, security, interoperability, performance, complexity,
   and evolution costs?

Questions 1 through 6 and the field's vision contribution must be answered
entirely from LicoArc roles, invariants, and observable interoperability. A
comparison source may support question 7 or challenge an answer, but it cannot
substitute for the required action, removal consequence, or authority model.

Convenience, usefulness, a familiar field name, an existing Candidate shape,
an existing product model, compatibility effort for unpublished bytes, or one
implementation's storage layout is not a necessity proof.

## Field-specific explanation index

The [Canonical Field Registry](../../spec/FIELD-REGISTRY.md) is the sole
authority for active fields and excluded, replaced, or profile-owned values.
Its `Detailed description（详细说明）` column links directly to the applicable
record below. These pages preserve role, vision contribution, field model,
visibility, alternatives, comparative evidence, decision history, and
definition evidence only; they cannot change a field.

This index is closed over every file under `fields/`. Decided, rejected, and
retired records project an active or excluded registry disposition. Open
proposal records are listed separately and cannot enter the active registry
until their own lifecycle reaches `DECIDED` and the registry is updated in the
same bounded change.

| Detail record | Detail record | Detail record | Detail record |
| --- | --- | --- | --- |
| [affiliation-commitment.md](fields/affiliation-commitment.md) | [affiliation-epoch.md](fields/affiliation-epoch.md) | [affiliation-nonce.md](fields/affiliation-nonce.md) | [affiliation-not-after.md](fields/affiliation-not-after.md) |
| [affiliation-state-digest.md](fields/affiliation-state-digest.md) | [previous-affiliation-update-digest.md](fields/previous-affiliation-update-digest.md) | [station-affiliation-signature.md](fields/station-affiliation-signature.md) | [station-affiliations.md](fields/station-affiliations.md) |
| [attachment-byte-length.md](fields/attachment-byte-length.md) | [attachment-chunk-count.md](fields/attachment-chunk-count.md) | [attachment-chunk-digest.md](fields/attachment-chunk-digest.md) | [attachment-chunk-length.md](fields/attachment-chunk-length.md) |
| [attachment-chunk-offset.md](fields/attachment-chunk-offset.md) | [attachment-chunk-size.md](fields/attachment-chunk-size.md) | [attachment-content-digest.md](fields/attachment-content-digest.md) | [attachment-id.md](fields/attachment-id.md) |
| [attachment-id-recovery.md](fields/attachment-id-recovery.md) | [attachment-media-type.md](fields/attachment-media-type.md) | [attachment-transfer-token.md](fields/attachment-transfer-token.md) | [attachments.md](fields/attachments.md) |
| [capability-digest.md](fields/capability-digest.md) | [capability-epoch.md](fields/capability-epoch.md) | [capability-signature.md](fields/capability-signature.md) | [capability-valid-until.md](fields/capability-valid-until.md) |
| [certification-refs.md](fields/certification-refs.md) | [chunk-final.md](fields/chunk-final.md) | [chunk-final-attachment.md](fields/chunk-final-attachment.md) | [chunk-index.md](fields/chunk-index.md) |
| [chunk-range-end-exclusive.md](fields/chunk-range-end-exclusive.md) | [chunk-range-start.md](fields/chunk-range-start.md) |  |  |
| [claim-epoch.md](fields/claim-epoch.md) | [claim-id.md](fields/claim-id.md) | [claimed-items.md](fields/claimed-items.md) | [confirmation-outcome.md](fields/confirmation-outcome.md) |
| [confirmation-stage.md](fields/confirmation-stage.md) | [confirmed-message-id.md](fields/confirmed-message-id.md) | [content-type.md](fields/content-type.md) | [content.md](fields/content.md) |
| [correlation-id.md](fields/correlation-id.md) | [correlation-id-recovery.md](fields/correlation-id-recovery.md) | [delivery-handle.md](fields/delivery-handle.md) | [descriptor-not-after.md](fields/descriptor-not-after.md) |
| [descriptor-not-before.md](fields/descriptor-not-before.md) |  |  |  |
| [descriptor-sequence.md](fields/descriptor-sequence.md) | [descriptor-signatures.md](fields/descriptor-signatures.md) | [endpoint-failure-code.md](fields/endpoint-failure-code.md) | [endpoint-identity.md](fields/endpoint-identity.md) |
| [endpoint-uri.md](fields/endpoint-uri.md) | [explicit-packet-length.md](fields/explicit-packet-length.md) | [extension-criticality.md](fields/extension-criticality.md) | [extensions.md](fields/extensions.md) |
| [failure-class.md](fields/failure-class.md) | [first-contact-token.md](fields/first-contact-token.md) | [handle-class.md](fields/handle-class.md) | [handshake-purpose.md](fields/handshake-purpose.md) |
| [handshake-role.md](fields/handshake-role.md) | [hop-trace.md](fields/hop-trace.md) | [invitation-binding.md](fields/invitation-binding.md) | [item-id.md](fields/item-id.md) |
| [listeners.md](fields/listeners.md) | [logical-message-id.md](fields/logical-message-id.md) | [message-kind.md](fields/message-kind.md) | [network-id.md](fields/network-id.md) |
| [nonce.md](fields/nonce.md) | [plaintext.md](fields/plaintext.md) | [previous-descriptor-digest.md](fields/previous-descriptor-digest.md) | [protected-packet.md](fields/protected-packet.md) |
| [previous-route-update-digest.md](fields/previous-route-update-digest.md) |  |  |  |
| [protection-profile-id.md](fields/protection-profile-id.md) | [protocol-line-id.md](fields/protocol-line-id.md) | [provider-id.md](fields/provider-id.md) | [record-type.md](fields/record-type.md) |
| [transport-framing.md](fields/transport-framing.md) | [requested-chunk-ranges.md](fields/requested-chunk-ranges.md) | [retention.md](fields/retention.md) | [retry-after.md](fields/retry-after.md) |
| [route-epoch.md](fields/route-epoch.md) |  |  |  |
| [route-not-after.md](fields/route-not-after.md) | [routes.md](fields/routes.md) | [sequence-counter.md](fields/sequence-counter.md) | [session-id.md](fields/session-id.md) |
| [service-until.md](fields/service-until.md) |  |  |  |
| [settle-action.md](fields/settle-action.md) | [settle-outcome.md](fields/settle-outcome.md) | [settlement-results.md](fields/settlement-results.md) | [settlements.md](fields/settlements.md) |
| [signature-value.md](fields/signature-value.md) | [signing-key-id.md](fields/signing-key-id.md) | [signing-key-profile-id.md](fields/signing-key-profile-id.md) | [signing-key-public-bytes.md](fields/signing-key-public-bytes.md) |
| [signing-keys.md](fields/signing-keys.md) | [station-descriptor-digest.md](fields/station-descriptor-digest.md) | [station-service-signature.md](fields/station-service-signature.md) |  |
| [station-id.md](fields/station-id.md) | [station-operation-id.md](fields/station-operation-id.md) | [station-receipt.md](fields/station-receipt.md) | [station-timestamp.md](fields/station-timestamp.md) |
| [supported-protection-profiles.md](fields/supported-protection-profiles.md) | [supported-protocol-lines.md](fields/supported-protocol-lines.md) | [transport-envelope-id.md](fields/transport-envelope-id.md) | [transport-profile-id.md](fields/transport-profile-id.md) |
| [transport-retention.md](fields/transport-retention.md) | [verification-epoch.md](fields/verification-epoch.md) | [verification-evidence.md](fields/verification-evidence.md) | [verification-method-id.md](fields/verification-method-id.md) |
| [protocol-line-id-session-binding.md](fields/protocol-line-id-session-binding.md) | [protection-profile-id-session-binding.md](fields/protection-profile-id-session-binding.md) | [capability-digest-session-binding.md](fields/capability-digest-session-binding.md) | [endpoint-identity-session-binding.md](fields/endpoint-identity-session-binding.md) |
| [content-type-user-intent.md](fields/content-type-user-intent.md) | [content-user-intent.md](fields/content-user-intent.md) | [confirmed-message-ids.md](fields/confirmed-message-ids.md) | [confirmation-stage-compact.md](fields/confirmation-stage-compact.md) |
| [confirmation-outcome-compact.md](fields/confirmation-outcome-compact.md) | [requested-chunk-ranges-compact.md](fields/requested-chunk-ranges-compact.md) | [generic-payload-length.md](fields/generic-payload-length.md) | [protocol-overhead-length.md](fields/protocol-overhead-length.md) |
| [payload-compression.md](fields/payload-compression.md) | [protected-padding-absence.md](fields/protected-padding-absence.md) | [control-budget-selector.md](fields/control-budget-selector.md) | [periodic-keepalive.md](fields/periodic-keepalive.md) |
| [record-type-evidence-checkpoint.md](fields/record-type-evidence-checkpoint.md) | [evidence-protocol-line-id.md](fields/evidence-protocol-line-id.md) | [evidence-signer-endpoint-identity-ref.md](fields/evidence-signer-endpoint-identity-ref.md) | [evidence-counterparty-endpoint-identity-ref.md](fields/evidence-counterparty-endpoint-identity-ref.md) |
| [evidence-signing-identity-state-digest.md](fields/evidence-signing-identity-state-digest.md) | [evidence-statement-digests.md](fields/evidence-statement-digests.md) | [evidence-signatures.md](fields/evidence-signatures.md) | [per-record-transferable-signature.md](fields/per-record-transferable-signature.md) |
| [session-authentication-as-transferable-evidence.md](fields/session-authentication-as-transferable-evidence.md) | [evidence-timestamp.md](fields/evidence-timestamp.md) | [non-repudiation-selector.md](fields/non-repudiation-selector.md) | [evidence-id.md](fields/evidence-id.md) |
| [legal-identity-evidence.md](fields/legal-identity-evidence.md) |  |  |  |

## Closed Group field-decision inventory

The seven Group field questions are independently closed. Six records are
`DECIDED` and linked to active Canonical Field Registry rows; the dedicated
Endpoint Association Claim is `REJECTED` and remains owned by ordinary opaque
`message.payload`. None creates a fourth entity, selects the Group algorithm,
or grants a Station or product permission authority.

| Closed record | Closed record | Closed record | Closed record |
| --- | --- | --- | --- |
| [group-id.md](fields/group-id.md) | [group-epoch.md](fields/group-epoch.md) | [previous-group-state-digest.md](fields/previous-group-state-digest.md) | [group-members.md](fields/group-members.md) |
| [group-member-role.md](fields/group-member-role.md) | [group-message-context.md](fields/group-message-context.md) | [endpoint-association-claim.md](fields/endpoint-association-claim.md) |  |

## Core v1 decision inventory

No Group field proposal remains open in this workspace. A future semantic
change requires a new Message Field Decision ID and a complete registry
migration; it cannot reopen or reinterpret one of the seven closed records.

Core v1 has six independent decided and specified field questions. Their exact
semantic conclusions, labels, objects, encodings, failures, and conformance
cases are joined to the owning machine authorities and Canonical Field
Registry. None permits component negotiation or fallback.

| Core v1 record | Core v1 record | Core v1 record |
| --- | --- | --- |
| [protocol-support-statement-v1.md](fields/protocol-support-statement-v1.md) | [minimum-protocol-generation-v1.md](fields/minimum-protocol-generation-v1.md) | [prekey-bundle-v1.md](fields/prekey-bundle-v1.md) |
| [handshake-transcript-v1.md](fields/handshake-transcript-v1.md) | [session-accept.md](fields/session-accept.md) | [ratchet-header.md](fields/ratchet-header.md) |

## Historical predecessor records

- [padding-length.md](fields/padding-length.md) preserves the rejected common
  length-field decision superseded in scope by
  `FLD-protected-padding-absence`.

## How a decision becomes authoritative

Follow the full [mandatory change procedure](../DECISION-LIFECYCLE.md#mandatory-change-procedure).
For this track, a record reaches `READY` only after the field admission rule
in this document is complete. A `DECIDED` transition updates or links the owning durable
intent authority in the same change. Definition status advances only when the
linked normative sources close the declared scope.

If the field is admitted to a Candidate wire, its definition includes the
schema or CDDL, registry entry, positive and negative definition-level corpus
cases, and artifact source closure.

This workspace never substitutes for those authorities.
