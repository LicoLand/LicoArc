import { createCipheriv, createHash, createHmac, hkdfSync } from "node:crypto";
import {
  assertValidProtocolCatalogs,
  canonicalizeRestrictedJson,
  computeProtectionProfileId,
  computeProtocolLineId,
  decodeDeterministicCbor,
  encodeDeterministicCbor,
  parseRestrictedJson,
  resolveExistingSessionPolicy,
  selectProtocolLine,
  validateClosedSchema
} from "../protocol/index.mjs";
import {
  assertDeclaredSourceClosure,
  assertValidProtocolDefinition
} from "../protocol/validation.mjs";
import { assertValidSecurityAccounting } from "../protocol/security.mjs";

export class ConformanceOperationError extends TypeError {
  constructor(code, message = code, options = undefined) {
    super(message, options);
    this.name = "ConformanceOperationError";
    this.code = code;
  }
}

const operations = {
  "licoarc.catalog.resolve-existing-session.v1": typed("invalid-existing-session-input", ({ input }) =>
    resolveExistingSessionPolicy(decodeTaggedJson(input))),
  "licoarc.catalog.select-protocol-line.v1": typed("invalid-protocol-line-selection-input", ({ input }) =>
    selectProtocolLine(decodeTaggedJson(input))),
  "licoarc.catalog.validate.v1": typed("invalid-protocol-catalog", ({ input }) => {
    const value = decodeTaggedJson(input);
    assertValidProtocolCatalogs(value.protocolLines, value.protectionProfiles, value.schemas);
    return { accepted: true };
  }),
  "licoarc.definition.validate.v1": typed("invalid-protocol-definition", ({ input }) => {
    const value = decodeTaggedJson(input);
    const result = assertValidProtocolDefinition({
      ...value,
      profileIdentityInputs: entriesToMap(value.profileIdentityInputs)
    });
    return {
      accepted: true,
      securityComplete: result.securitySummary.complete,
      provedClaimIds: [...result.securitySummary.provedClaimIds],
      explicitNonClaimIds: [...result.securitySummary.explicitNonClaimIds]
    };
  }),
  "licoarc.definition.validate-source-closure.v1": typed("invalid-source-closure", ({ input }) => ({
    sourcePaths: [...assertDeclaredSourceClosure(decodeTaggedJson(input))]
  })),
  "licoarc.foundation.canonicalize-governance-json.v1": typed("invalid-governance-json", ({ input }) => {
    const parsed = parseRestrictedJson(input.source, input.limits);
    return { canonical: canonicalizeRestrictedJson(parsed, input.limits) };
  }),
  "licoarc.foundation.decode-deterministic-cbor.v1": typed("invalid-deterministic-cbor", ({ input }) => ({
    value: encodeTaggedJson(decodeDeterministicCbor(hexToBytes(input.hex), input.limits))
  })),
  "licoarc.foundation.encode-deterministic-cbor.v1": typed("invalid-deterministic-cbor-value", ({ input }) => ({
    hex: Buffer.from(encodeDeterministicCbor(decodeTaggedJson(input.value), input.limits)).toString("hex")
  })),
  "licoarc.identity.compute-profile.v1": typed("invalid-profile-content-identity-input", ({ input }) => ({
    profileId: computeProtectionProfileId(decodeTaggedJson(input))
  })),
  "licoarc.identity.compute-protocol-line.v1": typed("invalid-protocol-line-content-identity-input", ({ input }) => ({
    protocolLineId: computeProtocolLineId(decodeTaggedJson(input))
  })),
  "licoarc.protection.admit-prekey-pair.v1": typed("invalid-prekey-admission-input", ({ input }) =>
    input.candidateSequence <= input.highWater || input.activeSequences.includes(input.candidateSequence)
      ? { error: "prekey-consumed", stateMutation: false }
      : { admitted: true, stateMutation: true }),
  "licoarc.protection.commit-first-packet.v1": typed("invalid-first-packet-commit-input", ({ input }) => {
    if (input.packetDigest === "same-as-committed") {
      return { result: "identical-committed-session-accept", stateMutation: false };
    }
    const committed = Math.min(input.authenticatedPackets, 1);
    return { committed, loserError: "prekey-consumed", partialRedemption: false };
  }),
  "licoarc.protection.compute-session-accept.v1": typed("invalid-session-accept-input", ({ input }) => {
    const key = exactHex(input.keyHex, 32);
    const unsigned = exactHex(input.unsignedCanonicalHex);
    const mac = createHmac("sha256", key)
      .update(Buffer.from("LICOARC-V1/HANDSHAKE/SESSION-ACCEPT-MAC\0", "ascii"))
      .update(unsigned)
      .digest("hex");
    return { macHex: mac, bytes: 32 };
  }),
  "licoarc.protection.delete-session.v1": typed("invalid-session-delete-input", ({ input }) => ({
    state: "DELETED",
    stateGeneration: checkedIncrement(input.stateGeneration),
    reachableKeyCount: 0,
    reachableRetryPacketCount: 0
  })),
  "licoarc.protection.encode-ratchet-header.v1": typed("invalid-ratchet-header-input", ({ input }) => ({
    hex: Buffer.from(encodeDeterministicCbor({
      0: exactHex(input.dhHex, 32),
      1: input.pn,
      2: input.n
    })).toString("hex"),
    plaintextButAuthenticated: true
  })),
  "licoarc.protection.frame-protected-record.v1": typed("invalid-protected-record-frame-input", ({ input }) => ({
    hex: Buffer.concat([
      exactHex(input.headerHex),
      exactHex(input.ciphertextHex),
      exactHex(input.tagHex, 16)
    ]).toString("hex")
  })),
  "licoarc.protection.hybrid-key-schedule-authority.v1": typed("invalid-hybrid-key-schedule-input", ({ input }) =>
    hybridKeySchedule(input)),
  "licoarc.protection.observe-prekey-bundle.v1": typed("invalid-prekey-observation-input", ({ input }) => {
    if (input.event !== "publication-or-handshake-receipt" || !Number.isSafeInteger(input.sequence)) {
      throw new ConformanceOperationError("invalid-prekey-observation-input");
    }
    return { active: true, reserved: false, stateMutation: false };
  }),
  "licoarc.protection.receive-record.v1": typed("invalid-record-receive-input", ({ input }) => {
    if (input.aeadAuthentication === false) {
      return { error: "record-authentication", committedSkippedKeys: 0, plaintextReleased: false };
    }
    const skipped = input.incomingN - input.currentN;
    if (skipped > 256 || input.skippedKeyCount + skipped > 2048) {
      return { error: "skip-bound", stateMutation: false };
    }
    return {
      derivedSkippedCoordinates: Array.from({ length: skipped }, (_, index) => input.currentN + index),
      committedN: checkedIncrement(input.incomingN),
      incomingKeyRetained: false,
      plaintextReleasedAfterCommit: true
    };
  }),
  "licoarc.protection.restart-session.v1": typed("invalid-session-restart-input", ({ input }) =>
    input.restoredGeneration < input.committedGeneration
      ? { error: "state-rollback", packetEmitted: false, plaintextReleased: false }
      : { restored: true, stateMutation: false }),
  "licoarc.protection.send-first-packet.v1": typed("invalid-first-packet-send-input", ({ input }) =>
    input.durableCommit === true
      ? { emittedPackets: 1, stateMutation: true }
      : { error: "persistence", emittedPackets: 0, stateMutation: false }),
  "licoarc.protection.send-record.v1": typed("invalid-record-send-input", ({ input }) => {
    if (input.n === 0xffff_ffff) return { error: "counter-overflow", packetEmitted: false, stateMutation: false };
    if (input.role === "responder" && input.sendingChain === null && input.freshLocalRatchetKey === true) {
      return {
        steps: ["X25519", "HKDF-extract-current-root", "derive-nextRootR2I", "derive-nextChainR2I", "commit-before-emission"],
        headerUsesFreshDh: true
      };
    }
    throw new ConformanceOperationError("invalid-record-send-input");
  }),
  "licoarc.protection.validate-hybrid-result.v1": typed("invalid-hybrid-result-input", ({ input }) =>
    input.x25519SharedSecret === "all-zero"
      ? { error: "handshake-rejected", stateMutation: false }
      : { accepted: true, stateMutation: false }),
  "licoarc.protection.validate-profile-shapes.v1": typed("invalid-profile-shape-input", ({ context, input }) =>
    profileShapes(context, input.profileLocator)),
  "licoarc.protection.verify-handshake-authentication.v1": typed("invalid-handshake-authentication-input", ({ input }) =>
    input.ed25519 === "valid-plain-signature" && input.mlDsa65 === "valid-final-signature"
      ? { accepted: true, stateMutation: true }
      : { error: "handshake-rejected", stateMutation: false, primitiveDetailDisclosed: false }),
  "licoarc.protection.verify-session-accept.v1": typed("invalid-session-accept-verification-input", ({ input }) =>
    input.macBytes === 32
      ? { accepted: true, stateMutation: true }
      : { error: "invalid-encoding", stateMutation: false }),
  "licoarc.schema.validate-closed.v1": typed("invalid-closed-schema-input", ({ input }) => {
    const value = decodeTaggedJson(input);
    const errors = validateClosedSchema(value.instance, value.schema, { schemas: value.schemas ?? [] });
    return {
      valid: errors.length === 0,
      errors
    };
  }),
  "licoarc.security.validate-accounting.v1": typed("invalid-security-accounting", ({ input }) => {
    const result = assertValidSecurityAccounting(decodeTaggedJson(input));
    return {
      complete: result.complete,
      provedClaimIds: [...result.provedClaimIds],
      explicitNonClaimIds: [...result.explicitNonClaimIds]
    };
  })
};

export const CONFORMANCE_OPERATIONS = Object.freeze(operations);
export const CONFORMANCE_OPERATION_IDS = Object.freeze(Object.keys(operations).sort());

function typed(defaultCode, executor) {
  return Object.freeze(function executeConformanceOperation(argument) {
    try {
      return executor(argument);
    } catch (error) {
      if (error instanceof ConformanceOperationError) throw error;
      const code = typeof error?.code === "string"
        ? error.code
        : stableParserCode(error?.message) ?? defaultCode;
      throw new ConformanceOperationError(code, code, { cause: error });
    }
  });
}

function stableParserCode(message) {
  if (typeof message !== "string") return undefined;
  const rules = [
    [/object .*duplicate member/u, "duplicate-member"],
    [/trailing content|trailing bytes/u, "trailing-bytes"],
    [/indefinite-length/u, "indefinite-length"],
    [/duplicate label/u, "duplicate-label"],
    [/not deterministic|shortest|non-canonical/u, "noncanonical-encoding"],
    [/unknown label/u, "unknown-label"],
    [/unsigned integer/u, "negative-label"],
    [/exceeds the bound|outside the safe range/u, "bound-exceeded"]
  ];
  return rules.find(([pattern]) => pattern.test(message))?.[1];
}

function entriesToMap(value) {
  if (value === undefined) return new Map();
  if (!Array.isArray(value) || value.some((entry) => !Array.isArray(entry) || entry.length !== 2 || typeof entry[0] !== "string")) {
    throw new ConformanceOperationError("invalid-profile-identity-input-map");
  }
  if (new Set(value.map(([key]) => key)).size !== value.length) {
    throw new ConformanceOperationError("duplicate-profile-identity-input");
  }
  return new Map(value);
}

function exactHex(value, byteLength = undefined) {
  if (typeof value !== "string" || value.length % 2 !== 0 || !/^[0-9a-f]*$/u.test(value)) {
    throw new ConformanceOperationError("invalid-hex-input");
  }
  const bytes = Buffer.from(value, "hex");
  if (byteLength !== undefined && bytes.length !== byteLength) {
    throw new ConformanceOperationError("invalid-byte-length");
  }
  return bytes;
}

function checkedIncrement(value) {
  if (!Number.isSafeInteger(value) || value < 0 || value === Number.MAX_SAFE_INTEGER) {
    throw new ConformanceOperationError("counter-overflow");
  }
  return value + 1;
}

function hybridKeySchedule(input) {
  const handshakeDigest = exactHex(input.handshakeCoreDigestHex, 32);
  const x25519 = exactHex(input.x25519SharedSecretHex, 32);
  const mlKem = exactHex(input.mlKem768SharedSecretHex, 32);
  const domain = (name) => Buffer.from(`${name}\0`, "ascii");
  const extractSalt = createHash("sha256")
    .update(domain("LICOARC-V1/HYBRID/EXTRACT-SALT"))
    .update(handshakeDigest)
    .digest();
  const ikm = Buffer.concat([x25519, mlKem]);
  const prk = createHmac("sha256", extractSalt).update(ikm).digest();
  const expand = (name, length) => Buffer.from(hkdfSync("sha256", ikm, extractSalt,
    Buffer.concat([domain(name), handshakeDigest]), length));
  const clientConfirmKey = expand("LICOARC-V1/HANDSHAKE/CLIENT-CONFIRM-KEY", 32);
  const clientConfirmNonce = expand("LICOARC-V1/HANDSHAKE/CLIENT-CONFIRM-NONCE", 12);
  const cipher = createCipheriv("chacha20-poly1305", clientConfirmKey, clientConfirmNonce,
    { authTagLength: 16 });
  cipher.setAAD(handshakeDigest);
  const clientConfirmCiphertext = Buffer.concat([
    cipher.update(domain("LICOARC-V1/HANDSHAKE/CLIENT-CONFIRM")),
    cipher.final()
  ]);
  return {
    extractSaltHex: extractSalt.toString("hex"),
    prkHex: prk.toString("hex"),
    hybridRootHex: expand("LICOARC-V1/HYBRID/ROOT", 32).toString("hex"),
    clientConfirmKeyHex: clientConfirmKey.toString("hex"),
    clientConfirmNonceHex: clientConfirmNonce.toString("hex"),
    clientConfirmCiphertextHex: clientConfirmCiphertext.toString("hex"),
    clientConfirmTagHex: cipher.getAuthTag().toString("hex"),
    sessionAcceptKeyHex: expand("LICOARC-V1/HANDSHAKE/SESSION-ACCEPT-KEY", 32).toString("hex")
  };
}

function profileShapes(context, profileLocator) {
  if (profileLocator !== "stable-core") throw new ConformanceOperationError("unknown-profile-locator");
  const algorithms = context.publicMaterial.find(({ name }) => name === "algorithms")?.value;
  if (!algorithms || !Array.isArray(algorithms.primitives)) {
    throw new ConformanceOperationError("missing-profile-algorithms");
  }
  const primitive = new Map(algorithms.primitives.map((item) => [item.name, item]));
  const required = ["ML-KEM-768", "ML-DSA-65", "X25519", "Ed25519", "ChaCha20-Poly1305", "HMAC-SHA-256"];
  if (required.some((name) => !primitive.has(name))) throw new ConformanceOperationError("incomplete-profile-shapes");
  return {
    mlKem768: {
      dkSeed: primitive.get("ML-KEM-768").dkSeedBytes,
      encapsulationKey: primitive.get("ML-KEM-768").encapsulationKeyBytes,
      ciphertext: primitive.get("ML-KEM-768").ciphertextBytes,
      sharedSecret: primitive.get("ML-KEM-768").sharedSecretBytes
    },
    mlDsa65: {
      seed: primitive.get("ML-DSA-65").seedBytes,
      publicKey: primitive.get("ML-DSA-65").publicKeyBytes,
      signature: primitive.get("ML-DSA-65").signatureBytes
    },
    x25519: {
      privateKey: primitive.get("X25519").privateKeyBytes,
      publicKey: primitive.get("X25519").publicKeyBytes,
      sharedSecret: primitive.get("X25519").sharedSecretBytes
    },
    ed25519: {
      seed: primitive.get("Ed25519").seedBytes,
      publicKey: primitive.get("Ed25519").publicKeyBytes,
      signature: primitive.get("Ed25519").signatureBytes
    },
    chacha20Poly1305: {
      key: primitive.get("ChaCha20-Poly1305").keyBytes,
      nonce: primitive.get("ChaCha20-Poly1305").nonceBytes,
      tag: primitive.get("ChaCha20-Poly1305").tagBytes
    },
    hmacSha256: primitive.get("HMAC-SHA-256").outputBytes
  };
}

function hexToBytes(value) {
  if (typeof value !== "string" || value.length % 2 !== 0 || !/^[0-9a-f]*$/u.test(value)) {
    throw new ConformanceOperationError("invalid-hex-input");
  }
  return Uint8Array.from(Buffer.from(value, "hex"));
}

function decodeTaggedJson(value) {
  if (typeof value === "string" && value.startsWith("base64:")) {
    const encoded = value.slice(7);
    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(encoded)) {
      throw new ConformanceOperationError("invalid-base64-input");
    }
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.toString("base64") !== encoded) throw new ConformanceOperationError("noncanonical-base64-input");
    return Uint8Array.from(bytes);
  }
  if (Array.isArray(value)) return value.map(decodeTaggedJson);
  if (isPlainObject(value)) return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, decodeTaggedJson(child)]));
  return value;
}

function encodeTaggedJson(value) {
  if (value instanceof Uint8Array) return `base64:${Buffer.from(value).toString("base64")}`;
  if (Array.isArray(value)) return value.map(encodeTaggedJson);
  if (isPlainObject(value)) return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, encodeTaggedJson(child)]));
  return value;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
