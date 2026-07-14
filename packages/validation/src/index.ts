import { z } from "zod";
import type { ConditionGroup, FieldAvailability, MarketCondition } from "@tutela/types";

export const conditionValueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bool"), value: z.boolean() }),
  z.object({ kind: z.literal("u16"), value: z.number().int().min(0).max(200) }),
  z.object({ kind: z.literal("team"), value: z.string().min(1).max(16) }),
  z.object({ kind: z.literal("player"), value: z.string().min(1).max(64) })
]);

export const marketConditionSchema = z.object({
  field: z.enum([
    "MatchWinner",
    "TotalGoals",
    "TeamGoals",
    "PlayerGoals",
    "TotalCorners",
    "TeamCorners",
    "TotalCards",
    "TeamCards",
    "BothTeamsScore",
    "FirstGoal",
    "CleanSheet",
    "DoubleChance"
  ]),
  operator: z.enum(["Eq", "Neq", "Gt", "Gte", "Lt", "Lte", "IsTrue", "IsFalse"]),
  scope: z.enum(["FullTime", "RegulationTime", "Team", "Player", "Match"]),
  value: conditionValueSchema,
  teamId: z.string().min(1).max(64).optional(),
  playerId: z.string().min(1).max(64).optional()
});

export const conditionGroupSchema = z.object({
  operator: z.enum(["AND", "OR"]),
  conditions: z.array(marketConditionSchema).min(1).max(5)
});

export function validateConditionGroup(group: ConditionGroup, availability?: FieldAvailability): string[] {
  const parsed = conditionGroupSchema.safeParse(group);
  if (!parsed.success) return parsed.error.issues.map((issue) => issue.message);
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const condition of group.conditions) {
    const key = `${condition.field}:${condition.operator}:${condition.scope}:${condition.teamId ?? ""}:${condition.playerId ?? ""}`;
    if (seen.has(key)) errors.push("Duplicate field/operator/scope combinations are not allowed.");
    seen.add(key);
    errors.push(...validateCondition(condition));
    if (availability && !availability.supportedFields.includes(condition.field)) {
      errors.push(`${condition.field} is unavailable for this match.`);
    }
  }
  if (group.operator === "AND") {
    errors.push(...findContradictions(group.conditions));
  }
  return [...new Set(errors)];
}

function validateCondition(condition: MarketCondition): string[] {
  const errors: string[] = [];
  const numeric = ["TotalGoals", "TeamGoals", "PlayerGoals", "TotalCorners", "TeamCorners", "TotalCards", "TeamCards"];
  const bool = ["BothTeamsScore", "CleanSheet"];
  const teamScoped = ["TeamGoals", "TeamCorners", "TeamCards", "CleanSheet"];
  const playerScoped = ["PlayerGoals"];
  if (numeric.includes(condition.field) && condition.value.kind !== "u16") errors.push(`${condition.field} requires a numeric value.`);
  if (bool.includes(condition.field) && condition.value.kind !== "bool") errors.push(`${condition.field} requires a boolean value.`);
  if (bool.includes(condition.field) && !["IsTrue", "IsFalse", "Eq", "Neq"].includes(condition.operator)) {
    errors.push(`${condition.operator} is unsupported for boolean fields.`);
  }
  if (teamScoped.includes(condition.field) && !condition.teamId) errors.push(`${condition.field} requires a team scope.`);
  if (playerScoped.includes(condition.field) && !condition.playerId) errors.push(`${condition.field} requires a player scope.`);
  if (["IsTrue", "IsFalse"].includes(condition.operator) && condition.value.kind !== "bool") {
    errors.push(`${condition.operator} requires a boolean value.`);
  }
  return errors;
}

function findContradictions(conditions: MarketCondition[]): string[] {
  const equals = new Map<string, string | number | boolean>();
  const errors: string[] = [];
  for (const condition of conditions) {
    if (condition.operator !== "Eq") continue;
    const key = `${condition.field}:${condition.scope}:${condition.teamId ?? ""}:${condition.playerId ?? ""}`;
    const value = condition.value.value;
    if (equals.has(key) && equals.get(key) !== value) {
      errors.push("Contradictory AND conditions were detected.");
    }
    equals.set(key, value);
  }
  return errors;
}
