import Link from "next/link";
import { ChevronRight, ListChecks } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { liveStatMarkets, upcomingMatchMarkets } from "@/lib/demo";
import { formatMatchClock, formatScoreline, getLiveMatchOrFallback } from "@/lib/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = upcomingMatchMarkets.find((item) => item.id === id) ?? upcomingMatchMarkets[0];
  const { match: liveMatch, live } = await getLiveMatchOrFallback(match.id);
  const isUpcoming = liveMatch.status === "upcoming";
  return (
    <AppShell>
      <section className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">
          {isUpcoming ? "Upcoming match" : formatMatchClock(liveMatch)}{live ? " · TxLINE live" : ""}
        </p>
        <h1 className="mt-3 text-3xl font-black">{match.home} v {match.away}</h1>
        {isUpcoming ? (
          <p className="mt-2 text-sm font-semibold text-[#4A051C]">{match.date} · {match.time} · {match.markets} markets opening</p>
        ) : (
          <p className="mt-2 text-2xl font-black text-[#094586]">{formatScoreline(liveMatch)}</p>
        )}
        <div className="mt-5 rounded-lg border border-dashed border-[#6FB4EB] bg-[#D0FEF5] p-4 text-sm font-semibold text-[#4A051C]">
          {isUpcoming
            ? "Markets open before kickoff. All markets use testnet coins with no monetary value."
            : "Match in progress. All markets use testnet coins with no monetary value."}
        </div>
      </section>
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Available stat markets</h2>
          <ListChecks size={18} className="text-[#6FB4EB]" />
        </div>
        <div className="grid gap-3">
          {liveStatMarkets.map((stat) => (
            <Link key={stat.id} href={`/markets/${stat.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
              <div>
                <p className="font-black">{stat.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#4A051C]">{stat.line} · no seeded pool data</p>
              </div>
              <ChevronRight size={18} className="text-[#094586]" />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
