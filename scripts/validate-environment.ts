const required = [
  "NEXT_PUBLIC_SOLANA_CLUSTER",
  "NEXT_PUBLIC_SOLANA_RPC_URL",
  "NEXT_PUBLIC_TUTELA_PROGRAM_ID",
  "NEXT_PUBLIC_MOCK_VERIFIER_PROGRAM_ID"
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta") {
  console.error("Tutela MVP must not target mainnet.");
  process.exit(1);
}

console.log("Tutela environment is valid for a devnet/localnet prototype.");
