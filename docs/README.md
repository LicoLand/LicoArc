# LicoArc documentation

LicoArc is an open communication protocol for people, devices and agents. Start
with the explanation that matches your goal, then follow its links to the exact
specification. You do not need to read decision workspaces to understand the protocol.

## Start here

| Your goal | Reading path |
| --- | --- |
| Understand the protocol | [Overview](../README.md) → [Concepts](../CONTEXT.md) → [Architecture](../ARCHITECTURE.md) |
| Build an independent implementation | [Implementer guide](guides/implementer-start.md) → [Core specification](../spec/README.md) |
| Understand offline communication | [A message's journey](guides/message-journey.md) → [Durable continuity](../spec/v1/reliable/continuity.md) |
| Use the Nostr network | [Nostr overview](protocols/nostr-interoperability-v1.md) → [Nostr binding](../spec/interop/v1/protocol.md) |
| Track changes | [Definition status](STATUS.md) and [Changelog](../CHANGELOG.md) |
| Propose an improvement | [Contributing](../CONTRIBUTING.md) and [Documenting a change](maintainers/documentation.md) |

## Protocol reference

| Subject | Explanation | Definition sources |
| --- | --- | --- |
| Foundation | [Foundation](protocols/foundation-v1.md) | [Core targets](../spec/v1/foundation/targets.json) |
| Identity | [Identity](protocols/identity-v1.md) | [Identity sources](../spec/v1/identity/source-manifest.json) |
| Protection | [Pairwise protection](protocols/pairwise-protection-v1.md) | [Protection sources](../spec/v1/protection/source-manifest.json) |
| Messaging | [Messages and attachments](protocols/generic-messaging-v1.md) | [Live capabilities](../spec/v1/messaging/capabilities.md) |
| Reliability | [Reliable exchange](protocols/reliable-exchange-v1.md) | [Durable continuity](../spec/v1/reliable/continuity.md) |
| Groups | [Group collaboration](protocols/group-collaboration-v1.md) | [Group continuity](../spec/v1/group/continuity.md) |
| Native transport | [HTTPS Station](protocols/https-transport-v1.md) | [Transport sources](../spec/v1/transport/source-manifest.json) |
| Federation | [Governance](protocols/federation-governance-v1.md) | [Governance sources](../spec/v1/governance/source-manifest.json) |

[Field registry](../spec/FIELD-REGISTRY.md) identifies the active fields.
The [source-check guide](conformance/verification.md) explains the repository tools.

## Which documents define the rules?

[Documentation authority](maintainers/documentation.md#authority-and-document-types)
separates normative definitions, explanatory guides, and decision history.
`spec/` owns the wire definitions; `docs/protocols/` explains and links to them.
The [README Core Domain Model](../README.md#core-domain-model) remains the authority
for the three domain entities. Website rendering does not add protocol meaning.

## Maintainers and decision history

[Algorithm decisions](algorithm-decisions/README.md),
[field decisions](field-decisions/README.md), and [ADRs](adrs/README.md) explain
why a choice was made. They are not a second current specification.
See also [decision lifecycle](DECISION-LIFECYCLE.md), [repository runbook](RUNBOOK.md),
[security reporting](../SECURITY.md), and [documentation publishing](maintainers/publishing.md).

The website is generated from this repository. Edit the Markdown or its owning
specification, not an HTML copy. `docs/catalog.json` supplies navigation and page
classification; generated status and reference listings read the same source snapshot.
