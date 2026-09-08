# Algorithm Decision: Fixed Initial Protocol Admission

## Lifecycle

| Item | Value |
| --- | --- |
| Decision track | `ALGORITHM` |
| Decision ID | `ALG-protocol-line-admission` |
| Decision status | `DECIDED` |
| Definition status | `SPECIFIED` |
| Existing authority | Approved initial V1 / Generation 1 product intent |
| Authority targets | `spec/protocol-lines.json`, `spec/protection-profiles.json`, and `spec/v1/protection/` |
| Predecessor or successor | None; the protocol has never been published. |

## Question and scope

How do Endpoints authenticate the one exact initial protocol through a
potentially malicious Station without exchanging version policy?

## Algorithm Prototype

An Endpoint admits the exact complete V1 artifact and recomputes its Protocol
Line and indivisible Protection Profile identities. Establishment binds those
identities, both Endpoint identity states and sibling user-authority states,
the initiator signing-key identifiers, the responder's dual-signed prekey,
and the hybrid ephemeral inputs. The initiator's dual signatures and both
confirmation constructions authenticate that fixed context. A mismatched
identity, invalid signature or noncanonical input rejects before state advance.

## Necessity and alternatives

A version list, selection algorithm, peer version floor, or compatibility
decoder has no interoperable purpose for one unpublished contract. These
mechanisms add wire bytes, linkable metadata and persistent state without
improving this contract. Omitting exact content and identity binding would
allow context substitution and is rejected. Direct fixed-context admission
preserves the existing cryptographic construction and removes that unused
policy surface.

The Noise specification's protocol-name, prologue and pre-message binding
provide comparison evidence for authenticating fixed context without a
negotiation list. Noise is not a normative input or an implementation dependency.

## Source-derived conformance material

Closed artifact and packet admission, exact content mismatch, dual-signature
tampering, prekey replay, exact retry, maximum legal packet encoding, and
Endpoint confirmation cover the fixed construction. State generations,
authority epochs and ratchet counters keep their separate security meanings.

## Decision outcome

The user's confirmed initial V1 / Generation 1 direction is adopted. There
is one closed wire and state shape, with no version compatibility surface.

## Definition evidence

The catalogs and pairwise schemas, transcript projections, domains, bounds
and definition-level corpus own the exact admission contract. Implementation,
audit, publication and operation remain separate downstream claims.
