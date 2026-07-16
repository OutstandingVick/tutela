# Architecture

Tutela is a programmable football-market infrastructure layer. TxLINE-compatible providers supply match data; Tutela normalizes that data, commits immutable football conditions and turns authenticated final statistics into deterministic market outcomes.

The system separates the Protocol, SDK, data adapters, automation and reference UI so another prediction application can integrate Tutela without adopting the Tutela consumer experience.

## Tutela Protocol

The `programs/tutela` Anchor program owns protocol config, market, position, proof, creator profile and fee vault PDAs. Escrow collateral is held in SPL Token accounts controlled by a vault-authority PDA, never by an external wallet.

Market conditions and their canonical hash become immutable when a market opens. The Protocol validates final-stat proofs through CPI into the exact configured executable TxLINE program, evaluates the stored flat AND/OR condition group on-chain and permits settlement only after that evaluation succeeds.

Core state transitions are emitted as events. Settlement math uses integer token base units and checked arithmetic. The Safety Circuit provides permissionless, fee-free principal refunds when valid final data is unavailable by the immutable deadline.

## Tutela SDK

`packages/sdk` exposes the supported integration surface as `@tutela/sdk`. It composes existing modules rather than implementing a second condition engine:

- Typed football conditions and market models from `@tutela/types`
- Validation rules from `@tutela/validation`
- Canonical serialization, SHA-256 hashes and deterministic preview evaluation from `@tutela/condition-engine`
- TxLINE-compatible data normalization and adapter contracts from `@tutela/txline-adapter`
- Protocol PDAs, proof parsing and transaction instruction builders from `@tutela/solana-client`

Browser-side evaluation is a preview only. Settlement authority remains with the Protocol.

## Off-Chain

`apps/indexer` exposes health and read-model endpoints. It has an in-memory repository by default and a PostgreSQL-ready abstraction.

`apps/keeper` runs idempotent jobs for reference locking, proof polling and refund checks. It has no authority over user collateral.

## Proof Boundary

`packages/txline-adapter` defines a provider-neutral `SportsDataAdapter`. The TxLINE adapter requires configured guest JWT, activated API token and explicit endpoint paths for fixtures, match details, score streams and validation proofs. The fallback implementation returns simulated/replayed football data and mock proof packages. It is labelled in the app and docs and does not claim to be TxLINE.

The Protocol CPI invokes TxLINE's official devnet `validate_stat_v2` instruction, requires the configured verifier account to be executable at the exact allowlisted address and consumes the authenticated validated-stat output. A caller cannot supply the winning side. Proof submission remains separate from validation and settlement, and the keeper has no authority over market outcomes or user collateral.

## Frontend

`apps/web` is the reference consumer implementation. It uses the same shared validation, deterministic condition hashing, adapter contracts and Solana instruction builders exposed through the SDK architecture.

## Deployment

The frontend targets Solana devnet configuration only. For the World Cup hackathon demo, deploy with TxLINE devnet free-tier credentials, keep the persistent prototype disclosure visible, and leave simulated fallback enabled only as a labelled contingency.
