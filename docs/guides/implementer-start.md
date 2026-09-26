# Implementer guide

This guide is an explanatory reading path for an independent implementation. It
does not prescribe a language, database, client brand, deployment or agent framework.

## Choose the contract you need

Read the [core targets](../../spec/v1/foundation/targets.json). An Endpoint Core
implementation owns identity, protected communication, messages and reliable exchange.
A Station transports protected bytes. Groups and federation add their own scopes;
implementing an Endpoint does not require operating a Station or joining a federation.

For ordinary Nostr private messaging, follow the upstream baseline selected by the
[Nostr binding](../../spec/interop/v1/protocol.md). For enhanced communication, add
the LicoArc core and the shared application definitions. Nostr is not required by
the core, and a successful relay acknowledgment is not an Endpoint receipt.

## Read meaning before encoding

Read [concepts](../../CONTEXT.md) and [architecture](../../ARCHITECTURE.md), then
[durable continuity](../../spec/v1/reliable/continuity.md). Distinguish a conversation,
a logical message, a delivery attempt and an execution result. A connection can
end without ending the other objects.

Read the [field registry](../../spec/FIELD-REGISTRY.md) alongside each capability's
source manifest. Schemas constrain shapes; registries, policies, CDDL comments and
normative prose supply the relationships and lifecycle rules. A valid shape alone
is not a valid state transition.

## Add application functions independently

[Live capabilities](../../spec/v1/messaging/capabilities.md) separate invoking an
interface, providing it, availability and permission. Updating a tool does not
rebind the conversation. Define the application's own request/result meaning;
do not add its internal workflow or model selection to the communication core.

## Follow exact sources

Use one source revision when reading definitions, examples and generated artifacts.
[Current status](../STATUS.md) explains the tracked definition; the website's
Definition snapshot reads the machine manifests automatically. Do not mix a moving
branch's schema with another revision's prose. Report a discrepancy against the
source path and section instead of silently choosing whichever is convenient.

[Repository checks](../conformance/verification.md) exercise definition sources.
An SDK's correctness and a deployment's behavior are separate responsibilities;
neither is a prerequisite for documenting or reviewing protocol design.
