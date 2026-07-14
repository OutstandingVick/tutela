import { describe, expect, it } from "vitest";
import { normalizeScoreRecord } from "./index";

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
