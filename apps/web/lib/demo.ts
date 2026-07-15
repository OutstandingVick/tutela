import { conditionHash } from "@tutela/condition-engine";
import { MockSportsDataAdapter } from "@tutela/txline-adapter";
import type { ActivityItem, ConditionGroup, TutelaMarket } from "@tutela/types";

export const sportsAdapter = new MockSportsDataAdapter();

export const coinBalance = 1_000;

export const liveStatMarkets = [
  { id: "stat-cards", label: "Cards", line: "Over 4.5", yes: 62, no: 38, volume: 420, status: "Proof-ready", minute: "61'", coverage: "TxLINE stat keys: yellow and red cards" },
  { id: "stat-corners", label: "Corners", line: "Over 8.5", yes: 57, no: 43, volume: 390, status: "Proof-ready", minute: "61'", coverage: "TxLINE stat keys: team corners" },
  { id: "stat-goals", label: "Total goals", line: "Over 2.5", yes: 49, no: 51, volume: 510, status: "Proof-ready", minute: "61'", coverage: "TxLINE stat keys: team goals" },
  { id: "stat-offsides", label: "Offsides", line: "Team 2+", yes: 44, no: 56, volume: 280, status: "Adapter pending", minute: "61'", coverage: "TxLINE feed-derived event; not settled by the current adapter" },
  { id: "stat-sot", label: "Shots on target", line: "Both teams 4+", yes: 36, no: 64, volume: 190, status: "Adapter pending", minute: "61'", coverage: "TxLINE feed-derived shot outcome; not settled by the current adapter" }
];

export const upcomingMatchMarkets = [
  {
    id: "worldcup-sf-france-spain-2026-07-14",
    time: "20:00",
    date: "Tue 14 Jul 2026",
    home: "France",
    away: "Spain",
    markets: 18,
    liquidity: 1240
  },
  {
    id: "worldcup-sf-england-argentina-2026-07-15",
    time: "20:00",
    date: "Wed 15 Jul 2026",
    home: "England",
    away: "Argentina",
    markets: 16,
    liquidity: 980
  },
  {
    id: "friendly-vietnam-myanmar-2026-07-18",
    time: "13:00",
    date: "Sat 18 Jul 2026",
    home: "Vietnam",
    away: "Myanmar",
    markets: 10,
    liquidity: 420
  },
  {
    id: "friendly-australia-brazil-2026-09-25",
    time: "16:00",
    date: "Fri 25 Sep 2026",
    home: "Australia",
    away: "Brazil",
    markets: 12,
    liquidity: 760
  },
  {
    id: "friendly-australia-brazil-2026-09-29",
    time: "16:00",
    date: "Tue 29 Sep 2026",
    home: "Australia",
    away: "Brazil",
    markets: 12,
    liquidity: 720
  },
  {
    id: "friendly-new-zealand-india-2026-11-12",
    time: "10:00",
    date: "Thu 12 Nov 2026",
    home: "New Zealand",
    away: "India",
    markets: 9,
    liquidity: 380
  },
  {
    id: "friendly-new-zealand-india-2026-11-15",
    time: "10:00",
    date: "Sun 15 Nov 2026",
    home: "New Zealand",
    away: "India",
    markets: 9,
    liquidity: 360
  }
];

export const contests = [
  { id: "lagos", title: "Lagos live-card contest", subtitle: "Location pool · top 20 split rewards", entry: 25, prize: 1400, active: true },
  { id: "global", title: "Global semifinal streak", subtitle: "Create or join 3 proof markets", entry: 10, prize: 3000, active: true },
  { id: "friends", title: "Friend battle room", subtitle: "Private link · winner takes test coins", entry: 50, prize: 500, active: false }
];

export const leaderboardRows = [
  { rank: 1, name: "TruthKeeper", score: 20741, detail: "18 settled markets", accent: true },
  { rank: 2, name: "NorthBank", score: 15743, detail: "12 proof wins" },
  { rank: 3, name: "CardReader", score: 9766, detail: "9 live stats" },
  { rank: 4, name: "Gigante", score: 4160, detail: "x12 best streak" },
  { rank: 5, name: "Ral", score: 3097, detail: "x8 best streak" },
  { rank: 6, name: "Medtiphanny84", score: 2908, detail: "x3 best streak" },
  { rank: 7, name: "Alfred", score: 2312, detail: "x5 best streak" },
  { rank: 8, name: "Lili", score: 1933, detail: "x6 best streak" }
];

export const sampleGroup: ConditionGroup = {
  operator: "AND",
  conditions: [
    { field: "TotalGoals", operator: "Gte", scope: "FullTime", value: { kind: "u16", value: 2 } },
    { field: "BothTeamsScore", operator: "IsTrue", scope: "Match", value: { kind: "bool", value: true } }
  ]
};

export const demoMarkets: TutelaMarket[] = [
  {
    id: "market-001",
    title: "France v Spain: 2+ goals and both score",
    matchId: "worldcup-sf-france-spain-2026-07-14",
    state: "Open",
    side: "YES",
    conditionGroup: sampleGroup,
    conditionHash: conditionHash(sampleGroup),
    yesPool: 1_800_000n,
    noPool: 1_200_000n,
    participantCount: 12,
    creator: "7nY...demo",
    collateralMint: "test-USDC",
    participationDeadline: "2026-07-14T19:45:00.000Z",
    expectedMatchEnd: "2026-07-14T22:00:00.000Z",
    refundEligibility: "2026-07-15T22:00:00.000Z",
    creatorFeeBps: 100,
    protocolFeeBps: 50,
    simulated: false
  },
  {
    id: "market-002",
    title: "England v Argentina: England do not lose",
    matchId: "worldcup-sf-england-argentina-2026-07-15",
    state: "Open",
    side: null,
    conditionGroup: { operator: "OR", conditions: [{ field: "MatchWinner", operator: "Eq", scope: "Match", value: { kind: "team", value: "HOME" } }] },
    conditionHash: "pending-local-builder",
    yesPool: 900_000n,
    noPool: 700_000n,
    participantCount: 7,
    creator: "9Uw...demo",
    collateralMint: "test-USDC",
    participationDeadline: "2026-07-15T19:45:00.000Z",
    expectedMatchEnd: "2026-07-15T22:00:00.000Z",
    refundEligibility: "2026-07-16T22:00:00.000Z",
    creatorFeeBps: 100,
    protocolFeeBps: 50,
    simulated: false
  }
];

export const demoActivity: ActivityItem[] = [
  {
    id: "a1",
    type: "create",
    title: "Created Cards over 4.5 market",
    signature: "5demoCreateTx",
    createdAt: "2026-07-13T08:01:00.000Z",
    explorerUrl: "https://explorer.solana.com/tx/5demoCreateTx?cluster=devnet"
  },
  {
    id: "a2",
    type: "settle",
    title: "Claimed proof-settled payout",
    signature: "5demoSettleTx",
    createdAt: "2026-07-13T08:32:00.000Z",
    explorerUrl: "https://explorer.solana.com/tx/5demoSettleTx?cluster=devnet"
  }
];

export function formatCoins(amount: number) {
  return `${amount.toLocaleString()} coins`;
}

export function formatUsdc(amount: bigint) {
  return `${(Number(amount) / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} test-USDC`;
}
