# Tutela Handoff

Updated: 2026-07-19

## Repository State

- Existing Tutela monorepo; do not recreate or reinitialize it.
- Branch at start of this continuation: `main`, tracking `origin/main`.
- Branding, routes, design tokens and application structure were preserved.
- `AGENTS.md` was not present when this continuation started.
- TxLINE official devnet program: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`.
- Configured Tutela program: `GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG`.

## Critical-Blocker Work Completed

- `programs/tutela` invokes the official Anchor `validate_stat_v2` discriminator and exact published
  payload/strategy layout.
- The TxLINE account is constrained to the exact devnet address and must be executable.
- The daily scores root must be the expected TxLINE PDA and owned by the TxLINE program.
- Each supplied final-period stat is authenticated with an equality predicate in the CPI strategy.
- Payloads are bound to the immutable fixture ID and submitted stat-payload hash.
- Stored canonical AND/OR conditions are evaluated on-chain from authenticated stats.
- No validation or settlement instruction accepts a caller-selected winning side.
- Settlement now consumes the verified proof PDA and requires its submitted stat hash to equal the
  nonzero hash persisted by successful TxLINE validation.
- The frontend checks that both Tutela and TxLINE are executable before submitting the two-step flow.
- The checked-in TxLINE devnet IDL is the official published version containing `validate_stat_v2`.

## Adversarial Evidence

Rust security tests cover:

- wrong fixture IDs;
- altered statistics after proof submission;
- replayed validation;
- forged/false and wrong-program CPI return data;
- exact coverage of every supplied statistic;
- authenticated AND/OR evaluation;
- settlement before validation, with an unverified proof, or with a mismatched stat hash.

TypeScript integration tests cover the exact official address/root accounts, payload mutation,
absence of a winning-side argument, rejection of an incorrect configured TxLINE address and the
required proof PDA on settlement.

## Checks Run

- `corepack pnpm -r build` — passed.
- `corepack pnpm -r typecheck` — passed when run serially after the Next.js build.
- `corepack pnpm test` — passed before the security hardening.
- `cargo test -p tutela --lib` — passed after hardening: 8 tests.
- `corepack pnpm exec vitest run tests/integration/txline-security.test.ts` — passed: 5 tests.
- `NO_DNA=1 anchor build` — passed with existing Anchor/Solana cfg and LTO warnings.

## Devnet Evidence and Remaining Blocker

- TxLINE executable check succeeded on devnet. Explorer:
  https://explorer.solana.com/address/6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J?cluster=devnet
- Tutela executable check failed because the configured program account does not exist yet. Explorer:
  https://explorer.solana.com/address/GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG?cluster=devnet
- Deployment was attempted with the existing program keypair. It required approximately 3.904
  devnet SOL; the deployer had approximately 1.954 SOL. Faucet requests for 2, 1 and 0.5 SOL were
  rate-limited. No deployment transaction was created and no temporary buffer retained funds.
- Because Tutela is not deployed, a complete live proof-validation-settlement transaction and its
  Explorer links cannot yet be produced. Do not claim deployment or end-to-end devnet completion.

## Next Commands

```bash
solana airdrop 2 --url devnet
NO_DNA=1 anchor build
solana program deploy target/deploy/tutela.so \
  --program-id target/deploy/tutela-keypair.json \
  --url devnet --use-rpc
corepack pnpm verify:devnet
corepack pnpm -r typecheck
corepack pnpm test
corepack pnpm --filter @tutela/web build
```

After funding/deployment, initialize the protocol and execute a real finalized TxLINE proof through
`/verify`; record both transaction signatures and add their Solana Explorer links here.
