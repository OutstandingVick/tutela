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
- `corepack pnpm test` — passed after the security hardening (6 TypeScript integration tests and 8
  Rust tests in the full command).
- `cargo test -p tutela --lib` — passed after hardening: 8 tests.
- `corepack pnpm exec vitest run tests/integration/txline-security.test.ts` — passed: 5 tests.
- `NO_DNA=1 anchor build` — passed with existing Anchor/Solana cfg and LTO warnings.

## Live Match Status Correction

- TxLINE `/scores/snapshot/{fixtureId}` responses are not assumed to be chronological; the adapter
  now selects the record with the greatest sequence number, using its timestamp as a tiebreaker.
- A fixture still marked `StatusId=1` after scheduled kickoff uses the bounded kickoff/end-time
  fallback, while explicit postponements remain upcoming.
- Verified against fixture `18257739` during the match: the adapter returned `status=live` and a
  TxLINE-backed `0-0` score.
- TxLINE adapter tests now include 8 passing cases, including unordered snapshot and live-status
  regressions. Web and adapter type-checks and the web production build pass.

## Devnet Evidence and Remaining Blocker

- Tutela was deployed successfully to Devnet at
  `GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG`. Deployment transaction:
  https://explorer.solana.com/tx/4LLgFX85ynwQVxN1gdaFV7rJGXSE52JdycVAzVcrE24cDPm1Qiiq69MC1AuBZBWKsCeMrbgoK9Q3dHfXeznYEB8u?cluster=devnet
- TxLINE and Tutela executable checks both pass with `corepack pnpm verify:devnet`:
  https://explorer.solana.com/address/6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J?cluster=devnet
  https://explorer.solana.com/address/GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG?cluster=devnet
- Protocol initialization, a fixture-bound market, YES/NO test deposits and the permissionless lock
  are confirmed for TxLINE fixture `18257739`. The market address is
  `4djfbpqndihNKBbQseHcpxEhr53JxREdRtSryPsHgyFS`.
- All confirmed signatures are recorded in `docs/devnet-evidence.md`.
- The remaining proof submission, TxLINE CPI validation, settlement and payout claim depend on
  TxLINE publishing the fixture's finalized proof after the match completes. Do not claim the full
  end-to-end flow until those final signatures are appended.

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

After TxLINE finalizes fixture `18257739`, run the remaining evidence commands with the configured
Devnet keypair and `apps/web/.env.local` loaded:

```bash
corepack pnpm evidence:settle
corepack pnpm evidence:claim
```

Append the returned Explorer links to `docs/devnet-evidence.md`, then rerun the checks above.
