import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  clusterApiUrl
} from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { getPublicConfig } from "@tutela/config";
import type { MarketSide } from "@tutela/types";

export function getConnection() {
  const config = getPublicConfig();
  return new Connection(config.rpcUrl || clusterApiUrl("devnet"), "confirmed");
}

export function protocolPda(programId: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("protocol")], programId);
}

export function creatorPda(programId: PublicKey, creator: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("creator"), creator.toBuffer()], programId);
}

export function marketPda(programId: PublicKey, creator: PublicKey, nonce: Uint8Array) {
  return PublicKey.findProgramAddressSync([Buffer.from("market"), creator.toBuffer(), Buffer.from(nonce)], programId);
}

export function vaultAuthorityPda(programId: PublicKey, market: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("vault"), market.toBuffer()], programId);
}

export function proofPda(programId: PublicKey, market: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("proof"), market.toBuffer()], programId);
}

export function positionPda(programId: PublicKey, market: PublicKey, user: PublicKey, side: MarketSide) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("position"), market.toBuffer(), user.toBuffer(), Buffer.from([side === "YES" ? 0 : 1])],
    programId
  );
}

export function feeVaultPda(programId: PublicKey, mint: PublicKey) {
  return PublicKey.findProgramAddressSync([Buffer.from("fee_vault"), mint.toBuffer()], programId);
}

export function associatedToken(owner: PublicKey, mint: PublicKey) {
  return getAssociatedTokenAddressSync(mint, owner, true);
}

export const TXLINE_DEVNET_PROGRAM_ID = new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");

const SUBMIT_PROOF_DISCRIMINATOR = Uint8Array.from([54, 241, 46, 84, 4, 212, 46, 94]);
const VALIDATE_OUTCOME_DISCRIMINATOR = Uint8Array.from([29, 203, 125, 138, 197, 125, 152, 60]);
const SETTLE_MARKET_DISCRIMINATOR = Uint8Array.from([193, 153, 95, 216, 166, 6, 144, 217]);

export type TxLineProofNode = { hash: Uint8Array; isRightSibling: boolean };
export type TxLineStatLeaf = {
  stat: { key: number; value: number; period: number };
  statProof: TxLineProofNode[];
};
export type TxLineStatValidationInput = {
  ts: bigint;
  fixtureSummary: {
    fixtureId: bigint;
    updateStats: { updateCount: number; minTimestamp: bigint; maxTimestamp: bigint };
    eventsSubTreeRoot: Uint8Array;
  };
  fixtureProof: TxLineProofNode[];
  mainTreeProof: TxLineProofNode[];
  eventStatRoot: Uint8Array;
  stats: TxLineStatLeaf[];
};

export function parseTxLineStatValidationInput(value: unknown): TxLineStatValidationInput {
  const root = record(value, "TxLINE validation payload");
  const summary = record(pick(root, "fixtureSummary", "fixture_summary"), "fixture summary");
  const updateStats = record(pick(summary, "updateStats", "update_stats"), "update stats");
  const stats = array(pick(root, "stats"), "stats").map((entry, index) => {
    const leaf = record(entry, `stat ${index}`);
    const stat = record(pick(leaf, "stat"), `stat ${index} value`);
    return {
      stat: {
        key: integer(pick(stat, "key"), "stat key"),
        value: integer(pick(stat, "value"), "stat value"),
        period: integer(pick(stat, "period"), "stat period")
      },
      statProof: parseProof(pick(leaf, "statProof", "stat_proof"))
    };
  });
  return {
    ts: bigint(pick(root, "ts"), "timestamp"),
    fixtureSummary: {
      fixtureId: bigint(pick(summary, "fixtureId", "fixture_id"), "fixture id"),
      updateStats: {
        updateCount: integer(pick(updateStats, "updateCount", "update_count"), "update count"),
        minTimestamp: bigint(pick(updateStats, "minTimestamp", "min_timestamp"), "minimum timestamp"),
        maxTimestamp: bigint(pick(updateStats, "maxTimestamp", "max_timestamp"), "maximum timestamp")
      },
      eventsSubTreeRoot: hash32(pick(summary, "eventsSubTreeRoot", "events_sub_tree_root"))
    },
    fixtureProof: parseProof(pick(root, "fixtureProof", "fixture_proof")),
    mainTreeProof: parseProof(pick(root, "mainTreeProof", "main_tree_proof")),
    eventStatRoot: hash32(pick(root, "eventStatRoot", "event_stat_root")),
    stats
  };
}

export async function assertOfficialTxLineVerifier(connection: Connection, configuredProgramId: PublicKey) {
  if (!configuredProgramId.equals(TXLINE_DEVNET_PROGRAM_ID)) {
    throw new Error(`Tutela only accepts the official TxLINE devnet program ${TXLINE_DEVNET_PROGRAM_ID.toBase58()}.`);
  }
  const account = await connection.getAccountInfo(configuredProgramId, "confirmed");
  if (!account?.executable) throw new Error("The configured TxLINE verifier account is missing or not executable.");
}

export async function assertTutelaDeployment(connection: Connection, programId: PublicKey) {
  const account = await connection.getAccountInfo(programId, "confirmed");
  if (!account?.executable) throw new Error(`Tutela program ${programId.toBase58()} is missing or not executable on devnet.`);
}

export function txLineDailyScoresRoot(minTimestamp: bigint) {
  const seconds = minTimestamp > 10_000_000_000n ? minTimestamp / 1_000n : minTimestamp;
  const day = seconds / 86_400n;
  if (day < 0n || day > 65_535n) throw new Error("TxLINE proof timestamp is outside the supported epoch-day range.");
  const dayBytes = Buffer.alloc(2);
  dayBytes.writeUInt16LE(Number(day));
  return PublicKey.findProgramAddressSync(
    [Buffer.from("daily_scores_roots"), dayBytes],
    TXLINE_DEVNET_PROGRAM_ID
  );
}

export function encodeTxLineStatValidationInput(payload: TxLineStatValidationInput): Uint8Array {
  const writer = new BorshWriter();
  writer.i64(payload.ts);
  writer.i64(payload.fixtureSummary.fixtureId);
  writer.i32(payload.fixtureSummary.updateStats.updateCount);
  writer.i64(payload.fixtureSummary.updateStats.minTimestamp);
  writer.i64(payload.fixtureSummary.updateStats.maxTimestamp);
  writer.hash(payload.fixtureSummary.eventsSubTreeRoot);
  writer.proof(payload.fixtureProof);
  writer.proof(payload.mainTreeProof);
  writer.hash(payload.eventStatRoot);
  writer.u32(payload.stats.length);
  for (const leaf of payload.stats) {
    writer.u32(leaf.stat.key);
    writer.i32(leaf.stat.value);
    writer.i32(leaf.stat.period);
    writer.proof(leaf.statProof);
  }
  return writer.bytes();
}

export function buildSubmitProofInstruction(args: {
  programId: PublicKey;
  submitter: PublicKey;
  market: PublicKey;
  proofHash: Uint8Array;
  matchId: Uint8Array;
  finalizationTimestamp: bigint;
  statPayloadHash: Uint8Array;
}) {
  const [proof] = proofPda(args.programId, args.market);
  const writer = new BorshWriter();
  writer.raw(SUBMIT_PROOF_DISCRIMINATOR);
  writer.hash(args.proofHash);
  writer.hash(args.matchId);
  writer.i64(args.finalizationTimestamp);
  writer.hash(args.statPayloadHash);
  return new TransactionInstruction({
    programId: args.programId,
    keys: [
      { pubkey: args.submitter, isSigner: true, isWritable: true },
      { pubkey: args.market, isSigner: false, isWritable: true },
      { pubkey: proof, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    data: Buffer.from(writer.bytes())
  });
}

export function buildValidateOutcomeInstruction(args: {
  programId: PublicKey;
  market: PublicKey;
  payload: TxLineStatValidationInput;
}) {
  const [protocol] = protocolPda(args.programId);
  const [proof] = proofPda(args.programId, args.market);
  const [dailyRoot] = txLineDailyScoresRoot(args.payload.fixtureSummary.updateStats.minTimestamp);
  const data = Buffer.concat([
    Buffer.from(VALIDATE_OUTCOME_DISCRIMINATOR),
    Buffer.from(encodeTxLineStatValidationInput(args.payload))
  ]);
  return new TransactionInstruction({
    programId: args.programId,
    keys: [
      { pubkey: protocol, isSigner: false, isWritable: false },
      { pubkey: args.market, isSigner: false, isWritable: true },
      { pubkey: proof, isSigner: false, isWritable: true },
      { pubkey: TXLINE_DEVNET_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: dailyRoot, isSigner: false, isWritable: false }
    ],
    data
  });
}

export function buildSettleMarketInstruction(programId: PublicKey, market: PublicKey) {
  const [proof] = proofPda(programId, market);
  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: market, isSigner: false, isWritable: true },
      { pubkey: proof, isSigner: false, isWritable: false }
    ],
    data: Buffer.from(SETTLE_MARKET_DISCRIMINATOR)
  });
}

export async function sha256Bytes(bytes: Uint8Array) {
  const copy = Uint8Array.from(bytes);
  return new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", copy.buffer));
}

class BorshWriter {
  private readonly chunks: Uint8Array[] = [];
  raw(value: Uint8Array) { this.chunks.push(value); }
  u32(value: number) { const out = Buffer.alloc(4); out.writeUInt32LE(value); this.raw(out); }
  i32(value: number) { const out = Buffer.alloc(4); out.writeInt32LE(value); this.raw(out); }
  i64(value: bigint) { const out = Buffer.alloc(8); out.writeBigInt64LE(value); this.raw(out); }
  hash(value: Uint8Array) {
    if (value.length !== 32) throw new Error("Expected a 32-byte hash.");
    this.raw(value);
  }
  proof(nodes: TxLineProofNode[]) {
    this.u32(nodes.length);
    for (const node of nodes) {
      this.hash(node.hash);
      this.raw(Uint8Array.of(node.isRightSibling ? 1 : 0));
    }
  }
  bytes() { return Uint8Array.from(this.chunks.flatMap((chunk) => Array.from(chunk))); }
}

function parseProof(value: unknown): TxLineProofNode[] {
  return array(value, "Merkle proof").map((entry) => {
    const node = record(entry, "Merkle proof node");
    return {
      hash: hash32(pick(node, "hash")),
      isRightSibling: Boolean(pick(node, "isRightSibling", "is_right_sibling"))
    };
  });
}

function hash32(value: unknown): Uint8Array {
  let bytes: Uint8Array;
  if (value instanceof Uint8Array) bytes = value;
  else if (Array.isArray(value)) bytes = Uint8Array.from(value.map(Number));
  else if (typeof value === "string") {
    const normalized = value.startsWith("0x") ? value.slice(2) : value;
    if (/^[0-9a-f]{64}$/i.test(normalized)) bytes = Uint8Array.from(normalized.match(/../g)!.map((part) => Number.parseInt(part, 16)));
    else bytes = Uint8Array.from(Buffer.from(value, "base64"));
  } else if (value && typeof value === "object" && "data" in value) {
    bytes = Uint8Array.from((value as { data: number[] }).data);
  } else throw new Error("TxLINE returned an invalid hash.");
  if (bytes.length !== 32) throw new Error("TxLINE returned a hash that is not 32 bytes.");
  return bytes;
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`TxLINE returned an invalid ${label}.`);
  return value as Record<string, unknown>;
}

function array(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`TxLINE returned invalid ${label}.`);
  return value;
}

function pick(source: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) if (source[key] !== undefined) return source[key];
  throw new Error(`TxLINE response is missing ${keys[0]}.`);
}

function integer(value: unknown, label: string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error(`TxLINE returned an invalid ${label}.`);
  return parsed;
}

function bigint(value: unknown, label: string) {
  try { return BigInt(value as string | number | bigint); }
  catch { throw new Error(`TxLINE returned an invalid ${label}.`); }
}

export type WalletProvider = {
  publicKey?: PublicKey;
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect?: () => Promise<void>;
  signTransaction?: (transaction: import("@solana/web3.js").Transaction) => Promise<import("@solana/web3.js").Transaction>;
  signAndSendTransaction?: (transaction: import("@solana/web3.js").Transaction) => Promise<{ signature: string }>;
  signAllTransactions?: (transactions: import("@solana/web3.js").Transaction[]) => Promise<import("@solana/web3.js").Transaction[]>;
};

declare global {
  interface Window {
    solana?: WalletProvider;
    solflare?: WalletProvider;
  }
}

export function discoverWallets(): Array<{ id: "phantom" | "solflare"; name: string; provider: WalletProvider }> {
  if (typeof window === "undefined") return [];
  const wallets: Array<{ id: "phantom" | "solflare"; name: string; provider: WalletProvider }> = [];
  if (window.solana?.isPhantom) wallets.push({ id: "phantom", name: "Phantom", provider: window.solana });
  if (window.solflare?.isSolflare) wallets.push({ id: "solflare", name: "Solflare", provider: window.solflare });
  return wallets;
}
