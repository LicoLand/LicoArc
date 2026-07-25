# Fabrigent

Fabrigent is LicoLand's neutral authority for versioned federation transport
contracts and governance policy. Implementations consume immutable,
content-addressed artifacts instead of importing this repository's source.

The current `v2` contract defines opaque relay envelopes, bounded retention,
mailbox and relay quotas, acknowledgements, and cleanup. The published `v1`
line remains immutable for pinned consumers. Both deliberately exclude client keys,
encryption, decryption, plaintext, local approval, host permissions, and
client-runtime coordination. LicoUp owns its end-to-end encryption and key
custody.

English is the normative language of this README; the
[Simplified Chinese localization](README.zh-CN.md) is provided for reference.

## Documentation

- [Product definition](PRODUCT.md)
- [Formal documentation index](docs/README.md)
- [Contributing](CONTRIBUTING.md)
- [Code of conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [License](LICENSE)

## Verification

Run `npm run verify` to validate the generated artifact and conformance corpus.

License: GPL-3.0-or-later.
