import { describe, expect, it } from "vitest";
import { conditionHash, evaluateConditionGroup } from "../../packages/condition-engine/src";
import type { ConditionGroup } from "../../packages/types/src";

const sampleGroup: ConditionGroup = {
  operator: "AND",
  conditions: [
    { field: "TotalGoals", operator: "Gte", scope: "FullTime", value: { kind: "u16", value: 2 } },
    { field: "BothTeamsScore", operator: "IsTrue", scope: "Match", value: { kind: "bool", value: true } }
  ]
};

describe("condition engine", () => {
  it("hashes deterministically and evaluates a settled match", () => {
    expect(conditionHash(sampleGroup)).toHaveLength(64);
    expect(evaluateConditionGroup(sampleGroup, {
      winner: "HOME",
      homeGoals: 2,
      awayGoals: 1,
      totalGoals: 3,
      homeCorners: 6,
      awayCorners: 4,
      totalCorners: 10,
      homeCards: 2,
      awayCards: 3,
      totalCards: 5,
      bothTeamsScore: true,
      firstGoal: "AWAY",
      homeCleanSheet: false,
      awayCleanSheet: false
    })).toBe(true);
  });
});
