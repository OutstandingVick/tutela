import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  TXLINE_DEVNET_PROGRAM_ID,
  assertOfficialTxLineVerifier,
  creatorPda,
  feeVaultPda,
  marketPda,
  positionPda,
  proofPda,
  protocolPda,
  vaultAuthorityPda
} from "@tutela/solana-client";
import type { MarketSide } from "@tutela/types";

export type TutelaSdkConfig = {
  programId: PublicKey | string;
  connection?: Connection;
  rpcUrl?: string;
  txLineProgramId?: PublicKey | string;
};

/** Configured entry point for protocol addresses and verifier checks. */
export class TutelaSdk {
  readonly connection: Connection;
  readonly programId: PublicKey;
  readonly txLineProgramId: PublicKey;

  constructor(config: TutelaSdkConfig) {
    this.programId = publicKey(config.programId, "Tutela program");
    this.txLineProgramId = publicKey(config.txLineProgramId ?? TXLINE_DEVNET_PROGRAM_ID, "TxLINE program");
    this.connection = config.connection ?? new Connection(config.rpcUrl ?? clusterApiUrl("devnet"), "confirmed");
  }

  protocolAddress() {
    return protocolPda(this.programId);
  }

  creatorAddress(creator: PublicKey) {
    return creatorPda(this.programId, creator);
  }

  marketAddress(creator: PublicKey, nonce: Uint8Array) {
    return marketPda(this.programId, creator, nonce);
  }

  vaultAuthorityAddress(market: PublicKey) {
    return vaultAuthorityPda(this.programId, market);
  }

  proofAddress(market: PublicKey) {
    return proofPda(this.programId, market);
  }

  positionAddress(market: PublicKey, user: PublicKey, side: MarketSide) {
    return positionPda(this.programId, market, user, side);
  }

  feeVaultAddress(mint: PublicKey) {
    return feeVaultPda(this.programId, mint);
  }

  async assertVerifierReady() {
    await assertOfficialTxLineVerifier(this.connection, this.txLineProgramId);
  }
}

function publicKey(value: PublicKey | string, label: string) {
  try {
    return typeof value === "string" ? new PublicKey(value) : value;
  } catch {
    throw new Error(`${label} ID is not a valid Solana public key.`);
  }
}

export type {
  ActivityItem,
  BooleanOperator,
  ComparisonOperator,
  ConditionGroup,
  ConditionScope,
  ConditionValue,
  FieldAvailability,
  MarketCondition,
  MarketSide,
  MarketState,
  MatchDetails,
  MatchStats,
  MatchSummary,
  ProofPackage,
  StatField,
  TutelaMarket
} from "@tutela/types";

export {
  canonicalConditionBytes,
  conditionHash,
  evaluateCondition,
  evaluateConditionGroup,
  sha256Hex
} from "@tutela/condition-engine";

export {
  conditionGroupSchema,
  conditionValueSchema,
  marketConditionSchema,
  validateConditionGroup
} from "@tutela/validation";

export type {
  SportsDataAdapter,
  SportsDataSource,
  MatchEvent,
  MatchFilters,
  TxLineAdapterConfig,
  Unsubscribe
} from "@tutela/txline-adapter";

export {
  MockSportsDataAdapter,
  PLAYABLE_MATCH_IDS,
  TXLINE_DEVNET,
  TXLINE_FIXTURE_MAP,
  TxLineSportsDataAdapter,
  createSportsDataAdapter,
  loadTxLineConfigFromEnv,
  normalizeScoreRecord
} from "@tutela/txline-adapter";

export type {
  TxLineProofNode,
  TxLineStatLeaf,
  TxLineStatValidationInput,
  WalletProvider
} from "@tutela/solana-client";

export {
  TXLINE_DEVNET_PROGRAM_ID,
  associatedToken,
  assertOfficialTxLineVerifier,
  assertTutelaDeployment,
  buildSettleMarketInstruction,
  buildSubmitProofInstruction,
  buildValidateOutcomeInstruction,
  creatorPda,
  discoverWallets,
  encodeTxLineStatValidationInput,
  feeVaultPda,
  getConnection,
  marketPda,
  parseTxLineStatValidationInput,
  positionPda,
  proofPda,
  protocolPda,
  sha256Bytes,
  txLineDailyScoresRoot,
  vaultAuthorityPda
} from "@tutela/solana-client";
