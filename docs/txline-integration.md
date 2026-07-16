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

The TxLINE implementation uses the documented score and validation endpoints. The mock implementation remains available only for offline UI development and is never accepted by the settlement endpoint.

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
- `programs/tutela` CPIs directly into TxLINE's official devnet `validate_stat_v2` instruction.
  Protocol initialization rejects any other verifier address, and validation also requires the
  configured program account to be executable.
- Tutela submits an equality predicate for every supplied final-period statistic. This prevents a
  caller from changing a value while retaining a valid proof for the original data.
- The proof payload is committed at submission, bound to the market's immutable TxLINE fixture ID,
  protected from replay, and evaluated against the stored canonical AND/OR conditions on-chain.
- `settle_market` accepts only the `Verified` state produced by that authenticated evaluation. There
  is no caller-supplied winning side.

## Deployment Gate

The source, generated IDL, client transaction builders and adversarial tests are complete. A devnet
upgrade must not be represented as deployed until the upgrade transaction has been simulated,
approved by the upgrade authority and confirmed. The frontend must use that confirmed program ID.

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
