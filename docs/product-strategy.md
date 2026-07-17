# Tutela Product Strategy

## Programmable, Verifiable Football Markets

**Status:** Post-hackathon product and business strategy  
**Product:** Tutela Protocol, Tutela SDK and Tutela Reference App  
**Current environment:** Solana devnet; test assets have no monetary value  
**Core message:** TxLINE provides the match data. Tutela turns that data into programmable, verifiable football markets.

Tutela is a football-market infrastructure layer built on Solana and a TxLINE-compatible data boundary. It gives prediction applications reusable primitives for defining football conditions, committing immutable market terms, validating final match statistics, evaluating outcomes deterministically, recording settlement receipts and returning principal when valid data never arrives.

The current reference application is a hackathon prototype. It is not audited, licensed for real-money wagering or ready for mainnet. Simulated and replayed data must remain clearly labelled.

## Executive Summary

Football has a large global audience and a high density of measurable events, but building a deep football prediction product requires much more than displaying a score feed. Every application must translate provider-specific data into bounded market conditions, commit those conditions before participation, establish which final data can settle a market, evaluate outcomes identically for every participant and provide a recovery path when settlement data is unavailable.

Tutela packages those responsibilities into a protocol and SDK:

- **Tutela Protocol** owns immutable market terms, condition hashes, lifecycle transitions, authenticated result validation, deterministic evaluation, settlement records and Safety Circuit refunds.
- **Tutela SDK** exposes typed conditions, validation, canonical serialization, hashes, data normalization, PDA derivation and transaction builders through `@tutela/sdk`.
- **Tutela Reference App** proves the integration through a consumer football experience without making the consumer interface the only product.

The commercial opportunity is infrastructure revenue: developer subscriptions, hosted indexing and keeper services, enterprise integration and, where legally and contractually permitted, a small protocol fee on successfully settled markets. Refunds should never generate protocol or creator fees.

## Problem Statement

### Prediction markets are useful, but contract design is the product

Research by Wolfers and Zitzewitz finds that prediction markets can aggregate dispersed information and often produce accurate forecasts. Later work by Snowberg, Wolfers and Zitzewitz reports that these markets incorporate information quickly and can outperform professional forecasts or polls in relevant settings. The same research also makes an important design point: what a market reveals depends on how its contract is specified.

Sources: [Prediction Markets (NBER Working Paper 10504)](https://www.nber.org/papers/w10504) and [Prediction Markets for Economic Forecasting (NBER Working Paper 18222)](https://www.nber.org/papers/w18222).

For football, that contract-design burden grows quickly. A simple winner market is easy to describe. A market such as "France wins AND total corners exceed eight AND total cards remain below five" requires:

- an explicit schema for each condition;
- supported fields, operators, scopes and value bounds;
- one canonical serialization and hash;
- a reliable mapping from provider data to the schema;
- a deterministic evaluation rule;
- a finality and refund policy; and
- an inspectable receipt explaining the result.

Without shared infrastructure, each prediction application must build and secure this machinery independently.

### Football creates a large, event-rich market surface

FIFA reports that the 2022 World Cup final reached close to 1.5 billion viewers and that the tournament generated 3.6 billion video views. The 2026 competition expands to 48 teams and 104 matches. These figures do not prove demand for any specific financial product, but they demonstrate a global audience and a dense schedule on which consumer games, forecasting products and market applications can be built.

Sources: [FIFA Qatar 2022 audience report](https://vod.fifa.com/tournament-organisation/audience-reports/qatar-2022) and [FIFA World Cup format evolution](https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/world-cup-format-evolution-change-history-1930-2026).

### A live feed cannot be the settlement authority by itself

Live data improves the user experience, but it should not independently determine payouts. Solana programs execute deterministically and cannot call network services or access wall-clock time in the way a web server can. A result must therefore enter the program through a transaction and be validated against an approved verification path.

Solana's Cross Program Invocation mechanism allows one program to invoke another during transaction execution. Tutela uses that boundary to validate supported TxLINE result proofs before evaluating the conditions stored in the market. The caller does not choose the winning side.

Sources: [Solana program limitations](https://solana.com/docs/programs/limitations), [Solana Cross Program Invocation](https://solana.com/docs/core/cpi) and [Solana program execution](https://solana.com/docs/core/programs/program-execution).

### Data availability failure needs a defined recovery path

Even a valid integration can experience a cancelled match, unavailable statistic, delayed finalization or missing proof. A market that only models successful settlement can leave collateral or credits in an ambiguous state. Tutela's Safety Circuit makes the recovery policy part of the market terms: after an immutable finality deadline, anyone can activate refund eligibility and participants can claim principal without protocol or creator fees.

This is not a claim that every market will settle. It is a guarantee that the protocol defines what happens when it cannot.

## Product Thesis

Prediction applications should compete on distribution, liquidity, community and market ideas rather than repeatedly rebuilding football-specific settlement infrastructure.

Tutela provides the reusable layer between match data and an application-specific market experience:

```text
TxLINE or compatible provider
            |
            v
Typed normalization and field availability
            |
            v
Tutela SDK: conditions, validation, canonical hash
            |
            v
Tutela Protocol: immutable market and lifecycle
            |
            v
Authenticated final-stat validation through CPI
            |
            v
Deterministic AND/OR evaluation
            |
            v
Settlement receipt or Safety Circuit refund
```

## Product Layers

### Tutela Protocol

The Anchor program is the source of truth for:

- market creation and immutable terms;
- a binary YES/NO participant-funded market lifecycle;
- a maximum of five conditions under one top-level `AND` or `OR` operator;
- canonical condition payloads and SHA-256 hashes;
- PDA-controlled escrow and explicit mint constraints;
- TxLINE verifier allowlisting and authenticated statistic validation;
- checked-integer pari-mutuel settlement;
- pull-based payout and refund claims;
- protocol and creator fee accounting on eligible settlements only; and
- permissionless, fee-free Safety Circuit refunds.

### Tutela SDK

`@tutela/sdk` is the integration surface for application teams. It should remain a thin, versioned facade over shared modules rather than creating a second implementation of protocol rules.

The SDK provides:

- typed football condition and market models;
- client-side validation equivalent to on-chain validation;
- canonical serialization and condition hashing;
- TxLINE-compatible normalization and field-availability checks;
- human-readable condition previews;
- Protocol PDA derivation;
- proof parsing; and
- transaction instruction builders.

Client-side evaluation is a preview. It is never the settlement authority.

### Tutela Reference App

The reference application demonstrates:

- match discovery and detail views;
- condition construction;
- test-point participation;
- proof and verification receipts;
- activity history; and
- refund behavior.

It is both a test harness and a distribution experiment. Third-party integrators do not need to adopt its branding or interface.

## Target Customers

| Segment | Need | Tutela value |
| --- | --- | --- |
| Prediction-market applications | Deeper football markets without a new settlement engine | Protocol and SDK integration |
| Sports fan and community apps | Verifiable forecasting, contests and social challenges | Condition templates and test-point workflows |
| Media and tournament products | Interactive match experiences with inspectable results | Hosted market and receipt components |
| Wallets and consumer platforms | Embedded football experiences | Typed SDK and transaction builders |
| Enterprise operators | Supported deployment, monitoring and integration | Hosted infrastructure and support |

Real-money use introduces licensing, consumer-protection, data-rights and jurisdiction-specific obligations. Those obligations are outside the current MVP and must be resolved before a production launch.

## Competitive Position

Tutela does not aim to replace TxLINE or claim to own the underlying sports data. TxLINE is a data and proof dependency. Tutela's differentiation is the market layer built above it:

- a bounded football condition language;
- equivalent frontend and on-chain validation;
- canonical, inspectable market commitments;
- deterministic result evaluation;
- a provider boundary that separates live UX from final settlement;
- reusable settlement and receipt workflows; and
- an explicit no-proof recovery mechanism.

The long-term defensibility comes from reliable integrations, audited protocol behavior, versioned condition schemas, reusable market templates, operational history and developer adoption.

## Business Model

Tutela should use a hybrid open-protocol and managed-infrastructure model. The Protocol and core SDK create trust and adoption; paid services reduce the operational burden for teams shipping consumer products.

### Revenue Streams

#### 1. Developer subscriptions

Charge for production-grade SDK support, dashboards, enhanced APIs, analytics and higher operational limits.

- Devnet and open-source development tier: free.
- Builder tier: documentation, test environments and basic hosted services.
- Growth tier: higher limits, monitoring, multiple environments and priority support.
- Enterprise tier: custom integrations, SLAs, deployment support and security reviews.

#### 2. Hosted infrastructure

Charge recurring or usage-based fees for services that application teams otherwise need to operate themselves:

- indexed market and activity APIs;
- keeper automation;
- proof polling and submission;
- verification receipt hosting;
- event webhooks;
- RPC failover and transaction monitoring; and
- operational dashboards.

#### 3. Protocol settlement fee

Where legally permitted and explicitly configured, Tutela can collect a small basis-point fee from successfully settled market volume. The existing protocol configuration supports a fee snapshot at market creation.

Rules:

- charge only on valid settlement;
- disclose the fee before participation;
- never charge on invalid, cancelled or refunded markets;
- do not let an administrator redirect participant principal; and
- introduce production fees only after audit, legal review and data-provider agreements.

#### 4. Enterprise integration and support

Offer fixed-scope implementation packages for condition design, data mapping, protocol integration, private test environments, security readiness and launch support.

#### 5. Optional creator tooling

Applications may enable bounded creator fees for eligible, validly settled markets. Tutela can charge for creator analytics, discovery and reputation tooling, but creator fees must not be represented as guaranteed income.

### Packaging Hypotheses

The following ranges are discovery hypotheses, not announced prices:

| Plan | Intended user | Illustrative model |
| --- | --- | --- |
| Devnet | Hackers and evaluators | Free |
| Builder | Small application team | $99-$299 per month |
| Growth | Active production integration | $500-$1,500 per month plus usage |
| Enterprise | Regulated or high-volume operator | Annual contract and SLA |
| Protocol | Eligible settled markets | 10-50 bps, subject to legal and partner approval |

Pricing should be validated through design-partner interviews. Tutela must not resell TxLINE data or imply partnership rights that are not covered by an agreement.

### Unit-Economics Model

```text
monthly revenue = subscriptions
                + hosted service usage
                + eligible settled volume * protocol fee bps / 10,000
                + integration and support revenue

gross profit = monthly revenue
             - data-provider costs
             - RPC, indexing and database costs
             - keeper and monitoring costs
             - support and security operations
```

An early validation milestone could be 20 Builder customers at an average $250 monthly subscription, producing $5,000 MRR before protocol-fee revenue. This is a scenario for testing willingness to pay, not a forecast.

### Business Model Canvas

| Area | Strategy |
| --- | --- |
| Customer segments | Prediction apps, sports communities, media products, wallets and enterprise operators |
| Value proposition | Launch deeper football markets without rebuilding condition, verification, settlement and refund logic |
| Channels | Open-source SDK, technical content, hackathons, ecosystem partnerships and direct design-partner sales |
| Customer relationships | Self-serve devnet, developer support, integration assistance and enterprise SLAs |
| Revenue | Subscriptions, hosted usage, integration services and eligible settlement fees |
| Key activities | Protocol development, security, provider integration, SDK maintenance and operations |
| Key resources | Anchor program, condition schema, SDK, adapter layer, reference app and developer documentation |
| Key partners | Sports-data providers, Solana RPC providers, wallets, security reviewers and distribution partners |
| Cost structure | Data licensing, infrastructure, audits, engineering, support, legal and compliance |

## Go-To-Market

### Beachhead

Begin with three to five football-focused design partners that already have users but lack rich condition and settlement infrastructure. The goal is not maximum transaction volume; it is proving that a team can integrate Tutela faster and more safely than building the same layer independently.

### Adoption Loop

1. A developer experiments on devnet at no cost.
2. Templates and the reference app shorten time to the first verifiable market.
3. Hosted receipts make the result easy to explain to users.
4. Successful markets generate reusable templates and integration evidence.
5. Mature teams adopt managed infrastructure or enterprise support.

### Initial Distribution

- publish complete SDK and protocol examples;
- provide World Cup and friendly-match templates supported by the configured data tier;
- use the reference app as a live integration demo;
- recruit Solana wallet, sports community and prediction-market partners; and
- publish verification receipts and adversarial test results rather than generic trust claims.

## Success Metrics

Do not invent production metrics. Use `Pending measurement` until telemetry produces a real value.

### Protocol and Reliability

- percentage of settlements backed by accepted proofs;
- median time from final proof availability to settlement;
- forged, replayed and wrong-fixture proof rejection rate;
- refund activation and successful claim rate;
- outstanding liabilities compared with vault balance;
- keeper success rate and RPC failover rate; and
- protocol, indexer and receipt API uptime.

### Developer Product

- time from install to first devnet market;
- SDK weekly active projects;
- number of production-qualified design partners;
- integration completion rate;
- condition validation error rate; and
- support requests per integrated application.

### Commercial

- free-to-paid conversion;
- monthly recurring revenue;
- net revenue retention;
- hosted events per customer;
- gross margin after data and infrastructure costs; and
- enterprise pilot conversion.

## Post-Hackathon Roadmap

Dates are indicative. Advancement depends on passing the release gates, not merely reaching a calendar date.

### Phase 0: Hackathon MVP - Current

- Solana devnet only;
- binary YES/NO markets;
- flat groups of up to five conditions under `AND` or `OR`;
- canonical condition hash;
- TxLINE-compatible data and proof adapter;
- direct CPI into the configured TxLINE validation program;
- deterministic on-chain evaluation;
- payout, refund and receipt workflows;
- `@tutela/sdk` integration facade; and
- reference app with non-transferable test points.

**Exit gate:** repeatable end-to-end demo, confirmed devnet program deployment, labelled data provenance and passing adversarial integration tests.

### Phase 1: Stabilization - 0 to 6 Weeks

- complete 50-user closed devnet test;
- remove seeded activity and pool data from production-like paths;
- finish durable PostgreSQL read models and idempotent participation APIs;
- wire live score updates without allowing them to settle markets;
- publish versioned SDK documentation and examples;
- add structured telemetry, stale-data UX and operational alerts;
- test forged results, wrong fixtures, replayed proofs and altered statistics; and
- document incident, pause and refund runbooks.

**Exit gate:** no critical security findings, liabilities reconcile, tester flows persist across refresh and deploys, and every accepted settlement has a traceable proof receipt.

### Phase 2: Private Builder Beta - 2 to 3 Months

- onboard three to five design partners;
- publish stable SDK interfaces and semantic versioning policy;
- launch hosted indexer, keeper and receipt APIs;
- add supported market templates and field-availability discovery;
- operate multiple independent keeper instances;
- conduct load and failure testing; and
- obtain an external architecture and threat-model review.

**Exit gate:** at least three partners complete integration, recovery drills succeed and no application depends on browser-only settlement logic.

### Phase 3: Production Readiness - 3 to 6 Months

- freeze the first production protocol scope;
- complete independent smart-contract audit and remediation;
- launch a public bug bounty after audit fixes;
- finalize commercial and technical terms with the sports-data provider;
- complete jurisdiction-specific legal and regulatory analysis;
- define collateral, treasury and upgrade-authority controls;
- establish monitoring, support and incident SLAs; and
- prepare a controlled mainnet release candidate.

**Exit gate:** audit findings resolved, legal approval obtained, data rights confirmed, operational ownership assigned and mainnet deployment explicitly approved. No mainnet launch occurs before these gates pass.

### Phase 4: Controlled Production Pilot - 6 to 12 Months

- launch with a small number of approved integrators and capped exposure;
- activate paid hosted services;
- test subscription and usage-based pricing;
- introduce protocol fees only where permitted;
- add provider redundancy behind the existing adapter boundary;
- publish reliability and settlement metrics; and
- progressively distribute keeper and operational responsibilities.

**Exit gate:** demonstrated reliability over a complete competition cycle, sustainable unit economics and acceptable security and compliance posture.

### Phase 5: Expansion - 12 Months and Beyond

- expand condition coverage only where verified data supports it;
- evaluate additional tournaments and sports;
- consider more expressive condition structures with formal complexity bounds;
- add institutional reporting and embedded-market components; and
- explore progressive decentralization after product-market fit and operational maturity.

## Principal Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| TxLINE or provider dependency | Missing or delayed settlement data | Adapter boundary, field availability, finality deadline and Safety Circuit |
| Incorrect normalization | Valid data mapped to wrong condition | Versioned schemas, fixtures, golden tests and receipt inspection |
| Smart-contract defect | Incorrect settlement or locked funds | Bounded conditions, checked arithmetic, adversarial tests, audit and bug bounty |
| RPC or keeper outage | Delayed transitions | Permissionless instructions, idempotent jobs, simulation and RPC failover |
| Legal or regulatory restrictions | Product cannot operate in a target market | Devnet-only MVP, jurisdictional review, partner controls and no premature mainnet launch |
| Data licensing limits | Commercial use or redistribution prohibited | Written provider agreement and no unsupported data resale |
| Weak integration adoption | Infrastructure does not become a business | Design partners, time-to-integration metrics and pricing discovery before expansion |

## Trust and Safety Commitments

- Do not connect real-money collateral in the hackathon MVP.
- Do not deploy the prototype to mainnet.
- Do not use real Circle USDC.
- Do not describe Tutela as licensed, audited, risk-free or production ready without evidence.
- Label test tokens as having no monetary value.
- Label simulated and replayed data.
- Do not present the mock verifier as TxLINE.
- Use "cryptographically verifiable settlement," not "oracle-free."
- Keep claims and refunds available when new creation and participation are paused.
- Reject late proofs after refund eligibility begins.
- Charge no protocol or creator fee on refunds.

## Explicitly Out of Scope Until Reassessed

- real-money wagering or fiat payments;
- mainnet USDC or mainnet deployment;
- fixed odds, AMMs, order books or secondary trading;
- arbitrarily nested condition trees;
- multi-outcome markets;
- governance tokens or a DAO;
- unaudited production custody;
- unverified TxLINE endpoints or account layouts; and
- expansion that precedes security, legal and data-provider readiness.

## Research Notes

The problem statement combines independent research with engineering inferences from the Tutela PRD and current architecture:

- Prediction-market effectiveness is supported by the cited NBER research.
- Football audience and tournament scale are supported by FIFA sources.
- Deterministic execution and CPI constraints are supported by Solana documentation.
- World Cup data access, proof endpoints and service levels are governed by the [TxLINE World Cup documentation](https://txline.txodds.com/documentation/worldcup).
- The conclusion that applications repeatedly need normalization, condition, settlement and recovery logic is Tutela's product thesis. It should be validated through design-partner interviews, integration measurements and willingness-to-pay tests.

