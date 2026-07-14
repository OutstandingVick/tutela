import { describe, it } from "node:test";
import assert from "node:assert";

describe("tutela anchor smoke", () => {
  it("documents required local validator flow", () => {
    assert.equal(process.env.ANCHOR_PROVIDER_URL ?? "localnet", "localnet");
  });
});
