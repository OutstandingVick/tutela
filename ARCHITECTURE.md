# Architecture

Tutela separates on-chain source of truth, off-chain read models, proof adapters and UI.

## On-Chain

The `programs/tutela` Anchor program owns protocol config, market, position, proof, creator profile and fee vault PDAs. Escrow collateral is held in SPL Token accounts controlled by a vault-authority PDA, never by an external wallet.

Core state transitions are emitted as events. Settlement math uses integer token base units only and checked arithmetic.

## Off-Chain

`apps/indexer` exposes health and read-model endpoints. It has an in-memory repository by default and a PostgreSQL-ready abstraction.

`apps/keeper` runs idempotent jobs for reference locking, proof polling and refund checks. It has no authority over user collateral.

## Proof Boundary

`packages/txline-adapter` defines a `SportsDataAdapter`. The TxLINE adapter is the primary production path and requires configured guest JWT, activated API token and explicit endpoint paths for fixtures, match details, score streams and validation proofs. The fallback implementation returns simulated/replayed football data and mock proof packages. It is labelled in the app and docs and does not claim to be TxLINE.

The on-chain verifier boundary is designed for a future CPI into TxLINE's `validate_stat` instruction after the matching devnet IDL, proof account layout and CPI accounts are wired. Proof submission remains separate from settlement, and the keeper has no authority over user collateral.

## Frontend

`apps/web` is a Next.js App Router app. It uses strict TypeScript, Tailwind, accessible local UI primitives, wallet-provider detection for Phantom/Solflare, shared validation and deterministic condition hashing.

## Deployment

The frontend targets Solana devnet configuration only. For the World Cup hackathon demo, deploy with TxLINE devnet free-tier credentials, keep the persistent prototype disclosure visible, and leave simulated fallback enabled only as a labelled contingency.
