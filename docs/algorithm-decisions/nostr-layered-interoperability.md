# Nostr layered interoperability

| Property | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-nostr-layered-interoperability` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Scope | Initial V1 path separation, framing, association and capability intersection; no new cryptographic primitive. |
| Authority | `spec/interop/v1/manifest.json` and `spec/interop/v1/protocol.md` |

## Question and alternatives

An ordinary Nostr private-message client must communicate without adopting
LicoArc or a product-specific runtime. Independently implementable enhanced
clients must additionally retain native Endpoint authority and exact protected
bytes. Replacing Nostr would lose the intended baseline interoperability;
using NIP-17 alone would omit native session and execution semantics. Merely
carrying proprietary ciphertext would not provide ordinary-client chat.
Borrowing NIP-78 app-storage kinds conflicts with cross-client interchange;
placing commands in kind 14 confuses conversation and execution authority.

Select two explicitly authorized paths: unmodified NIP-17/44/59 chat, and an
independent NIP-59 outer binding carrying native V1 objects. Keep primitive selection separate from application compatibility. Current V1
continuity revises native admission and requires formal requalification.
The binding uses bounded 8192-byte fragments to carry the existing 524288-byte
native maximum without pretending every relay accepts a half-megabyte event.
Capabilities stay in native protected application payloads, never the AKE.

## Prototype and acceptance

The exact prototype is protocol.md sections 2–7: authenticated namespace
classification, original-byte hashing/framing, bounded reassembly, existing
native establishment, role/account/conversation binding, independent live capability
matching and explicit per-message path selection. Unknown or invalid
input cannot advance native state. An enhanced failure cannot enter standard
chat. Any conforming independent client may implement the extension.

The semantic identity binds only declared semantic sources and never itself.
Current semantic identities are recomputed; old proof inputs are not current evidence.
No native Station operation or governance membership is needed by a Nostr relay.
Core, Group, transport and governance have independent conformance targets.

## Risks and non-goals

This does not claim a new cryptographic proof, audited implementation, relay
anonymity, deletion, universal client support, automatic account recovery,
post-quantum Nostr outer signatures or upstream event-kind allocation. MLS and
Marmot are alternatives for a separately reviewed future endpoint profile,
not silently interchangeable ciphertext or an installed dependency here.
The chosen experimental kind is namespace-disambiguated and subject to an
explicit reviewed change if an upstream allocation is later made.

## Definition evidence

Closed manifest, three schemas, normative field inventory and protocol;
`conformance/interop/v1/cases.json`; deterministic tests in
`tests/nostr-interoperability.test.mjs`; independent generated V1 binding bundle.
These are definition evidence only, not production cryptographic execution.
