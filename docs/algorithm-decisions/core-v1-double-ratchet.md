# Algorithm Decision: Core v1 Double Ratchet

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-core-v1-double-ratchet` |
| Decision status | `OPEN` |
| Definition status | `PARTIAL` |
| Existing authority | Core v1 Pairwise Protection boundary |
| Authority targets | `spec/v1/protection`, security claims, conformance corpus, and a future complete Protocol Line |
| Predecessor or successor | Successor to the ratchet scope of `ALG-baseline-pairwise-protection-suite`. |

## Question and scope

Which exact Double Ratchet Prototype closes initial state, DH ratchet
transitions, root/send/receive KDFs, ratchet header, message-key derivation,
skipped-key and replay state, rollback/restart behavior, deletion transitions,
resource bounds, and compromise claims for Core v1?

## Partial conclusion

An epoch plus direction and counter is not a Double Ratchet and cannot be an
active wire substitute. Core v1 requires an authenticated DH ratchet public
key, previous-chain length and message number only after their exact
Algorithm Prototype and independent Message Field Decisions are closed.
Rejected input must never partially mutate state.

## Alternatives and acceptance

The retired counter-only frame, an implementation-selected ratchet, unbounded
skipped keys, and a custom post-quantum chain without an applicable proof are
rejected. `READY` requires the complete Prototype, exact bounds and failures,
claim-to-proof mapping, and source-derived positive, negative, boundary and
adversarial cases.

## Source-derived conformance material

No active ratchet vector exists until the Prototype is decided and specified.

## Definition evidence

The definition status is `PARTIAL`: the necessity of a real DH ratchet and the
rejection of the old counter-only frame are closed; all executable semantics
remain open.
