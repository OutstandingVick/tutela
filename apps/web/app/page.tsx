"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Anchor,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Blocks,
  Code2,
  DatabaseZap,
  EyeOff,
  Hourglass,
  Menu,
  Radio,
  ReceiptText,
  ShieldCheck,
  Split,
  UsersRound,
  X
} from "lucide-react";

const navItems = [
  { label: "Product", href: "#product" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Developers", href: "#developers" },
  { label: "Documentation", href: "#documentation" }
];

const infrastructureLabels = [
  { label: "Solana", Icon: Blocks },
  { label: "Anchor", Icon: Anchor },
  { label: "TypeScript SDK", Icon: Code2 },
  { label: "TxLINE-compatible", Icon: DatabaseZap },
  { label: "Public receipts", Icon: ReceiptText }
];

const infrastructurePillars = [
  {
    title: "Live product surface",
    body: "Match discovery, market creation and participation stay fast for everyday users while final settlement remains constrained to supported proof paths.",
    Icon: Radio
  },
  {
    title: "Verifiable settlement rails",
    body: "Final data packages move through a TxLINE-compatible adapter, verification boundary and deterministic Anchor condition evaluation.",
    Icon: BadgeCheck
  },
  {
    title: "Recoverable test collateral",
    body: "PDA-controlled devnet escrow, public receipts and permissionless refund activation keep test assets from relying on operator discretion.",
    Icon: ShieldCheck
  }
];

const manualInfrastructureSteps = [
  "Normalize football data",
  "Build condition logic",
  "Generate condition hashes",
  "Develop market contracts",
  "Verify final results",
  "Implement settlement",
  "Create refund handling",
  "Maintain keeper infrastructure"
];

const tutelaIntegrationFlow = [
  { label: "TxLINE-compatible data", Icon: DatabaseZap },
  { label: "@tutela/sdk", Icon: Code2 },
  { label: "Tutela Protocol", Icon: Blocks },
  { label: "Verified settlement receipt", Icon: BadgeCheck }
];

const trustMetrics = [
  {
    value: "Pending",
    label: "demo settlements backed by submitted proofs"
  },
  {
    value: "Pending",
    label: "median devnet settlement time"
  },
  {
    value: "12",
    label: "condition types supported in the MVP schema"
  },
  {
    value: "Pending",
    label: "verified demo matches"
  },
  {
    value: "0",
    label: "operator-controlled outcome changes"
  }
];

const marketProblems = [
  {
    title: "Limited combinations",
    body: "Traditional products mainly support simple winner or totals markets, leaving richer football theses outside the market surface.",
    Icon: Split
  },
  {
    title: "Opaque settlement",
    body: "Users cannot easily inspect the exact data package, condition rules or transaction path used to determine an outcome.",
    Icon: EyeOff
  },
  {
    title: "Delayed resolution",
    body: "Final results can remain pending while participants wait without a clear proof status or recovery route.",
    Icon: Hourglass
  },
  {
    title: "Counterparty dependence",
    body: "Participants often depend on an operator to custody funds, interpret edge cases and decide when settlement is final.",
    Icon: UsersRound
  }
];

const traditionalSteps = ["Match ends", "Operator reviews", "Internal decision", "Delayed result"];
const tutelaSteps = ["Final data", "Proof validation", "Condition evaluation", "On-chain receipt"];

const developerUseCases = [
  {
    id: "compound",
    label: "Compound football markets",
    description: "Combine goals, cards, corners, match results, and both-teams-to-score conditions into deeper market outcomes.",
    Icon: Split
  },
  {
    id: "live",
    label: "Live-stat experiences",
    description: "Turn supported live match updates into fast, inspectable prediction surfaces for football audiences.",
    Icon: Radio
  },
  {
    id: "creator",
    label: "Creator market builders",
    description: "Give communities structured tools to publish clear football theses without rebuilding contract logic.",
    Icon: UsersRound
  },
  {
    id: "verification",
    label: "Verification explorers",
    description: "Trace match facts, condition evaluation, and proof-backed receipts in a plain-language result view.",
    Icon: BadgeCheck
  },
  {
    id: "safety",
    label: "Safety-first pools",
    description: "Add deterministic deadlines and permissionless principal refunds when final data cannot be verified.",
    Icon: ShieldCheck
  },
  {
    id: "embedded",
    label: "Embedded football infrastructure",
    description: "Use @tutela/sdk and protocol instructions inside prediction apps, contests, and fan products.",
    Icon: Code2
  }
] as const;

function UseCaseVisual({ type }: { type: (typeof developerUseCases)[number]["id"] }) {
  if (type === "compound") {
    return (
      <div className="space-y-2 font-mono text-xs font-bold text-[#D0FEF5]">
        {["Home team wins", "Total goals > 2", "Total corners ≥ 8"].map((condition, index) => (
          <div key={condition}>
            {index > 0 && <p className="pb-2 pl-3 text-[10px] uppercase tracking-[0.16em] text-[#6FB4EB]">And</p>}
            <div className="flex items-center justify-between border border-[#6FB4EB]/26 bg-[#094586]/54 px-3 py-2.5">
              <span>{condition}</span>
              <BadgeCheck aria-hidden="true" size={15} className="text-[#6FB4EB]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "live") {
    return (
      <div className="border border-[#6FB4EB]/26 bg-[#094586]/42 p-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">
          <span>Live · 67&apos;</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D0FEF5]" /> Fresh</span>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div><p className="text-xs text-[#D0FEF5]/60">Corners</p><p className="mt-1 text-2xl font-black text-white">5</p></div>
          <div className="h-10 w-px bg-[#D0FEF5]/16" />
          <div><p className="text-xs text-[#D0FEF5]/60">Cards</p><p className="mt-1 text-2xl font-black text-white">3</p></div>
          <div className="h-10 w-px bg-[#D0FEF5]/16" />
          <div><p className="text-xs text-[#D0FEF5]/60">Goals</p><p className="mt-1 text-2xl font-black text-white">2</p></div>
        </div>
      </div>
    );
  }

  if (type === "creator") {
    return (
      <div className="border border-[#6FB4EB]/26 bg-[#D0FEF5] p-4 text-[#094586]">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.14em]">New market</p>
          <span className="border border-[#094586]/22 px-2 py-1 text-[10px] font-black">3 / 5</span>
        </div>
        <p className="mt-5 text-lg font-black">France wins + match totals</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#094586]/16 pt-3 font-mono text-[11px] font-bold">
          <span>hash ready</span><span>AND</span>
        </div>
      </div>
    );
  }

  if (type === "verification") {
    return (
      <div className="space-y-2">
        {["Match facts received", "Conditions evaluated", "Receipt generated"].map((step, index) => (
          <div key={step} className="flex items-center gap-3 border-b border-[#D0FEF5]/14 pb-2.5 text-sm font-bold text-[#D0FEF5]">
            <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#D0FEF5] text-xs font-black text-[#094586]">{index + 1}</span>
            <span>{step}</span>
            <BadgeCheck aria-hidden="true" size={16} className="ml-auto text-[#6FB4EB]" />
          </div>
        ))}
      </div>
    );
  }

  if (type === "safety") {
    return (
      <div>
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-[#D0FEF5]/68">
          <span>Finality window</span><span>00:42:18</span>
        </div>
        <div className="mt-4 h-2 bg-[#D0FEF5]/12"><div className="h-full w-2/3 bg-[#6FB4EB]" /></div>
        <div className="mt-5 flex items-center gap-3 border border-[#6FB4EB]/26 bg-[#094586]/48 p-3">
          <ShieldCheck aria-hidden="true" size={20} className="text-[#D0FEF5]" />
          <div><p className="text-sm font-black text-white">Refund path defined</p><p className="mt-0.5 text-xs text-[#D0FEF5]/62">Principal only · permissionless</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#6FB4EB]/26 bg-[#071925] p-4 font-mono text-xs leading-6 text-[#D0FEF5]">
      <p><span className="text-[#6FB4EB]">import</span> {'{ createMarket }'}</p>
      <p><span className="text-[#6FB4EB]">from</span> &quot;@tutela/sdk&quot;;</p>
      <p className="mt-3 text-[#D0FEF5]/58">// typed conditions</p>
      <p>await createMarket(terms);</p>
    </div>
  );
}

const developerWorkflow = [
  {
    id: "define",
    number: "01",
    label: "Define",
    heading: "Define the market conditions.",
    description: "Use Tutela’s typed condition language to combine supported football statistics into one deterministic market definition.",
    Icon: Split
  },
  {
    id: "deploy",
    number: "02",
    label: "Deploy",
    heading: "Deploy immutable market terms.",
    description: "Create the market through Tutela Protocol with canonical conditions, a condition hash, and lifecycle deadlines fixed before participation.",
    Icon: Blocks
  },
  {
    id: "participate",
    number: "03",
    label: "Participate",
    heading: "Receive participation through your app.",
    description: "Let users inspect the market definition, choose YES or NO, and participate through the experience you control.",
    Icon: UsersRound
  },
  {
    id: "verify",
    number: "04",
    label: "Verify",
    heading: "Verify the final match facts.",
    description: "Submit a TxLINE-compatible proof package and validate fixture identity, finalization, and supported match statistics.",
    Icon: DatabaseZap
  },
  {
    id: "settle",
    number: "05",
    label: "Settle",
    heading: "Settle from deterministic evaluation.",
    description: "Evaluate the stored AND or OR conditions against validated statistics and record one reproducible market result.",
    Icon: BadgeCheck
  },
  {
    id: "recover",
    number: "06",
    label: "Recover",
    heading: "Recover when proof never arrives.",
    description: "After the immutable finality window, activate Tutela’s Safety Circuit so participants can claim principal without operator approval.",
    Icon: ShieldCheck
  }
] as const;

const architectureLayers = [
  {
    label: "Prediction app",
    detail: "Consumer markets, contests, analytics, and creator experiences",
    meta: "Application layer",
    Icon: UsersRound
  },
  {
    label: "@tutela/sdk",
    detail: "Typed conditions, canonical serialization, hashes, and transaction builders",
    meta: "Developer interface",
    Icon: Code2
  },
  {
    label: "Tutela Protocol",
    detail: "Immutable market terms, lifecycle state, condition evaluation, and Safety Circuit",
    meta: "Solana programs",
    Icon: Blocks
  },
  {
    label: "TxLINE verification path",
    detail: "Fixture identity, finalization, proof validation, and authenticated match statistics",
    meta: "Verification boundary",
    Icon: DatabaseZap
  },
  {
    label: "Settlement registry",
    detail: "Reusable market result, verification receipt, settlement status, or refund status",
    meta: "Public outcome record",
    Icon: ReceiptText
  }
] as const;

function WorkflowVisual({ type }: { type: (typeof developerWorkflow)[number]["id"] }) {
  if (type === "define") {
    return (
      <div className="mx-auto w-full max-w-xl border border-[#6FB4EB]/28 bg-[#06141F] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4 border-b border-[#D0FEF5]/14 pb-5">
          <div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#6FB4EB]">Condition group</p><p className="mt-2 text-xl font-black text-white">Match thesis</p></div>
          <span className="bg-[#D0FEF5] px-3 py-1.5 text-xs font-black text-[#094586]">AND</span>
        </div>
        <div className="mt-6 space-y-3 font-mono text-sm font-bold text-[#D0FEF5]">
          {["Home team wins", "Total goals > 2", "Total corners ≥ 8"].map((condition, index) => (
            <div key={condition}>
              {index > 0 && <p className="pb-2 pl-4 text-[10px] uppercase tracking-[0.18em] text-[#6FB4EB]">And</p>}
              <div className="flex items-center justify-between border border-[#6FB4EB]/25 bg-[#094586]/46 px-4 py-3.5">
                <span>{condition}</span><BadgeCheck aria-hidden="true" size={17} className="text-[#6FB4EB]" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-[#D0FEF5]/14 pt-4 font-mono text-xs text-[#D0FEF5]/58">condition_hash: ready</div>
      </div>
    );
  }

  if (type === "deploy") {
    return (
      <div className="mx-auto w-full max-w-xl">
        {["Canonical condition bytes", "Market PDA", "Immutable Open state"].map((item, index) => (
          <div key={item} className="contents">
            <div className="flex items-center gap-4 border border-[#6FB4EB]/28 bg-[#06141F] p-5 sm:p-6">
              <span className="grid h-10 w-10 place-items-center bg-[#D0FEF5] font-mono text-sm font-black text-[#094586]">{index + 1}</span>
              <div><p className="text-sm font-black text-white">{item}</p><p className="mt-1 font-mono text-xs text-[#D0FEF5]/56">{index === 0 ? "sha256 · canonical" : index === 1 ? "creator · market nonce" : "terms locked"}</p></div>
              <BadgeCheck aria-hidden="true" size={18} className="ml-auto text-[#6FB4EB]" />
            </div>
            {index < 2 && <ArrowDown aria-hidden="true" className="mx-auto my-3 text-[#6FB4EB]" size={20} />}
          </div>
        ))}
      </div>
    );
  }

  if (type === "participate") {
    return (
      <div className="mx-auto grid w-full max-w-xl gap-4 sm:grid-cols-2">
        {[{side:"YES",pool:"7,420",share:"71%"},{side:"NO",pool:"3,080",share:"29%"}].map(({side,pool,share}) => (
          <div key={side} className="border border-[#6FB4EB]/28 bg-[#06141F] p-6">
            <div className="flex items-center justify-between"><p className="text-sm font-black text-[#D0FEF5]">{side} pool</p><p className="font-mono text-xs text-[#6FB4EB]">{share}</p></div>
            <p className="mt-8 text-4xl font-black text-white">{pool}</p>
            <div className="mt-6 h-2 bg-[#D0FEF5]/12"><div className="h-full bg-[#6FB4EB]" style={{ width: share }} /></div>
          </div>
        ))}
        <div className="border border-[#6FB4EB]/28 bg-[#D0FEF5] p-5 text-[#094586] sm:col-span-2">
          <div className="flex items-center justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[0.14em]">Participation review</p><p className="mt-2 text-lg font-black">Terms verified before entry</p></div><UsersRound aria-hidden="true" size={28} /></div>
        </div>
      </div>
    );
  }

  if (type === "verify") {
    return (
      <div className="mx-auto w-full max-w-xl border border-[#6FB4EB]/28 bg-[#06141F] p-5 sm:p-8">
        <div className="flex items-center justify-between border-b border-[#D0FEF5]/14 pb-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#6FB4EB]">Proof package</p><p className="mt-2 text-xl font-black text-white">Final match facts</p></div><DatabaseZap aria-hidden="true" className="text-[#D0FEF5]" size={27} /></div>
        <dl className="mt-5 divide-y divide-[#D0FEF5]/12 font-mono text-xs">
          {[["fixture", "matched"],["finalization", "accepted"],["statistics", "authenticated"],["proof status", "validated"]].map(([term,value]) => (
            <div key={term} className="flex items-center justify-between gap-5 py-4"><dt className="text-[#D0FEF5]/56">{term}</dt><dd className="flex items-center gap-2 font-bold text-[#D0FEF5]"><BadgeCheck aria-hidden="true" size={14} className="text-[#6FB4EB]" />{value}</dd></div>
          ))}
        </dl>
      </div>
    );
  }

  if (type === "settle") {
    return (
      <div className="mx-auto w-full max-w-xl overflow-hidden border border-[#6FB4EB]/28 bg-[#06141F]">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-[#D0FEF5]/14 bg-[#094586]/46 px-4 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#6FB4EB]"><span>Condition</span><span>Value</span><span>Result</span></div>
        {[["Home team wins", "Home"],["Total goals > 2", "3"],["Total corners ≥ 8", "9"]].map(([condition,value]) => (
          <div key={condition} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-[#D0FEF5]/12 px-4 py-4 text-sm last:border-b-0"><span className="font-bold text-[#D0FEF5]">{condition}</span><span className="font-mono text-[#D0FEF5]/68">{value}</span><BadgeCheck aria-label="Passed" size={18} className="text-[#6FB4EB]" /></div>
        ))}
        <div className="flex items-end justify-between bg-[#D0FEF5] p-5 text-[#094586]"><div><p className="text-xs font-black uppercase tracking-[0.14em]">Market result</p><p className="mt-2 text-4xl font-black">YES</p></div><ReceiptText aria-hidden="true" size={30} /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-[#D0FEF5]/64"><span>Finality window</span><span>Expired</span></div>
      <div className="mt-4 h-2 bg-[#D0FEF5]/12"><div className="h-full w-full bg-[#6FB4EB]" /></div>
      <div className="mt-6 border border-[#6FB4EB]/28 bg-[#06141F] p-6 sm:p-8">
        <ShieldCheck aria-hidden="true" size={30} className="text-[#6FB4EB]" />
        <p className="mt-6 text-2xl font-black text-white">Refund eligible</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[#D0FEF5]/64">No valid proof was accepted before the immutable deadline.</p>
        <div className="mt-6 flex items-center justify-between border-t border-[#D0FEF5]/14 pt-5"><span className="text-sm font-black text-[#D0FEF5]">Principal claim</span><span className="bg-[#D0FEF5] px-4 py-2 text-xs font-black text-[#094586]">AVAILABLE</span></div>
      </div>
    </div>
  );
}

/**
 * Real product screenshots. Save the four screenshots at these exact paths in
 * apps/web/public/ (filenames match what's referenced here). `translate` and
 * `emphasis` control the desktop staggered layout in <ProductShowcase />.
 */
const productPreviews = [
  {
    src: "/match-markets.png",
    label: "Match Markets",
    alt: "Tutela match markets screen showing the live France v Spain scoreline and stat markets",
    translate: "md:translate-y-6",
    emphasis: false
  },
  {
    src: "/create-markets.png",
    label: "Create Markets",
    alt: "Tutela create markets screen with the AND/OR condition builder",
    translate: "md:-translate-y-3",
    emphasis: true
  },
  {
    src: "/leaderboards.png",
    label: "Leaderboards",
    alt: "Tutela leaderboards screen showing global rankings",
    translate: "md:-translate-y-1",
    emphasis: true
  },
  {
    src: "/preview-profile.png",
    label: "Profile",
    alt: "Tutela profile screen showing test-coin balance and activity",
    translate: "md:translate-y-8",
    emphasis: false
  }
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#020B12] text-[#D0FEF5] overflow-hidden">
      <div className="text-[#4A051C] top-0 z-50">
        <nav
          className={`bg-transparent border-b px-4 md:px-6 lg:px-8 transition ${scrolled ? "border-[#D0FEF5]/12 shadow-sm backdrop-blur" : "border-transparent backdrop-blur"}`}
        >
          <div className="mx-auto flex h-20 max-w-[90rem] items-center justify-between gap-5">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#D0FEF5] p-1.5 ring-1 ring-[#D0FEF5]/25">
                <img src="/tutela-logo.png" alt="Tutela" className="h-full w-full object-contain" />
              </span>
              <span className="text-2xl font-black tracking-normal text-[#D0FEF5]">Tutela</span>
            </Link>

            <div className="hidden items-center gap-7 text-sm font-black lg:flex">
              {navItems.map((item, index) => (
                <a key={item.href} href={item.href} className={`relative transition hover:text-[#6FB4EB] ${index === 0 ? "text-[#6FB4EB]" : "text-[#D0FEF5]"}`}>
                  {item.label}
                  {index === 0 && <span className="absolute -bottom-3 left-0 h-1 w-full rounded-full bg-[#6FB4EB]" />}
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Link href="/matches" className="rounded-full border border-[#D0FEF5]/20 px-5 py-3 text-sm font-black text-[#D0FEF5] transition hover:bg-[#D0FEF5]/10">
                View Demo
              </Link>
              <Link href="/app" className="rounded-full bg-[#6FB4EB] px-6 py-3 text-sm font-black text-[#4A051C] shadow-[0_12px_35px_rgba(9,69,134,0.18)] transition hover:bg-[#D0FEF5]">
                Play
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-full border border-[#D0FEF5]/20 text-[#D0FEF5] lg:hidden"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {menuOpen && (
            <div className="mx-auto grid max-w-7xl gap-2 pb-5 lg:hidden">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg bg-[#D0FEF5]/10 px-4 py-3 text-sm font-black text-[#D0FEF5]">
                  {item.label}
                </a>
              ))}
              <Link href="/app" className="mt-1 rounded-full bg-[#6FB4EB] px-5 py-3 text-center text-sm font-black text-[#4A051C]">
                Play
              </Link>
            </div>
          )}
        </nav>
      </div>
      <section
        id="product"
        className="relative overflow-hidden px-4 pb-0 pt-14 md:px-6 md:pt-20 lg:px-8"
      >
      <br />
      <br />
      <br />
      <br />
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/landing-stadium-bg.png"
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-110 object-cover object-center opacity-55 blur-[18px]"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_28%,rgba(111,180,235,0.34),transparent_24rem),linear-gradient(180deg,rgba(2,11,18,0.68)_0%,rgba(2,11,18,0.88)_64%,#020B12_100%)]" />
        <div className="absolute inset-x-0 top-24 z-0 mx-auto h-[420px] max-w-5xl rounded-[50%] bg-[#6FB4EB]/16 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-[90rem]">
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mx-auto max-w-6xl text-3xl font-black leading-[0.95] tracking-normal text-white md:text-7xl">
              Every football statistical 
              <span className="block text-[#D0FEF5]">outcome verified On-chain</span>
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg font-semibold leading-8 text-[#D0FEF5]/86 md:text-xl">
              Construct multi-condition football markets using results, goals, corners, cards and player events. Tutela resolves every outcome through verifiable match data and deterministic Solana programs.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/app" className="inline-flex items-center gap-2 rounded-full bg-[#6FB4EB] px-8 py-4 text-base font-black text-[#4A051C] shadow-[0_18px_45px_rgba(9,69,134,0.2)] transition hover:bg-[#D0FEF5]">
                Play <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <br />
          <br />
          <br />
          <ProductShowcase />
        </div>
      </section>

      <section
        aria-label="Infrastructure credibility"
        className="border-y border-[#D0FEF5]/10 bg-[#020B12] px-4 md:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-center gap-x-8 gap-y-4 py-6 text-[#D0FEF5]/58 sm:gap-x-10 md:flex-nowrap md:justify-between md:gap-x-6 lg:gap-x-12">
          {infrastructureLabels.map(({ label, Icon }) => (
            <div key={label} className="flex shrink-0 items-center gap-2.5">
              <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
              <span className="whitespace-nowrap text-xs font-bold tracking-normal sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-continuous-gradient relative px-4 pb-14 md:px-6 md:pb-20 lg:px-8">
        <div className="mx-auto max-w-[90rem]">
          <section id="problem" className="mx-auto max-w-7xl py-20 md:py-28">
            <div className="max-w-5xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D0FEF5]/72">
                The infrastructure problem
              </p>
              <h2 className="mt-5 max-w-5xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Building deeper football markets requires more than a data feed.
              </h2>
              <p className="mt-7 max-w-3xl text-base font-semibold leading-7 text-[#D0FEF5]/78 md:text-lg md:leading-8">
                Teams still need to normalize match data, encode conditions, verify outcomes, manage settlement, and handle failed-data scenarios. Tutela provides these components as reusable infrastructure.
              </p>
            </div>

            <div className="mt-14 grid border-y border-[#D0FEF5]/18 lg:grid-cols-2">
              <div className="py-10 lg:border-r lg:border-[#D0FEF5]/18 lg:pr-10 xl:pr-14">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D0FEF5]/58">
                  Build everything manually
                </p>
                <div className="mt-7 grid grid-cols-2 gap-3">
                  {manualInfrastructureSteps.map((step, index) => (
                    <div
                      key={step}
                      className={`flex min-h-20 items-center gap-4 border border-[#D0FEF5]/14 bg-[#020B12]/42 px-4 py-4 ${index % 2 === 1 ? "sm:translate-y-3" : ""}`}
                    >
                      <span className="font-mono text-xs font-bold text-[#6FB4EB]/72">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-bold leading-5 text-[#D0FEF5]/78">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#D0FEF5]/18 py-10 lg:border-t-0 lg:pl-10 xl:pl-14">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">
                  Build with Tutela
                </p>
                <div className="mt-7 flex flex-col items-stretch">
                  {tutelaIntegrationFlow.map(({ label, Icon }, index) => (
                    <div key={label} className="contents">
                      <div className="flex min-h-20 items-center gap-4 border border-[#6FB4EB]/30 bg-[#094586]/56 px-5 py-4">
                        <span className="grid h-10 w-10 shrink-0 place-items-center bg-[#D0FEF5] text-[#094586]">
                          <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
                        </span>
                        <span className="text-base font-black text-[#D0FEF5] sm:text-lg">
                          {label}
                        </span>
                      </div>
                      {index < tutelaIntegrationFlow.length - 1 && (
                        <ArrowDown aria-hidden="true" size={19} className="mx-auto my-2 text-[#6FB4EB]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="core-proposition" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D0FEF5]/72">
                  THE TUTELA LAYER
                </p>
                <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl">
                  Turn verified match data into programmable football markets.
                </h2>
              </div>
              <p className="max-w-xl text-base font-semibold leading-7 text-[#D0FEF5]/78 md:text-lg md:leading-8 lg:pb-1">
                TxLINE-compatible data provides the match facts. Tutela normalizes those facts, evaluates developer-defined conditions, and produces deterministic results that applications can use for settlement.
              </p>
            </div>

            <div className="mt-14 grid border-y border-[#D0FEF5]/18 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
              <div className="py-9 md:pr-7 lg:pr-10">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center bg-[#D0FEF5] text-[#094586]">
                    <DatabaseZap aria-hidden="true" size={19} strokeWidth={1.9} />
                  </span>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6FB4EB]">Stage 1</p>
                </div>
                <h3 className="mt-6 text-2xl font-black text-white">TxLINE-compatible data</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/68">
                  Final football statistics such as goals, cards, corners, match result, and both teams to score.
                </p>
                <dl className="mt-7 divide-y divide-[#D0FEF5]/12 border-y border-[#D0FEF5]/12 text-sm">
                  {[
                    ["Home goals", "2"],
                    ["Away goals", "1"],
                    ["Total corners", "9"],
                    ["Total cards", "4"],
                    ["Match winner", "Home"]
                  ].map(([term, value]) => (
                    <div key={term} className="flex items-center justify-between gap-4 py-3">
                      <dt className="font-semibold text-[#D0FEF5]/62">{term}</dt>
                      <dd className="font-mono font-bold text-[#D0FEF5]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="grid place-items-center border-y border-[#D0FEF5]/18 py-3 md:border-x md:border-y-0 md:px-3">
                <ArrowDown aria-hidden="true" size={20} className="text-[#6FB4EB] md:hidden" />
                <ArrowRight aria-hidden="true" size={20} className="hidden text-[#6FB4EB] md:block" />
              </div>

              <div className="py-9 md:px-7 lg:px-10">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center bg-[#D0FEF5] text-[#094586]">
                    <Code2 aria-hidden="true" size={19} strokeWidth={1.9} />
                  </span>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6FB4EB]">Stage 2</p>
                </div>
                <h3 className="mt-6 text-2xl font-black text-white">Tutela condition engine</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/68">
                  Validates, normalizes, combines, and evaluates football conditions using deterministic rules.
                </p>
                <div className="mt-7 border-y border-[#6FB4EB]/28 bg-[#094586]/46 py-2">
                  {["Home team wins", "Total corners > 8", "Total cards ≤ 5"].map((condition, index) => (
                    <div key={condition}>
                      {index > 0 && (
                        <div className="flex items-center gap-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#6FB4EB]">
                          <span className="h-px flex-1 bg-[#6FB4EB]/25" />
                          And
                          <span className="h-px flex-1 bg-[#6FB4EB]/25" />
                        </div>
                      )}
                      <p className="px-4 py-3 text-sm font-black text-[#D0FEF5]">{condition}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid place-items-center border-y border-[#D0FEF5]/18 py-3 md:border-x md:border-y-0 md:px-3">
                <ArrowDown aria-hidden="true" size={20} className="text-[#6FB4EB] md:hidden" />
                <ArrowRight aria-hidden="true" size={20} className="hidden text-[#6FB4EB] md:block" />
              </div>

              <div className="py-9 md:pl-7 lg:pl-10">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center bg-[#D0FEF5] text-[#094586]">
                    <BadgeCheck aria-hidden="true" size={19} strokeWidth={1.9} />
                  </span>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6FB4EB]">Stage 3</p>
                </div>
                <h3 className="mt-6 text-2xl font-black text-white">Programmable market result</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/68">
                  A deterministic result and verification receipt that applications can use to continue their settlement flow.
                </p>
                <div className="mt-7 border border-[#6FB4EB]/30 bg-[#D0FEF5] p-5 text-[#094586]">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#094586]/68">Market result</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-5xl font-black leading-none text-[#094586]">YES</p>
                    <BadgeCheck aria-hidden="true" size={28} />
                  </div>
                  <div className="mt-5 border-t border-[#094586]/16 pt-4 font-mono text-xs font-bold leading-6">
                    <p>conditions: passed</p>
                    <p>receipt: proof-backed</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="use-cases" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D0FEF5]/72">
                  BUILT WITH TUTELA
                </p>
                <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl">
                  One infrastructure layer. Many football experiences.
                </h2>
              </div>
              <p className="max-w-xl text-base font-semibold leading-7 text-[#D0FEF5]/78 md:text-lg md:leading-8 lg:pb-1">
                Use Tutela&apos;s programmable conditions, TxLINE-compatible data adapter, deterministic settlement, and verification receipts to build deeper football products without rebuilding the underlying infrastructure.
              </p>
            </div>

            <div className="mt-14 grid overflow-hidden border-l border-t border-[#D0FEF5]/18 md:grid-cols-2 lg:grid-cols-3">
              {developerUseCases.map(({ id, label, description, Icon }) => (
                <article key={id} className="flex min-h-[30rem] flex-col border-b border-r border-[#D0FEF5]/18 bg-[#06141F]/52 p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center bg-[#D0FEF5] text-[#094586]">
                      <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
                    </span>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">{label}</p>
                  </div>

                  <div className="mt-8 min-h-[12.5rem] border-y border-[#D0FEF5]/12 bg-[#020B12]/38 p-4 sm:p-5">
                    <UseCaseVisual type={id} />
                  </div>

                  <p className="mt-7 text-base font-semibold leading-7 text-[#D0FEF5]/72">{description}</p>
                  <Link
                    href="#developers"
                    className="mt-auto inline-flex items-center gap-2 pt-7 text-sm font-black text-[#D0FEF5] transition hover:text-[#6FB4EB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6FB4EB]"
                    aria-label={`Explore ${label.toLowerCase()} use case`}
                  >
                    Explore use case
                    <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section id="developer-workflow" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D0FEF5]/72">
                  THE DEVELOPER WORKFLOW
                </p>
                <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl">
                  From market idea to verifiable outcome.
                </h2>
              </div>
              <p className="max-w-xl text-base font-semibold leading-7 text-[#D0FEF5]/78 md:text-lg md:leading-8 lg:pb-1">
                Define football conditions, deploy them through Tutela Protocol, receive participation through your application, and resolve every outcome using TxLINE-compatible match data.
              </p>
            </div>

            <nav aria-label="Developer workflow stages" className="sticky top-0 z-20 mt-12 overflow-x-auto border-y border-[#D0FEF5]/18 bg-[#020B12]/94 backdrop-blur">
              <div className="mx-auto flex min-w-max items-center justify-center">
                {developerWorkflow.map(({ id, number, label }, index) => (
                  <a key={id} href={`#workflow-${id}`} className="group flex items-center">
                    <span className="flex items-center gap-2 px-3 py-4 text-xs font-black uppercase tracking-[0.12em] text-[#D0FEF5]/52 transition group-hover:text-[#D0FEF5] sm:px-4">
                      <span className="font-mono text-[#6FB4EB]">{number}</span>{label}
                    </span>
                    {index < developerWorkflow.length - 1 && <span className="h-px w-5 bg-[#D0FEF5]/18 sm:w-8" />}
                  </a>
                ))}
              </div>
            </nav>

            <div className="relative">
              <div aria-hidden="true" className="absolute bottom-0 left-[1.1rem] top-0 hidden w-px bg-[#D0FEF5]/14 lg:block" />
              {developerWorkflow.map(({ id, number, label, heading, description, Icon }, index) => {
                const visualFirst = index % 2 === 1;
                return (
                  <article id={`workflow-${id}`} key={id} className="relative grid scroll-mt-20 items-center gap-10 border-b border-[#D0FEF5]/18 py-20 last:border-b-0 lg:min-h-[86vh] lg:grid-cols-[0.86fr_1.14fr] lg:gap-16 lg:pl-20">
                    <div className={`${visualFirst ? "lg:order-2" : ""} lg:sticky lg:top-28`}>
                      <div className="flex items-center gap-4">
                        <span className="relative z-10 grid h-9 w-9 place-items-center bg-[#6FB4EB] font-mono text-xs font-black text-[#020B12] lg:-ml-[5.05rem]">{number}</span>
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">{label}</span>
                      </div>
                      <Icon aria-hidden="true" size={30} className="mt-10 text-[#D0FEF5]/70" strokeWidth={1.7} />
                      <h3 className="mt-6 max-w-xl text-4xl font-black leading-[1.06] text-white sm:text-5xl">{heading}</h3>
                      <p className="mt-6 max-w-lg text-base font-semibold leading-7 text-[#D0FEF5]/68 md:text-lg md:leading-8">{description}</p>
                    </div>

                    <div className={`${visualFirst ? "lg:order-1" : ""} flex min-h-[29rem] items-center border-y border-[#D0FEF5]/16 bg-[#071925]/34 px-4 py-10 sm:px-8 lg:px-10`}>
                      <WorkflowVisual type={id} />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="architecture" className="mx-auto max-w-7xl border-t border-[#D0FEF5]/18 py-20 md:py-28">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D0FEF5]/72">
                  ARCHITECTURE
                </p>
                <h2 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl">
                  A layered path from prediction app to reusable outcome.
                </h2>
              </div>
              <p className="max-w-xl text-base font-semibold leading-7 text-[#D0FEF5]/78 md:text-lg md:leading-8 lg:pb-1">
                Applications compose markets through Tutela&apos;s typed SDK. Tutela Protocol stores the market definition, consumes the supported verification path, and records a deterministic result that other interfaces can inspect.
              </p>
            </div>

            <div className="mt-14 grid overflow-hidden border border-[#D0FEF5]/18 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="bg-[#06141F]/56 p-4 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-3xl">
                  {architectureLayers.map(({ label, detail, meta, Icon }, index) => (
                    <div key={label} className="contents">
                      <div className="grid gap-4 border border-[#6FB4EB]/28 bg-[#020B12]/64 p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
                        <span className="grid h-11 w-11 place-items-center bg-[#D0FEF5] text-[#094586]">
                          <Icon aria-hidden="true" size={20} strokeWidth={1.9} />
                        </span>
                        <div>
                          <h3 className="text-lg font-black text-white sm:text-xl">{label}</h3>
                          <p className="mt-1.5 max-w-xl text-sm font-semibold leading-6 text-[#D0FEF5]/62">{detail}</p>
                        </div>
                        <span className="w-fit border border-[#6FB4EB]/26 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#6FB4EB]">{meta}</span>
                      </div>
                      {index < architectureLayers.length - 1 && (
                        <div className="relative mx-auto flex h-12 w-px items-center justify-center bg-[#6FB4EB]/42">
                          <ArrowDown aria-hidden="true" size={18} className="absolute top-4 max-w-none bg-[#06141F] text-[#6FB4EB]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <aside className="border-t border-[#D0FEF5]/18 bg-[#094586]/42 lg:border-l lg:border-t-0">
                <div className="border-b border-[#D0FEF5]/18 p-6 sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6FB4EB]">Settlement boundary</p>
                  <h3 className="mt-5 text-2xl font-black leading-tight text-white">Live experience and final resolution stay separate.</h3>
                  <p className="mt-4 text-sm font-semibold leading-6 text-[#D0FEF5]/66">
                    Live or cached match data can improve the product experience. It cannot determine payouts. Settlement follows only the supported verified-stat path.
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#6FB4EB]">Reusable output</p>
                  <div className="mt-5 border border-[#6FB4EB]/28 bg-[#D0FEF5] p-5 text-[#094586]">
                    <div className="flex items-center justify-between gap-4">
                      <div><p className="text-xs font-black uppercase tracking-[0.12em]">Outcome receipt</p><p className="mt-2 text-xl font-black">Market resolved</p></div>
                      <BadgeCheck aria-hidden="true" size={28} />
                    </div>
                    <div className="mt-5 border-t border-[#094586]/16 pt-4 font-mono text-xs font-bold leading-6">
                      <p>result: deterministic</p>
                      <p>status: inspectable</p>
                      <p>source: verified path</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section id="infrastructure" className="mx-auto mt-10 max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#D0FEF5]/18 bg-[#F4FAFA] text-[#111827] shadow-[0_28px_90px_rgba(2,11,18,0.28)]">
            <div className="grid md:grid-cols-3">
              {infrastructurePillars.map(({ title, body, Icon }) => (
                <div key={title} className="border-b border-r border-[#094586]/12 p-7 last:border-r-0 md:border-b-0 lg:p-10">
                  <Icon size={30} className="mb-12 text-[#094586]" />
                  <h2 className="max-w-sm text-2xl font-black leading-tight text-[#111827]">{title}</h2>
                  <p className="mt-5 max-w-sm text-base font-semibold leading-7 text-[#5E6673]">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="trust-metrics" className="mx-auto mt-10 max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#D0FEF5]/18 bg-[#F7FBFC] text-[#081629] shadow-[0_28px_90px_rgba(2,11,18,0.2)]">
            <div className="border-b border-[#094586]/12 px-6 py-16 text-center md:px-10 md:py-24">
              <p className="mx-auto mb-5 inline-flex rounded-full border border-[#094586]/12 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#094586]">
                Trust metrics
              </p>
              <h2 className="mx-auto max-w-4xl text-5xl font-black leading-tight tracking-normal text-[#081629] md:text-7xl">
                Technical proof before big promises.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-7 text-[#687487]">
                Tutela reports measurable settlement evidence as the devnet demo produces it. Unmeasured values stay marked as pending instead of being invented.
              </p>
            </div>
            <div className="grid md:grid-cols-5">
              {trustMetrics.map((metric, index) => (
                <div key={metric.label} className={`border-b border-r border-[#094586]/12 px-5 py-10 text-center md:border-b-0 ${index === trustMetrics.length - 1 ? "md:border-r-0" : ""}`}>
                  <p className={`text-4xl font-black tracking-normal md:text-5xl ${metric.value === "Pending" ? "text-[#8A94A6]" : "text-[#081629]"}`}>
                    {metric.value}
                  </p>
                  <p className="mx-auto mt-4 max-w-[210px] text-sm font-semibold leading-6 text-[#687487]">{metric.label}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="settlement-problem" className="mx-auto mt-10 max-w-7xl overflow-hidden rounded-[1.75rem] border border-[#D0FEF5]/18 bg-[#F7FBFC] text-[#081629] shadow-[0_28px_90px_rgba(2,11,18,0.2)]">
            <div className="grid gap-12 border-b border-[#094586]/12 px-6 py-14 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-20">
              <div>
                <p className="mb-5 inline-flex rounded-full border border-[#094586]/12 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#094586]">
                  The settlement problem
                </p>
                <h2 className="max-w-xl text-5xl font-black leading-tight tracking-normal text-[#081629] md:text-6xl">
                  Sports markets become opaque exactly when settlement matters most.
                </h2>
              </div>
              <div className="grid gap-0">
                {marketProblems.map(({ title, body, Icon }) => (
                  <div key={title} className="grid gap-4 border-b border-[#094586]/12 py-7 last:border-b-0 md:grid-cols-[42px_1fr]">
                    <Icon size={27} className="text-[#094586]" />
                    <div>
                      <h3 className="text-xl font-black text-[#111827]">{title}</h3>
                      <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-[#687487]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0B111A] px-6 py-12 text-[#D0FEF5] md:px-10 md:py-14">
              <div className="grid gap-7 lg:grid-cols-[0.55fr_1fr_1fr]">
                <div className="flex flex-col justify-between gap-8">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">Settlement path</p>
                    <h3 className="mt-4 max-w-sm text-3xl font-black leading-tight text-white">
                      Compare the moment after the final whistle.
                    </h3>
                  </div>
                  <p className="max-w-sm text-sm font-semibold leading-6 text-[#D0FEF5]/70">
                    Live feeds can improve the experience, but payouts should follow a verifiable final-data path.
                  </p>
                </div>

                <ProcessLane
                  title="Traditional process"
                  tone="muted"
                  steps={traditionalSteps}
                  footer="Outcome depends on an internal review path."
                />
                <ProcessLane
                  title="Tutela process"
                  tone="accent"
                  steps={tutelaSteps}
                  footer="Outcome is backed by proof validation and a Solana receipt."
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
    </main>
  );
}

function ProcessLane({ title, steps, footer, tone }: { title: string; steps: string[]; footer: string; tone: "muted" | "accent" }) {
  const isAccent = tone === "accent";
  return (
    <div className={`rounded-[1.35rem] border p-5 ${isAccent ? "border-[#6FB4EB]/45 bg-[#094586]/55" : "border-white/10 bg-white/[0.04]"}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h4 className="text-xl font-black text-white">{title}</h4>
        {isAccent ? <ShieldCheck size={22} className="text-[#6FB4EB]" /> : <AlertTriangle size={22} className="text-[#8A94A6]" />}
      </div>
      <div className="grid gap-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-3">
            <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black ${isAccent ? "bg-[#6FB4EB] text-[#4A051C]" : "bg-white/10 text-[#D0FEF5]"}`}>
              {index + 1}
            </div>
            <div className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-black ${isAccent ? "border-[#6FB4EB]/25 bg-[#D0FEF5] text-[#094586]" : "border-white/10 bg-white/[0.04] text-[#D0FEF5]"}`}>
              {step}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm font-semibold leading-6 text-[#D0FEF5]/70">{footer}</p>
    </div>
  );
}

function ProductShowcase() {
  return (
    <>
      {/* Desktop / tablet: staggered showcase */}
      <div className="mt-12 hidden items-end justify-center gap-6 md:flex lg:gap-8">
        {productPreviews.map((preview) => (
          <figure
            key={preview.label}
            className={`flex flex-col items-center transition ${preview.translate} ${preview.emphasis ? "z-10 w-52 lg:w-60" : "w-44 opacity-90 lg:w-52"}`}
          >
            <div
              className={`relative w-full overflow-hidden rounded-[1.75rem] border border-[#6FB4EB]/35 bg-[#0B111A] shadow-[0_30px_80px_rgba(2,11,18,0.5)] ${preview.emphasis ? "ring-1 ring-[#6FB4EB]/40" : ""}`}
              style={{ aspectRatio: "402 / 874" }}
            >
              <Image src={preview.src} alt={preview.alt} fill sizes="(min-width: 1024px) 240px, 208px" className="object-cover" />
            </div>
            <figcaption className="mt-4 text-sm font-black uppercase tracking-[0.14em] text-[#D0FEF5]/85">{preview.label}</figcaption>
          </figure>
        ))}
      </div>

      {/* Mobile: swipeable, scroll-snapped row */}
      <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden">
        {productPreviews.map((preview) => (
          <figure key={preview.label} className="flex w-[72%] shrink-0 snap-center flex-col items-center">
            <div
              className="relative w-full overflow-hidden rounded-[1.75rem] border border-[#6FB4EB]/35 bg-[#0B111A] shadow-[0_20px_60px_rgba(2,11,18,0.5)]"
              style={{ aspectRatio: "402 / 874" }}
            >
              <Image src={preview.src} alt={preview.alt} fill sizes="72vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm font-black uppercase tracking-[0.14em] text-[#D0FEF5]/85">{preview.label}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
