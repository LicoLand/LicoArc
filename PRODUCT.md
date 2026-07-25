# Fabrigent Product Definition

Fabrigent is the LicoLand organization's neutral authority for federation
communication contracts and governance policy. It publishes immutable,
versioned, content-addressed protocol artifacts; implementations pin an exact
artifact version and verify its digest instead of importing this repository's
source.

## Scope

Fabrigent owns:

- Neutral federation addressing, session, and delivery contract definitions.
- Opaque relay envelope wire contracts (`contracts/v1/`, `contracts/v2/`).
- Relay governance policy, including required and forbidden capabilities and
  envelope limits (`policies/v1/`, `policies/v2/`).
- Compatibility rules and version policy
  ([docs/COMPATIBILITY.md](docs/COMPATIBILITY.md)).
- Synthetic conformance corpora (`conformance/v1/`, `conformance/v2/`).
- Versioned bundle artifacts with content digests (`artifacts/`).

## Explicitly Out Of Scope

- Client end-to-end encryption, decryption, key custody, local approval,
  plaintext handling, and user-interface behavior. These belong to LicoUp.
- Relay implementation, storage, mailbox operation, lease enforcement, quota
  accounting, acknowledgement handling, and cleanup execution. These belong
  to BadTower.
- Any runtime service. This repository publishes specifications and policy,
  not executable infrastructure.

## Current Contract Line

The current `v2` line defines the opaque relay envelope
`fabrigent.relay.v2` and governance policy
`fabrigent.relay-governance.v2` under a `relay-is-untrusted` trust model.
The published `v1` line remains immutable. Human-readable projections are
[v2](docs/protocols/relay-envelope-v2.md) and
[v1](docs/protocols/relay-envelope-v1.md).

## Consumption Model

1. Pin an exact artifact, for example `artifacts/fabrigent-v2.json`.
2. Verify the artifact digest against `artifactVersion`, `digestAlgorithm`,
   and the canonical sources it embeds.
3. Treat the embedded contract, policy, and conformance corpus as the only
   authority for that version.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
