import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  ReliableConfirmationError,
  applyAttachmentConfirmation,
  applyGroupMemberConfirmation,
  applyReliableConfirmation,
  confirmationBinding,
  executeGroupMemberConfirmationCase,
  executeReliableConfirmationCase,
  validateClosedSchema,
  validateEndpointConfirmation
} from "../tools/protocol/index.mjs";

const id = (byte) => byte.toString(16).padStart(2, "0").repeat(16);
const digest = (byte) => byte.toString(16).padStart(2, "0").repeat(32);
const messageId = id(1);
const senderEndpointRef = digest(2);
const sessionId = id(3);
const resultDigest = digest(4);

const session = Object.freeze({
  sessionId,
  senderEndpointRef,
  expectedSenderEndpointRef: senderEndpointRef,
  authenticated: true,
  senderAuthorized: true
});

function confirmation(overrides = {}) {
  return {
    confirmationId: id(5),
    confirmedMessageIds: [messageId],
    confirmationStage: "endpointAccepted",
    confirmationOutcome: "succeeded",
    ...overrides
  };
}

function state(overrides = {}) {
  return {
    logicalMessageId: messageId,
    finalityState: "pending",
    transitionCount: 0,
    confirmations: {},
    localEffectAudit: [],
    ...overrides
  };
}

const throwsCode = (code) => (error) =>
  error instanceof ReliableConfirmationError && error.code === code;

test("confirmation schema keeps the frozen initial-v1 wire names", async () => {
  const schema = JSON.parse(await readFile(new URL("../spec/v1/reliable/confirmation.schema.json", import.meta.url)));
  assert.deepEqual(validateClosedSchema(confirmation(), schema), []);
  assert.equal(validateClosedSchema({
    confirmationId: id(5), confirmedMessageIds: [messageId], stage: "endpointAccepted", outcome: "succeeded"
  }, schema).length > 0, true);
  const completed = confirmation({
    confirmationStage: "effectCompleted",
    resultDigest
  });
  assert.deepEqual(validateClosedSchema(completed, schema), []);
  assert.equal(validateClosedSchema({ ...completed, resultDigest: undefined }, schema).length > 0, true);
});

test("only an authenticated confirmation from the exact authorized sending session advances", () => {
  const accepted = applyReliableConfirmation({ state: state(), confirmation: confirmation(), session });
  assert.equal(accepted.status, "advanced");
  assert.equal(accepted.state.finalityState, "accepted");
  assert.equal(accepted.state.transitionCount, 1);
  assert.equal(accepted.state.localEffectAudit.length, 1);

  for (const [mutatedSession, code] of [
    [{ ...session, authenticated: false }, "confirmation-unauthenticated"],
    [{ ...session, senderAuthorized: false }, "sender-unauthorized"],
    [{ ...session, senderEndpointRef: digest(9) }, "wrong-sender"]
  ]) {
    assert.throws(
      () => applyReliableConfirmation({ state: state(), confirmation: confirmation(), session: mutatedSession }),
      throwsCode(code)
    );
  }
});

test("binding covers message, sender, session, stage, outcome, failure, and result", () => {
  const base = confirmationBinding({ confirmation: confirmation(), senderEndpointRef, sessionId });
  const variants = [
    { confirmation: confirmation({ confirmedMessageIds: [id(6)] }), senderEndpointRef, sessionId },
    { confirmation: confirmation(), senderEndpointRef: digest(7), sessionId },
    { confirmation: confirmation(), senderEndpointRef, sessionId: id(8) },
    { confirmation: confirmation({ confirmationOutcome: "failed", failureCode: 1 }), senderEndpointRef, sessionId }
  ];
  for (const variant of variants) assert.notEqual(confirmationBinding(variant), base);
  const completed = confirmation({ confirmationStage: "effectCompleted", resultDigest });
  assert.notEqual(
    confirmationBinding({ confirmation: completed, senderEndpointRef, sessionId }),
    confirmationBinding({ confirmation: { ...completed, resultDigest: digest(10) }, senderEndpointRef, sessionId })
  );
});

test("exact replay is idempotent and changed reuse is rejected without mutation", () => {
  const first = applyReliableConfirmation({ state: state(), confirmation: confirmation(), session });
  const before = structuredClone(first.state);
  const replay = applyReliableConfirmation({ state: first.state, confirmation: confirmation(), session });
  assert.equal(replay.status, "duplicate");
  assert.deepEqual(replay.state, before);
  assert.throws(() => applyReliableConfirmation({
    state: first.state,
    confirmation: confirmation({ confirmationOutcome: "failed", failureCode: 1 }),
    session
  }), throwsCode("confirmation-conflict"));
  assert.deepEqual(first.state, before);
});

test("effect completion requires prior acceptance and the exact result digest", () => {
  const effect = confirmation({
    confirmationId: id(6),
    confirmationStage: "effectCompleted",
    resultDigest
  });
  assert.throws(
    () => applyReliableConfirmation({ state: state(), confirmation: effect, session, expectedResultDigest: resultDigest }),
    throwsCode("premature-effect-confirmation")
  );
  const accepted = applyReliableConfirmation({ state: state(), confirmation: confirmation(), session }).state;
  assert.throws(
    () => applyReliableConfirmation({ state: accepted, confirmation: effect, session, expectedResultDigest: digest(9) }),
    throwsCode("wrong-result-digest")
  );
  const completed = applyReliableConfirmation({ state: accepted, confirmation: effect, session, expectedResultDigest: resultDigest });
  assert.equal(completed.state.finalityState, "completed");
  assert.equal(completed.state.resultDigest, resultDigest);
});

test("missing and Station-only input never advance endpoint finality", () => {
  const before = state();
  assert.throws(
    () => applyReliableConfirmation({ state: before, confirmation: undefined, session }),
    throwsCode("invalid-confirmation")
  );
  assert.deepEqual(before, state());
  assert.equal(before.finalityState, "pending");
  assert.equal(Object.hasOwn(before, "stationOutcome"), false);
});

test("attachment completion requires authenticated chunks, content integrity, and confirmation", () => {
  const attachment = state({
    completeAuthenticatedChunks: true,
    declaredContentDigest: digest(11),
    authenticatedContentDigest: digest(11)
  });
  assert.equal(applyAttachmentConfirmation({ state: attachment, confirmation: confirmation(), session }).state.finalityState, "accepted");
  assert.throws(() => applyAttachmentConfirmation({
    state: { ...attachment, completeAuthenticatedChunks: false }, confirmation: confirmation(), session
  }), throwsCode("attachment-chunks-incomplete"));
  assert.throws(() => applyAttachmentConfirmation({
    state: { ...attachment, authenticatedContentDigest: digest(12) }, confirmation: confirmation(), session
  }), throwsCode("attachment-content-digest-mismatch"));
});

test("group projections accept endpoint-confirmation or remain pending with none", () => {
  const pending = applyGroupMemberConfirmation({
    result: { projectionId: messageId, authority: "none", outcome: "pending" },
    confirmation: undefined,
    session
  });
  assert.equal(pending.status, "pending");
  const confirmed = applyGroupMemberConfirmation({
    result: { projectionId: messageId, authority: "endpoint-confirmation", outcome: "pending" },
    confirmation: confirmation(),
    session
  });
  assert.equal(confirmed.result.finalityState, "accepted");
  assert.throws(() => applyGroupMemberConfirmation({
    result: { projectionId: messageId, authority: "station", outcome: "delivered" },
    confirmation: confirmation(),
    session
  }), throwsCode("invalid-group-authority"));
});

test("confirmation records are closed, sorted, bounded, and outcome-consistent", () => {
  assert.throws(() => validateEndpointConfirmation({ ...confirmation(), extra: true }), throwsCode("unknown-confirmation-field"));
  assert.throws(() => validateEndpointConfirmation(confirmation({ confirmedMessageIds: [id(2), id(1)] })), throwsCode("non-canonical-confirmed-message-ids"));
  assert.throws(() => validateEndpointConfirmation(confirmation({ confirmedMessageIds: [id(1), id(1)] })), throwsCode("duplicate-confirmed-message-id"));
  assert.doesNotThrow(() => validateEndpointConfirmation(confirmation({ confirmationOutcome: "failed" })));
  assert.throws(() => validateEndpointConfirmation(confirmation({ resultDigest })), throwsCode("unexpected-result-digest"));
});

test("new reliable and group conformance operations execute every behavioral case", async () => {
  const corpora = [
    ["../conformance/v1/reliable/cases.json", "licoarc.reliable.apply-endpoint-confirmation.v1", executeReliableConfirmationCase],
    ["../conformance/v1/group/cases.json", "licoarc.group.apply-member-confirmation.v1", executeGroupMemberConfirmationCase]
  ];
  for (const [relativePath, operationId, execute] of corpora) {
    const corpus = JSON.parse(await readFile(new URL(relativePath, import.meta.url)));
    const cases = corpus.cases.filter((case_) => case_.target.operationId === operationId);
    assert.equal(cases.length > 0, true);
    for (const case_ of cases) {
      let actual;
      try {
        actual = { result: execute(structuredClone(case_.input)) };
      } catch (error) {
        actual = { error: { code: error.code } };
      }
      assert.deepEqual(actual, case_.expected, case_.id);
    }
  }
});
