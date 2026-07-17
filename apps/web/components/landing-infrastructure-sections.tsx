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

function FlowArrow() {
  return <ArrowDown aria-hidden="true" className="mx-auto my-3 text-[#6FB4EB] lg:my-0 lg:-rotate-90" size={20} />;
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
          {capabilities.map(([title, body, Icon], index) => <article key={title} className="min-h-64 border-b border-r border-[#D0FEF5]/18 bg-[#06141F]/35 p-7 sm:p-9"><span className="font-mono text-xs font-black text-[#6FB4EB]">0{index + 1}</span><Icon className="mt-8 text-[#D0FEF5]" size={28} strokeWidth={1.6} /><h3 className="mt-6 text-2xl font-black text-white">{title}</h3><p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-[#D0FEF5]/65">{body}</p></article>)}
        </div>
      </section>

      <section id="verification-showcase" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="VERIFIABLE OUTCOMES" title="Every result has a traceable verification path." body="Tutela transforms TxLINE-compatible final match data into deterministic market outcomes, validated through Solana and recorded as reusable settlement receipts." />
        <p className="mt-8 inline-flex items-center gap-2 border border-[#6FB4EB]/35 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#D0FEF5]"><CircleDot size={14} className="text-[#6FB4EB]" /> Sample Solana Devnet walkthrough</p>
        <div className="mt-10 grid items-stretch lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
          {verificationStages.map(([title, body, Icon], index) => <div className="contents" key={title}><article className="border border-[#D0FEF5]/18 bg-[#06141F]/48 p-5"><span className="font-mono text-xs font-black text-[#6FB4EB]">0{index + 1}</span><Icon className="mt-7 text-[#D0FEF5]" size={24} /><h3 className="mt-5 text-lg font-black text-white">{title}</h3><p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/62">{body}</p></article>{index < 4 && <FlowArrow />}</div>)}
        </div>
      </section>

      <section id="safety-circuit" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
        <SectionHeading eyebrow="AUTOMATED RECOVERY" title="Every market has a defined path forward." body="When TxLINE-compatible final data arrives on time, Tutela verifies and settles the market. When acceptable data remains unavailable past the finality deadline, the Safety Circuit activates a deterministic refund path." />
        <div className="mt-12 border border-[#D0FEF5]/18 bg-[#06141F]/45 p-5 sm:p-8">
          <div className="mx-auto max-w-xl border border-[#6FB4EB]/40 bg-[#094586]/45 p-5 text-center"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Shared state</p><h3 className="mt-2 text-2xl font-black text-white">Market closed</h3><p className="mt-2 text-sm font-semibold text-[#D0FEF5]/65">No manual result selection</p></div>
          <div className="mx-auto h-10 w-px bg-[#6FB4EB]/45" />
          <div className="grid gap-5 md:grid-cols-2">
            <article className="border-t-2 border-[#6FB4EB] bg-[#D0FEF5] p-6 text-[#094586]"><p className="text-xs font-black uppercase tracking-[0.12em]">Final data before deadline</p><div className="mt-6 space-y-3">{["Final data received", "Data validated", "Conditions evaluated", "Market settled"].map(x => <p key={x} className="flex items-center gap-3 border-b border-[#094586]/16 pb-3 font-bold"><Check size={17} />{x}</p>)}</div></article>
            <article className="border-t-2 border-[#D0FEF5]/45 bg-[#071925] p-6 text-[#D0FEF5]"><p className="text-xs font-black uppercase tracking-[0.12em] text-[#6FB4EB]">No acceptable data by deadline</p><div className="mt-6 space-y-3">{["Finality window ends", "Refund eligibility triggered", "Principal claim opened", "No protocol or creator fee"].map(x => <p key={x} className="flex items-center gap-3 border-b border-[#D0FEF5]/14 pb-3 font-bold"><RefreshCcw size={17} />{x}</p>)}</div></article>
          </div>
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
