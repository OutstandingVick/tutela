# Tutela

**Guardianship Through Verifiable Truth**

Tutela is a hackathon MVP for verifiable parametric football markets on Solana devnet. It uses devnet test tokens only; they have no monetary value. The prototype is not licensed for real-money wagering, not audited, not production ready, and must not be deployed to mainnet.

## What Works In P0

- Premium responsive Next.js app shell and landing page
- Phantom and Solflare devnet wallet detection
- Test-USDC faucet UX and scripts for creating a local/devnet mint
- Match browser, match detail, market discovery, market detail and activity views
- Flat AND/OR condition builder with shared TypeScript validation
- Anchor program source for PDA markets, SPL-token escrow, settlement, refunds and claims
- TxLINE-primary adapter boundary with clearly labelled simulated fallback
- Keeper and indexer stubs with health checks and deterministic demo data
- Seed, settlement and refund demo scripts

## Local Setup

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
cp .env.example .env.local
NO_DNA=1 anchor build
pnpm dev
```

If `pnpm` is unavailable, install it through Corepack first. Do not connect mainnet wallets or real USDC.

## Safety Notices

- Devnet test-USDC has no monetary value.
- Simulated/replayed match data is labelled in the UI.
- The bundled mock verifier is not TxLINE.
- TxLINE is the intended primary data source for the World Cup hackathon build; simulated fallback is only for development and demos when credentials or endpoint paths are unavailable.
- The MVP uses cryptographically verifiable settlement language and does not claim to be oracle-free.
- Pausing the protocol blocks new markets and joins only; claims and refunds remain available.

## Hackathon Submission Checklist

- Deploy a working devnet web app or functional API/devnet endpoint.
- Record a public demo video up to 5 minutes showing the problem, app walkthrough and how TxLINE powers the backend.
- Publish the repository.
- Include brief technical docs, business/technical highlights and the exact TxLINE endpoints used.
- Include feedback on the TxLINE API experience.
- Keep real-money, mainnet USDC and production-readiness claims out of the submission.

## Demo

See [docs/demo-script.md](docs/demo-script.md).

## Verification Status

Validated in this workspace:

```bash
corepack pnpm -r typecheck
corepack pnpm test
corepack pnpm --filter @tutela/web build
```

`NO_DNA=1 anchor build` is configured, but dependency fetching from `index.crates.io` was blocked by DNS in this environment.
