export type MarketSide = "YES" | "NO";
export type BooleanOperator = "AND" | "OR";
export type MarketState =
  | "Draft"
  | "Open"
  | "Locked"
  | "AwaitingResult"
  | "ProofSubmitted"
  | "Verified"
  | "Settled"
  | "RefundEligible"
  | "Refunded"
  | "Cancelled"
  | "Invalid"
  | "Closed";

export type StatField =
  | "MatchWinner"
  | "TotalGoals"
  | "TeamGoals"
  | "PlayerGoals"
  | "TotalCorners"
  | "TeamCorners"
  | "TotalCards"
  | "TeamCards"
  | "BothTeamsScore"
  | "FirstGoal"
  | "CleanSheet"
  | "DoubleChance";

export type ComparisonOperator =
  | "Eq"
  | "Neq"
  | "Gt"
  | "Gte"
  | "Lt"
  | "Lte"
  | "IsTrue"
  | "IsFalse";

export type ConditionScope = "FullTime" | "RegulationTime" | "Team" | "Player" | "Match";

export type ConditionValue =
  | { kind: "bool"; value: boolean }
  | { kind: "u16"; value: number }
  | { kind: "team"; value: string }
  | { kind: "player"; value: string };

export interface MarketCondition {
  field: StatField;
  operator: ComparisonOperator;
  scope: ConditionScope;
  value: ConditionValue;
  teamId?: string;
  playerId?: string;
}

export interface ConditionGroup {
  operator: BooleanOperator;
  conditions: MarketCondition[];
}

export interface MatchSummary {
  id: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  startsAt: string;
  status: "upcoming" | "live" | "completed";
  simulated: boolean;
}

export interface MatchDetails extends MatchSummary {
  venue: string;
  expectedEndAt: string;
  score?: { home: number; away: number };
  stats?: MatchStats;
}

export interface MatchStats {
  winner: "HOME" | "AWAY" | "DRAW";
  homeGoals: number;
  awayGoals: number;
  totalGoals: number;
  homeCorners: number;
  awayCorners: number;
  totalCorners: number;
  homeCards: number;
  awayCards: number;
  totalCards: number;
  bothTeamsScore: boolean;
  firstGoal: "HOME" | "AWAY" | "NONE";
  homeCleanSheet: boolean;
  awayCleanSheet: boolean;
}

export interface FieldAvailability {
  matchId: string;
  supportedFields: StatField[];
}

export interface ProofPackage {
  matchId: string;
  proofHash: string;
  finalizationTimestamp: string;
  verifierLabel: "mock-dev" | "txline";
  stats: MatchStats;
  simulated: boolean;
  raw?: unknown;
}

export interface TutelaMarket {
  id: string;
  title: string;
  matchId: string;
  state: MarketState;
  side: MarketSide | null;
  conditionGroup: ConditionGroup;
  conditionHash: string;
  yesPool: bigint;
  noPool: bigint;
  participantCount: number;
  creator: string;
  collateralMint: string;
  participationDeadline: string;
  expectedMatchEnd: string;
  refundEligibility: string;
  creatorFeeBps: number;
  protocolFeeBps: number;
  simulated: boolean;
}

export interface ActivityItem {
  id: string;
  type: "create" | "join" | "lock" | "proof" | "settle" | "claim" | "refund";
  title: string;
  signature: string;
  createdAt: string;
  explorerUrl: string;
}
