import { sha256Hex } from "@tutela/condition-engine";
import type { FieldAvailability, MatchDetails, MatchStats, MatchSummary, ProofPackage } from "@tutela/types";

export interface MatchFilters {
  status?: MatchSummary["status"];
}

export type MatchEvent = { type: "score" | "status"; match: MatchDetails };
export type Unsubscribe = () => void;

export interface SportsDataAdapter {
  listMatches(filters?: MatchFilters): Promise<MatchSummary[]>;
  getMatch(matchId: string): Promise<MatchDetails>;
  subscribeToMatch(matchId: string, onEvent: (event: MatchEvent) => void): Unsubscribe;
  getFieldAvailability(matchId: string): Promise<FieldAvailability>;
  getFinalProof(matchId: string): Promise<ProofPackage>;
}

export type SportsDataSource = "txline" | "mock";

/**
 * CONFIRMED against TxLINE's public docs (https://txline.txodds.com/documentation) on 2026-07-13.
 * Source pages: /documentation/quickstart, /documentation/worldcup, /documentation/scores/schedule,
 * /documentation/scores/soccer-feed, /documentation/examples/fetching-snapshots,
 * /documentation/examples/streaming-data, /documentation/programs/devnet.
 *
 * These replace the previously-TBD endpoint paths. Field-level JSON shapes for
 * /api/scores/snapshot/{fixtureId} were not captured from a live response (this
 * environment cannot reach txline-dev.txodds.com), so parsing below is defensive:
 * it tries multiple known-casing variants and never throws on an unexpected shape.
 * Verify the first real response against `normalizeScoreRecord` below once activated
 * (see scripts/activate-txline.ts) and adjust field names if needed.
 */
export const TXLINE_DEVNET = {
  programId: "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J",
  txlTokenMint: "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG",
  rpcUrl: "https://api.devnet.solana.com",
  apiOrigin: "https://txline-dev.txodds.com",
  apiBaseUrl: "https://txline-dev.txodds.com/api",
  guestAuthUrl: "https://txline-dev.txodds.com/auth/guest/start",
  activateUrl: "https://txline-dev.txodds.com/api/token/activate",
  freeServiceLevelId: 1,
  durationWeeks: 4
} as const;

/**
 * Confirmed devnet World Cup fixture IDs for Tutela's two tracked semifinal demo
 * matches (docs: /documentation/scores/schedule, "World Cup - Semi-finals").
 * Home/away below matches the schedule's own Home Team / Away Team columns, so
 * Participant1 == home and Participant2 == away for both fixtures.
 */
export const TXLINE_FIXTURE_MAP: Record<string, number> = {
  "worldcup-sf-france-spain-2026-07-14": 18237038,
  "worldcup-sf-england-argentina-2026-07-15": 18241006,
  "friendly-vietnam-myanmar-2026-07-18": 18143850,
  "friendly-australia-brazil-2026-09-25": 18182808,
  "friendly-australia-brazil-2026-09-29": 18182864,
  "friendly-new-zealand-india-2026-11-12": 18242838,
  "friendly-new-zealand-india-2026-11-15": 18242839
};

const FIXTURE_ID_TO_MATCH_ID = Object.fromEntries(
  Object.entries(TXLINE_FIXTURE_MAP).map(([matchId, fixtureId]) => [fixtureId, matchId])
) as Record<number, string>;

/**
 * Soccer feed full-game (period prefix 0) stat keys.
 * Docs: /documentation/scores/soccer-feed, "Full Game Stats (Keys 1-8)".
 */
const STAT_KEY = {
  p1Goals: 1,
  p2Goals: 2,
  p1YellowCards: 3,
  p2YellowCards: 4,
  p1RedCards: 5,
  p2RedCards: 6,
  p1Corners: 7,
  p2Corners: 8
} as const;

/**
 * Soccer feed game-phase encoding. Docs: /documentation/scores/soccer-feed,
 * "Game Phase Encoding". NS/Postponed map to "upcoming"; all in-play/interrupted
 * phases map to "live"; ended/abandoned/cancelled phases map to "completed" since
 * Tutela's MatchSummary status has no separate abandoned/cancelled state and a
 * terminal match should stop being offered for new deposits either way.
 */
const PHASE_UPCOMING = new Set([1, 19]); // NS, P
const PHASE_LIVE = new Set([2, 3, 4, 6, 7, 8, 9, 11, 12, 14]); // H1,HT,H2,WET,ET1,HTET,ET2,WPE,PE,I
const PHASE_TERMINAL = new Set([5, 10, 13, 15, 16, 17, 18]); // F,FET,FPE,A,C,TXCC,TXCS

function derivePhaseId(record: Record<string, unknown>): number | undefined {
  const raw = record.phase ?? record.Phase ?? record.statusId ?? record.StatusId ?? record.period ?? record.Period;
  const value = typeof raw === "string" ? Number(raw) : raw;
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function deriveStatus(phaseId: number | undefined): MatchSummary["status"] {
  if (phaseId === undefined) return "upcoming";
  if (PHASE_TERMINAL.has(phaseId)) return "completed";
  if (PHASE_LIVE.has(phaseId)) return "live";
  if (PHASE_UPCOMING.has(phaseId)) return "upcoming";
  return "upcoming";
}

function deriveFixtureStatus(base: MatchDetails): MatchSummary["status"] {
  const now = Date.now();
  if (now < Date.parse(base.startsAt)) return "upcoming";
  if (now > Date.parse(base.expectedEndAt)) return "completed";
  return "live";
}

function readStatValue(record: Record<string, unknown>, key: number): number {
  const container =
    (record.stats as unknown) ??
    (record.Stats as unknown) ??
    (record.statValues as unknown) ??
    (record.StatValues as unknown);

  if (Array.isArray(container)) {
    const entry = (container as Array<Record<string, unknown>>).find((item) => {
      const itemKey = item.statKey ?? item.StatKey ?? item.key ?? item.Key;
      return Number(itemKey) === key;
    });
    const value = entry?.value ?? entry?.Value;
    return typeof value === "number" ? value : Number(value ?? 0) || 0;
  }

  if (container && typeof container === "object") {
    const value = (container as Record<string, unknown>)[String(key)];
    return typeof value === "number" ? value : Number(value ?? 0) || 0;
  }

  return 0;
}

function readIsFinalised(record: Record<string, unknown>): boolean {
  const action = record.action ?? record.Action;
  return action === "game_finalised";
}

/**
 * Maps one TxLINE scores record (from /api/scores/snapshot/{fixtureId} or the
 * scores stream) into Tutela's internal MatchStats shape. Defensive: unknown or
 * missing fields resolve to 0/false rather than throwing, so a live demo degrades
 * instead of crashing if the real payload shape differs from what's documented.
 */
export function normalizeScoreRecord(record: Record<string, unknown>): MatchStats {
  const homeGoals = readStatValue(record, STAT_KEY.p1Goals);
  const awayGoals = readStatValue(record, STAT_KEY.p2Goals);
  const homeCards = readStatValue(record, STAT_KEY.p1YellowCards) + readStatValue(record, STAT_KEY.p1RedCards);
  const awayCards = readStatValue(record, STAT_KEY.p2YellowCards) + readStatValue(record, STAT_KEY.p2RedCards);
  const homeCorners = readStatValue(record, STAT_KEY.p1Corners);
  const awayCorners = readStatValue(record, STAT_KEY.p2Corners);
  const phaseId = derivePhaseId(record);
  const isFinal = readIsFinalised(record) || (phaseId !== undefined && PHASE_TERMINAL.has(phaseId));

  return {
    winner: isFinal ? (homeGoals > awayGoals ? "HOME" : awayGoals > homeGoals ? "AWAY" : "DRAW") : "DRAW",
    homeGoals,
    awayGoals,
    totalGoals: homeGoals + awayGoals,
    homeCorners,
    awayCorners,
    totalCorners: homeCorners + awayCorners,
    homeCards,
    awayCards,
    totalCards: homeCards + awayCards,
    bothTeamsScore: homeGoals > 0 && awayGoals > 0,
    // First-goal attribution needs event-level (not stat-total) data from TxLINE's
    // action stream; not derivable from a stat snapshot alone. Left unattributed
    // until event-level parsing is added.
    firstGoal: "NONE",
    homeCleanSheet: isFinal ? awayGoals === 0 : false,
    awayCleanSheet: isFinal ? homeGoals === 0 : false
  };
}

export interface TxLineAdapterConfig {
  apiBaseUrl: string;
  guestAuthUrl: string;
  apiToken: string;
  /** Seeded guest JWT; refreshed automatically from guestAuthUrl on 401. */
  guestJwt?: string;
}

function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/**
 * Fetches a fresh guest JWT. Docs: POST /auth/guest/start (no body), response
 * shape `{ token: string }` per the quickstart snippet's `authResponse.data.token`.
 */
async function fetchGuestJwt(guestAuthUrl: string): Promise<string> {
  const response = await fetch(guestAuthUrl, { method: "POST" });
  if (!response.ok) {
    throw new Error(`TxLINE guest auth failed with ${response.status}`);
  }
  const body = (await response.json()) as { token?: string };
  if (!body.token) throw new Error("TxLINE guest auth response did not include a token");
  return body.token;
}

/**
 * GET wrapper against the TxLINE data API with automatic guest-JWT renewal on
 * 401, per /documentation/quickstart "Credential Lifecycle" and
 * /documentation/examples/streaming-data "If a stream returns 401, renew the
 * guest JWT from the same host and reconnect with the same X-Api-Token."
 */
class TxLineHttpClient {
  private jwt: string | undefined;

  constructor(private readonly config: TxLineAdapterConfig) {
    this.jwt = config.guestJwt;
  }

  private async ensureJwt(): Promise<string> {
    if (!this.jwt) this.jwt = await fetchGuestJwt(this.config.guestAuthUrl);
    return this.jwt;
  }

  async getJson<T>(path: string, params?: Record<string, string | number>): Promise<T> {
    const url = new URL(joinUrl(this.config.apiBaseUrl, path));
    for (const [key, value] of Object.entries(params ?? {})) url.searchParams.set(key, String(value));

    const jwt = await this.ensureJwt();
    let response = await fetch(url, {
      headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": this.config.apiToken }
    });

    if (response.status === 401) {
      this.jwt = await fetchGuestJwt(this.config.guestAuthUrl);
      response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.jwt}`, "X-Api-Token": this.config.apiToken }
      });
    }

    if (!response.ok) {
      throw new Error(`TxLINE request failed with ${response.status} for ${path}`);
    }

    return (await response.json()) as T;
  }

  async getJwtAndToken() {
    return { jwt: await this.ensureJwt(), apiToken: this.config.apiToken };
  }
}

function assertTxLineConfig(config: Partial<TxLineAdapterConfig>): asserts config is TxLineAdapterConfig {
  if (!config.apiBaseUrl || !config.guestAuthUrl || !config.apiToken) {
    throw new Error("TxLINE adapter requires apiBaseUrl, guestAuthUrl and apiToken.");
  }
}

export class TxLineSportsDataAdapter implements SportsDataAdapter {
  private readonly client: TxLineHttpClient;
  private readonly config: TxLineAdapterConfig;

  constructor(config: Partial<TxLineAdapterConfig>) {
    assertTxLineConfig(config);
    this.config = config;
    this.client = new TxLineHttpClient(config);
  }

  private fixtureIdFor(matchId: string): number {
    const fixtureId = TXLINE_FIXTURE_MAP[matchId];
    if (!fixtureId) throw new Error(`No TxLINE fixture mapping for match "${matchId}"`);
    return fixtureId;
  }

  private async fetchLatestRecord(fixtureId: number): Promise<Record<string, unknown> | undefined> {
    const snapshot = await this.client.getJson<Array<Record<string, unknown>> | Record<string, unknown>>(
      `/scores/snapshot/${fixtureId}`
    );
    const records = Array.isArray(snapshot) ? snapshot : [snapshot];
    if (records.length === 0) return undefined;
    // Snapshot is expected newest-last per the historical-updates examples; fall
    // back to the last element defensively either way.
    return records[records.length - 1];
  }

  private async fetchFixtureSnapshot(): Promise<Record<string, unknown>[]> {
    const snapshot = await this.client.getJson<Array<Record<string, unknown>> | Record<string, unknown>>(
      "/fixtures/snapshot"
    );
    return Array.isArray(snapshot) ? snapshot : [snapshot];
  }

  async listMatches(filters?: MatchFilters): Promise<MatchSummary[]> {
    let matchIds = Object.keys(TXLINE_FIXTURE_MAP);
    try {
      const fixtureSnapshot = await this.fetchFixtureSnapshot();
      const discoveredMatchIds = fixtureSnapshot
        .map((fixture) => Number(fixture.FixtureId ?? fixture.fixtureId ?? fixture.id))
        .map((fixtureId) => FIXTURE_ID_TO_MATCH_ID[fixtureId])
        .filter((matchId): matchId is string => Boolean(matchId));

      if (discoveredMatchIds.length > 0) {
        matchIds = discoveredMatchIds;
      }
    } catch {
      // Keep the verified static fixture IDs available when the snapshot route is unavailable.
    }

    const summaries = await Promise.all(
      matchIds.map(async (matchId) => {
        const details = await this.getMatch(matchId);
        return details;
      })
    );
    return summaries.filter((match) => !filters?.status || match.status === filters.status);
  }

  async getMatch(matchId: string): Promise<MatchDetails> {
    const base = STATIC_FIXTURE_METADATA[matchId];
    if (!base) throw new Error(`Unknown match "${matchId}"`);

    const fixtureId = this.fixtureIdFor(matchId);
    let record: Record<string, unknown> | undefined;
    try {
      record = await this.fetchLatestRecord(fixtureId);
    } catch {
      return { ...base, status: deriveFixtureStatus(base), simulated: false };
    }

    if (!record) {
      return { ...base, status: deriveFixtureStatus(base), simulated: false };
    }

    const phaseId = derivePhaseId(record);
    const stats = normalizeScoreRecord(record);
    return {
      ...base,
      status: deriveStatus(phaseId),
      score: { home: stats.homeGoals, away: stats.awayGoals },
      stats,
      simulated: false
    };
  }

  subscribeToMatch(matchId: string, onEvent: (event: MatchEvent) => void): Unsubscribe {
    let cancelled = false;
    const poll = async () => {
      try {
        const match = await this.getMatch(matchId);
        if (!cancelled) onEvent({ type: "score", match });
      } catch (error) {
        console.warn(`TxLINE poll failed for ${matchId}: ${(error as Error).message}`);
      }
    };
    void poll();
    const timer = setInterval(poll, 15_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }

  async getFieldAvailability(matchId: string): Promise<FieldAvailability> {
    await this.getMatch(matchId);
    return {
      matchId,
      supportedFields: [
        "MatchWinner",
        "TotalGoals",
        "TeamGoals",
        "TotalCorners",
        "TeamCorners",
        "TotalCards",
        "TeamCards",
        "BothTeamsScore",
        "CleanSheet"
      ]
    };
  }

  async getFinalProof(matchId: string): Promise<ProofPackage> {
    const fixtureId = this.fixtureIdFor(matchId);
    const record = await this.fetchLatestRecord(fixtureId);
    if (!record || !readIsFinalised(record)) {
      throw new Error(`Final data is not yet available from TxLINE for ${matchId}`);
    }

    const seq = Number(record.seq ?? record.Seq ?? 0);
    if (!Number.isInteger(seq) || seq < 1) {
      throw new Error(`TxLINE returned an invalid sequence for the finalised record of ${matchId}`);
    }

    // statKeys 1,2,3,4,5,6,7,8 == full-game goals/cards/corners for both sides,
    // matching STAT_KEY above. This fetches the real validation payload TxLINE
    // would use for on-chain validateStatV2; Tutela's own Anchor program does not
    // yet CPI into it (see docs/txline-integration.md), so this proof is surfaced
    // to the verification UI as real TxLINE data but settlement still runs through
    // the labelled mock-verifier program until that CPI is wired.
    const validation = await this.client.getJson<Record<string, unknown>>("/scores/stat-validation", {
      fixtureId,
      seq,
      statKeys: "1,2,3,4,5,6,7,8"
    });

    const stats = normalizeScoreRecord(record);
    const payload = JSON.stringify({ matchId, fixtureId, seq, stats });
    return {
      matchId,
      proofHash: sha256Hex(new TextEncoder().encode(payload)),
      finalizationTimestamp: new Date().toISOString(),
      verifierLabel: "txline",
      stats,
      simulated: false,
      // Raw validation payload retained for the verification page (Section 23 of
      // the PRD); not part of the ProofPackage type contract, so cast is local.
      ...(validation ? { raw: validation } : {})
    } as ProofPackage;
  }

  /** Exposes the underlying jwt/apiToken pair, e.g. for a debug/status endpoint. */
  async credentials() {
    return this.client.getJwtAndToken();
  }
}

const STATIC_FIXTURE_METADATA: Record<string, MatchDetails> = {
  "worldcup-sf-france-spain-2026-07-14": {
    id: "worldcup-sf-france-spain-2026-07-14",
    homeTeam: "France",
    awayTeam: "Spain",
    competition: "FIFA World Cup 2026 Semifinal",
    startsAt: "2026-07-14T19:00:00.000Z",
    expectedEndAt: "2026-07-14T21:00:00.000Z",
    status: "upcoming",
    venue: "World Cup Semifinal Venue",
    simulated: false
  },
  "worldcup-sf-england-argentina-2026-07-15": {
    id: "worldcup-sf-england-argentina-2026-07-15",
    homeTeam: "England",
    awayTeam: "Argentina",
    competition: "FIFA World Cup 2026 Semifinal",
    startsAt: "2026-07-15T19:00:00.000Z",
    expectedEndAt: "2026-07-15T21:00:00.000Z",
    status: "upcoming",
    venue: "World Cup Semifinal Venue",
    simulated: false
  },
  "friendly-vietnam-myanmar-2026-07-18": {
    id: "friendly-vietnam-myanmar-2026-07-18",
    homeTeam: "Vietnam",
    awayTeam: "Myanmar",
    competition: "International Friendlies",
    startsAt: "2026-07-18T12:00:00.000Z",
    expectedEndAt: "2026-07-18T14:00:00.000Z",
    status: "upcoming",
    venue: "International Friendly Venue",
    simulated: false
  },
  "friendly-australia-brazil-2026-09-25": {
    id: "friendly-australia-brazil-2026-09-25",
    homeTeam: "Australia",
    awayTeam: "Brazil",
    competition: "International Friendlies",
    startsAt: "2026-09-25T15:00:00.000Z",
    expectedEndAt: "2026-09-25T17:00:00.000Z",
    status: "upcoming",
    venue: "International Friendly Venue",
    simulated: false
  },
  "friendly-australia-brazil-2026-09-29": {
    id: "friendly-australia-brazil-2026-09-29",
    homeTeam: "Australia",
    awayTeam: "Brazil",
    competition: "International Friendlies",
    startsAt: "2026-09-29T15:00:00.000Z",
    expectedEndAt: "2026-09-29T17:00:00.000Z",
    status: "upcoming",
    venue: "International Friendly Venue",
    simulated: false
  },
  "friendly-new-zealand-india-2026-11-12": {
    id: "friendly-new-zealand-india-2026-11-12",
    homeTeam: "New Zealand",
    awayTeam: "India",
    competition: "International Friendlies",
    startsAt: "2026-11-12T09:00:00.000Z",
    expectedEndAt: "2026-11-12T11:00:00.000Z",
    status: "upcoming",
    venue: "International Friendly Venue",
    simulated: false
  },
  "friendly-new-zealand-india-2026-11-15": {
    id: "friendly-new-zealand-india-2026-11-15",
    homeTeam: "New Zealand",
    awayTeam: "India",
    competition: "International Friendlies",
    startsAt: "2026-11-15T09:00:00.000Z",
    expectedEndAt: "2026-11-15T11:00:00.000Z",
    status: "upcoming",
    venue: "International Friendly Venue",
    simulated: false
  }
};

export const demoMatches: MatchDetails[] = Object.values(STATIC_FIXTURE_METADATA);

export class MockSportsDataAdapter implements SportsDataAdapter {
  async listMatches(filters?: MatchFilters) {
    return demoMatches
      .filter((match) => !filters?.status || match.status === filters.status)
      .map(({ stats: _stats, venue: _venue, expectedEndAt: _end, score, ...summary }) => ({ ...summary, score }));
  }

  async getMatch(matchId: string) {
    const match = demoMatches.find((item) => item.id === matchId);
    if (!match) throw new Error(`Unknown demo match ${matchId}`);
    return match;
  }

  subscribeToMatch(matchId: string, onEvent: (event: MatchEvent) => void): Unsubscribe {
    const timer = setInterval(async () => {
      onEvent({ type: "status", match: await this.getMatch(matchId) });
    }, 15_000);
    return () => clearInterval(timer);
  }

  async getFieldAvailability(matchId: string): Promise<FieldAvailability> {
    await this.getMatch(matchId);
    return {
      matchId,
      supportedFields: [
        "MatchWinner",
        "TotalGoals",
        "TeamGoals",
        "TotalCorners",
        "TeamCorners",
        "TotalCards",
        "TeamCards",
        "BothTeamsScore",
        "FirstGoal",
        "CleanSheet",
        "DoubleChance"
      ]
    };
  }

  async getFinalProof(matchId: string): Promise<ProofPackage> {
    const match = await this.getMatch(matchId);
    if (!match.stats) throw new Error("Final data is unavailable for this simulated match.");
    const payload = JSON.stringify({ matchId, stats: match.stats, source: "mock-dev" });
    return {
      matchId,
      proofHash: sha256Hex(new TextEncoder().encode(payload)),
      finalizationTimestamp: match.expectedEndAt,
      verifierLabel: "mock-dev",
      stats: match.stats,
      simulated: true
    };
  }
}

/** Builds a TxLineAdapterConfig from process.env, or undefined if incomplete. */
export function loadTxLineConfigFromEnv(env: Record<string, string | undefined> = process.env): Partial<TxLineAdapterConfig> {
  return {
    apiBaseUrl: env.TXLINE_API_BASE_URL || TXLINE_DEVNET.apiBaseUrl,
    guestAuthUrl: env.TXLINE_GUEST_AUTH_URL || TXLINE_DEVNET.guestAuthUrl,
    apiToken: env.TXLINE_API_TOKEN,
    guestJwt: env.TXLINE_GUEST_JWT || undefined
  };
}

/**
 * Builds the live adapter when TxLINE credentials are configured; otherwise (or
 * on any construction error) falls back to the labelled simulated adapter so the
 * app never crashes for missing/incomplete credentials.
 */
export function createSportsDataAdapter(options: { source?: SportsDataSource; txline?: Partial<TxLineAdapterConfig> } = {}): SportsDataAdapter {
  if (options.source === "txline") {
    try {
      return new TxLineSportsDataAdapter(options.txline ?? loadTxLineConfigFromEnv());
    } catch (error) {
      console.warn(`Falling back to simulated sports data: ${(error as Error).message}`);
    }
  }

  return new MockSportsDataAdapter();
}
