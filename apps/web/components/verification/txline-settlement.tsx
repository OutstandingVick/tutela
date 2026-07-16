"use client";

import { useState } from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  TXLINE_DEVNET_PROGRAM_ID,
  assertOfficialTxLineVerifier,
  buildSettleMarketInstruction,
  buildSubmitProofInstruction,
  buildValidateOutcomeInstruction,
  encodeTxLineStatValidationInput,
  getConnection,
  parseTxLineStatValidationInput,
  sha256Bytes
} from "@tutela/solana-client";
import { getPublicConfig, explorerTx } from "@tutela/config";
import { useTutelaAuth } from "@/providers/tutela-auth-provider";
import { useWallet } from "@/providers/wallet-provider";

const MATCHES = [
  ["worldcup-france-england-2026-07-18", "France vs England"],
  ["worldcup-spain-argentina-2026-07-19", "Spain vs Argentina"],
  ["friendly-vietnam-myanmar-2026-07-18", "Vietnam vs Myanmar"]
] as const;

export function TxLineSettlement() {
  const { authenticated, authenticatedFetch, login } = useTutelaAuth();
  const { publicKey, provider, wallets, connect } = useWallet();
  const [matchId, setMatchId] = useState<string>(MATCHES[0][0]);
  const [marketAddress, setMarketAddress] = useState("");
  const [status, setStatus] = useState("Ready to fetch a finalized TxLINE proof.");
  const [busy, setBusy] = useState(false);
  const [signatures, setSignatures] = useState<string[]>([]);

  async function run() {
    if (!authenticated) return login();
    if (!publicKey || !provider?.signAndSendTransaction) {
      const first = wallets[0];
      if (!first) throw new Error("Install Phantom or Solflare to submit a permissionless settlement.");
      await connect(first.id);
      return;
    }
    setBusy(true);
    setSignatures([]);
    try {
      const market = new PublicKey(marketAddress);
      const config = getPublicConfig();
      if (!config.tutelaProgramId) throw new Error("NEXT_PUBLIC_TUTELA_PROGRAM_ID is not configured.");
      const programId = new PublicKey(config.tutelaProgramId);
      const connection = getConnection();
      setStatus("Checking the official TxLINE executable program...");
      await assertOfficialTxLineVerifier(connection, new PublicKey(config.txlineProgramId));

      const response = await authenticatedFetch(`/api/txline/proof?matchId=${encodeURIComponent(matchId)}`, { cache: "no-store" });
      const packageData = await response.json() as { raw?: unknown; proofHash?: string; fixtureId?: number; error?: string };
      if (!response.ok || !packageData.raw) throw new Error(packageData.error ?? "Final proof is unavailable.");
      const payload = parseTxLineStatValidationInput(packageData.raw);
      if (payload.fixtureSummary.fixtureId !== BigInt(packageData.fixtureId!)) throw new Error("TxLINE proof fixture does not match the selected match.");
      if (payload.stats.some((leaf) => leaf.stat.period !== 100)) throw new Error("TxLINE has not finalized all requested statistics.");

      const marketAccount = await connection.getAccountInfo(market, "confirmed");
      if (!marketAccount || !marketAccount.owner.equals(programId) || marketAccount.data.length < 73) {
        throw new Error("The market is not a valid account owned by the configured Tutela program.");
      }
      const storedMatchId = marketAccount.data.subarray(41, 73);
      const payloadBytes = encodeTxLineStatValidationInput(payload);
      const payloadHash = await sha256Bytes(payloadBytes);
      const proofHash = packageData.proofHash && /^[0-9a-f]{64}$/i.test(packageData.proofHash)
        ? Uint8Array.from(packageData.proofHash.match(/../g)!.map((part) => Number.parseInt(part, 16)))
        : payloadHash;
      const finalizationSeconds = payload.fixtureSummary.updateStats.maxTimestamp > 10_000_000_000n
        ? payload.fixtureSummary.updateStats.maxTimestamp / 1_000n
        : payload.fixtureSummary.updateStats.maxTimestamp;

      setStatus("Simulating proof submission...");
      const submit = new Transaction().add(buildSubmitProofInstruction({
        programId,
        submitter: publicKey,
        market,
        proofHash,
        matchId: storedMatchId,
        finalizationTimestamp: finalizationSeconds,
        statPayloadHash: payloadHash
      }));
      await prepareAndSimulate(connection, submit, publicKey);
      setStatus("Approve proof submission in your wallet.");
      const submitted = await provider.signAndSendTransaction(submit);
      await connection.confirmTransaction(submitted.signature, "confirmed");
      setSignatures([submitted.signature]);

      setStatus("Simulating TxLINE validation and deterministic settlement...");
      const settle = new Transaction().add(
        buildValidateOutcomeInstruction({ programId, market, payload }),
        buildSettleMarketInstruction(programId, market)
      );
      await prepareAndSimulate(connection, settle, publicKey);
      setStatus("Approve TxLINE validation and settlement in your wallet.");
      const settled = await provider.signAndSendTransaction(settle);
      await connection.confirmTransaction(settled.signature, "confirmed");
      setSignatures([submitted.signature, settled.signature]);
      setStatus("Outcome authenticated by TxLINE, evaluated by Tutela, and settled on devnet.");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-5 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-5 text-[#4A051C]">
      <div className="flex items-center gap-2"><ShieldCheck size={20} /><h2 className="text-xl font-black">Permissionless TxLINE settlement</h2></div>
      <p className="mt-2 text-sm leading-6">Fetch a finalized proof, simulate both transactions, authenticate every statistic through TxLINE, evaluate the stored conditions on-chain, then settle.</p>
      <label className="mt-4 block text-xs font-black uppercase tracking-[0.14em]">Match</label>
      <select value={matchId} onChange={(event) => setMatchId(event.target.value)} className="mt-2 w-full rounded-lg border border-[#6FB4EB] bg-white px-3 py-3 font-bold">
        {MATCHES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
      <label className="mt-4 block text-xs font-black uppercase tracking-[0.14em]">Tutela market account</label>
      <input value={marketAddress} onChange={(event) => setMarketAddress(event.target.value)} placeholder="Devnet market public key" className="mt-2 w-full rounded-lg border border-[#6FB4EB] bg-white px-3 py-3 font-mono text-sm" />
      <button type="button" disabled={busy || !marketAddress} onClick={() => void run()} className="mt-4 w-full rounded-lg bg-[#094586] px-4 py-3 font-black text-[#D0FEF5] disabled:opacity-50">
        {busy ? "Simulating..." : authenticated ? publicKey ? "Submit proof and settle" : "Connect wallet" : "Sign in to settle"}
      </button>
      <p role="status" className="mt-3 text-sm font-semibold">{status}</p>
      {signatures.map((signature) => <a key={signature} href={explorerTx(signature)} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 break-all font-mono text-xs font-bold text-[#094586]">{signature}<ExternalLink size={13} /></a>)}
      <p className="mt-4 text-xs font-bold">Verifier: {TXLINE_DEVNET_PROGRAM_ID.toBase58()}</p>
    </section>
  );
}

async function prepareAndSimulate(connection: ReturnType<typeof getConnection>, transaction: Transaction, feePayer: PublicKey) {
  transaction.feePayer = feePayer;
  transaction.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  const simulation = await connection.simulateTransaction(transaction);
  if (simulation.value.err) {
    const detail = simulation.value.logs?.slice(-4).join(" | ") ?? JSON.stringify(simulation.value.err);
    throw new Error(`Transaction simulation failed: ${detail}`);
  }
}
