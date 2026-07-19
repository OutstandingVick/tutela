import { describe, expect, it } from "vitest";
import {
  demoMatches,
  MockSportsDataAdapter,
  normalizeScoreRecord,
  PLAYABLE_MATCH_IDS,
  resolveTxLineMatchStatus,
  selectLatestScoreRecord,
  TXLINE_FIXTURE_MAP
} from "./index";

describe("normalizeScoreRecord", () => {
  it("maps documented stat-array shape (statKey/value) into MatchStats", () => {
    const record = {
      action: "score_update",
      phase: 4, // H2
      stats: [
        { statKey: 1, value: 2 }, // home goals
        { statKey: 2, value: 1 }, // away goals
        { statKey: 3, value: 1 }, // home yellow
        { statKey: 4, value: 2 }, // away yellow
        { statKey: 5, value: 0 }, // home red
        { statKey: 6, value: 0 }, // away red
        { statKey: 7, value: 6 }, // home corners
        { statKey: 8, value: 4 } // away corners
      ]
    };

    const stats = normalizeScoreRecord(record);
    expect(stats.homeGoals).toBe(2);
    expect(stats.awayGoals).toBe(1);
    expect(stats.totalGoals).toBe(3);
    expect(stats.homeCards).toBe(1);
    expect(stats.awayCards).toBe(2);
    expect(stats.homeCorners).toBe(6);
    expect(stats.awayCorners).toBe(4);
    expect(stats.bothTeamsScore).toBe(true);
    // Not finalised yet, so winner should not be asserted from a mid-match snapshot.
    expect(stats.winner).toBe("DRAW");
  });

  it("maps PascalCase Stats object shape defensively", () => {
    const record = {
      Action: "game_finalised",
      StatusId: 5, // F
      Period: 100,
      Stats: { "1": 3, "2": 0, "3": 0, "4": 1, "5": 0, "6": 0, "7": 8, "8": 2 }
    };

    const stats = normalizeScoreRecord(record);
    expect(stats.homeGoals).toBe(3);
    expect(stats.awayGoals).toBe(0);
    expect(stats.winner).toBe("HOME");
    expect(stats.homeCleanSheet).toBe(true);
    expect(stats.awayCleanSheet).toBe(false);
  });

  it("degrades to zeroed stats instead of throwing on an unrecognized shape", () => {
    const stats = normalizeScoreRecord({ someUnexpectedField: true });
    expect(stats.homeGoals).toBe(0);
    expect(stats.awayGoals).toBe(0);
    expect(stats.totalGoals).toBe(0);
    expect(stats.bothTeamsScore).toBe(false);
  });
});

describe("playable TxLINE fixtures", () => {
  it("maps every requested fixture ID", () => {
    expect(PLAYABLE_MATCH_IDS.map((matchId) => TXLINE_FIXTURE_MAP[matchId])).toEqual([
      18143850,
      18257865,
      18257739,
      18182808,
      18182864,
      18242838,
      18242839
    ]);
  });

  it("keeps fixture metadata in chronological order", async () => {
    const adapter = new MockSportsDataAdapter();
    const matches = await adapter.listMatches();
    const startsAt = matches.map((match) => Date.parse(match.startsAt));

    expect(startsAt).toEqual([...startsAt].sort((left, right) => left - right));
    expect(demoMatches.find((match) => match.id === "worldcup-france-england-2026-07-18")?.startsAt)
      .toBe("2026-07-18T21:00:00.000Z");
    expect(demoMatches.find((match) => match.id === "worldcup-spain-argentina-2026-07-19")?.startsAt)
      .toBe("2026-07-19T19:00:00.000Z");
  });
});

describe("TxLINE live status", () => {
  const match = demoMatches.find((item) => item.id === "worldcup-spain-argentina-2026-07-19")!;

  it("selects the greatest sequence from an unordered snapshot", () => {
    expect(selectLatestScoreRecord([
      { Seq: 13, Action: "players_warming_up" },
      { Seq: 3, Action: "venue" },
      { Seq: 16, Action: "standby" },
      { Seq: 10, Action: "weather" }
    ])?.Action).toBe("standby");
  });

  it("uses the scheduled window after kickoff while TxLINE still reports not-started", () => {
    expect(resolveTxLineMatchStatus(
      match,
      { StatusId: 1, GameState: "scheduled" },
      Date.parse("2026-07-19T19:05:00.000Z")
    )).toBe("live");
  });

  it("does not turn an explicitly postponed fixture live", () => {
    expect(resolveTxLineMatchStatus(
      match,
      { StatusId: 19 },
      Date.parse("2026-07-19T19:05:00.000Z")
    )).toBe("upcoming");
  });
});
