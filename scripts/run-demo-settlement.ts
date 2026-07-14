console.log(JSON.stringify({
  demo: "settlement",
  steps: [
    "Create a market from worldcup-sf-france-spain-2026-07-14 or worldcup-sf-england-argentina-2026-07-15",
    "Join YES and NO with devnet test-USDC",
    "Lock after participation deadline",
    "Submit the final proof reference only after the match has completed",
    "Validate outcome through the configured verification adapter identity",
    "Settle and claim winning payout"
  ],
  safety: "No real-money collateral. Testnet coins have no monetary value. Mock verifier is not TxLINE."
}, null, 2));
