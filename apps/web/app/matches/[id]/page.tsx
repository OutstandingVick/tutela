import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ListChecks } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { forecastStatMarkets, upcomingMatchMarkets } from "@/lib/demo";
import { formatMatchClock, formatScoreline, getLiveMatchOrFallback } from "@/lib/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = upcomingMatchMarkets.find((item) => item.id === id);
  if (!match) notFound();

  const { match: liveMatch, live } = await getLiveMatchOrFallback(match.id);
  const isUpcoming = liveMatch.status === "upcoming";
  const isCompleted = liveMatch.status === "completed";
  return (
    <AppShell>
      <section
        data-match-status={liveMatch.status}
        className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-5"
      >
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">
          {isUpcoming ? "Upcoming match" : formatMatchClock(liveMatch)}{live ? " · TxLINE connected" : ""}
        </p>
        <h1 className="mt-3 text-3xl font-black">{match.home} v {match.away}</h1>
        {isUpcoming ? (
          <p className="mt-2 text-sm font-semibold text-[#4A051C]">{match.date} · {match.time} · {match.markets} markets opening</p>
        ) : (
          <p className="mt-2 text-2xl font-black text-[#094586]">{formatScoreline(liveMatch)}</p>
        )}
        <div className="mt-5 rounded-lg border border-dashed border-[#6FB4EB] bg-[#D0FEF5] p-4 text-sm font-semibold text-[#4A051C]">
          {isCompleted
            ? "Forecasting is closed. Final statistics remain unavailable until TxLINE marks the fixture final."
            : isUpcoming
            ? "Markets open before kickoff. All markets use testnet coins with no monetary value."
            : "Match in progress. All markets use testnet coins with no monetary value."}
        </div>
        {!isCompleted ? (
          <Link href={`/markets?match=${match.id}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#6FB4EB] px-4 py-3 text-sm font-black text-[#4A051C]">
            Create a custom market <ChevronRight size={17} />
          </Link>
        ) : null}
      </section>
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Available stat markets</h2>
          <ListChecks size={18} className="text-[#6FB4EB]" />
        </div>
        <div className="grid gap-3">
          {forecastStatMarkets.map((stat) => (
            <Link key={stat.id} href={`/matches/${match.id}/markets/${stat.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
              <div>
                <p className="font-black">{stat.label}</p>
                <p className="mt-1 text-sm font-semibold text-[#4A051C]">{stat.description}</p>
              </div>
              <ChevronRight size={18} className="text-[#094586]" />
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
