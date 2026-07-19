# Hackathon Alignment

Source listing: Superteam Earn, TxODDS, "Prediction Markets and Settlement".

## Hard Requirements

- Working build, not a concept, pitch deck or wireframe.
- TxLINE data must be the primary data source.
- Deployed website or functional API/devnet endpoint for judges.
- Public repository.
- Demo video up to 5 minutes showing the problem, live walkthrough and how TxLINE powers the backend.
- Brief technical docs with core idea, highlights and specific TxLINE endpoints used.
- Feedback on the TxLINE API experience.

## Tutela Fit

- Tutela is a Solana devnet prediction-market prototype for World Cup football statistics.
- Users receive testnet coins/test-USDC only. Tokens are never cashable and have no monetary value.
- Markets are binary YES/NO, funded by participants, and settled through PDA-controlled escrow.
- Conditions cover football statistics such as cards, offsides, throw-ins, shots, shots on target, goals and corners.
- Settlement is deterministic and uses cryptographically verifiable settlement language.
- The product has a fan-facing mobile-first interface for match markets, friend battles, location contests, leaderboards and profile analytics.

## Current Alignment Status

| Area | Status | Notes |
| --- | --- | --- |
| Working web build | Aligned | Next.js app builds and exposes the core user journey. |
| Devnet/testnet | Aligned | Configuration targets Solana devnet and labels all test coins. |
| TxLINE primary data | Aligned | The configured adapter uses live TxLINE credentials and the documented Devnet endpoints; mock data remains labelled fallback-only. |
| On-chain settlement | Aligned pending final receipt | Tutela is deployed on Devnet and invokes official TxLINE `validate_stat_v2`; the fixture-bound market is locked while waiting for TxLINE's finalized proof. |
| Demo readiness | Aligned with caveat | Demo script covers the full flow and labels fallback data. |
| Submission docs | Aligned | README, TxLINE integration notes and this checklist cover the required docs. |

## Before July 19, 2026 Submission

- Publish the remaining proof-validation-settlement-claim Explorer receipts after TxLINE finalizes fixture `18257739`.
- Record the July 14, 2026 semifinal demo path, or replay it with a labelled TxLINE/historical feed.
- Include the TxLINE API feedback paragraph from `docs/txline-integration.md` in the submission form.
