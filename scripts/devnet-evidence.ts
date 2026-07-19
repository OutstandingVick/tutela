import { AnchorProvider, BN, Program, Wallet, type Idl } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  type TransactionInstruction
} from "@solana/web3.js";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  TXLINE_DEVNET_PROGRAM_ID,
  buildSettleMarketInstruction,
  buildSubmitProofInstruction,
  buildValidateOutcomeInstruction,
  creatorPda,
  encodeTxLineStatValidationInput,
  marketPda,
  parseTxLineStatValidationInput,
  positionPda,
  proofPda,
  protocolPda,
  sha256Bytes,
  vaultAuthorityPda
} from "../packages/solana-client/src/index.ts";
import {
  createSportsDataAdapter,
  loadTxLineConfigFromEnv
} from "../packages/txline-adapter/src/index.ts";
import { canonicalConditionBytes } from "../packages/condition-engine/src/index.ts";

const PROGRAM_ID = new PublicKey("GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG");
const FIXTURE_ID = 18_257_739;
const MATCH_ID = "worldcup-spain-argentina-2026-07-19";
const NONCE = Uint8Array.from([84, 85, 84, 69, 76, 65, 48, 49]); // TUTELA01
const EXPECTED_END = BigInt(Date.parse("2026-07-19T21:00:00.000Z") / 1_000);
const RPC_URL = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
const KEYPAIR_PATH = process.env.SOLANA_KEYPAIR_PATH ?? configuredSolanaKeypairPath();

const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(KEYPAIR_PATH, "utf8")) as number[]));
const connection = new Connection(RPC_URL, "confirmed");
const wallet = new Wallet(payer);
const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed", preflightCommitment: "confirmed" });
const idl = JSON.parse(readFileSync(resolve("target/idl/tutela.json"), "utf8")) as Idl;
const program = new Program(idl, provider) as Program;
const [protocol] = protocolPda(PROGRAM_ID);
const [market] = marketPda(PROGRAM_ID, payer.publicKey, NONCE);
const command = process.argv[2];

if (command === "prepare") await prepare();
else if (command === "lock") await lock();
else if (command === "settle") await settle();
else if (command === "claim") await claim();
else throw new Error("Usage: tsx scripts/devnet-evidence.ts <prepare|lock|settle|claim>");

async function prepare() {
  assertFutureWindow();
  let protocolAccount = await connection.getAccountInfo(protocol, "confirmed");
  let mint: PublicKey;

  if (!protocolAccount) {
    const mintKeypair = Keypair.generate();
    mint = mintKeypair.publicKey;
    const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE, "confirmed");
    await sendSimulated("create test-USDC mint", [
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: mintRent,
        space: MINT_SIZE,
        programId: TOKEN_PROGRAM_ID
      }),
      createInitializeMintInstruction(mint, 6, payer.publicKey, null, TOKEN_PROGRAM_ID)
    ], [mintKeypair]);

    const ownerToken = getAssociatedTokenAddressSync(mint, payer.publicKey);
    await sendSimulated("create and fund test-USDC account", [
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        ownerToken,
        payer.publicKey,
        mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      ),
      createMintToInstruction(mint, ownerToken, payer.publicKey, 10_000_000n)
    ]);

    const initialize = await program.methods
      .initializeProtocol(0, 0, new BN(1), new BN(10_000_000), 100, TXLINE_DEVNET_PROGRAM_ID)
      .accountsStrict({
        admin: payer.publicKey,
        protocolConfig: protocol,
        collateralMint: mint,
        systemProgram: SystemProgram.programId
      })
      .instruction();
    await sendSimulated("initialize Tutela protocol", [initialize]);
    protocolAccount = await connection.getAccountInfo(protocol, "confirmed");
  } else {
    const decoded = await (program.account as any).protocolConfig.fetch(protocol);
    mint = decoded.allowedCollateralMint as PublicKey;
  }

  if (!protocolAccount) throw new Error("Protocol initialization was not confirmed.");
  if (await connection.getAccountInfo(market, "confirmed")) {
    print({ phase: "prepare", reused: true, mint: mint.toBase58(), market: market.toBase58() });
    return;
  }

  const now = BigInt(Math.floor(Date.now() / 1_000));
  const participationDeadline = now + 180n;
  const refundEligibility = EXPECTED_END + 7_200n;
  const claimDeadline = EXPECTED_END + 10_000n;
  const matchIdHash = Uint8Array.from(createHash("sha256").update(MATCH_ID).digest());
  const conditionPayload = canonicalConditionBytes({
    operator: "AND",
    conditions: [{
      field: "TotalGoals",
      operator: "Gte",
      scope: "FullTime",
      value: { kind: "u16", value: 0 }
    }]
  });
  const vault = Keypair.generate();
  const [creatorProfile] = creatorPda(PROGRAM_ID, payer.publicKey);
  const [vaultAuthority] = vaultAuthorityPda(PROGRAM_ID, market);
  const createMarket = await program.methods
    .createMarket({
      marketNonce: Array.from(NONCE),
      matchId: Array.from(matchIdHash),
      txlineFixtureId: new BN(FIXTURE_ID),
      title: "Spain vs Argentina — TxLINE verified total goals",
      booleanOperator: { and: {} },
      conditionCount: 1,
      conditionPayload: Buffer.from(conditionPayload),
      minimumDeposit: new BN(1),
      maximumDeposit: new BN(10_000_000),
      creatorFeeBps: 0,
      participationDeadline: new BN(participationDeadline.toString()),
      expectedMatchEndTimestamp: new BN(EXPECTED_END.toString()),
      refundEligibilityTimestamp: new BN(refundEligibility.toString()),
      claimDeadline: new BN(claimDeadline.toString())
    })
    .accountsStrict({
      creator: payer.publicKey,
      protocolConfig: protocol,
      creatorProfile,
      market,
      vaultAuthority,
      vault: vault.publicKey,
      collateralMint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    })
    .instruction();
  const createSignature = await sendSimulated("create TxLINE-bound market", [createMarket], [vault]);

  const ownerToken = getAssociatedTokenAddressSync(mint, payer.publicKey);
  const deposits: Record<string, string> = {};
  for (const [label, side] of [["YES", { yes: {} }], ["NO", { no: {} }]] as const) {
    const [position] = positionPda(PROGRAM_ID, market, payer.publicKey, label);
    const join = await program.methods
      .joinMarket(side, new BN(1_000_000))
      .accountsStrict({
        user: payer.publicKey,
        protocolConfig: protocol,
        market,
        userToken: ownerToken,
        vault: vault.publicKey,
        position,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      })
      .instruction();
    deposits[label] = await sendSimulated(`join ${label}`, [join]);
  }

  print({
    phase: "prepare",
    fixtureId: FIXTURE_ID,
    matchId: MATCH_ID,
    mint: mint.toBase58(),
    market: market.toBase58(),
    participationDeadline: participationDeadline.toString(),
    transactions: { createMarket: createSignature, ...deposits }
  });
}

async function lock() {
  const instruction = await program.methods.lockMarket().accountsStrict({ market }).instruction();
  const signature = await sendSimulated("lock market", [instruction]);
  print({ phase: "lock", market: market.toBase58(), transaction: signature });
}

async function settle() {
  const adapter = createSportsDataAdapter({ source: "txline", txline: loadTxLineConfigFromEnv() });
  const proofPackage = await adapter.getFinalProof(MATCH_ID);
  if (!proofPackage.raw || proofPackage.simulated || proofPackage.verifierLabel !== "txline") {
    throw new Error("An authenticated final TxLINE proof is not available.");
  }
  const payload = parseTxLineStatValidationInput(proofPackage.raw);
  if (payload.fixtureSummary.fixtureId !== BigInt(FIXTURE_ID)) throw new Error("TxLINE fixture mismatch.");
  const payloadBytes = encodeTxLineStatValidationInput(payload);
  const payloadHash = await sha256Bytes(payloadBytes);
  const proofHash = /^[0-9a-f]{64}$/i.test(proofPackage.proofHash)
    ? Uint8Array.from(proofPackage.proofHash.match(/../g)!.map((part) => Number.parseInt(part, 16)))
    : payloadHash;
  const marketAccount = await connection.getAccountInfo(market, "confirmed");
  if (!marketAccount || !marketAccount.owner.equals(PROGRAM_ID)) throw new Error("Tutela market account is unavailable.");
  const storedMatchId = marketAccount.data.subarray(41, 73);
  const finalization = payload.fixtureSummary.updateStats.maxTimestamp > 10_000_000_000n
    ? payload.fixtureSummary.updateStats.maxTimestamp / 1_000n
    : payload.fixtureSummary.updateStats.maxTimestamp;

  const submitted = await sendSimulated("submit TxLINE proof", [buildSubmitProofInstruction({
    programId: PROGRAM_ID,
    submitter: payer.publicKey,
    market,
    proofHash,
    matchId: storedMatchId,
    finalizationTimestamp: finalization,
    statPayloadHash: payloadHash
  })]);
  const validated = await sendSimulated("validate through TxLINE", [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    buildValidateOutcomeInstruction({ programId: PROGRAM_ID, market, payload })
  ]);
  const settled = await sendSimulated("settle authenticated outcome", [buildSettleMarketInstruction(PROGRAM_ID, market)]);
  print({ phase: "settle", market: market.toBase58(), transactions: { submitted, validated, settled } });
}

async function claim() {
  const account = await (program.account as any).market.fetch(market);
  const side = account.verifiedResult?.yes !== undefined ? "YES" : "NO";
  const [position] = positionPda(PROGRAM_ID, market, payer.publicKey, side);
  const mint = account.collateralMint as PublicKey;
  const vault = account.vault as PublicKey;
  const [vaultAuthority] = vaultAuthorityPda(PROGRAM_ID, market);
  const ownerToken = getAssociatedTokenAddressSync(mint, payer.publicKey);
  const instruction = await program.methods.claimPayout().accountsStrict({
    owner: payer.publicKey,
    market,
    position,
    vault,
    vaultAuthority,
    ownerToken,
    tokenProgram: TOKEN_PROGRAM_ID
  }).instruction();
  const signature = await sendSimulated("claim winning payout", [instruction]);
  print({ phase: "claim", side, market: market.toBase58(), transaction: signature });
}

async function sendSimulated(label: string, instructions: TransactionInstruction[], additionalSigners: Keypair[] = []) {
  const latest = await connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({
    feePayer: payer.publicKey,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight
  }).add(...instructions);
  transaction.sign(payer, ...additionalSigners);
  const simulation = await connection.simulateTransaction(transaction);
  if (simulation.value.err) {
    const logs = simulation.value.logs?.slice(-10).join(" | ") ?? JSON.stringify(simulation.value.err);
    throw new Error(`${label} simulation failed: ${logs}`);
  }
  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 8
  });
  const confirmation = await connection.confirmTransaction({ signature, ...latest }, "confirmed");
  if (confirmation.value.err) throw new Error(`${label} failed: ${JSON.stringify(confirmation.value.err)}`);
  console.log(`${label}: ${explorer(signature)}`);
  return signature;
}

function assertFutureWindow() {
  const now = BigInt(Math.floor(Date.now() / 1_000));
  if (now + 240n >= EXPECTED_END) throw new Error("Not enough time remains to prepare this fixture safely.");
}

function explorer(signature: string) {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

function print(value: unknown) {
  console.log(JSON.stringify(value, null, 2));
}

function configuredSolanaKeypairPath() {
  const output = execFileSync("solana", ["config", "get", "keypair"], { encoding: "utf8" });
  const match = output.match(/Key Path:\s*(.+)/);
  if (!match?.[1]) throw new Error("Set SOLANA_KEYPAIR_PATH or configure a Solana CLI keypair.");
  return match[1].trim();
}
