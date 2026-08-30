import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const recordsRoot = path.join(repositoryRoot, "docs/field-decisions/fields");
const fieldWorkspace = path.join(repositoryRoot, "docs/field-decisions/README.md");
const registryPath = path.join(repositoryRoot, "spec/FIELD-REGISTRY.md");
const statusPath = path.join(repositoryRoot, "docs/STATUS.md");
const groupAlgorithmPath = path.join(
  repositoryRoot,
  "docs/algorithm-decisions/group-state-evolution.md"
);

const groupRecords = [
  {
    name: "group-id.md",
    status: "DECIDED",
    registryId: "group-state.group-id",
    field: "groupId",
    type: "DIGEST256",
    presence: "M",
    active: true
  },
  {
    name: "group-epoch.md",
    status: "DECIDED",
    registryId: "group-state.epoch",
    field: "groupEpoch",
    type: "uint64",
    presence: "M",
    active: true
  },
  {
    name: "previous-group-state-digest.md",
    status: "DECIDED",
    registryId: "group-state.previous-digest",
    field: "previousGroupStateDigest",
    type: "DIGEST256",
    presence: "C",
    active: true
  },
  {
    name: "group-members.md",
    status: "DECIDED",
    registryId: "group-state.members",
    field: "members",
    type: "GroupMember[1..MAX_GROUP_MEMBERS]",
    presence: "M",
    active: true
  },
  {
    name: "group-member-role.md",
    status: "DECIDED",
    registryId: "group-member.role",
    field: "role",
    type: "member \\| state-authority",
    presence: "M",
    active: true
  },
  {
    name: "group-message-context.md",
    status: "DECIDED",
    registryId: "group-message.state-digest",
    field: "groupStateDigest",
    type: "DIGEST256",
    presence: "M",
    active: true
  },
  {
    name: "endpoint-association-claim.md",
    status: "REJECTED",
    registryId: "Dedicated Endpoint Association Claim field",
    field: "message.payload",
    active: false
  }
];

test("all seven Group field questions close independently", async () => {
  const algorithm = await readFile(groupAlgorithmPath, "utf8");
  assert.match(algorithm, /\| Decision status \| `DECIDED` \|/);
  assert.match(algorithm, /\| Definition status \| `SPECIFIED` \|/);

  for (const expected of groupRecords) {
    const record = await readFile(path.join(recordsRoot, expected.name), "utf8");
    assert.match(record, /^\| Decision track \| `MESSAGE-FIELD` \|$/m);
    assert.match(
      record,
      new RegExp(
        "^\\| Decision ID \\| `FLD-" +
          expected.name.replace(/\.md$/, "") +
          "` \\|$",
        "m"
      )
    );
    assert.match(
      record,
      new RegExp("^\\| Decision status \\| `" + expected.status + "` \\|$", "m")
    );
    assert.match(
      record,
      new RegExp(
        "^\\| Definition status \\| `" +
          (expected.active ? "SPECIFIED" : "NOT-SPECIFIED") +
          "` \\|$",
        "m"
      )
    );
    for (const heading of [
      "Role in communication",
      "Contribution to LicoArc's final vision",
      "Field model and trade-offs",
      "Necessity proof",
      "Visibility and trust",
      "Alternatives",
      "Decision history",
      "Definition evidence"
    ]) {
      assert.match(record, new RegExp(`^## ${heading}$`, "m"), `${expected.name} must close ${heading}`);
    }
    assert.match(record, /\.\.\/\.\.\/\.\.\/spec\/FIELD-REGISTRY\.md/);
  }
});

test("the Canonical Field Registry contains the smallest protected Group state", async () => {
  const registry = await readFile(registryPath, "utf8");
  const activeSection = registry
    .split("## Active fields\n", 2)[1]
    .split("## Excluded, replaced, and profile-owned values\n", 1)[0];
  const excludedSection = registry
    .split("## Excluded, replaced, and profile-owned values\n", 2)[1]
    .split("## Authority boundaries\n", 1)[0];

  for (const expected of groupRecords.filter((item) => item.active)) {
    const row = activeSection
      .split("\n")
      .find((line) => line.startsWith("| `" + expected.registryId + "` |"));
    assert.ok(row, `${expected.registryId} must be active exactly once`);
    assert.equal(
      activeSection.split("| `" + expected.registryId + "` |").length - 1,
      1,
      `${expected.registryId} must occur once in the active registry`
    );
    assert.match(
      row,
      new RegExp("\\| `" + escapeRegExp(expected.field) + "` \\|")
    );
    assert.match(
      row,
      new RegExp("\\| `" + escapeRegExp(expected.type) + "` \\|")
    );
    assert.match(row, new RegExp("\\| " + expected.presence + " \\|"));
    assert.match(row, /Peer Endpoints|Member Endpoints/);
    assert.match(row, /fields\/[a-z0-9-]+\.md\) \|$/);
  }

  assert.match(activeSection, /`group-state\.members`[\s\S]*MAX_GROUP_MEMBERS = 64/);
  assert.match(activeSection, /`member \\| state-authority`/);
  assert.match(activeSection, /`group-message\.state-digest`[\s\S]*`groupStateDigest`/);
  assert.doesNotMatch(activeSection, /Association Claim/);

  const rejected = groupRecords.find((item) => !item.active);
  assert.match(
    excludedSection,
    new RegExp(
      String.raw`\| ${escapeRegExp(rejected.registryId)} \| Rejected \|[\s\S]*message\.payload`
    )
  );
  assert.doesNotMatch(activeSection, /association-claim|associationClaim/i);
  assert.match(registry, /Group Membership State is a protected versioned object, not a fourth core/);
  assert.match(registry, /A dedicated Endpoint Association Claim is not a common field/);
  assert.match(registry, /`groupStateDigest` as its sole Group\s+context/);
});

test("Group field inventory is closed and the Candidate Group schema is admitted", async () => {
  const index = await readFile(fieldWorkspace, "utf8");
  const status = await readFile(statusPath, "utf8");
  const [groupRegistry, groupBounds] = await Promise.all([
    readFile(path.join(repositoryRoot, "spec/v1/group/registry.json"), "utf8").then(JSON.parse),
    readFile(path.join(repositoryRoot, "spec/v1/group/bounds.json"), "utf8").then(JSON.parse)
  ]);

  for (const expected of groupRecords) {
    const link = `](fields/${expected.name})`;
    assert.equal(
      index.split(link).length - 1,
      1,
      `${expected.name} must appear exactly once in the field workspace inventory`
    );
  }
  assert.match(index, /^## Closed Group field-decision inventory$/m);
  assert.match(index, /No Group field proposal remains open/);
  assert.doesNotMatch(index, /\| Decision status \| `OPEN` \|/);

  assert.match(status, /\| Lifecycle \| `Candidate` \|/);
  assert.match(status, /\| Definition status \| `COMPLETE` \|/);
  assert.match(
    status,
    /\| Mandatory capability closure \| 9 of 9 `COMPLETE` \|/
  );
  assert.match(status, /The nine capabilities are[\s\S]*Group Collaboration/);
  assert.equal(groupRegistry.lifecycle, "Candidate");
  assert.equal(groupRegistry.capabilityId, "licoarc.group-collaboration.v1");
  assert.equal(groupBounds.bounds.MAX_GROUP_EPOCH, Number.MAX_SAFE_INTEGER);
  assert.equal(groupRegistry.stateIdentity.genesisEpoch, 0);
  assert.equal(groupRegistry.stateIdentity.successorRule,
    "exactly-predecessor-epoch-plus-one");

  await assert.doesNotReject(() => access(path.join(repositoryRoot, "spec/v1/group")));
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
