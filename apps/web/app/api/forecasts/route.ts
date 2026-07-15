import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { conditionHash } from "@tutela/condition-engine";
import { validateConditionGroup } from "@tutela/validation";
import type { ConditionGroup } from "@tutela/types";
import { isAuthError, requireAuthenticatedUser } from "@/lib/server/auth";
import { createParticipation, ForecastStoreError } from "@/lib/server/forecast-store";

const valueSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("u16"), value: z.number().int().min(0).max(65_535) }),
  z.object({ kind: z.literal("bool"), value: z.boolean() }),
  z.object({ kind: z.literal("team"), value: z.string().min(1).max(80) }),
  z.object({ kind: z.literal("player"), value: z.string().min(1).max(120) })
]);

const bodySchema = z.object({
  idempotencyKey: z.string().uuid(),
  matchId: z.string().min(1).max(160),
  matchTitle: z.string().min(1).max(180),
  kickoffAt: z.string().datetime(),
  side: z.enum(["YES", "NO"]),
  points: z.number().int().min(1).max(100),
  group: z.object({
    operator: z.enum(["AND", "OR"]),
    conditions: z.array(z.object({
      field: z.enum(["MatchWinner", "TotalGoals", "TeamGoals", "PlayerGoals", "TotalCorners", "TeamCorners", "TotalCards", "TeamCards", "BothTeamsScore", "FirstGoal", "CleanSheet", "DoubleChance"]),
      operator: z.enum(["Eq", "Neq", "Gt", "Gte", "Lt", "Lte", "IsTrue", "IsFalse"]),
      scope: z.enum(["FullTime", "RegulationTime", "Team", "Player", "Match"]),
      value: valueSchema
    })).min(1).max(5)
  })
});

export async function POST(request: NextRequest) {
  const user = await requireAuthenticatedUser(request);
  if (isAuthError(user)) return user;

  try {
    const body = bodySchema.parse(await request.json());
    const group = body.group as ConditionGroup;
    const errors = validateConditionGroup(group);
    if (errors.length > 0) return NextResponse.json({ error: errors[0], errors }, { status: 400 });

    const result = await createParticipation({
      ...body,
      userId: user.id,
      group,
      conditionHash: conditionHash(group)
    });
    return NextResponse.json(result, { status: result.duplicate ? 200 : 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Forecast details are invalid.", issues: error.issues }, { status: 400 });
    }
    if (error instanceof ForecastStoreError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create Tutela forecast", error);
    return NextResponse.json({ error: "Forecast submission is unavailable." }, { status: 503 });
  }
}
