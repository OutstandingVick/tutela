import "server-only";

import postgres, { type Sql } from "postgres";
import type { ConditionGroup } from "@tutela/types";

export const STARTING_DEMO_POINTS = 1_000;
export const MAX_PARTICIPATION_POINTS = 100;

export type ForecastSide = "YES" | "NO";

export type ForecastActivity = {
  id: string;
  forecastId: string;
  title: string;
  side: ForecastSide;
  points: number;
  status: "Pending" | "Won" | "Lost" | "Invalid" | "Refunded";
  createdAt: string;
};

export type UserSnapshot = {
  balance: number;
  activity: ForecastActivity[];
};

export type ForecastMarket = {
  id: string;
  title: string;
  status: string;
  operator: "AND" | "OR";
  conditions: ConditionGroup["conditions"];
  yesPoints: number;
  noPoints: number;
  participantCount: number;
  createdAt: string;
};

export type CreateParticipationInput = {
  userId: string;
  idempotencyKey: string;
  matchId: string;
  matchTitle: string;
  kickoffAt: string;
  conditionHash: string;
  group: ConditionGroup;
  side: ForecastSide;
  points: number;
};

type DatabaseGlobals = typeof globalThis & {
  tutelaSql?: Sql;
  tutelaSchemaReady?: Promise<void>;
};

const globals = globalThis as DatabaseGlobals;

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url || (!url.startsWith("postgres://") && !url.startsWith("postgresql://"))) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string.");
  }
  return url;
}

function db() {
  globals.tutelaSql ??= postgres(databaseUrl(), {
    max: process.env.VERCEL ? 1 : 5,
    prepare: false,
    ssl: process.env.NODE_ENV === "production" ? "require" : undefined
  });
  return globals.tutelaSql;
}

async function ensureSchema() {
  globals.tutelaSchemaReady ??= (async () => {
    const sql = db();
    await sql`
      CREATE TABLE IF NOT EXISTS tutela_users (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tutela_matches (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        kickoff_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tutela_forecasts (
        id UUID PRIMARY KEY,
        creator_id TEXT NOT NULL REFERENCES tutela_users(id),
        match_id TEXT NOT NULL REFERENCES tutela_matches(id),
        title TEXT NOT NULL,
        boolean_operator TEXT NOT NULL CHECK (boolean_operator IN ('AND', 'OR')),
        condition_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tutela_forecast_conditions (
        id BIGSERIAL PRIMARY KEY,
        forecast_id UUID NOT NULL REFERENCES tutela_forecasts(id) ON DELETE CASCADE,
        position INTEGER NOT NULL,
        payload JSONB NOT NULL,
        UNIQUE (forecast_id, position)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tutela_participations (
        id UUID PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES tutela_users(id),
        forecast_id UUID NOT NULL REFERENCES tutela_forecasts(id),
        side TEXT NOT NULL CHECK (side IN ('YES', 'NO')),
        points INTEGER NOT NULL CHECK (points > 0 AND points <= 100),
        status TEXT NOT NULL DEFAULT 'Pending',
        idempotency_key TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, idempotency_key)
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS tutela_demo_point_ledger (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES tutela_users(id),
        participation_id UUID REFERENCES tutela_participations(id),
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, idempotency_key)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS tutela_activity_user_idx ON tutela_participations(user_id, created_at DESC)`;
  })();
  await globals.tutelaSchemaReady;
}

export async function getUserSnapshot(userId: string): Promise<UserSnapshot> {
  await ensureUser(userId);
  const sql = db();
  const [balanceRows, activityRows] = await Promise.all([
    sql<{ balance: number }[]>`
      SELECT COALESCE(SUM(amount), 0)::INTEGER AS balance
      FROM tutela_demo_point_ledger
      WHERE user_id = ${userId}
    `,
    sql<ForecastActivity[]>`
      SELECT
        p.id::TEXT AS id,
        p.forecast_id::TEXT AS "forecastId",
        f.title,
        p.side,
        p.points,
        p.status,
        p.created_at::TEXT AS "createdAt"
      FROM tutela_participations p
      JOIN tutela_forecasts f ON f.id = p.forecast_id
      WHERE p.user_id = ${userId}
      ORDER BY p.created_at DESC
      LIMIT 50
    `
  ]);
  return { balance: balanceRows[0]?.balance ?? 0, activity: activityRows };
}

export async function createParticipation(input: CreateParticipationInput) {
  await ensureSchema();
  const sql = db();

  return sql.begin(async (tx) => {
    await ensureUserInTransaction(tx, input.userId);
    const existing = await tx<{ id: string }[]>`
      SELECT id::TEXT AS id FROM tutela_participations
      WHERE user_id = ${input.userId} AND idempotency_key = ${input.idempotencyKey}
    `;
    if (existing[0]) return { ...(await snapshotInTransaction(tx, input.userId)), duplicate: true };

    const kickoff = new Date(input.kickoffAt);
    if (!Number.isFinite(kickoff.getTime()) || kickoff.getTime() <= Date.now()) {
      throw new ForecastStoreError("Forecasting for this match is closed.", 409);
    }

    await tx`SELECT id FROM tutela_users WHERE id = ${input.userId} FOR UPDATE`;
    const balanceRows = await tx<{ balance: number }[]>`
      SELECT COALESCE(SUM(amount), 0)::INTEGER AS balance
      FROM tutela_demo_point_ledger
      WHERE user_id = ${input.userId}
    `;
    const balance = balanceRows[0]?.balance ?? 0;
    if (balance < input.points) throw new ForecastStoreError("Insufficient demo points.", 409);

    await tx`
      INSERT INTO tutela_matches (id, title, kickoff_at)
      VALUES (${input.matchId}, ${input.matchTitle}, ${input.kickoffAt})
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, kickoff_at = EXCLUDED.kickoff_at
    `;

    const forecastId = crypto.randomUUID();
    const participationId = crypto.randomUUID();
    const title = describeGroup(input.group, input.matchTitle);
    await tx`
      INSERT INTO tutela_forecasts (id, creator_id, match_id, title, boolean_operator, condition_hash)
      VALUES (${forecastId}, ${input.userId}, ${input.matchId}, ${title}, ${input.group.operator}, ${input.conditionHash})
    `;
    for (const [position, condition] of input.group.conditions.entries()) {
      await tx`
        INSERT INTO tutela_forecast_conditions (forecast_id, position, payload)
        VALUES (${forecastId}, ${position}, ${tx.json(condition as unknown as postgres.JSONValue)})
      `;
    }
    await tx`
      INSERT INTO tutela_participations (id, user_id, forecast_id, side, points, idempotency_key)
      VALUES (${participationId}, ${input.userId}, ${forecastId}, ${input.side}, ${input.points}, ${input.idempotencyKey})
    `;
    await tx`
      INSERT INTO tutela_demo_point_ledger (user_id, participation_id, amount, reason, idempotency_key)
      VALUES (${input.userId}, ${participationId}, ${-input.points}, 'FORECAST_PARTICIPATION', ${input.idempotencyKey})
    `;

    return { ...(await snapshotInTransaction(tx, input.userId)), duplicate: false, forecastId };
  });
}

export async function getPoolTotals() {
  await ensureSchema();
  return db()<Array<{ forecastId: string; yesPoints: number; noPoints: number }>>`
    SELECT
      forecast_id::TEXT AS "forecastId",
      COALESCE(SUM(points) FILTER (WHERE side = 'YES'), 0)::INTEGER AS "yesPoints",
      COALESCE(SUM(points) FILTER (WHERE side = 'NO'), 0)::INTEGER AS "noPoints"
    FROM tutela_participations
    GROUP BY forecast_id
  `;
}

export async function listForecastMarkets(): Promise<ForecastMarket[]> {
  await ensureSchema();
  const rows = await db()<Array<Omit<ForecastMarket, "conditions"> & { conditions: unknown }>>`
    WITH condition_groups AS (
      SELECT forecast_id, jsonb_agg(payload ORDER BY position) AS conditions
      FROM tutela_forecast_conditions
      GROUP BY forecast_id
    ), pool_totals AS (
      SELECT
        forecast_id,
        COALESCE(SUM(points) FILTER (WHERE side = 'YES'), 0)::INTEGER AS yes_points,
        COALESCE(SUM(points) FILTER (WHERE side = 'NO'), 0)::INTEGER AS no_points,
        COUNT(*)::INTEGER AS participant_count
      FROM tutela_participations
      GROUP BY forecast_id
    )
    SELECT
      f.id::TEXT AS id,
      f.title,
      f.status,
      f.boolean_operator AS operator,
      COALESCE(c.conditions, '[]'::jsonb) AS conditions,
      COALESCE(p.yes_points, 0)::INTEGER AS "yesPoints",
      COALESCE(p.no_points, 0)::INTEGER AS "noPoints",
      COALESCE(p.participant_count, 0)::INTEGER AS "participantCount",
      f.created_at::TEXT AS "createdAt"
    FROM tutela_forecasts f
    LEFT JOIN condition_groups c ON c.forecast_id = f.id
    LEFT JOIN pool_totals p ON p.forecast_id = f.id
    ORDER BY f.created_at DESC
    LIMIT 50
  `;
  return rows.map((row) => ({ ...row, conditions: row.conditions as ConditionGroup["conditions"] }));
}

export async function getForecastMarket(id: string) {
  const markets = await listForecastMarkets();
  return markets.find((market) => market.id === id) ?? null;
}

async function ensureUser(userId: string) {
  await ensureSchema();
  await db().begin((tx) => ensureUserInTransaction(tx, userId));
}

async function ensureUserInTransaction(tx: postgres.TransactionSql, userId: string) {
  await tx`INSERT INTO tutela_users (id) VALUES (${userId}) ON CONFLICT (id) DO NOTHING`;
  await tx`
    INSERT INTO tutela_demo_point_ledger (user_id, amount, reason, idempotency_key)
    VALUES (${userId}, ${STARTING_DEMO_POINTS}, 'WELCOME_GRANT', 'welcome-grant-v1')
    ON CONFLICT (user_id, idempotency_key) DO NOTHING
  `;
}

async function snapshotInTransaction(tx: postgres.TransactionSql, userId: string) {
  const rows = await tx<{ balance: number }[]>`
    SELECT COALESCE(SUM(amount), 0)::INTEGER AS balance
    FROM tutela_demo_point_ledger WHERE user_id = ${userId}
  `;
  return { balance: rows[0]?.balance ?? 0 };
}

function describeGroup(group: ConditionGroup, matchTitle: string) {
  const conditions = group.conditions.map((condition) => `${condition.field} ${condition.operator} ${String(condition.value.value)}`);
  return `${matchTitle}: ${conditions.join(` ${group.operator} `)}`;
}

export class ForecastStoreError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}
