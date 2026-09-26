# V1 interoperability fields

This table is incorporated by the Canonical Field Registry. It covers only
the Nostr outer binding and ordinary protected application payloads. It adds
no native cryptographic header, handshake field, algorithm selector, Station
roster or native identity alias. The linked schemas and protocol.md supply
exact encoding, validation, direction and failure semantics.

| Scope / value | Necessity and placement | Definition decision |
| --- | --- | --- |
| Carrier `channel` | Private pending-attempt/session lookup; cannot be derived before a native session exists; not an authenticator. | FLD-nostr-carrier-envelope |
| Carrier `type` | Select one existing native validator before untrusted bytes are parsed; no algorithm negotiation. | FLD-nostr-carrier-envelope |
| Carrier `digest` | Identify the complete unchanged native object across ordered or reordered fragments and wrappers; not a business id. | FLD-nostr-carrier-envelope |
| Carrier `length` | Reserve bounded reassembly memory and derive count/final fragment length; outer event length cannot describe the full object. | FLD-nostr-carrier-envelope |
| Carrier `index` | Restore order independently of relay order/timestamps; fragment count is derived and omitted. | FLD-nostr-carrier-envelope |
| Carrier `data` | Transport exact native octets through the required Nostr JSON string boundary. | FLD-nostr-carrier-envelope |
| Binding `binding` | Bind the exact non-circular interoperability semantic identity; version labels alone are insufficient. | FLD-nostr-session-binding |
| Binding `channel` | Authenticate the selected outer association inside native protection. | FLD-nostr-session-binding |
| Binding `initiator`, `responder` | Bind both role-ordered Nostr accounts to the native session; no cross-curve key alias. | FLD-nostr-session-binding |
| Binding `session` | Reject cross-session reassociation; the exact native context is the authenticated source. | FLD-nostr-session-binding |
| Binding `conversation` | Associates the established peer scope with a persistent dialogue; tools are not part of identity binding. | FLD-continuity-and-capability-records |
| Collaboration `conversation` | Keeps business payload meaning independent of session renewal and capability updates. | FLD-continuity-and-capability-records |
| Collaboration `capability` (`id`, `definition`) | Select only an exact mutually supported definition without inferring semantics from a brand or version label. | FLD-nostr-collaboration-payload |
| Collaboration `payload` | Preserve opaque application bytes; native message kind/id/relatesTo already supply request semantics. | FLD-nostr-collaboration-payload |

The namespace tag and dedicated kind are fixed binding constants, not an
upstream allocation. Upstream event fields, seals, gift wraps, Nostr key types,
and standard-chat fields are inherited unchanged from the pinned NIPs and
are not redefined by this registry. External wire names never become native
CBOR labels. All carrier values are inside NIP-59 protection; all binding and
collaboration values are additionally inside native protection. A parser
rejects unknown fields, duplicates, invalid bounds or noncanonical strings
without state advance. No product-command catalogue is allocated here.
