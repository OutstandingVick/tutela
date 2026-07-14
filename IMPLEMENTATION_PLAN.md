# Implementation Plan

## P0

- Create isolated monorepo, documentation, environment template and reproducible scripts.
- Build Anchor programs for Tutela and a labelled mock verifier.
- Implement shared condition engine, validation, types and TxLINE adapter interfaces.
- Build Next.js app with landing, app shell, wallet connection, market/match/verify/activity/faucet flows.
- Add lightweight indexer and keeper services with health endpoints and demo read models.
- Add local validator Anchor tests, TypeScript unit tests and Playwright smoke coverage.
- Document setup, security, TxLINE assumptions and demo procedure.

## P1

- Add analytics, creator dashboard, keeper dashboard and admin protocol status.
- Add SSE reconnect/stale-data UX and persistent indexed read model.
- Add creator reputation counters and protocol pause UI.
- Expand Playwright and monitoring coverage.

## P2

- Mainnet, real USDC, fiat, fixed-odds, AMM/order book, secondary trading, nested condition trees, governance, SDK and compliance infrastructure are intentionally out of scope.

## Milestones

1. Foundation and docs.
2. Shared validation and mock data.
3. Anchor state machine and token escrow.
4. Web P0 flows.
5. Keeper/indexer/demo scripts.
6. Tests and hackathon deployment notes.
