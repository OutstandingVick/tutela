import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { TXLINE_DEVNET_PROGRAM_ID } from "../packages/solana-client/src/index.js";

const tutelaProgramId = new PublicKey(
  process.env.NEXT_PUBLIC_TUTELA_PROGRAM_ID ?? "GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG"
);
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("devnet"),
  "confirmed"
);

const [txLineAccount, tutelaAccount] = await Promise.all([
  connection.getAccountInfo(TXLINE_DEVNET_PROGRAM_ID, "confirmed"),
  connection.getAccountInfo(tutelaProgramId, "confirmed")
]);

assertExecutable("TxLINE", TXLINE_DEVNET_PROGRAM_ID, txLineAccount);
assertExecutable("Tutela", tutelaProgramId, tutelaAccount);

console.log(`TxLINE: ${explorer(TXLINE_DEVNET_PROGRAM_ID)}`);
console.log(`Tutela: ${explorer(tutelaProgramId)}`);

function assertExecutable(
  label: string,
  address: PublicKey,
  account: Awaited<ReturnType<Connection["getAccountInfo"]>>
) {
  if (!account?.executable) {
    throw new Error(`${label} program ${address.toBase58()} is missing or not executable on devnet.`);
  }
}

function explorer(address: PublicKey) {
  return `https://explorer.solana.com/address/${address.toBase58()}?cluster=devnet`;
}
