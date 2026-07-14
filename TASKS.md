# Tasks

## P0

- [x] Create monorepo skeleton.
- [x] Record assumptions and TxLINE confirmed devnet configuration.
- [x] Implement Anchor protocol.
- [x] Implement mock verifier.
- [x] Implement shared condition engine and validation.
- [x] Implement Solana client helpers.
- [x] Implement Next.js web app.
- [x] Implement indexer and keeper.
- [x] Add demo scripts.
- [x] Add tests.
- [x] Add documentation.
- [x] Add Superteam/TxODDS hackathon alignment checklist.

## Submission Blockers

- [x] Configure exact TxLINE fixture, score, stream and proof endpoint paths (confirmed 2026-07-13
      against https://txline.txodds.com/documentation; see docs/txline-integration.md).
- [x] Wire live TxLINE data into `/matches` as the primary feed, with automatic fallback to the
      labelled simulated adapter on any error (packages/txline-adapter, apps/web/lib/live.ts).
- [ ] Activate TxLINE devnet free-tier access — run `scripts/txline/activate.ts` from a machine with
      a funded devnet wallet (cannot be done from this sandbox: no network route to Solana devnet RPC
      or txline-dev.txodds.com here).
- [ ] Deploy `programs/tutela` and `programs/mock-verifier` to devnet (or confirm they're already
      deployed under the program IDs in `.env.example`) — needs the Anchor/Solana CLI toolchain,
      which this sandbox does not have.
- [ ] Wire CPI validation against TxLINE `validate_stat_v2` (currently settlement still runs through
      the tested mock-verifier; `getFinalProof` fetches real TxLINE proof data for display but it
      isn't yet consumed on-chain). Requires a Rust change + anchor build/deploy.
- [ ] Record and publish the 5-minute demo video.
- [ ] Publish repo and deploy the web app somewhere public (e.g. Vercel) or confirm a devnet API
      endpoint judges can hit.

## P1

- [ ] Analytics dashboard.
- [ ] Creator dashboard.
- [ ] Keeper dashboard.
- [ ] Admin status.
- [ ] SSE reconnect and stale-data UX.
- [ ] Indexed read model.
- [ ] Creator reputation counters.
- [ ] Protocol pause UI.
- [ ] Monitoring.
- [ ] Expanded Playwright.

## P2

- [ ] Keep out of scope unless hackathon requirements change.
