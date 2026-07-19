# Devnet Deployment and Flow Evidence

Captured on 2026-07-19 against Solana Devnet. All collateral below is test-only and has no monetary
value.

## Programs

- Tutela: [`GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG`](https://explorer.solana.com/address/GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG?cluster=devnet)
- Official TxLINE: [`6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J`](https://explorer.solana.com/address/6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J?cluster=devnet)
- Tutela deployment transaction: [`4LLgFX85ynwQVxN1gdaFV7rJGXSE52JdycVAzVcrE24cDPm1Qiiq69MC1AuBZBWKsCeMrbgoK9Q3dHfXeznYEB8u`](https://explorer.solana.com/tx/4LLgFX85ynwQVxN1gdaFV7rJGXSE52JdycVAzVcrE24cDPm1Qiiq69MC1AuBZBWKsCeMrbgoK9Q3dHfXeznYEB8u?cluster=devnet)

`corepack pnpm verify:devnet` passed after deployment and confirmed both program accounts are
executable.

## TxLINE-Bound Market Preparation

- Fixture: `18257739` (Spain v Argentina)
- Market: [`4djfbpqndihNKBbQseHcpxEhr53JxREdRtSryPsHgyFS`](https://explorer.solana.com/address/4djfbpqndihNKBbQseHcpxEhr53JxREdRtSryPsHgyFS?cluster=devnet)
- Test mint: [`EzW7SZYGHMQkeQ7qm2eeBEHehTGH3sdqf44TDNjmFFPT`](https://explorer.solana.com/address/EzW7SZYGHMQkeQ7qm2eeBEHehTGH3sdqf44TDNjmFFPT?cluster=devnet)

| Step | Devnet transaction |
| --- | --- |
| Create test mint | [`gzGTUf2U...`](https://explorer.solana.com/tx/gzGTUf2U1Sqgb2KQzKkAcE3as8UHcGTP4ityusmVYnq7vFv27wYDffPzoE2QqGwDu32Jb8nYd3wcg1SitMzt3Lq?cluster=devnet) |
| Create/fund test token account | [`2wQSPU2j...`](https://explorer.solana.com/tx/2wQSPU2jGXRfhqpAmMfjwW5uMmKEt7NUhMXsUGBbeZX7qAPNqLyMgMrtyYeLKfLHmmTtjnNAb4dfBGhVoCVEgCZT?cluster=devnet) |
| Initialize Tutela with official TxLINE verifier | [`3YPaQGBH...`](https://explorer.solana.com/tx/3YPaQGBHQi8GUwzLWGXXnVcNBZzrhtSfwpEZB1Czfc4Ncng9zSyapQSzDi4NQYLDy6dZ9dsbqUnqEwmKjujWUtCW?cluster=devnet) |
| Create fixture-bound market | [`4Tnoypkv...`](https://explorer.solana.com/tx/4TnoypkvViozoAtaiDqoPPjXcy4sitmUsNEXS2uixGBPzxciWq1pqvLqggCthCQUn9AW4Q7UKEd4RbjQCsBuUFBT?cluster=devnet) |
| Deposit YES | [`3kptf6bR...`](https://explorer.solana.com/tx/3kptf6bRHjafspExqSbDx6mJABAVAuiLEvhoqrLPCNfgpz8kV7bnW3dk1BvYjXGTyXrtovzbLWTKyRGpN2Jw6n1e?cluster=devnet) |
| Deposit NO | [`2F6s5XV2...`](https://explorer.solana.com/tx/2F6s5XV2FoiPU1YnP5kD8sttkXefssjaYuzVhwjhe73tfD6GJmdwBDwruu6P8ZCFMRcEzevkiv2XovX1mRvnqqya?cluster=devnet) |
| Lock funded market | [`2GUz6t3T...`](https://explorer.solana.com/tx/2GUz6t3TWo5co1QMnh53r914JsnK646eWTuSbz5o5pVh77KWAGjmZYVZfUZ1GLGypqvZTtESALUfr2hbDNftRsPF?cluster=devnet) |

The remaining proof submission, TxLINE `validate_stat_v2` CPI, settlement and payout claim
transactions are appended after TxLINE publishes the fixture's finalized proof.
