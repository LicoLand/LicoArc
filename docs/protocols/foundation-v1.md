# Lico Arc Protocol Foundation v1

Status: Candidate foundation source only. This document closes the
representation, registry, schema, parser, and generation contract required by
future capability Candidates. It does not define Pairwise Protection,
Generic Messaging, Reliable Exchange, or a Transport Profile. The current
Protocol Line integration binds this foundation to the one closed Candidate
wire identity.

## Authority and source closure

The machine-readable authority is the explicitly sorted
[`source-manifest.json`](../../spec/v1/foundation/source-manifest.json). It
declares every source under these three roots:

| Root | Role |
| --- | --- |
| `spec/v1/foundation/` | Foundation registries, policy, source manifest, and CDDL |
| `spec/v1/schemas/` | Closed JSON Schemas for governance inputs and declarations |
| `conformance/v1/foundation/` | Synthetic positive and negative parser cases |

The source manifest rejects duplicate paths, unsafe paths, symlinks, missing
files, and undeclared regular files. Paths are repository-relative and sorted
by ordinal lexical order. Generation reads only this manifest and has no
machine, wall-clock, account, process, or runtime-state input.

Capability-specific sources are deliberately outside this foundation closure;
the Protocol Line manifest binds them as separate capability records.

## Two disjoint representations

The foundation has one governance representation and one Endpoint runtime
representation. They are not alternate encodings of one object.

### Governance and distribution inputs

Governance documents use restricted JCS (RFC 8785-style) canonical JSON and
closed JSON Schema Draft 2020-12:

- UTF-8 is required and malformed UTF-8 is rejected.
- Duplicate object names are rejected after escape decoding; member order is
  not semantic and canonical output sorts names by UTF-16 code-unit order.
- Canonical output contains no trailing line break. `-0` is emitted as `0`;
  non-finite and unsafe integral numbers are rejected.
- Strings must contain Unicode scalar values. Schema object members must set
  `additionalProperties: false`; unknown schema vocabulary is rejected.
- Governance parsers reject trailing bytes, over-bound arrays/objects/strings,
  and values that do not satisfy the exact closed schema.

The deterministic source checker is in
[`tools/protocol/canonical-json.mjs`](../../tools/protocol/canonical-json.mjs)
and [`tools/protocol/schema.mjs`](../../tools/protocol/schema.mjs).

### Endpoint runtime records

Runtime records use the closed CDDL subset in
[`runtime.cddl`](../../spec/v1/foundation/runtime.cddl) and deterministic
CBOR:

- Maps use compact unsigned-integer labels from
  [`labels.json`](../../spec/v1/foundation/labels.json); semantic names are
  documentation only and never become wire text.
- Integer and length arguments use their shortest definite representation.
  Map keys are sorted by their encoded byte strings.
- Raw bytes use definite-length `bstr` and are bounded by `MAX_RAW_BYTES`.
- Tags, floating-point values, indefinite-length items, text map labels,
  duplicate labels, non-canonical integer/length forms, and trailing bytes are
  rejected.
- The foundation runtime record is only an encoding fixture: label `0` is an
  unsigned record kind, optional label `1` is bounded raw bytes, and optional
  label `2` is an unsigned sequence. Capability Tasks allocate their own
  decided fields and do not inherit these fixture semantics.

The deterministic source encoder is in
[`tools/protocol/deterministic-cbor.mjs`](../../tools/protocol/deterministic-cbor.mjs).

The representations meet only at a closed Protocol Line manifest. A
governance JSON document cannot be substituted for runtime CBOR, and runtime
CBOR cannot be translated into or used as a governance JSON source. The
manifest binds source families, lifecycle, minimum-safe policy, handshake
binding, session lock, and the single `translationPolicy: "forbidden"`
assertion.

## Closed registries and lifecycle

[`registry.json`](../../spec/v1/foundation/registry.json) links the bounds,
identifier, lifecycle, label, representation, schema, and source-closure
contracts. Every parser-relevant numeric value comes from
[`bounds.json`](../../spec/v1/foundation/bounds.json); callers cannot raise a
bound by sending a self-reported length or budget.

| Symbol | Value | Use |
| --- | ---: | --- |
| `MAX_SOURCE_FILES` | 256 | Declared source count |
| `MAX_SOURCE_BYTES` | 1,048,576 | One source before canonicalization |
| `MAX_MANIFEST_BYTES` | 65,536 | Foundation source manifest |
| `MAX_GOVERNANCE_BYTES` | 1,048,576 | One governance JSON document |
| `MAX_RUNTIME_RECORD_BYTES` | 1,048,576 | One deterministic CBOR item |
| `MAX_RAW_BYTES` | 262,144 | One runtime `bstr` |
| `MAX_TEXT_BYTES` | 4,096 | One governance/runtime text value |
| `MAX_IDENTIFIER_BYTES` | 128 | One foundation identifier |
| `MAX_ARRAY_ITEMS` | 64 | One JSON/CBOR array |
| `MAX_MAP_ENTRIES` | 64 | One runtime map |
| `MAX_OBJECT_MEMBERS` | 64 | One governance object |
| `MAX_NESTING_DEPTH` | 16 | Recursive parser depth |
| `MAX_INTEGER` | 9,007,199,254,740,991 | Safe integer ceiling |

The lifecycle registry closes `Draft → Candidate → Published → Retired`, with
an explicit Candidate regeneration transition. Published bytes are immutable
and remain verifiable after retirement. Unknown states and transitions,
mixed lifecycle composition, retired inputs, and downgrade-selected inputs
fail closed. Foundation identifiers are source-contract or encoding-contract
identifiers only; they are not capability, Provider, product, account, or
runtime identifiers.

## Generation and content identity

`tools/protocol/generate-foundation.mjs` invokes
[`generateFoundationBundle`](../../tools/protocol/foundation.mjs). Generation:

1. parses and validates the source manifest with duplicate-key rejection;
2. verifies the exact sorted source closure and rejects undeclared files;
3. canonicalizes every JSON source as restricted JCS and validates CDDL as
   UTF-8 LF text;
4. records only each declared relative source path, representation, byte
   count, and SHA-256 digest; and
5. hashes the canonical bundle body to produce a stable content identity.

The bundle has no generated timestamp, hostname, user/account, process,
absolute path, dependency graph, or runtime observation. `--check` computes
the identity without writing; `--write=<relative-path>` is an explicit local
artifact action for a later integration workflow.

## Fail-closed conformance

The focused corpus in
[`conformance/v1/foundation/`](../../conformance/v1/foundation/) covers
canonical ordering, Unicode, exact CBOR bytes, duplicate keys/labels,
unknown closed members/labels, non-canonical integers, indefinite lengths,
trailing bytes, negative labels, and integer overflow. The executable oracle
is [`tests/protocol-foundation.test.mjs`](../../tests/protocol-foundation.test.mjs):

```sh
node --test tests/protocol-foundation.test.mjs
```

The oracle also checks a synthetic undeclared-source mutation in a temporary
copy and confirms that source closure fails closed. No fixture contains
plaintext, endpoint secrets, runtime observations, or machine identity.
