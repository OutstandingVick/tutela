# TxLINE Integration Boundary

Tutela's hackathon submission must use TxLINE as the primary sports data source. Simulated or replayed football data is allowed only as a labelled fallback for demos, tests and offline development.

## Confirmed Devnet Configuration

- TxLINE devnet program ID: `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`
- TxLINE devnet API origin: `https://txline-dev.txodds.com`
- TxLINE devnet API base: `https://txline-dev.txodds.com/api`
- Guest auth: `POST https://txline-dev.txodds.com/auth/guest/start`
- API activation: `POST https://txline-dev.txodds.com/api/token/activate`
- Free devnet service level: `1`
- API request headers after activation: `Authorization: Bearer <guest-jwt>` and `X-Api-Token: <api-token>`

Free tier access does not require a TxL purchase, but the subscribing wallet still needs devnet SOL for transaction fees and possible rent.

## Adapter Contract

`packages/txline-adapter` exposes `SportsDataAdapter` with:

- `listMatches`
- `getMatch`
- `subscribeToMatch`
- `getFieldAvailability`
- `getFinalProof`

The TxLINE implementation requires exact endpoint paths to be supplied through configuration. It intentionally does not hardcode undocumented paths. The mock implementation remains available for offline development and must always be labelled as simulated/replayed data.

## Confirmed 2026-07-13 Against TxLINE's Public Docs

Source pages: `/documentation/quickstart`, `/documentation/worldcup`, `/documentation/scores/schedule`,
`/documentation/scores/soccer-feed`, `/documentation/examples/fetching-snapshots`,
`/documentation/examples/streaming-data`, `/documentation/examples/onchain-validation`,
`/documentation/programs/devnet`.

- Confirmed devnet World Cup semifinal fixture IDs: `18237038` (France v Spain, 2026-07-14 19:00 UTC)
  and `18241006` (England v Argentina, 2026-07-15 19:00 UTC). See `TXLINE_FIXTURE_MAP` in
  `packages/txline-adapter/src/index.ts`.
- Soccer full-game stat keys (period prefix 0): `1`/`2` = P1/P2 goals, `3`/`4` = P1/P2 yellow cards,
  `5`/`6` = P1/P2 red cards, `7`/`8` = P1/P2 corners. Final outcome records use
  `action=game_finalised` with `statusId`/`period` = `100`.
- `packages/txline-adapter/src/index.ts` implements `TxLineSportsDataAdapter` against these endpoints,
  with defensive parsing (unknown/unrecognized field casing degrades to 0 rather than throwing) since this
  environment could not reach `txline-dev.txodds.com` to capture one live response body. Run
  `scripts/txline/activate.ts` and compare its printed sample response against
  `normalizeScoreRecord` in that file before relying on it for the live demo.
- The **CPI into TxLINE's own `validate_stat`/`validate_stat_v2`** (i.e. Tutela's Anchor program
  verifying a TxLINE proof on-chain, per Section 20/30 of the PRD) is **not yet wired** — that
  requires a Rust change to `programs/tutela` plus an `anchor build`/`anchor deploy`, which needs the
  Solana/Anchor toolchain this environment does not have. Settlement still runs through the
  already-tested `mock-verifier` program. `getFinalProof` in the adapter does fetch a **real** TxLINE
  validation payload (`/scores/stat-validation`) for display on the verification page, so the data is
  real even though on-chain verification of it is not yet CPI'd.

## Still To Wire Before Submission

- CPI account layout and proof payload mapping so `programs/tutela`'s `validate_outcome` instruction
  actually calls TxLINE's `validate_stat_v2` instead of the mock verifier.
- Verify `normalizeScoreRecord`'s field-name assumptions against one real `/scores/snapshot/{fixtureId}`
  response (see `scripts/txline/activate.ts` output) and adjust if the live shape differs.

## Submission Endpoint List

Endpoints actually used in the deployed build:

| Purpose | Endpoint |
| --- | --- |
| Guest authentication | `POST https://txline-dev.txodds.com/auth/guest/start` |
| API token activation | `POST https://txline-dev.txodds.com/api/token/activate` |
| On-chain free-tier subscription | `subscribe(serviceLevelId=1, weeks=4)` on program `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` |
| Scores snapshot (live match state) | `GET /scores/snapshot/{fixtureId}` |
| Scores stream (SSE, not yet wired client-side) | `GET /scores/stream` |
| Validation proof | `GET /scores/stat-validation?fixtureId=...&seq=...&statKeys=1,2,3,4,5,6,7,8` |
