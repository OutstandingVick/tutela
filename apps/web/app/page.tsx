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
