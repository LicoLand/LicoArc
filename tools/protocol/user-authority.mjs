import { createHash } from "node:crypto";
import { encodeDeterministicCbor } from "./deterministic-cbor.mjs";

export const USER_IDENTITY_DOMAIN = "LICOARC-V1/USER-IDENTITY-REF\0";
export const USER_AUTHORITY_STATE_DOMAIN = "LICOARC-V1/USER-AUTHORITY-STATE\0";
export const USER_AUTHORITY_SIGNATURE_DOMAIN = "LICOARC-V1/USER-AUTHORITY-STATE/SIGN\0";
export const DEVICE_POSSESSION_DOMAIN = "LICOARC-V1/USER-AUTHORITY/DEVICE-POSSESSION\0";

export const USER_AUTHORITY_LIMITS = Object.freeze({
  MAX_AUTHORITY_BATCH_STATES: 64,
  MAX_AUTHORIZED_DEVICES: 16,
  MAX_SIGNING_KEYS_PER_PURPOSE: 2,
  MAX_SIGNATURES_PER_COMPOSITION: 2,
  MAX_AUTHORITY_EPOCH: Number.MAX_SAFE_INTEGER
});

const ED25519_PROFILE_ID = "176b912b9547ca9c47ace10f881457ab63fcd493ef953616f5859e76b830fd60";
const ML_DSA_65_PROFILE_ID = "427e788bb9aed076acc2fb5a94715d14e694ec5fbc846ac52c8c7e118a6b1b8f";
const REQUIRED_PROFILES = Object.freeze([ED25519_PROFILE_ID, ML_DSA_65_PROFILE_ID].sort());
const HEX_256 = /^[0-9a-f]{64}$/u;

export class UserAuthorityError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "UserAuthorityError";
    this.code = code;
  }
}

export function deriveUserIdentityRef({ managementSigningKeys, recoverySigningKeys }) {
  const management = validateKeyComposition(managementSigningKeys, "management");
  const recovery = validateKeyComposition(recoverySigningKeys, "recovery");
  return digest(USER_IDENTITY_DOMAIN, [projectKeys(management), projectKeys(recovery)]);
}

export function computeUserAuthorityStateDigest(state) {
  validateSnapshotShape(state, { verifyIdentity: false, requireAuthoritySignatures: false });
  return digest(USER_AUTHORITY_STATE_DOMAIN, authorityStateProjection(state));
}

export function authoritySignatureInput(state) {
  return domainInput(USER_AUTHORITY_SIGNATURE_DOMAIN,
    hexBytes(computeUserAuthorityStateDigest(state), "user-authority-state-digest"));
}

export function possessionProofInput(state, device) {
  validateDigest(state.protocolLineId, "protocol-line-id");
  validateDigest(state.userIdentityRef, "user-identity-ref");
  validateEpoch(state.authorityEpoch, true);
  validateDigest(device.endpointIdentityRef, "endpoint-identity-ref");
  validateDigest(device.identityStateDigest, "identity-state-digest");
  return domainInput(DEVICE_POSSESSION_DOMAIN, encodeDeterministicCbor([
    hexBytes(state.protocolLineId, "protocol-line-id"),
    hexBytes(state.userIdentityRef, "user-identity-ref"),
    state.authorityEpoch,
    hexBytes(device.endpointIdentityRef, "endpoint-identity-ref"),
    hexBytes(device.identityStateDigest, "identity-state-digest")
  ], cborLimits()));
}

export function replacementPossessionInput(state) {
  validateSnapshotShape(state, { verifyIdentity: false, requireAuthoritySignatures: false });
  return domainInput(DEVICE_POSSESSION_DOMAIN, encodeDeterministicCbor([
    "AuthorityKeyReplacementV1", hexBytes(state.protocolLineId, "protocol-line-id"),
    hexBytes(state.userIdentityRef, "user-identity-ref"), state.authorityEpoch,
    projectKeys(state.managementSigningKeys), projectKeys(state.recoverySigningKeys)
  ], cborLimits()));
}

/**
 * Validate one complete authority snapshot. The caller supplies the cryptographic
 * verifier and independently accepted Endpoint-state digests; this module never
 * treats fixture bytes or caller labels as signature evidence.
 */
export async function validateUserAuthorityState(state, {
  previousState = null,
  verifySignature,
  resolveEndpointState,
  expectedProtocolLineId = state?.protocolLineId
} = {}) {
  validateSnapshotShape(state, { verifyIdentity: true });
  if (state.protocolLineId !== expectedProtocolLineId) fail("authority-protocol-line-mismatch");
  if (typeof verifySignature !== "function") fail("authority-verifier-required");
  if (typeof resolveEndpointState !== "function") fail("endpoint-state-resolver-required");

  const management = validateKeyComposition(state.managementSigningKeys, "management");
  const recovery = validateKeyComposition(state.recoverySigningKeys, "recovery");
  const devices = validateDevices(state.authorizedDevices, state.authorityEpoch);
  const computedDigest = computeUserAuthorityStateDigest(state);

  if (previousState === null) {
    if (state.authorityEpoch !== 0 || state.authorityTransitionKind !== "genesis" ||
        state.previousUserAuthorityStateDigest !== undefined) fail("invalid-authority-genesis");
    if (state.userIdentityRef !== deriveUserIdentityRef(state)) fail("user-identity-ref-mismatch");
    await verifyComposition(state.authoritySignatures, management,
      authoritySignatureInput(state), "authority-genesis", verifySignature);
    await verifyNewDevicePossession(state, devices, new Map(), resolveEndpointState, verifySignature);
    return Object.freeze({ state: freezeSnapshot(state), digest: computedDigest, reason: "genesis" });
  }

  validateSnapshotShape(previousState, { verifyIdentity: true });
  const previousDigest = computeUserAuthorityStateDigest(previousState);
  if (state.userIdentityRef !== previousState.userIdentityRef) fail("user-identity-ref-mismatch");
  if (state.authorityEpoch <= previousState.authorityEpoch) fail("stale-authority-epoch");
  if (state.authorityEpoch !== previousState.authorityEpoch + 1) fail("authority-epoch-gap");
  if (state.previousUserAuthorityStateDigest !== previousDigest) fail("authority-parent-mismatch");
  if (state.authorityTransitionKind === "genesis") fail("invalid-authority-successor");

  const previousDevices = new Map(previousState.authorizedDevices.map((device) =>
    [device.endpointIdentityRef, device]));
  validateRosterTransition(previousDevices, devices, state.authorityEpoch);
  const signerKeys = state.authorityTransitionKind === "recovery"
    ? validateKeyComposition(previousState.recoverySigningKeys, "recovery")
    : validateKeyComposition(previousState.managementSigningKeys, "management");
  const purpose = state.authorityTransitionKind === "recovery"
    ? "authority-recovery" : "authority-management";
  await verifyComposition(state.authoritySignatures, signerKeys,
    authoritySignatureInput(state), purpose, verifySignature);
  await verifyNewDevicePossession(state, devices, previousDevices,
    resolveEndpointState, verifySignature);

  if (state.authorityTransitionKind === "management" &&
      !equalKeys(recovery, previousState.recoverySigningKeys)) {
    fail("management-recovery-authority-substitution");
  }
  if (state.authorityTransitionKind === "management" &&
      !equalKeys(management, previousState.managementSigningKeys)) {
    await verifyReplacementKeyPossession(state, previousState, verifySignature);
  }
  if (state.authorityTransitionKind === "recovery") {
    await verifyReplacementKeyPossession(state, previousState, verifySignature);
  }
  return Object.freeze({ state: freezeSnapshot(state), digest: computedDigest, reason: "successor" });
}

export async function applyUserAuthorityCatchUp(accepted, snapshots, options = {}) {
  if (!Array.isArray(snapshots) || snapshots.length < 1 ||
      snapshots.length > USER_AUTHORITY_LIMITS.MAX_AUTHORITY_BATCH_STATES) {
    fail("authority-batch-bound-exceeded");
  }
  let current = accepted?.state ?? accepted ?? null;
  let result = accepted ?? null;
  const siblings = new Map();
  for (const snapshot of snapshots) {
    const parent = snapshot.previousUserAuthorityStateDigest ?? "genesis";
    const digestValue = computeUserAuthorityStateDigest(snapshot);
    const priorSibling = siblings.get(parent);
    if (priorSibling && priorSibling !== digestValue) fail("authority-fork");
    siblings.set(parent, digestValue);
    result = await validateUserAuthorityState(snapshot, { ...options, previousState: current });
    current = result.state;
  }
  return result;
}

export async function admitProtectedAuthorityPayload({
  payload,
  expectedAuthorityStateDigest,
  expectedEndpointIdentityRef,
  expectedIdentityStateDigest,
  acceptedAuthority,
  protectedPayloadValidated,
  localPeerTrust,
  ...options
}) {
  if (protectedPayloadValidated !== true) fail("authority-payload-not-protected");
  const payloadDigest = computeUserAuthorityStateDigest(payload);
  const result = acceptedAuthority?.state && acceptedAuthority.digest === payloadDigest
    ? acceptedAuthority
    : await validateUserAuthorityState(payload, {
      ...options,
      previousState: acceptedAuthority?.state ?? acceptedAuthority ?? null
    });
  if (result.digest !== expectedAuthorityStateDigest) fail("authority-payload-digest-mismatch");
  const device = result.state.authorizedDevices.find((entry) =>
    entry.endpointIdentityRef === expectedEndpointIdentityRef && entry.deviceStatus === "active");
  if (!device || device.identityStateDigest !== expectedIdentityStateDigest) {
    fail("application-endpoint-not-authorized");
  }
  return Object.freeze({ ...result, applicationAdmitted: true, localPeerTrust });
}

export function validateAuthoritySessionBinding(binding) {
  if (!isPlainObject(binding) || !isPlainObject(binding.protectedAuthorityPayloadDigests)) {
    fail("authority-session-binding-missing");
  }
  for (const field of ["initiatorIdentityStateDigest", "initiatorUserAuthorityStateDigest",
    "responderIdentityStateDigest", "responderUserAuthorityStateDigest"]) {
    if (binding[field] === undefined) fail("authority-session-binding-missing");
    validateDigest(binding[field], field.replaceAll(/[A-Z]/gu, (match) => `-${match.toLowerCase()}`));
  }
  const { initiator, responder } = binding.protectedAuthorityPayloadDigests;
  if (initiator !== binding.initiatorUserAuthorityStateDigest ||
      responder !== binding.responderUserAuthorityStateDigest) {
    fail("authority-payload-digest-mismatch");
  }
  return Object.freeze({ valid: true });
}

/** Execute the compact synthetic conformance scenarios through the real validator. */
export async function executeUserAuthorityCase(input) {
  if (!isPlainObject(input)) fail("invalid-user-authority-operation");
  if (input.protectedPayloadValidated === false) {
    return admitProtectedAuthorityPayload(input);
  }
  if (input.scenario === "genesis-authority-signature-variant") {
    const state = conformanceGenesis();
    const variant = structuredClone(state);
    variant.authoritySignatures[0].signatureValue = "ff".repeat(64);
    return Object.freeze({
      equalDigest: computeUserAuthorityStateDigest(state) === computeUserAuthorityStateDigest(variant)
    });
  }
  if (input.scenario === "management-recovery-authority-substitution") {
    const genesis = conformanceGenesis();
    const accepted = await validateUserAuthorityState(genesis, conformanceOptions());
    const successor = conformanceSuccessor(genesis, "management");
    successor.recoverySigningKeys = conformanceKeys("recovery", 70);
    conformanceSignState(successor, genesis.managementSigningKeys, "authority-management");
    return validateUserAuthorityState(successor, {
      ...conformanceOptions(), previousState: accepted.state
    });
  }
  if (input.scenario === "equal-parent-unequal-valid-successors") {
    const genesis = conformanceGenesis();
    const accepted = await validateUserAuthorityState(genesis, conformanceOptions());
    const left = conformanceSuccessor(genesis, "management");
    const right = conformanceSuccessor(genesis, "management");
    right.authorizedDevices[0].deviceStatus = "revoked";
    right.authorizedDevices[0].revokedAuthorityEpoch = 1;
    conformanceSignState(right, genesis.managementSigningKeys, "authority-management");
    return applyUserAuthorityCatchUp(accepted, [left, right], conformanceOptions());
  }
  if (input.scenario === "cross-endpoint-possession-signer") {
    const genesis = conformanceGenesis();
    return validateUserAuthorityState(genesis, {
      ...conformanceOptions(),
      resolveEndpointState: async () => ({
        identityStateDigest: "cc".repeat(32),
        possessionSigningKeys: conformanceKeys("management", 90)
      })
    });
  }
  if (input.scenario === "unchanged-offline-device-successor") {
    const genesis = conformanceGenesis();
    const accepted = await validateUserAuthorityState(genesis, conformanceOptions());
    const successor = conformanceSuccessor(genesis, "management");
    const priorProof = JSON.stringify(genesis.authorizedDevices[0].possessionProof);
    const result = await validateUserAuthorityState(successor, {
      ...conformanceOptions(), previousState: accepted.state,
      resolveEndpointState: async () => { fail("unchanged-device-was-resolved"); }
    });
    return Object.freeze({
      accepted: result.reason === "successor",
      possessionProofPreserved: JSON.stringify(result.state.authorizedDevices[0].possessionProof) === priorProof
    });
  }
  if (input.scenario === "post-revocation-existing-session") {
    const genesis = conformanceGenesis();
    const accepted = await validateUserAuthorityState(genesis, conformanceOptions());
    const revoked = conformanceSuccessor(genesis, "management");
    revoked.authorizedDevices[0].deviceStatus = "revoked";
    revoked.authorizedDevices[0].revokedAuthorityEpoch = 1;
    conformanceSignState(revoked, genesis.managementSigningKeys, "authority-management");
    return admitProtectedAuthorityPayload({
      payload: revoked,
      acceptedAuthority: accepted,
      expectedAuthorityStateDigest: computeUserAuthorityStateDigest(revoked),
      expectedEndpointIdentityRef: "bb".repeat(32),
      expectedIdentityStateDigest: "cc".repeat(32),
      protectedPayloadValidated: true,
      ...conformanceOptions()
    });
  }
  if (input.accepted === null && Array.isArray(input.snapshots)) {
    return applyUserAuthorityCatchUp(input.accepted, input.snapshots, conformanceOptions());
  }
  fail("invalid-user-authority-operation");
}

function conformanceGenesis() {
  const managementSigningKeys = conformanceKeys("management", 10);
  const recoverySigningKeys = conformanceKeys("recovery", 20);
  const state = {
    recordType: "userAuthorityState",
    protocolLineId: "aa".repeat(32),
    userIdentityRef: deriveUserIdentityRef({ managementSigningKeys, recoverySigningKeys }),
    authorityEpoch: 0,
    authorityTransitionKind: "genesis",
    managementSigningKeys,
    recoverySigningKeys,
    authorizedDevices: [{
      endpointIdentityRef: "bb".repeat(32),
      identityStateDigest: "cc".repeat(32),
      deviceStatus: "active",
      admittedAuthorityEpoch: 0,
      possessionProof: []
    }],
    authoritySignatures: []
  };
  state.authorizedDevices[0].possessionProof = conformanceSignatures(
    conformanceKeys("management", 30), possessionProofInput(state, state.authorizedDevices[0]),
    "device-possession");
  conformanceSignState(state, managementSigningKeys, "authority-genesis");
  return state;
}

function conformanceSuccessor(previous, kind) {
  const state = structuredClone(previous);
  state.authorityEpoch += 1;
  state.previousUserAuthorityStateDigest = computeUserAuthorityStateDigest(previous);
  state.authorityTransitionKind = kind;
  conformanceSignState(state, kind === "recovery" ? previous.recoverySigningKeys :
    previous.managementSigningKeys, kind === "recovery" ? "authority-recovery" : "authority-management");
  return state;
}

function conformanceKeys(purpose, seed) {
  return [
    { keyId: seed.toString(16).padStart(2, "0").repeat(32), keyPurpose: purpose,
      keyProfileId: ED25519_PROFILE_ID, publicKey: (seed + 1).toString(16).padStart(2, "0").repeat(32) },
    { keyId: (seed + 2).toString(16).padStart(2, "0").repeat(32), keyPurpose: purpose,
      keyProfileId: ML_DSA_65_PROFILE_ID, publicKey: (seed + 3).toString(16).padStart(2, "0").repeat(1952) }
  ];
}

function conformanceSignState(state, keys, purpose) {
  state.authoritySignatures = [{}, {}];
  state.authoritySignatures = conformanceSignatures(keys, authoritySignatureInput(state), purpose);
}

function conformanceSignatures(keys, input, purpose) {
  return keys.map((key) => ({
    keyProfileId: key.keyProfileId,
    keyId: key.keyId,
    signaturePurpose: purpose,
    signatureValue: conformanceSignature(key.keyId, input,
      key.keyProfileId === ED25519_PROFILE_ID ? 64 : 3309)
  }));
}

function conformanceSignature(keyId, input, bytes) {
  const block = createHash("sha256").update(Buffer.from(keyId, "hex")).update(input).digest("hex");
  return block.repeat(Math.ceil(bytes * 2 / block.length)).slice(0, bytes * 2);
}

function conformanceOptions() {
  return {
    expectedProtocolLineId: "aa".repeat(32),
    resolveEndpointState: async (endpointIdentityRef) => endpointIdentityRef === "bb".repeat(32) ? {
      identityStateDigest: "cc".repeat(32),
      possessionSigningKeys: conformanceKeys("management", 30)
    } : null,
    verifySignature: async ({ signature, input }) => signature.signatureValue === conformanceSignature(
      signature.keyId, input, signature.keyProfileId === ED25519_PROFILE_ID ? 64 : 3309)
  };
}

function validateSnapshotShape(state, { verifyIdentity, requireAuthoritySignatures = true }) {
  if (!isPlainObject(state)) fail("invalid-user-authority-state");
  const allowed = new Set(["recordType", "protocolLineId", "userIdentityRef", "authorityEpoch",
    "previousUserAuthorityStateDigest", "authorityTransitionKind", "managementSigningKeys",
    "recoverySigningKeys", "authorizedDevices", "authoritySignatures", "possessionProof"]);
  if (Object.keys(state).some((key) => !allowed.has(key))) fail("unknown-authority-field");
  if (state.recordType !== "userAuthorityState") fail("invalid-authority-record-type");
  validateDigest(state.protocolLineId, "protocol-line-id");
  validateDigest(state.userIdentityRef, "user-identity-ref");
  validateEpoch(state.authorityEpoch, true);
  if (state.previousUserAuthorityStateDigest !== undefined) {
    validateDigest(state.previousUserAuthorityStateDigest, "authority-parent-digest");
  }
  if (!["genesis", "management", "recovery"].includes(state.authorityTransitionKind)) {
    fail("unknown-authority-transition");
  }
  validateKeyComposition(state.managementSigningKeys, "management");
  validateKeyComposition(state.recoverySigningKeys, "recovery");
  validateDevices(state.authorizedDevices, state.authorityEpoch);
  if (requireAuthoritySignatures &&
      (!Array.isArray(state.authoritySignatures) || state.authoritySignatures.length !== 2)) {
    fail("authority-signature-composition");
  }
  if (verifyIdentity && state.authorityEpoch === 0 &&
      state.userIdentityRef !== deriveUserIdentityRef(state)) fail("user-identity-ref-mismatch");
}

function validateKeyComposition(keys, purpose) {
  if (!Array.isArray(keys) || keys.length !== USER_AUTHORITY_LIMITS.MAX_SIGNING_KEYS_PER_PURPOSE) {
    fail(`${purpose}-key-composition`);
  }
  const ordered = [...keys].sort(keyOrder);
  if (!keys.every((key, index) => key === ordered[index])) fail(`${purpose}-keys-not-canonical`);
  const profiles = keys.map((key) => key.keyProfileId).sort();
  if (!equalArray(profiles, REQUIRED_PROFILES)) fail(`${purpose}-key-profile-downgrade`);
  const ids = new Set();
  for (const key of keys) {
    if (!isPlainObject(key) || Object.keys(key).some((name) =>
      !["keyId", "keyPurpose", "keyProfileId", "publicKey"].includes(name))) fail("invalid-signing-key");
    validateDigest(key.keyId, "key-id");
    if (key.keyPurpose !== purpose) fail(`${purpose}-key-purpose`);
    validateDigest(key.keyProfileId, "key-profile-id");
    const expectedLength = key.keyProfileId === ED25519_PROFILE_ID ? 64 : 3904;
    if (typeof key.publicKey !== "string" || key.publicKey.length !== expectedLength ||
        !/^[0-9a-f]+$/u.test(key.publicKey)) fail("invalid-public-key");
    if (ids.has(key.keyId)) fail("duplicate-signing-key");
    ids.add(key.keyId);
  }
  return keys;
}

function validateDevices(devices, authorityEpoch) {
  if (!Array.isArray(devices) || devices.length < 1 ||
      devices.length > USER_AUTHORITY_LIMITS.MAX_AUTHORIZED_DEVICES) fail("authorized-device-bound");
  const ordered = [...devices].sort(deviceOrder);
  if (!devices.every((device, index) => device === ordered[index])) fail("authorized-devices-not-canonical");
  const refs = new Set();
  for (const device of devices) {
    if (!isPlainObject(device) || Object.keys(device).some((name) => ![
      "endpointIdentityRef", "identityStateDigest", "deviceStatus", "admittedAuthorityEpoch",
      "revokedAuthorityEpoch", "possessionProof"
    ].includes(name))) fail("invalid-authorized-device");
    validateDigest(device.endpointIdentityRef, "endpoint-identity-ref");
    validateDigest(device.identityStateDigest, "identity-state-digest");
    if (refs.has(device.endpointIdentityRef)) fail("duplicate-authorized-device");
    refs.add(device.endpointIdentityRef);
    if (!["active", "revoked"].includes(device.deviceStatus)) fail("unknown-device-status");
    validateEpoch(device.admittedAuthorityEpoch, true);
    if (device.admittedAuthorityEpoch > authorityEpoch) fail("future-device-admission");
    if (device.deviceStatus === "active" && device.revokedAuthorityEpoch !== undefined) {
      fail("active-device-has-revocation");
    }
    if (device.deviceStatus === "revoked" &&
        (!Number.isSafeInteger(device.revokedAuthorityEpoch) ||
         device.revokedAuthorityEpoch < device.admittedAuthorityEpoch)) fail("invalid-device-revocation");
    if (device.revokedAuthorityEpoch > authorityEpoch) fail("future-device-revocation");
    if (!Array.isArray(device.possessionProof) || device.possessionProof.length !== 2) {
      fail("device-possession-composition");
    }
  }
  return devices;
}

function validateRosterTransition(previous, devices, epoch) {
  const next = new Map(devices.map((device) => [device.endpointIdentityRef, device]));
  for (const [ref, oldDevice] of previous) {
    const current = next.get(ref);
    if (!current) {
      if (oldDevice.deviceStatus === "active") fail("silent-device-removal");
      continue;
    }
    if (oldDevice.deviceStatus === "revoked" && !equalDevice(oldDevice, current)) {
      fail("revoked-device-rewritten");
    }
    if (oldDevice.deviceStatus === "active" && current.deviceStatus === "revoked") {
      if (current.revokedAuthorityEpoch !== epoch) fail("invalid-device-revocation");
      if (oldDevice.identityStateDigest !== current.identityStateDigest ||
          oldDevice.admittedAuthorityEpoch !== current.admittedAuthorityEpoch ||
          !equalSignatures(oldDevice.possessionProof, current.possessionProof)) {
        fail("device-admission-mutated");
      }
    }
    if (oldDevice.deviceStatus === "active" && current.deviceStatus === "active") {
      if (oldDevice.identityStateDigest === current.identityStateDigest &&
          (oldDevice.admittedAuthorityEpoch !== current.admittedAuthorityEpoch ||
           !equalSignatures(oldDevice.possessionProof, current.possessionProof))) {
        fail("device-admission-mutated");
      }
      if (oldDevice.identityStateDigest !== current.identityStateDigest &&
          current.admittedAuthorityEpoch !== epoch) fail("silent-device-state-change");
    }
  }
  for (const [ref, current] of next) {
    if (!previous.has(ref) &&
        (current.deviceStatus !== "active" || current.admittedAuthorityEpoch !== epoch)) {
      fail("invalid-device-admission-epoch");
    }
  }
}

async function verifyNewDevicePossession(state, devices, previous, resolveState, verifier) {
  for (const device of devices) {
    const old = previous.get(device.endpointIdentityRef);
    const changed = !old || old.identityStateDigest !== device.identityStateDigest;
    if (!changed) continue;
    if (!old && (device.deviceStatus !== "active" ||
        device.admittedAuthorityEpoch !== state.authorityEpoch)) {
      fail("invalid-device-admission-epoch");
    }
    const independentlyResolved = await resolveState(device.endpointIdentityRef);
    if (!isPlainObject(independentlyResolved) ||
        independentlyResolved.identityStateDigest !== device.identityStateDigest ||
        !Array.isArray(independentlyResolved.possessionSigningKeys) ||
        independentlyResolved.possessionSigningKeys.length !== 2) {
      fail("endpoint-state-digest-mismatch");
    }
    const resolvedKeys = new Map();
    for (const key of independentlyResolved.possessionSigningKeys) {
      if (!isPlainObject(key) || !HEX_256.test(key.keyId) || !HEX_256.test(key.keyProfileId) ||
          typeof key.publicKey !== "string" || resolvedKeys.has(key.keyId)) {
        fail("invalid-endpoint-possession-key-set");
      }
      resolvedKeys.set(key.keyId, key);
    }
    if (!equalArray([...resolvedKeys.values()].map(({ keyProfileId }) => keyProfileId).sort(),
      REQUIRED_PROFILES)) fail("endpoint-possession-key-downgrade");
    await verifySignatureList(device.possessionProof, possessionProofInput(state, device),
      "device-possession", verifier, resolvedKeys);
  }
}

async function verifyReplacementKeyPossession(state, previousState, verifier) {
  const proof = state.possessionProof;
  if (!isPlainObject(proof)) fail("replacement-key-possession-required");
  const allowed = ["managementSignatures", "recoverySignatures"];
  if (Object.keys(proof).some((key) => !allowed.includes(key))) fail("invalid-replacement-key-possession");
  const input = replacementPossessionInput(state);
  const managementChanged = !equalKeys(state.managementSigningKeys, previousState.managementSigningKeys);
  const recoveryChanged = !equalKeys(state.recoverySigningKeys, previousState.recoverySigningKeys);
  if (managementChanged) await verifyComposition(proof.managementSignatures,
    state.managementSigningKeys, input, "replacement-management-possession", verifier);
  else if (proof.managementSignatures !== undefined) fail("surplus-replacement-key-possession");
  if (recoveryChanged) await verifyComposition(proof.recoverySignatures,
    state.recoverySigningKeys, input, "replacement-recovery-possession", verifier);
  else if (proof.recoverySignatures !== undefined) fail("surplus-replacement-key-possession");
  if (!managementChanged && !recoveryChanged) fail("surplus-replacement-key-possession");
}

async function verifyComposition(signatures, keys, input, purpose, verifier) {
  if (!Array.isArray(signatures) || signatures.length !== 2) fail("authority-signature-composition");
  const byId = new Map(keys.map((key) => [key.keyId, key]));
  const profiles = [];
  for (const signature of signatures) {
    const key = byId.get(signature?.keyId);
    if (!key || signature.keyProfileId !== key.keyProfileId) fail("unauthorized-authority-signer");
    profiles.push(signature.keyProfileId);
  }
  if (!equalArray([...profiles].sort(), REQUIRED_PROFILES)) fail("authority-signature-downgrade");
  await verifySignatureList(signatures, input, purpose, verifier, byId);
}

async function verifySignatureList(signatures, input, purpose, verifier, suppliedKeys = null) {
  if (!Array.isArray(signatures) || signatures.length !== 2) fail("signature-composition");
  if (!equalArray(signatures.map((signature) => signature?.keyProfileId), REQUIRED_PROFILES)) {
    fail("signature-profile-composition");
  }
  const seen = new Set();
  for (const signature of signatures) {
    if (!isPlainObject(signature) || signature.signaturePurpose !== purpose || seen.has(signature.keyId)) {
      fail("invalid-signature-composition");
    }
    seen.add(signature.keyId);
    const key = suppliedKeys?.get(signature.keyId) ?? null;
    if (suppliedKeys !== null && key === null) fail("unauthorized-possession-signer");
    const valid = await verifier(Object.freeze({ signature, key, input: new Uint8Array(input), purpose }));
    if (valid !== true) fail("authority-signature-invalid");
  }
}

function authorityStateProjection(state) {
  return [
    "UserAuthorityStateV1", hexBytes(state.protocolLineId, "protocol-line-id"),
    hexBytes(state.userIdentityRef, "user-identity-ref"), state.authorityEpoch,
    state.previousUserAuthorityStateDigest === undefined ? null :
      hexBytes(state.previousUserAuthorityStateDigest, "authority-parent-digest"),
    state.authorityTransitionKind, projectKeys(state.managementSigningKeys),
    projectKeys(state.recoverySigningKeys), state.authorizedDevices.map(projectDevice),
    state.possessionProof ? projectReplacementProof(state.possessionProof) : null
  ];
}

function projectKeys(keys) {
  return keys.map((key) => [hexBytes(key.keyId, "key-id"), key.keyPurpose,
    hexBytes(key.keyProfileId, "key-profile-id"), Buffer.from(key.publicKey, "hex")]);
}

function projectDevice(device) {
  return [hexBytes(device.endpointIdentityRef, "endpoint-identity-ref"),
    hexBytes(device.identityStateDigest, "identity-state-digest"), device.deviceStatus,
    device.admittedAuthorityEpoch, device.revokedAuthorityEpoch ?? null,
    projectSignatures(device.possessionProof)];
}

function projectReplacementProof(proof) {
  return [proof.managementSignatures ? projectSignatures(proof.managementSignatures) : null,
    proof.recoverySignatures ? projectSignatures(proof.recoverySignatures) : null];
}

function projectSignatures(signatures) {
  return signatures.map((signature) => [hexBytes(signature.keyProfileId, "key-profile-id"),
    hexBytes(signature.keyId, "key-id"), signature.signaturePurpose,
    Buffer.from(signature.signatureValue, "hex")]);
}

function digest(domain, projection) {
  return createHash("sha256").update(domain, "utf8")
    .update(encodeDeterministicCbor(projection, cborLimits())).digest("hex");
}

function domainInput(domain, bytes) {
  return Buffer.concat([Buffer.from(domain, "utf8"), Buffer.from(bytes)]);
}

function cborLimits() {
  return { maxBytes: 262144, maxDepth: 16, maxArrayItems: 256,
    maxMapEntries: 64, maxRawBytes: 65536, maxTextBytes: 256 };
}

function validateDigest(value, label) {
  if (typeof value !== "string" || !HEX_256.test(value)) fail(`invalid-${label}`);
}

function validateEpoch(value, allowZero) {
  if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1) ||
      value > USER_AUTHORITY_LIMITS.MAX_AUTHORITY_EPOCH) fail("invalid-authority-epoch");
}

function hexBytes(value, label) {
  validateDigest(value, label);
  return Buffer.from(value, "hex");
}

function keyOrder(left, right) {
  return left.keyProfileId.localeCompare(right.keyProfileId) || left.keyId.localeCompare(right.keyId);
}

function deviceOrder(left, right) {
  return left.endpointIdentityRef.localeCompare(right.endpointIdentityRef) ||
    left.identityStateDigest.localeCompare(right.identityStateDigest);
}

function equalKeys(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function equalDevice(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function equalSignatures(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function equalArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function freezeSnapshot(state) {
  return deepFreeze(structuredClone(state));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function fail(code) {
  throw new UserAuthorityError(code);
}
