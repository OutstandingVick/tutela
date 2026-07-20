import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, Blocks, BookOpen, DatabaseZap, ExternalLink, ShieldCheck, Trophy } from "lucide-react";

const GITHUB = "https://github.com/OutstandingVick/tutela";

const documents = [
  {
    title: "Technical overview",
    description: "Repository structure, local setup, commands, program addresses and the current implementation status.",
    href: `${GITHUB}#readme`,
    label: "Open README"
  },
  {
    title: "TxLINE integration",
    description: "Fixture mapping, authenticated statistics, official validate_stat_v2 CPI and settlement boundaries.",
    href: `${GITHUB}/blob/main/docs/txline-integration.md`,
    label: "Read integration guide"
  },
  {
    title: "Devnet evidence",
    description: "Tutela and TxLINE program IDs, deployment transactions, market accounts and Explorer evidence.",
    href: `${GITHUB}/blob/main/docs/devnet-evidence.md`,
    label: "View Explorer evidence"
  },
  {
    title: "TypeScript SDK",
    description: "Typed condition construction, validation, hashing and Solana transaction preparation.",
    href: `${GITHUB}/tree/main/packages/sdk`,
    label: "Browse SDK source"
  }
];

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-[#D0FEF5] sm:py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center justify-between gap-2 border-b border-[#D0FEF5]/18 pb-5 sm:gap-4 sm:pb-6">
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#D0FEF5] transition hover:text-[#6FB4EB]">
            <ArrowLeft size={17} /> Tutela
          </Link>
          <Link href="/matches" className="bg-[#6FB4EB] px-3 py-3 text-center text-xs font-black leading-4 text-[#020B12] transition hover:bg-[#D0FEF5] sm:px-5 sm:text-sm">
            Open Tutela Markets
          </Link>
        </nav>

        <header className="border-b border-[#D0FEF5]/18 py-12 sm:py-16 md:py-24">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">Tutela documentation</p>
          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl md:text-6xl">Tutela is a 2-in-1 football prediction platform.</h1>
          <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-[#D0FEF5]/72 md:text-lg">
            The consumer experience and the reusable settlement infrastructure are delivered together: Tutela Markets gives fans the product they use, while Tutela Protocol provides the trusted engine underneath it.
          </p>
        </header>

        <section className="grid border-l border-t border-[#D0FEF5]/18 md:grid-cols-2">
          <ProductLayer
            icon={<Trophy size={22} />}
            label="Product 1 · Consumer application"
            title="Tutela Markets"
            body="The football prediction app where fans browse matches, enter individual YES/NO stat markets, create custom predictions, compete with friends and claim Devnet demo-point rewards."
          />
          <ProductLayer
            icon={<Blocks size={22} />}
            label="Product 2 · Infrastructure layer"
            title="Tutela Protocol"
            body="Reusable Solana infrastructure for TxLINE-authenticated statistics, on-chain AND/OR condition evaluation, escrow, deterministic settlement, payouts and safety refunds."
          />
        </section>

        <section className="grid border-l border-t border-[#D0FEF5]/18 md:grid-cols-3">
          <ArchitectureStep icon={<DatabaseZap size={21} />} number="01" title="Authenticate statistics" body="TxLINE provides the fixture-bound sporting facts through its official Devnet validation program." />
          <ArchitectureStep icon={<Blocks size={21} />} number="02" title="Evaluate conditions" body="Tutela evaluates the stored AND/OR conditions on-chain from the authenticated statistics." />
          <ArchitectureStep icon={<ShieldCheck size={21} />} number="03" title="Settle safely" body="The protocol resolves the market, enables claims, or activates refunds when reliable final data is unavailable." />
        </section>

        <section className="py-16 md:py-24">
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#6FB4EB]" size={22} />
            <h2 className="text-2xl font-black text-white">Technical resources</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <a key={document.title} href={document.href} target="_blank" rel="noreferrer" className="group border border-[#D0FEF5]/18 bg-[#06141F] p-6 transition hover:border-[#6FB4EB]">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-black text-white">{document.title}</h3>
                  <ExternalLink size={17} className="shrink-0 text-[#6FB4EB]" />
                </div>
                <p className="mt-4 text-sm font-semibold leading-6 text-[#D0FEF5]/68">{document.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#6FB4EB] group-hover:text-white">{document.label} <ArrowRight size={15} /></span>
              </a>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[#D0FEF5]/18 py-8 text-xs font-bold text-[#D0FEF5]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>Solana Devnet · Experimental · Test assets have no monetary value</p>
          <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#6FB4EB]">GitHub <ExternalLink size={12} /></a>
        </footer>
      </div>
    </main>
  );
}

function ProductLayer({ icon, label, title, body }: { icon: ReactNode; label: string; title: string; body: string }) {
  return (
    <article className="border-b border-r border-[#D0FEF5]/18 bg-[#094586]/28 p-6 md:p-8">
      <div className="flex items-center gap-3 text-[#6FB4EB]">
        {icon}
        <p className="text-xs font-black uppercase tracking-[0.14em]">{label}</p>
      </div>
      <h2 className="mt-6 text-2xl font-black text-white">{title}</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/72">{body}</p>
    </article>
  );
}

function ArchitectureStep({ icon, number, title, body }: { icon: ReactNode; number: string; title: string; body: string }) {
  return (
    <article className="border-b border-r border-[#D0FEF5]/18 bg-[#06141F]/60 p-6 md:p-8">
      <div className="flex items-center justify-between gap-3 text-[#6FB4EB]">
        {icon}
        <span className="font-mono text-xs font-black">{number}</span>
      </div>
      <h2 className="mt-7 text-xl font-black text-white">{title}</h2>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#D0FEF5]/68">{body}</p>
    </article>
  );
}
