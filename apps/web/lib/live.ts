import { createSportsDataAdapter, loadTxLineConfigFromEnv } from "@tutela/txline-adapter";
import type { MatchDetails, MatchSummary } from "@tutela/types";
import { sportsAdapter as mockAdapter } from "./demo";

const dataSource = process.env.NEXT_PUBLIC_DATA_SOURCE === "txline" ? "txline" : "mock";
const liveAdapter = createSportsDataAdapter({ source: dataSource, txline: loadTxLineConfigFromEnv() });

/**
 * Server-side fetch of a match's current TxLINE-backed status, with a hard
 * fallback to the existing static demo snapshot on any failure (missing
 * credentials, network error, unexpected response shape). This means the page
 * never breaks: worst case it renders exactly what it rendered before this was
 * wired up, best case it shows real live World Cup data.
 */
export async function getLiveMatchOrFallback(matchId: string): Promise<{ match: MatchDetails; live: boolean }> {
  try {
    const match = await liveAdapter.getMatch(matchId);
    return { match, live: dataSource === "txline" };
  } catch (error) {
    console.warn(`Live match fetch failed for ${matchId}, using simulated fallback: ${(error as Error).message}`);
    const match = await mockAdapter.getMatch(matchId);
    return { match, live: false };
  }
}

export async function listLiveMatchesOrFallback(): Promise<{ matches: MatchSummary[]; live: boolean }> {
  try {
    const matches = await liveAdapter.listMatches();
    return { matches, live: dataSource === "txline" };
  } catch (error) {
    console.warn(`Live match list fetch failed, using simulated fallback: ${(error as Error).message}`);
    return { matches: await mockAdapter.listMatches(), live: false };
  }
}

export function formatMatchClock(match: MatchDetails): string {
  if (match.status === "upcoming") return "Kickoff soon";
  if (match.status === "completed") return "Full-time";
  return "Live";
}

export function formatScoreline(match: MatchDetails): string {
  if (!match.score) return "vs";
  return `${match.score.home}-${match.score.away}`;
}
