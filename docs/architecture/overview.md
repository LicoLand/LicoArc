# Fabrigent Architecture Overview

Fabrigent is not a running system; it is a build-time authority that turns
human-reviewed protocol sources into immutable, verifiable artifacts.

## Components

```text
contracts/vN/   policies/vN/   conformance/vN/
       \            |            /
        tools/generate-artifact.mjs
                    |
        artifacts/fabrigent-vN.json
                    |
        tests/conformance.test.mjs
```

- **Canonical sources.** The envelope schema
  governance policy, and synthetic conformance corpus in matching version
  directories are the only inputs for each bundle.
- **Bundle artifact.** `tools/generate-artifact.mjs` parses the sources,
  embeds them under `sources`, and computes `digest` as SHA-256 over the
  canonical JSON serialization. In `fabrigent.bundle.v2`, the digest binds
  `artifactVersion`, `digestAlgorithm`, and `sources`; the published v1
  digest and bytes retain their original source-only definition.
- **Verification.** `npm run artifacts:check` regenerates the expected
  bundle and compares it byte-for-byte; `npm test` re-derives the digest
  and evaluates the corpus against the embedded schema and policy.

## Trust Model

The policy declares `relay-is-untrusted`. The contract carries only opaque
ciphertext and routing metadata; encryption, decryption, key custody,
plaintext inspection, host permission authority, and client-runtime
coordination are forbidden capabilities by policy. See
[../protocols/relay-envelope-v2.md](../protocols/relay-envelope-v2.md).

## Boundaries

- LicoUp owns endpoint encryption, key custody, local approval, and client
  behavior.
- BadTower owns relay implementation, storage, mailbox operation, leases,
  quotas, acknowledgements, and cleanup execution.
- Fabrigent owns only the neutral contract, the governance policy, the
  conformance corpus, and the artifact pipeline described above.
