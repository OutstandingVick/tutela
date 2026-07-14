# Assumptions

- `Tutela_PRD.docx` was requested but was not present anywhere under `/Users/macbook/Documents/New project` during implementation. The detailed prompt is used as the authoritative fallback.
- Design references were inspected from the available workspace screenshots and brand assets. They are used only for structural UX inspiration.
- TxLINE must be Tutela's primary sports data source for the Superteam/TxODDS World Cup hackathon submission.
- Confirmed TxLINE devnet values from the public docs: program ID `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`, API origin `https://txline-dev.txodds.com`, API base `https://txline-dev.txodds.com/api`, guest auth `https://txline-dev.txodds.com/auth/guest/start`, free service level `1`, and API activation at `/api/token/activate`.
- Exact endpoint paths for fixtures, score snapshots, score streams and validation proofs must be filled from TxLINE API reference/examples before submission. The adapter requires explicit endpoint paths instead of inventing them.
- TxLINE's internal TxL credit token is not the user betting currency. Tutela users only receive testnet coins/test-USDC with no monetary value.
- `packages/txline-adapter` includes a TxLINE-primary adapter shape and a mock development adapter. The mock path is clearly labelled as simulated/replayed data and not TxLINE.
- The default development fixture list contains only the real upcoming World Cup semifinal fixtures currently targeted for the demo: France v Spain on July 14, 2026 and England v Argentina on July 15, 2026. Live stats and final proof packages still require TxLINE endpoint credentials/reference paths before production-grade public use.
- The placeholder program IDs in `.env.example` must be replaced with deployed localnet/devnet program IDs before a public demo.
- `pnpm` was not installed in the current shell. The project includes Corepack instructions to activate it.
- The faucet mints devnet/localnet test-USDC only. It never connects to real Circle USDC.
- Keeper jobs simulate transactions before broadcast in code paths intended to submit transactions.
- TypeScript typecheck, workspace tests, integration tests, Next production build and localhost HTTP smoke checks passed after the redo.
- Anchor build could not be completed in this environment because DNS resolution to `index.crates.io` failed even when rerun through the escalated network path.
