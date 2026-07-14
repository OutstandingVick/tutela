/**
 * One-time TxLINE devnet free-tier activation for Tutela.
 *
 * This performs the exact flow documented at
 * https://txline.txodds.com/documentation/worldcup and
 * https://txline.txodds.com/documentation/quickstart:
 *   1. Create (if needed) a Token-2022 associated token account for the TxL mint.
 *   2. Submit an on-chain `subscribe(serviceLevelId=1, weeks=4)` transaction
 *      (free World Cup tier — no TxL purchase required, but the wallet needs
 *      devnet SOL for the transaction fee and any account rent).
 *   3. Fetch a guest JWT from /auth/guest/start.
 *   4. Sign `${txSig}::${jwt}` with the same wallet and POST it to
 *      /api/token/activate to receive a long-lived API token.
 *
 * This CANNOT be run from Claude's sandbox (no route to Solana devnet RPC or
 * txline-dev.txodds.com from there) — run it yourself, from a machine with
 * normal internet access and a funded devnet wallet.
 *
 * This is a standalone script (its own package.json) so it never touches the
 * main pnpm workspace's lockfile. Run it from scripts/txline/:
 *
 * Usage:
 *   cd scripts/txline
 *   npm install
 *   solana-keygen new --outfile ~/.config/solana/id.json   # if you don't have one
 *   solana airdrop 1 --url devnet                          # fund it (may need a faucet if rate-limited)
 *   ANCHOR_WALLET=~/.config/solana/id.json npx tsx activate.ts
 *
 * On success this prints the exact lines to paste into the repo root's .env.local.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import * as anchor from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import nacl from "tweetnacl";
import idl from "./idl/txoracle.devnet.json" with { type: "json" };

const RPC_URL = process.env.ANCHOR_PROVIDER_URL || "https://api.devnet.solana.com";
const WALLET_PATH = (process.env.ANCHOR_WALLET || `${homedir()}/.config/solana/id.json`).replace(/^~/, homedir());
const TXL_MINT = new PublicKey(process.env.TOKEN_MINT_ADDRESS || "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG");
const PROGRAM_ID = new PublicKey(idl.address);
const API_ORIGIN = process.env.TXLINE_API_ORIGIN || "https://txline-dev.txodds.com";
const GUEST_AUTH_URL = `${API_ORIGIN}/auth/guest/start`;
const API_BASE_URL = `${API_ORIGIN}/api`;
const SERVICE_LEVEL_ID = 1; // Free World Cup tier
const DURATION_WEEKS = 4;
const SELECTED_LEAGUES: number[] = []; // Standard free bundle

async function main() {
  const secret = Uint8Array.from(JSON.parse(readFileSync(WALLET_PATH, "utf8")));
  const wallet = Keypair.fromSecretKey(secret);
  console.log(`Wallet: ${wallet.publicKey.toBase58()}`);

  const connection = new Connection(RPC_URL, "confirmed");
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Devnet SOL balance: ${balance / 1e9}`);
  if (balance === 0) {
    throw new Error(
      "Wallet has 0 devnet SOL. Run `solana airdrop 1 --url devnet` (or use a faucet) before activating."
    );
  }

  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(wallet), { commitment: "confirmed" });
  const program = new anchor.Program(idl as anchor.Idl, provider);

  const userTokenAccount = getAssociatedTokenAddressSync(TXL_MINT, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);

  const accountInfo = await connection.getAccountInfo(userTokenAccount);
  if (!accountInfo) {
    console.log("Creating Token-2022 associated token account for the TxL mint...");
    const createAtaTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        userTokenAccount,
        wallet.publicKey,
        TXL_MINT,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    const sig = await connection.sendTransaction(createAtaTx, [wallet]);
    await connection.confirmTransaction(sig, "confirmed");
    console.log(`Token account created: ${sig}`);
  }

  await getAccount(connection, userTokenAccount, "confirmed", TOKEN_2022_PROGRAM_ID);

  const [pricingMatrixPda] = PublicKey.findProgramAddressSync([Buffer.from("pricing_matrix")], PROGRAM_ID);
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("token_treasury_v2")], PROGRAM_ID);
  const tokenTreasuryVault = getAssociatedTokenAddressSync(TXL_MINT, tokenTreasuryPda, true, TOKEN_2022_PROGRAM_ID);

  console.log(`Subscribing on-chain: service level ${SERVICE_LEVEL_ID}, ${DURATION_WEEKS} weeks (free tier, no TxL charge)...`);

  const subscribeTx: Transaction = await program.methods
    .subscribe(SERVICE_LEVEL_ID, DURATION_WEEKS)
    .accounts({
      user: wallet.publicKey,
      pricingMatrix: pricingMatrixPda,
      tokenMint: TXL_MINT,
      userTokenAccount,
      tokenTreasuryVault,
      tokenTreasuryPda,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    })
    .transaction();

  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  subscribeTx.recentBlockhash = latestBlockhash.blockhash;
  subscribeTx.feePayer = wallet.publicKey;
  subscribeTx.sign(wallet);

  const txSig = await connection.sendRawTransaction(subscribeTx.serialize());
  await connection.confirmTransaction(
    { signature: txSig, blockhash: latestBlockhash.blockhash, lastValidBlockHeight: latestBlockhash.lastValidBlockHeight },
    "confirmed"
  );
  console.log(`Subscribe transaction confirmed: ${txSig}`);
  console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);

  console.log("Requesting guest JWT...");
  const jwtResponse = await fetch(GUEST_AUTH_URL, { method: "POST" });
  if (!jwtResponse.ok) throw new Error(`Guest auth failed with ${jwtResponse.status}`);
  const { token: jwt } = (await jwtResponse.json()) as { token: string };

  console.log("Activating API token...");
  const messageString = `${txSig}:${SELECTED_LEAGUES.join(",")}:${jwt}`;
  const signatureBytes = nacl.sign.detached(new TextEncoder().encode(messageString), wallet.secretKey);
  const walletSignature = Buffer.from(signatureBytes).toString("base64");

  const activationResponse = await fetch(`${API_BASE_URL}/token/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
    body: JSON.stringify({ txSig, walletSignature, leagues: SELECTED_LEAGUES })
  });
  if (!activationResponse.ok) {
    const body = await activationResponse.text();
    throw new Error(`Activation failed with ${activationResponse.status}: ${body}`);
  }
  const activationBody = (await activationResponse.json()) as { token?: string } | string;
  const apiToken = typeof activationBody === "string" ? activationBody : activationBody.token;
  if (!apiToken) throw new Error(`Activation response did not include a token: ${JSON.stringify(activationBody)}`);

  console.log("\nActivated. Add these to your .env.local:\n");
  console.log(`NEXT_PUBLIC_DATA_SOURCE=txline`);
  console.log(`TXLINE_API_BASE_URL=${API_BASE_URL}`);
  console.log(`TXLINE_GUEST_AUTH_URL=${GUEST_AUTH_URL}`);
  console.log(`TXLINE_API_TOKEN=${apiToken}`);
  console.log(`TXLINE_GUEST_JWT=${jwt}`);

  console.log("\nSanity check: fetching live scores snapshot for fixture 18237038 (France v Spain, semifinal)...");
  const check = await fetch(`${API_BASE_URL}/scores/snapshot/18237038`, {
    headers: { Authorization: `Bearer ${jwt}`, "X-Api-Token": apiToken }
  });
  console.log(`GET /scores/snapshot/18237038 -> ${check.status}`);
  if (check.ok) {
    const body = await check.json();
    console.log(JSON.stringify(body, null, 2).slice(0, 2000));
    console.log(
      "\nIf this shape doesn't match what packages/txline-adapter/src/index.ts expects (normalizeScoreRecord), " +
        "share this output so the field mapping can be corrected before kickoff."
    );
  } else {
    console.log(await check.text());
  }
}

main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  }
);
