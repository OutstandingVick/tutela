# Tutela: Go-Live Runbook for the July 14 Semifinal

Everything below has to run on your own machine (or Vercel's build environment) — the sandbox
Claude used to make these code changes has no network route to Solana RPC or txline-dev.txodds.com,
so none of this could be executed or tested live from there. Code changes were verified by typecheck,
unit tests, and manual review of TxLINE's public docs instead.

## What's already done (this session)

- `packages/txline-adapter` now implements a real `TxLineSportsDataAdapter` against TxLINE's confirmed
  devnet endpoints (fixtures/scores/proof), mapped to the exact fixture IDs for tomorrow's match
  (France v Spain = `18237038`) and Wednesday's (England v Argentina = `18241006`). It falls back to
  the existing simulated adapter automatically on any error, so nothing breaks if credentials aren't
  configured or TxLINE hiccups mid-demo.
- `apps/indexer` and the `/matches` + `/matches/[id]` pages now pull from this adapter (live score,
  clock, status) with the same automatic fallback.
- `scripts/txline/activate.ts` — a standalone script (own `package.json`, doesn't touch the main
  lockfile) that performs TxLINE's on-chain free-tier `subscribe` + API token activation flow.
- Docs/env updated with the confirmed endpoint list (see `docs/txline-integration.md`).
- Full workspace `typecheck` and `test` pass. New adapter logic has unit tests
  (`packages/txline-adapter/src/index.test.ts`).

**Not done, and out of scope for tonight:** CPI'ing Tutela's own Anchor program into TxLINE's
`validate_stat_v2` for on-chain settlement verification. That needs a Rust change plus an
`anchor build`/`anchor deploy`, which requires tooling this sandbox doesn't have, and is too risky to
ship uncompiled hours before a live demo. Settlement still runs on the existing, tested mock-verifier
program — real escrow, real deterministic condition evaluation, real Force Refund, per the PRD's own
allowance that the data-source/verifier may be simulated for the hackathon demo.

## Step 1 — Install and sanity-check

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
pnpm typecheck
pnpm test
```

## Step 2 — Activate TxLINE devnet free tier (real live match data)

Requires a devnet wallet funded with a small amount of devnet SOL (fees + rent only — the World Cup
tier itself is free, no TxL purchase).

```bash
solana-keygen new --outfile ~/.config/solana/id.json   # skip if you already have one
solana airdrop 1 --url devnet                          # if rate-limited, use a devnet SOL faucet

cd scripts/txline
npm install
ANCHOR_WALLET=~/.config/solana/id.json npx tsx activate.ts
```

This subscribes on-chain (service level 1, 4 weeks, free), activates an API token, and prints a live
sanity check against fixture `18237038`. Copy the printed lines into `.env.local` at the repo root:

```
NEXT_PUBLIC_DATA_SOURCE=txline
TXLINE_API_BASE_URL=https://txline-dev.txodds.com/api
TXLINE_GUEST_AUTH_URL=https://txline-dev.txodds.com/auth/guest/start
TXLINE_API_TOKEN=<printed>
TXLINE_GUEST_JWT=<printed>
```

**If the sanity-check response shape doesn't match what `normalizeScoreRecord` in
`packages/txline-adapter/src/index.ts` expects**, the app will just show zeros for that match rather
than crashing — but paste me the printed JSON and I'll fix the field mapping before kickoff.

If you'd rather not activate TxLINE tonight, leave `NEXT_PUBLIC_DATA_SOURCE=mock` — the app runs fine
on the existing labelled simulated data.

## Step 3 — Confirm (or deploy) the Solana program

`target/deploy/tutela-keypair.json` and `mock_verifier-keypair.json` already exist in the repo, which
pin the program IDs already in `.env.example`. Check whether they're already live on devnet:

```bash
solana program show GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG --url devnet
solana program show 8fRo2KWuFW4r9EBKVNKBN6AvzszFMU7hd6p9EXcCEGxv --url devnet
```

If either says "Unable to find the account" (not deployed yet):

```bash
NO_DNA=1 anchor build
anchor deploy --provider.cluster devnet
```

If `anchor deploy` assigns different program IDs than the ones above, update
`NEXT_PUBLIC_TUTELA_PROGRAM_ID` / `NEXT_PUBLIC_MOCK_VERIFIER_PROGRAM_ID` in `.env.local` and
`programs.devnet` in `Anchor.toml` to match.

## Step 4 — Test-USDC and demo markets

```bash
spl-token create-token --decimals 6 --url devnet          # note the mint address
spl-token create-account <MINT> --url devnet
spl-token mint <MINT> 1000000 --url devnet
# put <MINT> into NEXT_PUBLIC_TEST_USDC_MINT in .env.local

pnpm seed
```

## Step 5 — Run it

Local (fastest, zero extra setup):

```bash
cp .env.example .env.local   # if you haven't already merged in Steps 2-4's values
pnpm dev
```

Public URL (Vercel, so anyone can try it without your machine running):

```bash
npx vercel --prod
```

`apps/web/vercel.json` is already configured for the monorepo build. In the Vercel project's
environment variables, set everything from `.env.local` (the `NEXT_PUBLIC_*` ones at minimum; the
non-public `TXLINE_*` ones only matter if `apps/indexer` is also deployed somewhere reachable —
otherwise the web app's own server components call TxLINE directly, which is already wired).

## Pre-kickoff checklist (July 14, 19:00 UTC)

- [ ] `pnpm typecheck && pnpm test` green
- [ ] TxLINE activated (Step 2) or deliberately left on `mock` for the demo
- [ ] Program IDs in `.env.local`/`Anchor.toml` match what's actually deployed on devnet
- [ ] Test-USDC mint created and funded
- [ ] `pnpm seed` run
- [ ] App reachable (local `pnpm dev` or a deployed Vercel URL) and `/matches` shows the France v
      Spain card
- [ ] Wallet connect (Phantom/Solflare, devnet) tested end to end: browse → create/join a market →
      deposit
