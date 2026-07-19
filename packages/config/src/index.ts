export const DEVNET_DISCLOSURE =
  "Hackathon prototype on Solana devnet. Test tokens have no monetary value. Not audited or production ready.";

export const EXPLORER_BASE = "https://explorer.solana.com";
export const TUTELA_DEVNET_PROGRAM_ID = "GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG";
export const TXLINE_DEVNET_PROGRAM_ID = "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J";
export const TXLINE_DEVNET_API_ORIGIN = "https://txline-dev.txodds.com";

export function explorerTx(signature: string, cluster = "devnet") {
  return `${EXPLORER_BASE}/tx/${signature}?cluster=${cluster}`;
}

export function getPublicConfig() {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";
  return {
    cluster,
    rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    tutelaProgramId: cluster === "devnet"
      ? TUTELA_DEVNET_PROGRAM_ID
      : process.env.NEXT_PUBLIC_TUTELA_PROGRAM_ID ?? "",
    mockVerifierProgramId: process.env.NEXT_PUBLIC_MOCK_VERIFIER_PROGRAM_ID ?? "",
    testUsdcMint: process.env.NEXT_PUBLIC_TEST_USDC_MINT ?? "",
    indexerUrl: process.env.NEXT_PUBLIC_INDEXER_URL ?? "http://localhost:8787",
    dataSource: process.env.NEXT_PUBLIC_DATA_SOURCE ?? "txline",
    txlineMode: process.env.NEXT_PUBLIC_TXLINE_MODE ?? "txline-primary-with-simulated-fallback",
    txlineProgramId: cluster === "devnet"
      ? TXLINE_DEVNET_PROGRAM_ID
      : process.env.NEXT_PUBLIC_TXLINE_PROGRAM_ID ?? TXLINE_DEVNET_PROGRAM_ID,
    txlineApiOrigin: process.env.NEXT_PUBLIC_TXLINE_API_ORIGIN ?? TXLINE_DEVNET_API_ORIGIN
  };
}
