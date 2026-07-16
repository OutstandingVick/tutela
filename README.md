# Tutela

**Guardianship Through Verifiable Truth**

Tutela is programmable football-market infrastructure built on Solana and TxLINE-compatible match data.

**TxLINE provides the match data. Tutela turns that data into programmable, verifiable football markets.**

The protocol and SDK let prediction-market applications reuse football condition logic, data normalization, canonical serialization and hashing, market creation, deterministic outcome evaluation, settlement receipts and Safety Circuit refunds. The bundled consumer app is a reference implementation of that infrastructure.

This hackathon deployment runs on Solana devnet and uses test assets only; they have no monetary value. It is not licensed for real-money wagering, not audited, not production ready and must not be deployed to mainnet.

## Product Layers

### Tutela Protocol

`programs/tutela` is the on-chain source of truth for immutable market terms, condition hashes, lifecycle transitions, TxLINE proof validation, deterministic condition evaluation, settlement records, claims and permissionless refunds.

### Tutela SDK

`@tutela/sdk` is the reusable TypeScript entry point for integrators. It exposes typed football conditions, validation, canonical bytes and hashes, TxLINE-compatible normalization, proof parsing, Protocol PDA derivation and settlement instruction builders.

```ts
import {
  TutelaSdk,
  conditionHash,
  validateConditionGroup,
  type ConditionGroup
} from "@tutela/sdk";

const sdk = new TutelaSdk({ programId: process.env.NEXT_PUBLIC_TUTELA_PROGRAM_ID! });
const errors = validateConditionGroup(conditionGroup satisfies ConditionGroup);
const hash = conditionHash(conditionGroup);
const [protocolAddress] = sdk.protocolAddress();
```

The SDK never treats live UI data as settlement authority. Applications submit supported final proof packages to the Protocol, which validates them through the configured TxLINE program before evaluating stored conditions.

### Tutela Reference App

`apps/web` demonstrates match discovery, market construction, demo participation, verification receipts and activity views. It is a consumer surface built on the same Protocol and SDK boundaries available to third-party applications.

## What Works In P0

- Premium responsive Next.js app shell and landing page
- Phantom and Solflare devnet wallet detection
- Test-USDC faucet UX and scripts for creating a local/devnet mint
- Match browser, match detail, market discovery, market detail and activity views
- Flat AND/OR condition builder with shared TypeScript validation
- Anchor program source for PDA markets, SPL-token escrow, settlement, refunds and claims
- TxLINE-compatible adapter boundary with clearly labelled simulated fallback
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

## Privy Sign-In For Testers

Tutela uses Privy for email and Google sign-in. Create a Privy app, enable **Email** and **Google** login methods, then set these variables locally and in Vercel:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SECRET=your_server_only_privy_secret
DATABASE_URL=postgresql://your_durable_database
```

`NEXT_PUBLIC_PRIVY_CLIENT_ID` is optional if your Privy dashboard provides one. New signed-in users receive one server-side grant of 1,000 free demo points. Demo points are non-transferable, cannot be purchased, cannot be withdrawn and have no monetary value.

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

For production-like tester hosting, follow the [Vercel deployment checklist](docs/vercel-deployment.md).

## Verification Status

Validated in this workspace:

```bash
corepack pnpm -r typecheck
corepack pnpm test
corepack pnpm --filter @tutela/web build
```

`NO_DNA=1 anchor build` is configured, but dependency fetching from `index.crates.io` was blocked by DNS in this environment.
