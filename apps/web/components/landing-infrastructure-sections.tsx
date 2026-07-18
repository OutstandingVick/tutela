"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Blocks,
  BookOpen,
  Check,
  ChevronDown,
  CircleDot,
  Code2,
  Database,
  ExternalLink,
  FileKey,
  GitMerge,
  LockKeyhole,
  ReceiptText,
  RefreshCcw,
  ShieldCheck
} from "lucide-react";
import { InteractiveMarketComposer } from "./interactive-market-composer";

const GITHUB = "https://github.com/OutstandingVick/tutela";
const UPDATED_AT = process.env.NEXT_PUBLIC_PROTOCOL_METRICS_UPDATED_AT ?? "17 Jul 2026";

const capabilities = [
  ["Condition Engine", "Typed football conditions, bounded AND/OR composition, canonical serialization and deterministic hashes.", Code2],
  ["Market Factory", "Reusable instructions for immutable market definitions, lifecycle state and participant-facing terms.", Blocks],
  ["Verification Adapter", "A narrow TxLINE-compatible boundary for match identity, final facts and verifier validation.", FileKey],
  ["Settlement Engine", "Integer-only condition evaluation and explicit settlement states on Solana.", GitMerge],
  ["Receipt Registry", "Inspectable outcome records that connect verified facts, conditions and settlement transactions.", ReceiptText],
  ["Safety Circuit", "A deadline-driven, permissionless recovery path when acceptable final data never arrives.", ShieldCheck]
] as const;

const capabilityPhases = ["Define", "Deploy", "Verify", "Resolve", "Inspect", "Recover"] as const;

const metrics = [
  {
    value: "Not measured yet",
    label: "Markets created",
    detail: "Requires indexed, confirmed Tutela Protocol market accounts on Solana Devnet. Local drafts are excluded."
  },
  {
    value: "Not measured yet",
    label: "Conditions evaluated",
    detail: "Requires persisted completed-settlement evaluation records, which are not currently indexed."
  },
  {
    value: "Not measured yet",
    label: "Verified settlements",
    detail: "No reliable Devnet settlement registry query is currently available to the landing page."
  },
  {
    value: "Not measured yet",
    label: "Median settlement time",
    detail: "Acceptance and confirmation timestamps are not yet recorded in a queryable telemetry source."
  },
  {
    value: "Not measured yet",
    label: "Safety Circuit tests",
    detail: "The current automated suite does not publish a distinct passed refund-path count."
  },
  {
    value: "Not measured yet",
    label: "SDK integrations",
    detail: "The @tutela/sdk workspace package exists, but consuming application imports are not yet instrumented."
  }
];

const verificationStages = [
  ["Final match data", "TxLINE-compatible final data provides completed facts.", Database],
  ["Verification package", "Match identity, schema and integrity data are packaged.", FileKey],
  ["Solana validation", "The configured verification boundary validates the package.", ShieldCheck],
  ["Condition evaluation", "Stored AND/OR conditions run deterministically.", GitMerge],
  ["Settlement receipt", "The reusable result and transaction references are recorded.", ReceiptText]
] as const;

const finalMatchFacts = [
  ["Home goals", "2"],
  ["Away goals", "1"],
  ["Total goals", "3"],
  ["Total corners", "9"],
  ["Total cards", "4"],
  ["Match winner", "Home"],
  ["Match status", "Final"]
] as const;

const finalMatchMetadata = [
  ["Match ID", "sample-match-id"],
  ["Schema version", "1.0"],
  ["Finalized at", "2026-07-14T21:02:18Z"],
  ["Data source mode", "TxLINE-compatible final data"]
] as const;

const solanaValidationChecks = [
  ["Match identity", "Passed"],
  ["Final status", "Passed"],
  ["Schema", "Supported"],
  ["Data hash", "Matched"]
] as const;

const conditionEvaluationRows = [
  ["Home team wins", "Home", "Passed"],
  ["Total goals > 2", "3", "Passed"],
  ["Total corners at least 8", "9", "Passed"]
] as const;

const settlementReceiptFields = [
  ["Winning side", "YES"],
  ["Market state", "Settled"],
  ["Receipt ID", "sample-receipt"],
  ["Condition hash", "f79d...c19a"],
  ["Network", "Solana Devnet"],
  ["Transaction", "Not broadcast - preview"]
] as const;

const verificationPayload = `{
  "matchId": "sample-match-id",
  "schemaVersion": "1.0",
  "status": "FINAL",
  "homeGoals": 2,
  "awayGoals": 1,
  "totalCorners": 9,
  "totalCards": 4,
  "dataHash": "8f21...c94a"
}`;

const faq = [
  {
    question: "What is Tutela?",
    paragraphs: ["Tutela is programmable football-market infrastructure built on Solana. It helps applications define football conditions, evaluate them against TxLINE-compatible final data, and produce reusable settlement records."],
    link: ["Read the Tutela overview", `${GITHUB}#readme`]
  },
  {
    question: "Is Tutela the same as Tutela Markets?",
    paragraphs: ["No. Tutela is the underlying protocol and developer infrastructure. Tutela Markets is the flagship consumer application built with Tutela Protocol and @tutela/sdk."],
    link: ["Explore Tutela Markets", "/app"]
  },
  {
    question: "How is Tutela different from TxLINE?",
    paragraphs: ["TxLINE-compatible infrastructure supplies football match facts. Tutela turns those facts into programmable conditions, evaluates market outcomes, manages settlement states, and records reusable receipts.", "Tutela does not create the underlying football statistics."],
    link: ["View the verification architecture", "#architecture"]
  },
  {
    question: "What can developers build with Tutela?",
    paragraphs: ["Developers can build compound football markets, tournament competitions, community forecasting products, analytics games, creator-led challenges, and other applications that need verifiable football outcomes.", "Every product must remain within the statistics supported by the configured data adapter."],
    link: ["Explore use cases", "#capabilities"]
  },
  {
    question: "Which football statistics are currently supported?",
    paragraphs: ["The current condition schema covers match winner, team and total goals, both teams to score, yellow and red cards, team and total cards, and team and total corners.", "The reference composer exposes a bounded subset, and actual availability depends on fields supplied through the configured TxLINE-compatible adapter."],
    link: ["View the condition schema", `${GITHUB}/tree/main/packages/types`]
  },
  {
    question: "Can developers combine multiple conditions?",
    paragraphs: ["Yes. A market can combine up to five supported conditions using one top-level AND or OR operator.", "For example: Home team wins AND total goals exceed two AND total corners are at least eight. Nested logical condition trees are not part of the current MVP."],
    link: ["Open the market composer", "#composer"]
  },
  {
    question: "How are conditions stored consistently?",
    paragraphs: ["Tutela validates each market definition, serializes it in a canonical format, and generates a deterministic condition hash. This helps applications and the protocol reference the same immutable definition."],
    link: ["Learn about serialization and hashing", `${GITHUB}/tree/main/packages/condition-engine`]
  },
  {
    question: "How are match outcomes verified?",
    paragraphs: ["After a match is finalized, Tutela receives a TxLINE-compatible data package, checks its match identity and supported schema, extracts the required statistics, and evaluates the stored conditions through Tutela Protocol.", "The exact guarantees depend on the verification mechanism currently implemented in the adapter and deployed protocol."],
    link: ["See the verification path", "#verification-showcase"]
  },
  {
    question: "Does Tutela manually choose winning outcomes?",
    paragraphs: ["No. Supported outcomes are evaluated by comparing validated match values with the immutable conditions stored for the market. An administrator should not be able to manually select a different result.", "The current website describes only guarantees enforced by the deployed program and documents remaining trust boundaries."],
    link: ["Read the trust model", "#security"]
  },
  {
    question: "What is a settlement receipt?",
    paragraphs: ["A settlement receipt is a reusable record containing the market definition, condition hash, verified values, individual condition results, final result, transaction references, and settlement status.", "Tutela Markets and third-party applications can use the same receipt to display how an outcome was resolved."],
    link: ["Inspect the shared types", `${GITHUB}/tree/main/packages/types`]
  },
  {
    question: "What happens when final match data is unavailable?",
    paragraphs: ["If acceptable final data does not arrive before the configured finality deadline, the market may become eligible for Tutela's Safety Circuit refund path.", "Once activated, participants claim their own principal through the supported pull-based claim process; this is not an automatic transfer."],
    link: ["Learn about the Safety Circuit", "#safety-circuit"]
  },
  {
    question: "Can third-party applications use their own product model?",
    paragraphs: ["Yes. Tutela is designed to provide programmable conditions and verifiable results without requiring every application to use the same interface, participation model, or community experience.", "The current Tutela Markets reference application uses non-transferable Devnet test credits with no monetary value."],
    link: ["Read the integration guide", `${GITHUB}/blob/main/docs/product-strategy.md`]
  },
  {
    question: "What is @tutela/sdk?",
    paragraphs: ["@tutela/sdk is the shared TypeScript workspace package for constructing and validating conditions, generating canonical hashes, deriving protocol addresses, checking the configured verifier, and building supported proof and settlement instructions."],
    link: ["Open the SDK quickstart", `${GITHUB}/tree/main/packages/sdk`]
  },
  {
    question: "Is Tutela live on Solana mainnet?",
    paragraphs: ["No. The current implementation is intended for Solana Devnet testing and demonstration.", "Test credits and test assets have no monetary value. Mainnet support should not be implied until the protocol has completed the required testing and security work."],
    link: ["View the current deployment status", "#roadmap"]
  },
  {
    question: "Is Tutela audited?",
    paragraphs: ["No. Tutela is currently experimental and unaudited. It should not be treated as production-ready financial infrastructure."],
    link: ["Read the current security limitations", `${GITHUB}/blob/main/docs/security.md`]
  },
  {
    question: "Does Tutela have an official TxLINE partnership?",
    paragraphs: ["No official partnership is currently documented. Tutela describes its integration as TxLINE-compatible; this wording refers to the supported data and verification path and does not, by itself, imply an official partnership."],
    link: ["View integration disclosures", `${GITHUB}/blob/main/docs/txline-integration.md`]
  },
  {
    question: "Can Tutela support more sports or data fields?",
    paragraphs: ["The architecture may support broader data coverage in the future, but the current implementation focuses on football and fields available through the configured adapter.", "Do not assume support for player events, exact timestamps, possession, shots, substitutions, or additional sports unless they are explicitly implemented."],
    link: ["View the roadmap", "#roadmap"]
  },
  {
    question: "How can developers start building?",
    paragraphs: ["Begin with the @tutela/sdk workspace package, construct a supported football condition, validate its generated payload, and test the complete market lifecycle on Solana Devnet."],
    link: ["Start building", `${GITHUB}#readme`]
  }
] as const;

const roadmapMilestones = [
  {
    id: "hackathon-mvp",
    number: "01",
    title: "Hackathon MVP",
    stage: "Prototype",
    status: "IN PROGRESS",
    objective: "Prove the complete programmable football-market lifecycle through a working Solana Devnet reference product.",
    deliverables: [
      "Typed, bounded football-condition definitions",
      "Canonical serialization and deterministic condition hashes",
      "Consumer match and market reference experience",
      "TxLINE-compatible verification boundary",
      "Settlement and Safety Circuit program paths"
    ],
    criteria: [
      "A reproducible Devnet flow creates, participates in, verifies and settles a market",
      "A missing-data scenario reaches refund eligibility and returns principal",
      "Setup, limitations and trust boundaries are documented"
    ],
    progress: "The reference application, typed conditions, SDK workspace package and protocol source exist. Reliable evidence for the complete deployed settlement and recovery lifecycle is not yet indexed, so this milestone remains in progress.",
    links: [
      ["Explore Tutela Markets", "/app"],
      ["Inspect repository", GITHUB]
    ]
  },
  {
    id: "public-devnet",
    number: "02",
    title: "Public Devnet",
    stage: "Current phase",
    status: "CURRENT",
    objective: "Make the Devnet protocol and reference integration reproducible, inspectable and dependable for external testing.",
    deliverables: [
      "Stable public Devnet program configuration",
      "Indexed market, evaluation, settlement and refund records",
      "Operational keeper with documented permissions",
      "Explorer-linked verification and settlement receipts",
      "Deployment guide and environment validation"
    ],
    criteria: [
      "A new developer can reproduce the supported flow from documented steps",
      "Protocol activity is derived from confirmed records rather than seeded UI data",
      "Known limitations and incident recovery procedures are public"
    ],
    progress: "The repository includes Devnet configuration, deployment guidance and a working reference application. A dependable public index, protocol-derived metrics and a fully reproducible external integration remain unfinished.",
    links: [
      ["Read deployment guide", `${GITHUB}/blob/main/docs/vercel-deployment.md`],
      ["Inspect verification", "/verify"]
    ]
  },
  {
    id: "external-integrations",
    number: "03",
    title: "External Integrations",
    stage: "Integration readiness",
    status: "NEXT",
    objective: "Let independent applications compose football conditions and consume Tutela outcomes without adopting the reference interface.",
    deliverables: [
      "Versioned @tutela/sdk public contract",
      "Framework-neutral integration quickstart",
      "Condition, market and receipt type references",
      "Example application outside the consumer reference flow",
      "Compatibility and migration policy"
    ],
    criteria: [
      "An external application creates a supported market from the public SDK",
      "The application can inspect a verified result and settlement receipt",
      "Breaking changes follow a documented versioning process"
    ],
    progress: "@tutela/sdk exists as a workspace package with tests. Public distribution, independent adopters and a compatibility policy are not yet complete.",
    links: [
      ["Inspect SDK source", `${GITHUB}/tree/main/packages/sdk`],
      ["Read integration notes", `${GITHUB}/blob/main/docs/txline-integration.md`]
    ]
  },
  {
    id: "security-hardening",
    number: "04",
    title: "Security Hardening",
    stage: "Review preparation",
    status: "PLANNED",
    objective: "Increase confidence in protocol invariants, verification boundaries and operational controls before any production consideration.",
    deliverables: [
      "Expanded adversarial and property-based program tests",
      "Replay, fixture mismatch and altered-statistics coverage",
      "Documented administrative and keeper threat models",
      "Reproducible security review environment",
      "Independent audit preparation"
    ],
    criteria: [
      "Critical lifecycle and accounting invariants have automated coverage",
      "Verification failure modes are exercised end to end",
      "Independent review findings can be tracked and remediated publicly"
    ],
    progress: "Security and TxLINE-boundary tests exist in the repository, but no completed independent audit is claimed. Tutela remains experimental and unaudited.",
    links: [
      ["Read security model", `${GITHUB}/blob/main/docs/security.md`],
      ["Inspect security tests", `${GITHUB}/tree/main/tests/integration`]
    ]
  },
  {
    id: "expanded-data-coverage",
    number: "05",
    title: "Expanded Data Coverage",
    stage: "Validated expansion",
    status: "FUTURE",
    objective: "Broaden supported football markets only where authenticated, verifiable final statistics and deterministic rules are available.",
    deliverables: [
      "Additional verified tournaments and fixtures",
      "Carefully versioned supported-stat definitions",
      "Field-availability discovery in the SDK",
      "Provider redundancy research",
      "Compatibility tests for every added statistic"
    ],
    criteria: [
      "Every new field has a documented verified-data source and safe bounds",
      "Frontend, SDK and on-chain evaluation rules remain equivalent",
      "Unavailable statistics are rejected rather than inferred or fabricated"
    ],
    progress: "Expansion is intentionally limited to data fields that can be authenticated through the supported verification path. No unsupported statistic or additional sport is promised.",
    links: [
      ["Read adapter assumptions", `${GITHUB}/blob/main/docs/txline-integration.md`],
      ["View condition SDK", `${GITHUB}/tree/main/packages/sdk`]
    ]
  }
] as const;

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">{eyebrow}</p>
        <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl md:text-6xl">{title}</h2>
      </div>
      <p className="max-w-xl text-base font-semibold leading-7 text-[#D0FEF5]/72 md:text-lg md:leading-8">{body}</p>
    </div>
  );
}

function CapabilityVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="border border-white/10 bg-[#03101A] p-4 text-sm text-[#D0FEF5]">
        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#6FB4EB]">Condition group</span>
          <span className="border border-[#6FB4EB]/40 px-2 py-1 text-xs font-semibold">AND</span>
        </div>
        {["Home team wins", "Total goals > 2", "Total corners >= 8"].map((condition) => (
          <div key={condition} className="flex items-center gap-3 border-b border-white/10 py-3 last:border-0">
            <Check className="h-4 w-4 shrink-0 text-[#6FB4EB]" />
            <span>{condition}</span>
          </div>
        ))}
        <div className="mt-3 truncate border-t border-white/10 pt-3 font-mono text-xs text-white/45">
          sha256: 8f21c3...c94a
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="border border-white/10 bg-[#03101A] p-4 text-sm text-[#D0FEF5]">
        <div className="grid grid-cols-3 border border-white/10 text-center text-xs font-semibold uppercase tracking-[0.12em]">
          <span className="bg-[#094586] px-2 py-3">Draft</span>
          <span className="border-x border-white/10 px-2 py-3 text-white/55">Open</span>
          <span className="px-2 py-3 text-white/55">Locked</span>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-white/55">Fixture</span><span>18257865</span>
          </div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-white/55">Conditions</span><span>3 / 5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/55">Terms</span><span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#6FB4EB]" /> Immutable after open</span>
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="border border-white/10 bg-[#03101A] p-4 text-sm text-[#D0FEF5]">
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#6FB4EB]">Verification path</div>
        <div className="mt-4 flex flex-col gap-2">
          {["TxLINE-compatible data", "Identity + schema checks", "Verified statistics"].map((step, stepIndex) => (
            <div key={step}>
              <div className="flex items-center justify-between border border-white/10 px-3 py-3">
                <span>{step}</span>
                {stepIndex === 2 ? <Check className="h-4 w-4 text-[#6FB4EB]" /> : <CircleDot className="h-4 w-4 text-white/35" />}
              </div>
              {stepIndex < 2 ? <ArrowDown className="mx-auto my-1 h-4 w-4 text-white/30" /> : null}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="border border-white/10 bg-[#03101A] p-4 text-sm text-[#D0FEF5]">
        <div className="mb-2 flex items-center justify-between font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#6FB4EB]">
          <span>Condition evaluation</span><span>3 / 3 passed</span>
        </div>
        {["Winner = Home", "Goals 3 > 2", "Corners 9 >= 8"].map((rule) => (
          <div key={rule} className="flex items-center justify-between border-b border-white/10 py-3">
            <span>{rule}</span><Check className="h-4 w-4 text-[#6FB4EB]" />
          </div>
        ))}
        <div className="mt-4 flex items-center justify-between bg-[#094586] px-4 py-3 font-bold">
          <span>MARKET RESULT</span><span>YES</span>
        </div>
      </div>
    );
  }

  if (index === 4) {
    return (
      <div className="border border-white/10 bg-[#03101A] p-4 text-sm text-[#D0FEF5]">
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3 font-semibold">
          <ReceiptText className="h-4 w-4 text-[#6FB4EB]" /> Settlement receipt
        </div>
        <dl className="space-y-3 font-mono text-xs">
          <div className="flex justify-between gap-4"><dt className="text-white/45">market</dt><dd className="truncate">7Xq2...tutela</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/45">condition_hash</dt><dd className="truncate">8f21...c94a</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/45">settlement_tx</dt><dd className="truncate">4mL9...Qp7a</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-white/45">slot</dt><dd>348,201,884</dd></div>
        </dl>
        <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#6FB4EB]">
          <Check className="h-4 w-4" /> Confirmed on Devnet
        </div>
      </div>
    );
  }

  return (
    <div className="border border-white/10 bg-[#03101A] p-4 text-sm text-[#D0FEF5]">
      <div className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-[#6FB4EB]">Finality timeline</div>
      <div className="mt-5 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <CircleDot className="h-5 w-5 text-white/45" />
        <div className="h-px bg-white/15" />
        <ShieldCheck className="h-5 w-5 text-[#6FB4EB]" />
      </div>
      <div className="mt-3 flex justify-between text-xs text-white/55"><span>Market closed</span><span>Deadline reached</span></div>
      <div className="mt-5 border border-[#6FB4EB]/35 p-4">
        <div className="flex items-center justify-between font-semibold"><span>Refund eligible</span><Check className="h-4 w-4 text-[#6FB4EB]" /></div>
        <p className="mt-2 text-xs leading-5 text-white/55">Principal becomes claimable without creator or protocol fees.</p>
      </div>
    </div>
  );
}

export function LandingInfrastructureSections() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedRoadmap, setSelectedRoadmap] = useState(1);
  const roadmapMilestone = roadmapMilestones[selectedRoadmap];

  return (
    <div className="landing-continuous-gradient -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <section id="composer" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading
          eyebrow="INTERACTIVE COMPOSER"
          title="Build a programmable football market."
          body="Select a match, combine supported statistics, and preview the exact condition shape an application can deploy through Tutela. This landing-page example uses fixed Devnet sample data."
        />
        <InteractiveMarketComposer />
      </section>

      <section id="capabilities" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="PLATFORM CAPABILITIES" title="Everything required to build and resolve programmable football markets." body="Tutela combines market definition, Solana execution, TxLINE-compatible verification, deterministic settlement, public receipts, and bounded recovery in one reusable developer stack." />
        <div className="mt-12 grid border-l border-t border-[#D0FEF5]/18 md:grid-cols-2">
          {capabilities.map(([title, body, Icon], index) => (
            <article key={title} className="flex min-h-[30rem] flex-col border-b border-r border-[#D0FEF5]/18 bg-[#06141F]/35 p-7 sm:p-9 lg:p-11">
              <div className="flex items-center justify-between border-b border-[#D0FEF5]/18 pb-5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black text-white/35">0{index + 1}</span>
                  <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#6FB4EB]">{capabilityPhases[index]}</span>
                </div>
                <Icon className="text-[#D0FEF5]" size={24} strokeWidth={1.6} aria-hidden="true" />
              </div>
              <div className="pt-8">
                <h3 className="text-2xl font-black text-white sm:text-3xl">{title}</h3>
                <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-[#D0FEF5]/65">{body}</p>
              </div>
              <div className="mt-auto pt-9">
                <CapabilityVisual index={index} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="verification-showcase" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="VERIFIABLE OUTCOMES" title="Every result has a traceable verification path." body="Tutela transforms TxLINE-compatible final match data into deterministic market outcomes, validated through Solana and recorded as reusable settlement receipts." />
        <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.12em]">
          <p className="inline-flex items-center gap-2 border border-[#6FB4EB]/35 px-3 py-2 text-[#D0FEF5]"><CircleDot size={14} className="text-[#6FB4EB]" /> Verifiable on Solana Devnet</p>
          <p className="border border-[#D0FEF5]/18 px-3 py-2 text-[#D0FEF5]/58">Illustrative walkthrough · no transaction broadcast</p>
        </div>

        <div className="mt-10 overflow-hidden border border-[#D0FEF5]/18 bg-[#06141F]/58">
          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div className="grid grid-cols-5 border-b border-[#D0FEF5]/18 bg-[#094586]/18">
                {verificationStages.map(([title, body, Icon], index) => (
                  <div className="relative min-h-52 border-r border-[#D0FEF5]/18 p-6 last:border-r-0" key={title}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#6FB4EB]">0{index + 1}</span>
                      <Icon aria-hidden="true" className="text-[#D0FEF5]" size={23} />
                    </div>
                    <h3 className="mt-8 text-lg font-black text-white">{title}</h3>
                    <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/62">{body}</p>
                    {index < verificationStages.length - 1 && (
                      <span aria-hidden="true" className="absolute -right-3 top-1/2 z-10 grid size-6 -translate-y-1/2 place-items-center border border-[#6FB4EB]/45 bg-[#06141F] text-[#6FB4EB]">
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5">
                <article className="border-r border-[#D0FEF5]/18 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">TxLINE-compatible final data</p>
                  <h4 className="mt-3 text-xl font-black text-white">Final match data</h4>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/64">The completed match produces the statistics required by the market definition.</p>
                  <dl className="mt-6 divide-y divide-[#D0FEF5]/12 border-y border-[#D0FEF5]/12">
                    {finalMatchFacts.map(([label, value]) => (
                      <div className="flex items-center justify-between gap-3 py-2.5 text-sm" key={label}>
                        <dt className="font-semibold text-[#D0FEF5]/55">{label}</dt>
                        <dd className="font-black text-white">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <details className="mt-5 border border-[#D0FEF5]/14 p-3 text-sm">
                    <summary className="cursor-pointer font-black text-[#D0FEF5]">Technical details</summary>
                    <dl className="mt-3 space-y-3">
                      {finalMatchMetadata.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[#6FB4EB]">{label}</dt>
                          <dd className="mt-1 break-words font-mono text-xs text-[#D0FEF5]/66">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                </article>

                <article className="border-r border-[#D0FEF5]/18 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Integrity payload</p>
                  <h4 className="mt-3 text-xl font-black text-white">Verification package</h4>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/64">The required match facts are packaged with the identifiers and integrity data needed for verification.</p>
                  <pre className="mt-6 overflow-x-auto border border-[#6FB4EB]/28 bg-[#03101A] p-4 font-mono text-[11px] leading-5 text-[#D0FEF5]/78"><code>{verificationPayload}</code></pre>
                  <p className="mt-4 text-xs font-semibold leading-5 text-[#D0FEF5]/46">The hash binds the packaged values to the submitted match identity.</p>
                </article>

                <article className="border-r border-[#D0FEF5]/18 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Program verification</p>
                  <h4 className="mt-3 text-xl font-black text-white">Solana validation</h4>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/64">The configured verification path checks identity, finality, schema support, and payload integrity before statistics are accepted.</p>
                  <div className="mt-6 space-y-2.5">
                    {solanaValidationChecks.map(([label, value]) => (
                      <div className="flex items-center justify-between border border-[#D0FEF5]/14 px-3 py-3" key={label}>
                        <span className="text-sm font-bold text-[#D0FEF5]/64">{label}</span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#D0FEF5]"><Check size={14} className="text-[#6FB4EB]" /> {value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 border-l-2 border-[#6FB4EB] pl-3 text-xs font-semibold leading-5 text-[#D0FEF5]/52">This preview demonstrates the supported validation sequence; it is not a confirmed transaction receipt.</p>
                </article>

                <article className="border-r border-[#D0FEF5]/18 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Deterministic rules</p>
                  <h4 className="mt-3 text-xl font-black text-white">Condition evaluation</h4>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/64">Tutela evaluates the market’s stored conditions against only the accepted statistics.</p>
                  <div className="mt-6 border-y border-[#D0FEF5]/14">
                    {conditionEvaluationRows.map(([rule, actual, result]) => (
                      <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#D0FEF5]/12 py-3 last:border-b-0" key={rule}>
                        <div>
                          <p className="text-sm font-black text-white">{rule}</p>
                          <p className="mt-1 text-xs font-semibold text-[#D0FEF5]/48">Verified value: {actual}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 self-center text-xs font-black text-[#D0FEF5]"><Check size={14} className="text-[#6FB4EB]" /> {result}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between bg-[#094586]/38 px-4 py-3">
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-[#D0FEF5]/58">AND result</span>
                    <span className="text-lg font-black text-white">YES</span>
                  </div>
                </article>

                <article className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Reusable output</p>
                  <h4 className="mt-3 text-xl font-black text-white">Settlement receipt</h4>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/64">The evaluated result is recorded in a consistent receipt that applications can inspect and use for their settlement flow.</p>
                  <dl className="mt-6 space-y-2.5">
                    {settlementReceiptFields.map(([label, value]) => (
                      <div className="border border-[#D0FEF5]/14 px-3 py-3" key={label}>
                        <dt className="text-[10px] font-black uppercase tracking-[0.1em] text-[#6FB4EB]">{label}</dt>
                        <dd className="mt-1 break-words font-mono text-xs font-bold text-[#D0FEF5]">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#D0FEF5]/18 px-5 py-4 text-xs font-semibold leading-5 text-[#D0FEF5]/52 md:flex-row md:items-center md:justify-between">
            <p>Match facts remain the responsibility of the configured data provider; Tutela evaluates accepted facts against immutable market conditions.</p>
            <p className="shrink-0 font-black uppercase tracking-[0.1em] text-[#6FB4EB]">Sample values and identifiers</p>
          </div>
        </div>
      </section>

      <section id="safety-circuit" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="AUTOMATED RECOVERY" title="Every market has a defined path forward." body="When TxLINE-compatible final data arrives on time, Tutela verifies and settles the market. When acceptable data remains unavailable past the finality deadline, the Safety Circuit activates a deterministic refund path." />
        <p className="mt-6 inline-flex border border-[#6FB4EB]/35 bg-[#094586]/35 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#D0FEF5]">No manual result selection</p>
        <div className="mt-10 border border-[#D0FEF5]/18 bg-[#06141F]/45 p-5 sm:p-8">
          <div className="grid gap-5 border-b border-[#D0FEF5]/16 pb-8 md:grid-cols-[0.7fr_1.3fr] md:items-start">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Risk scenario</p>
            <div>
              <h3 className="text-xl font-black leading-tight text-white">A match has finished, but acceptable final data has not been submitted before the market&apos;s finality deadline.</h3>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#D0FEF5]/68">Without a recovery mechanism, participants could remain locked in an unresolved market. Tutela uses an on-chain deadline and explicit market states to prevent indefinite settlement delays.</p>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-xl border border-[#6FB4EB]/40 bg-[#094586]/45 p-5 text-center"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Shared state</p><h3 className="mt-2 text-2xl font-black text-white">Market closed</h3></div>
          <div className="mx-auto h-10 w-px bg-[#6FB4EB]/45" />
          <div className="grid gap-5 md:grid-cols-2">
            <article className="border-t-2 border-[#6FB4EB] bg-[#D0FEF5] p-6 text-[#094586]"><p className="text-xs font-black uppercase tracking-[0.12em]">Acceptable final data received before deadline</p><h3 className="mt-3 text-2xl font-black">Normal settlement path</h3><div className="mt-6 space-y-3">{["Final data received", "Data validated", "Conditions evaluated", "Market settled"].map((x, index) => <p key={x} className="flex items-center gap-3 border-b border-[#094586]/16 pb-3 font-bold"><span className="flex size-7 shrink-0 items-center justify-center bg-[#094586] text-xs text-[#D0FEF5]">{index + 1}</span>{x}<Check className="ml-auto" size={17} /></p>)}</div></article>
            <article className="border-t-2 border-[#D0FEF5]/45 bg-[#071925] p-6 text-[#D0FEF5]"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#6FB4EB]">No acceptable final data by deadline</p><h3 className="mt-3 text-2xl font-black">Safety Circuit recovery path</h3><div className="mt-6 space-y-3">{["Finality window ends", "Refund eligibility triggered", "Principal claim opened", "No protocol or creator fee"].map((x, index) => <p key={x} className="flex items-center gap-3 border-b border-[#D0FEF5]/14 pb-3 font-bold"><span className="flex size-7 shrink-0 items-center justify-center bg-[#D0FEF5] text-xs text-[#094586]">{index + 1}</span>{x}<RefreshCcw className="ml-auto" size={17} /></p>)}</div></article>
          </div>
          <p className="mt-5 border border-[#6FB4EB]/28 bg-[#094586]/24 p-4 text-sm font-semibold leading-6 text-[#D0FEF5]/75">Once refund eligibility is active, late proofs are rejected. Principal claims remain pull-based and available while new protocol activity is paused.</p>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="SECURITY AND TRUST" title="Know what the protocol enforces—and what it depends on." body="Tutela narrows operator discretion with immutable conditions, explicit state transitions and pull-based claims, while documenting the data, keeper and administrative boundaries that remain." />
        <div className="mt-12 grid border-l border-t border-[#D0FEF5]/18 md:grid-cols-2 lg:grid-cols-5">
          {[
            ["On-chain enforcement", "PDA controls, immutable terms, bounded evaluation and checked arithmetic."],
            ["Data responsibility", "TxLINE-compatible providers remain the source of underlying match facts."],
            ["Keeper permissions", "Keepers can submit and advance eligible transitions, not choose winning facts."],
            ["Admin limits", "Pause applies narrowly; payout and refund claims remain available."],
            ["Current limitations", "Experimental Devnet software, unaudited, with test assets only."]
          ].map(([title, body]) => <article key={title} className="border-b border-r border-[#D0FEF5]/18 p-6"><LockKeyhole size={22} className="text-[#6FB4EB]" /><h3 className="mt-6 text-lg font-black text-white">{title}</h3><p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/62">{body}</p></article>)}
        </div>
      </section>

      <section id="built-on-tutela" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="BUILT ON TUTELA" title="One protocol. Many football products." body="Tutela Markets is the first working consumer surface. Additional formats below are integration concepts, not claimed customers or deployed partner products." />
        <div className="mt-12 grid gap-px bg-[#D0FEF5]/18 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/app" className="group bg-[#06141F] p-7 lg:col-span-2"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Live product</p><h3 className="mt-5 text-3xl font-black text-white">Tutela Markets</h3><p className="mt-4 max-w-2xl font-semibold leading-7 text-[#D0FEF5]/65">A Devnet football forecasting interface that demonstrates match discovery, condition composition, participation and receipts.</p><span className="mt-8 inline-flex items-center gap-2 font-black text-[#D0FEF5]">Explore Tutela Markets <ArrowRight size={17} className="transition group-hover:translate-x-1" /></span></Link>
          {["Creator market studio", "Verification explorer", "Location contests", "Embedded prediction module"].map(title => <article key={title} className="bg-[#06141F] p-7"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Integration concept</p><h3 className="mt-5 text-2xl font-black text-white">{title}</h3><p className="mt-4 text-sm font-semibold leading-6 text-[#D0FEF5]/62">A possible product surface powered by the shared condition, verification and settlement stack.</p></article>)}
        </div>
      </section>

      <section id="protocol-activity" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="PROTOCOL ACTIVITY" title="Measured across the Tutela Devnet stack." body="A transparent view of markets, condition evaluations, settlements, recovery tests, and integrations completed through Tutela." />
        <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-[#D0FEF5]/58">Solana Devnet · Updated {UPDATED_AT}</p>
        <div className="mt-10 grid border-l border-t border-[#D0FEF5]/18 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(metric => <article key={metric.label} className="min-h-56 border-b border-r border-[#D0FEF5]/18 p-6 sm:p-8"><p className={`font-black leading-tight ${metric.value === "Not measured yet" ? "text-2xl text-[#D0FEF5]/60" : "text-4xl text-[#6FB4EB]"}`}>{metric.value}</p><h3 className="mt-5 text-lg font-black text-white">{metric.label}</h3><p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/55">{metric.detail}</p></article>)}
        </div>
        <p className="mt-5 max-w-3xl text-xs font-semibold leading-5 text-[#D0FEF5]/48">Values are intentionally withheld where the repository has no reliable Devnet account index, settlement registry, or test-report telemetry. Seeded UI data and local drafts are never counted.</p>
      </section>

      <section id="roadmap" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading
          eyebrow="PROTOCOL ROADMAP"
          title="From working prototype to open football-market infrastructure."
          body="Tutela is being developed in measured stages, beginning with a complete Devnet reference implementation and progressing toward public integrations, stronger security guarantees, and broader verified-data coverage."
        />
        <p className="mt-7 max-w-3xl text-xs font-semibold leading-5 text-[#D0FEF5]/48">Roadmap priorities may change based on testing, integrations, and security review.</p>

        <div className="mt-12 overflow-x-auto pb-4 [scrollbar-color:#6FB4EB44_transparent] [scrollbar-width:thin]">
          <div className="relative grid min-w-[920px] grid-cols-5">
            <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[3.15rem] h-px bg-[#6FB4EB]/35" />
            {roadmapMilestones.map((milestone, index) => {
              const selected = selectedRoadmap === index;
              const current = milestone.status === "CURRENT";
              return (
                <button
                  key={milestone.id}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="roadmap-milestone-detail"
                  onClick={() => setSelectedRoadmap(index)}
                  className={`relative z-10 min-h-44 border-y border-r border-[#D0FEF5]/18 px-4 py-5 text-left transition-colors first:border-l focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6FB4EB] motion-reduce:transition-none ${selected ? "bg-[#D0FEF5] text-[#094586]" : "bg-[#06141F]/55 text-white hover:bg-[#094586]/50"}`}
                >
                  <span className={`grid h-12 w-12 place-items-center border font-mono text-sm font-black ${selected ? "border-[#094586] bg-[#094586] text-[#D0FEF5]" : current ? "border-[#6FB4EB] bg-[#6FB4EB] text-[#020B12]" : "border-[#6FB4EB]/55 bg-[#06141F] text-[#6FB4EB]"}`}>{milestone.number}</span>
                  <span className={`mt-5 block text-[0.65rem] font-black uppercase tracking-[0.12em] ${selected ? "text-[#094586]/65" : current ? "text-[#6FB4EB]" : "text-[#D0FEF5]/48"}`}>{milestone.status}</span>
                  <span className="mt-2 block text-base font-black leading-tight">{milestone.title}</span>
                  <span className={`mt-2 block text-xs font-semibold ${selected ? "text-[#094586]/65" : "text-[#D0FEF5]/48"}`}>{milestone.stage}</span>
                </button>
              );
            })}
          </div>
        </div>

        <article id="roadmap-milestone-detail" aria-live="polite" className="mt-7 overflow-hidden border border-[#D0FEF5]/18 bg-[#06141F]/58">
          <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b border-[#D0FEF5]/18 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-black text-[#6FB4EB]">{roadmapMilestone.number}</span>
                <span className="border border-[#6FB4EB]/35 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[#D0FEF5]">{roadmapMilestone.status}</span>
              </div>
              <p className="mt-7 text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Objective</p>
              <h3 className="mt-3 text-3xl font-black leading-tight text-white">{roadmapMilestone.title}</h3>
              <p className="mt-5 text-sm font-semibold leading-7 text-[#D0FEF5]/68">{roadmapMilestone.objective}</p>
              <p className="mt-8 text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Current progress and limitation</p>
              <p className="mt-3 text-sm font-semibold leading-7 text-[#D0FEF5]/58">{roadmapMilestone.progress}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {roadmapMilestone.links.map(([label, href]) => (
                  <Link key={label} href={href} className="inline-flex items-center gap-2 border border-[#D0FEF5]/24 px-4 py-3 text-sm font-black text-[#D0FEF5] transition-colors hover:border-[#6FB4EB] hover:text-[#6FB4EB] motion-reduce:transition-none">
                    {label} {href.startsWith("http") ? <ExternalLink size={14} /> : <ArrowRight size={14} />}
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Deliverables</p>
              <ul className="mt-5 space-y-4">
                {roadmapMilestone.deliverables.map((deliverable) => <li key={deliverable} className="flex gap-3 text-sm font-semibold leading-6 text-[#D0FEF5]/72"><CircleDot size={16} className="mt-1 shrink-0 text-[#6FB4EB]" />{deliverable}</li>)}
              </ul>
            </div>
          </div>
          <div className="border-t border-[#D0FEF5]/18 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Completion criteria</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {roadmapMilestone.criteria.map((criterion) => <p key={criterion} className="border-l border-[#6FB4EB]/45 pl-4 text-sm font-semibold leading-6 text-[#D0FEF5]/65">{criterion}</p>)}
            </div>
          </div>
        </article>
      </section>

      <section id="faq" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading
          eyebrow="FREQUENTLY ASKED QUESTIONS"
          title="Everything you need to understand Tutela."
          body="Learn how Tutela turns TxLINE-compatible football data into programmable market conditions, verifiable outcomes, and reusable settlement infrastructure."
        />
        <div className="mt-12 border-t border-[#D0FEF5]/18">
          {faq.map(({ question, paragraphs, link }, index) => {
            const open = openFaq === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={question} className="border-b border-[#D0FEF5]/18">
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenFaq(open ? null : index)}
                  className="flex min-h-20 w-full items-start justify-between gap-5 py-6 text-left text-lg font-black leading-7 text-white transition-colors hover:text-[#6FB4EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6FB4EB] motion-reduce:transition-none sm:items-center sm:py-7 sm:text-xl"
                >
                  <span>{question}</span>
                  <ChevronDown aria-hidden="true" size={22} className={`mt-1 shrink-0 text-[#6FB4EB] transition-transform duration-300 motion-reduce:transition-none sm:mt-0 ${open ? "rotate-180" : ""}`} />
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="max-w-4xl pb-7 text-sm font-semibold leading-7 text-[#D0FEF5]/65 md:text-base">
                      {paragraphs.map((paragraph) => <p key={paragraph} className="mt-2 first:mt-0">{paragraph}</p>)}
                      <Link href={link[1]} className="mt-4 inline-flex items-center gap-2 font-black text-[#6FB4EB] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6FB4EB] motion-reduce:transition-none">
                        {link[0]} <ArrowRight aria-hidden="true" size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-y border-[#D0FEF5]/18 py-20 md:py-28">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">BUILD WITH TUTELA</p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><h2 className="max-w-4xl text-4xl font-black leading-[1.02] text-white sm:text-5xl md:text-6xl">Build the next generation of football markets.</h2><p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-[#D0FEF5]/68">Define typed football conditions, inspect the verification path and experience the current Solana Devnet prototype.</p></div><div className="flex flex-wrap gap-3"><Link href="/app" className="inline-flex items-center gap-2 bg-[#6FB4EB] px-6 py-4 font-black text-[#020B12]">Explore Markets <ArrowRight size={17} /></Link><a href={`${GITHUB}#readme`} className="inline-flex items-center gap-2 border border-[#D0FEF5]/28 px-6 py-4 font-black text-[#D0FEF5]">Documentation <BookOpen size={17} /></a></div></div>
      </section>

      <footer className="mx-auto max-w-7xl py-16">
        <div className="grid gap-12 border-b border-[#D0FEF5]/18 pb-12 lg:grid-cols-[1.4fr_2fr]">
          <div><p className="text-2xl font-black text-white">Tutela</p><p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-[#D0FEF5]/62">Programmable football-market infrastructure built on Solana. Tutela turns TxLINE-compatible match data into reusable conditions, verifiable outcomes and settlement infrastructure.</p><p className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#D0FEF5]"><span className="h-2 w-2 rounded-full bg-[#6FB4EB]" /> Solana Devnet environment</p></div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Platform", [["Architecture", "#architecture"], ["Verification", "#verification-showcase"], ["Safety Circuit", "#safety-circuit"], ["Protocol metrics", "#protocol-activity"]]],
              ["Developers", [["Documentation", `${GITHUB}#readme`], ["@tutela/sdk", `${GITHUB}/tree/main/packages/sdk`], ["GitHub", GITHUB]]],
              ["Tutela Markets", [["Explore Markets", "/app"], ["Match browser", "/matches"], ["Activity", "/activity"], ["Verification receipts", "/verify"]]],
              ["Resources", [["Roadmap", "#roadmap"], ["FAQ", "#faq"], ["Trust model", "#security"], ["Current limitations", "#security"]]]
            ].map(([heading, links]) => <div key={String(heading)}><h3 className="text-sm font-black text-white">{String(heading)}</h3><ul className="mt-4 space-y-3">{(links as string[][]).map(([label, href]) => <li key={label}><a href={href} className="text-sm font-semibold text-[#D0FEF5]/56 transition hover:text-[#6FB4EB]">{label}</a></li>)}</ul></div>)}
          </div>
        </div>
        <p className="mt-8 max-w-4xl text-sm font-semibold leading-6 text-[#D0FEF5]/58">Tutela is experimental and available on Solana Devnet. Test credits and test assets have no monetary value. The protocol is currently unaudited and should not be treated as production-ready infrastructure.</p>
        <div className="mt-8 flex flex-col gap-4 border-t border-[#D0FEF5]/18 pt-7 text-xs font-bold text-[#D0FEF5]/48 md:flex-row md:items-center md:justify-between"><p>© 2026 Tutela</p><div className="flex flex-wrap gap-5"><a href={`${GITHUB}#readme`}>Documentation</a><a href={GITHUB} className="inline-flex items-center gap-1">GitHub <ExternalLink size={12} /></a><span>Solana Devnet · Experimental</span></div></div>
      </footer>
    </div>
  );
}
