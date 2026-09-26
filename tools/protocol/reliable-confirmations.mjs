import { createHash } from "node:crypto";
import { canonicalizeRestrictedJson } from "./canonical-json.mjs";

const HEX_ID = /^[0-9a-f]{32}$/u;
const HEX_DIGEST = /^[0-9a-f]{64}$/u;
const STAGES = new Set(["endpointAccepted", "effectCompleted"]);
const OUTCOMES = new Set(["succeeded", "rejected", "failed"]);
const GROUP_AUTHORITIES = new Set(["endpoint-confirmation", "none"]);
const MAX_CONFIRMATION_IDS = 32;
const MAX_FAILURE_CODE = 13;

export class ReliableConfirmationError extends TypeError {
  constructor(code, message = code) {
    super(message);
    this.name = "ReliableConfirmationError";
    this.code = code;
  }
}

export function validateEndpointConfirmation(confirmation) {
  assertPlainObject(confirmation, "invalid-confirmation");
  assertExactKeys(confirmation, [
    "confirmationId", "confirmationStage", "confirmationOutcome",
    "confirmedMessageIds", "failureCode", "resultDigest"
  ]);
  assertHex(confirmation.confirmationId, HEX_ID, "invalid-confirmation-id");
  if (!STAGES.has(confirmation.confirmationStage)) throw new ReliableConfirmationError("invalid-confirmation-stage");
  if (!OUTCOMES.has(confirmation.confirmationOutcome)) throw new ReliableConfirmationError("invalid-confirmation-outcome");
  if (!Array.isArray(confirmation.confirmedMessageIds) ||
      confirmation.confirmedMessageIds.length === 0 ||
      confirmation.confirmedMessageIds.length > MAX_CONFIRMATION_IDS) {
    throw new ReliableConfirmationError("invalid-confirmed-message-ids");
  }
  for (let index = 0; index < confirmation.confirmedMessageIds.length; index += 1) {
    const messageId = confirmation.confirmedMessageIds[index];
    assertHex(messageId, HEX_ID, "invalid-confirmed-message-id");
    if (index > 0 && confirmation.confirmedMessageIds[index - 1] >= messageId) {
      throw new ReliableConfirmationError(
        confirmation.confirmedMessageIds[index - 1] === messageId
          ? "duplicate-confirmed-message-id"
          : "non-canonical-confirmed-message-ids"
      );
    }
  }
  const succeeded = confirmation.confirmationOutcome === "succeeded";
  if (confirmation.failureCode !== undefined) {
    if (!Number.isSafeInteger(confirmation.failureCode) ||
        confirmation.failureCode < 0 || confirmation.failureCode > MAX_FAILURE_CODE) {
      throw new ReliableConfirmationError("invalid-failure-code");
    }
    if (succeeded) throw new ReliableConfirmationError("unexpected-failure-code");
  }
  if (confirmation.resultDigest !== undefined) {
    assertHex(confirmation.resultDigest, HEX_DIGEST, "invalid-result-digest");
  }
  if (confirmation.confirmationStage === "effectCompleted") {
    if (succeeded && confirmation.resultDigest === undefined) {
      throw new ReliableConfirmationError("missing-result-digest");
    }
  } else if (confirmation.resultDigest !== undefined) {
    throw new ReliableConfirmationError("unexpected-result-digest");
  }
  return confirmation;
}

/** Stable facts exclude the session used to authenticate a particular delivery. */
export function confirmationBinding({ confirmation, senderEndpointRef, sessionId }) {
  validateEndpointConfirmation(confirmation);
  assertHex(senderEndpointRef, HEX_DIGEST, "invalid-sender-endpoint-ref");
  if (sessionId !== undefined) assertHex(sessionId, HEX_ID, "invalid-session-id");
  const { confirmationId: _id, ...meaning } = confirmation;
  return createHash("sha256").update("LICOARC-RELIABLE-CONFIRMATION-V1\0", "ascii")
    .update(canonicalizeRestrictedJson({ ...meaning, senderEndpointRef }), "utf8").digest("hex");
}

/** V1 identifiers are content-derived; an unlimited cache of random receipt ids is unnecessary. */
export function createEndpointConfirmation(meaning, senderEndpointRef) {
  const confirmation = { ...meaning, confirmationId: "0".repeat(32) };
  confirmation.confirmationId = confirmationBinding({ confirmation, senderEndpointRef }).slice(0, 32);
  return confirmation;
}

function semanticFact(confirmation, senderEndpointRef, logicalMessageId) {
  return { logicalMessageId, senderEndpointRef, stage: confirmation.confirmationStage,
    outcome: confirmation.confirmationOutcome, failureCode: confirmation.failureCode ?? null,
    resultDigest: confirmation.resultDigest ?? null };
}
function factDigest(fact) {
  return createHash("sha256").update("LICOARC-RELIABLE-FACT-V1\0", "ascii")
    .update(canonicalizeRestrictedJson(fact), "utf8").digest("hex");
}

export function applyReliableConfirmation({ state, confirmation, session, expectedResultDigest = undefined }) {
  assertPlainObject(state, "invalid-state"); validateSession(session);
  validateEndpointConfirmation(confirmation);
  assertHex(state.logicalMessageId, HEX_ID, "invalid-message-id");
  if (!confirmation.confirmedMessageIds.includes(state.logicalMessageId))
    throw new ReliableConfirmationError("message-not-confirmed");
  if (session.expectedSenderEndpointRef !== session.senderEndpointRef)
    throw new ReliableConfirmationError("wrong-sender");
  if (!session.authenticated) throw new ReliableConfirmationError("confirmation-unauthenticated");
  if (!session.senderAuthorized) throw new ReliableConfirmationError("sender-unauthorized");
  const binding = confirmationBinding({ confirmation, senderEndpointRef: session.senderEndpointRef });
  if (confirmation.confirmationId !== binding.slice(0, 32))
    throw new ReliableConfirmationError("confirmation-id-mismatch");
  if (expectedResultDigest !== undefined) {
    assertHex(expectedResultDigest, HEX_DIGEST, "invalid-expected-result-digest");
    if (confirmation.confirmationStage === "effectCompleted" && confirmation.confirmationOutcome === "succeeded" &&
        confirmation.resultDigest !== expectedResultDigest) throw new ReliableConfirmationError("wrong-result-digest");
  }
  const fact = semanticFact(confirmation, session.senderEndpointRef, state.logicalMessageId);
  const digest = factDigest(fact);
  const priorFacts = state.facts ?? {};
  if (Object.hasOwn(priorFacts, digest)) {
    // Missing result content can be independently verified later without replaying execution.
    if (expectedResultDigest !== undefined && state.resultVerified !== true &&
        fact.stage === "effectCompleted" && fact.outcome === "succeeded" &&
        state.resultDigest === fact.resultDigest && state.evidenceConflict !== true)
      return { status: "advanced", state: { ...structuredClone(state), resultVerified: true } };
    return { status: "duplicate", state };
  }
  // At most two distinct facts per stage are sufficient to prove inconsistency.
  // Canonical selection makes the retained evidence independent of arrival order.
  const all = { ...priorFacts, [digest]: fact };
  const facts = {};
  for (const stage of STAGES) for (const id of Object.keys(all).filter(k => all[k].stage === stage).sort().slice(0, 2))
    facts[id] = all[id];
  const next = structuredClone(state); next.facts = facts;
  const acceptance = Object.values(facts).filter(f => f.stage === "endpointAccepted");
  const effects = Object.values(facts).filter(f => f.stage === "effectCompleted");
  const conflict = acceptance.length > 1 || effects.length > 1 ||
    (effects.length > 0 && acceptance.some(f => f.outcome !== "succeeded"));
  // Confirmation ids derive from immutable meaning, so no unbounded per-id guard map is needed.
  next.confirmations = {};
  next.transitionCount = Object.keys(facts).length;
  next.localEffectAudit = Object.keys(facts).sort().map(k => ({ factDigest: k, ...facts[k] }));
  next.lastConfirmationBinding = binding;
  next.evidenceConflict = conflict;
  if (conflict) next.finalityState = "evidence-conflict";
  else if (effects.length) {
    next.finalityState = effects[0].outcome === "succeeded" ? "completed" : effects[0].outcome;
    if (effects[0].resultDigest !== null) next.resultDigest = effects[0].resultDigest;
    next.resultVerified = expectedResultDigest !== undefined || next.resultVerified === true;
  } else if (acceptance.length) next.finalityState = acceptance[0].outcome === "succeeded" ? "accepted" : acceptance[0].outcome;
  // Cancellation intent / transport uncertainty are preserved fields, not evidence to erase.
  return { status: conflict ? "conflict" : "advanced", state: next };
}

export function applyAttachmentConfirmation({ state, confirmation, session, expectedResultDigest }) {
  assertPlainObject(state, "invalid-attachment-state");
  if (state.completeAuthenticatedChunks !== true) throw new ReliableConfirmationError("attachment-chunks-incomplete");
  assertHex(state.declaredContentDigest, HEX_DIGEST, "invalid-attachment-content-digest");
  if (state.authenticatedContentDigest !== state.declaredContentDigest) {
    throw new ReliableConfirmationError("attachment-content-digest-mismatch");
  }
  return applyReliableConfirmation({ state, confirmation, session, expectedResultDigest });
}

export function applyGroupMemberConfirmation({ result, confirmation, session, expectedResultDigest = undefined }) {
  assertPlainObject(result, "invalid-group-result");
  if (!GROUP_AUTHORITIES.has(result.authority)) throw new ReliableConfirmationError("invalid-group-authority");
  if (result.authority === "none") return { status: "pending", result };
  const reduced = applyReliableConfirmation({
    state: {
      logicalMessageId: result.projectionId,
      finalityState: result.finalityState ?? "pending",
      confirmations: result.confirmations ?? {},
      transitionCount: result.transitionCount ?? 0,
      localEffectAudit: result.localEffectAudit ?? [],
      facts: result.facts ?? {}
    },
    confirmation,
    session,
    expectedResultDigest
  });
  return {
    status: reduced.status,
    result: {
      ...result,
      finalityState: reduced.state.finalityState,
      confirmations: reduced.state.confirmations,
      transitionCount: reduced.state.transitionCount,
      localEffectAudit: reduced.state.localEffectAudit,
      facts: reduced.state.facts,
      evidenceConflict: reduced.state.evidenceConflict,
      ...(reduced.state.resultDigest === undefined ? {} : { resultDigest: reduced.state.resultDigest })
    }
  };
}

export function executeReliableConfirmationCase(input) {
  assertPlainObject(input, "invalid-confirmation-operation");
  const apply = input.kind === "attachment" ? applyAttachmentConfirmation : applyReliableConfirmation;
  if (input.kind !== "message" && input.kind !== "attachment") {
    throw new ReliableConfirmationError("invalid-confirmation-operation");
  }
  const reduced = apply({
    state: input.state,
    confirmation: input.confirmation,
    session: input.session,
    expectedResultDigest: input.expectedResultDigest
  });
  return {
    status: reduced.status,
    finalityState: reduced.state.finalityState,
    stateMutation: reduced.status === "advanced" || reduced.status === "conflict"
  };
}

export function executeGroupMemberConfirmationCase(input) {
  assertPlainObject(input, "invalid-group-confirmation-operation");
  const reduced = applyGroupMemberConfirmation(input);
  return {
    status: reduced.status,
    finalityState: reduced.result.finalityState ?? "pending",
    stateMutation: reduced.status === "advanced" || reduced.status === "conflict"
  };
}

function validateSession(session) {
  assertPlainObject(session, "invalid-session");
  assertHex(session.sessionId, HEX_ID, "invalid-session-id");
  assertHex(session.senderEndpointRef, HEX_DIGEST, "invalid-sender-endpoint-ref");
  assertHex(session.expectedSenderEndpointRef, HEX_DIGEST, "invalid-expected-sender-endpoint-ref");
  if (typeof session.authenticated !== "boolean" || typeof session.senderAuthorized !== "boolean") {
    throw new ReliableConfirmationError("invalid-session-authority");
  }
}

function assertPlainObject(value, code) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ReliableConfirmationError(code);
  }
}

function assertExactKeys(value, allowedKeys) {
  const allowed = new Set(allowedKeys);
  if (Object.keys(value).some((key) => !allowed.has(key))) {
    throw new ReliableConfirmationError("unknown-confirmation-field");
  }
}

function assertHex(value, pattern, code) {
  if (typeof value !== "string" || !pattern.test(value)) throw new ReliableConfirmationError(code);
}
