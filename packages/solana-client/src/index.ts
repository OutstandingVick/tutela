import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
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

export type WalletProvider = {
  publicKey?: PublicKey;
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect?: () => Promise<void>;
  signTransaction?: unknown;
  signAllTransactions?: unknown;
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
