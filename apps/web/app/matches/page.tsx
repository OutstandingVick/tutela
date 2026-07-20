import Link from "next/link";
import { ChevronRight, Clock, Flame, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { forecastStatMarkets, upcomingMatchMarkets } from "@/lib/demo";
import { formatMatchClock, formatScoreline, getLiveMatchOrFallback, listLiveMatchesOrFallback } from "@/lib/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MatchesPage() {
  const { matches, live: listIsLive } = await listLiveMatchesOrFallback();
  const playableIds = new Set(upcomingMatchMarkets.map((match) => match.id));
  const availableMatches = matches
    .filter((match) => playableIds.has(match.id) && match.status !== "completed")
    .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
  const currentMatch = availableMatches[0];

  if (!currentMatch) {
    return (
      <AppShell>
        <h1 className="text-3xl font-black text-[#D0FEF5]">Match markets</h1>
        <p className="mt-4 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-4 text-sm font-bold text-[#4A051C]">
          No playable fixtures are currently available from the configured TxLINE bundle.
        </p>
      </AppShell>
    );
  }

  const { match: liveMatch, live: detailIsLive } = await getLiveMatchOrFallback(currentMatch.id);
  const live = listIsLive || detailIsLive;

  return (
    <AppShell>
      <div className="mb-6">
        <div className="flex flex-col items-start justify-between gap-3 min-[390px]:flex-row min-[390px]:items-center">
          <div>
            <h1 className="text-3xl font-black tracking-normal text-[#D0FEF5]">Match markets</h1>
            <p className="mt-1 text-sm font-semibold text-[#D0FEF5]">Trade live football stats with testnet coins.</p>
          </div>
          <div className="rounded-full bg-[#094586] px-3 py-2 text-sm font-black text-[#6FB4EB]">{live ? "TxLINE · Connected" : "TxLINE"}</div>
        </div>
      </div>

      <Link href={`/matches/${currentMatch.id}`} className="block rounded-lg border border-[#094586] bg-[#D0FEF5] p-4 text-[#4A051C] transition hover:border-[#6FB4EB]">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-[#4A051C]">
          <span>{liveMatch.homeTeam} v {liveMatch.awayTeam}</span>
          <span className="text-[#6FB4EB]">{formatMatchClock(liveMatch)}</span>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
          <div>
            <p className="break-words text-base font-black sm:text-xl">{liveMatch.homeTeam}</p>
          </div>
          <div className="rounded-lg bg-[#094586] px-3 py-2 text-lg font-black text-[#D0FEF5]">{formatScoreline(liveMatch)}</div>
          <div className="text-right">
            <p className="break-words text-base font-black sm:text-xl">{liveMatch.awayTeam}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end text-xs font-black text-[#094586]">
          <span className="inline-flex items-center gap-1">View match markets <ChevronRight size={14} /></span>
        </div>
      </Link>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Live stat markets</h2>
          </div>
          <Flame size={18} className="text-[#6FB4EB]" />
        </div>
        <div className="grid gap-3">
          {forecastStatMarkets.slice(2, 4).map((market) => (
            <Link key={market.id} href={`/matches/${currentMatch.id}/markets/${market.id}`} className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4 transition hover:border-[#6FB4EB]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black">{market.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#4A051C]">{market.description}</p>
                </div>
                <div className="rounded-full bg-[#094586] px-3 py-1 text-xs font-black text-[#6FB4EB]">Open</div>
              </div>
              <div className="mt-4 rounded-lg bg-[#094586] px-3 py-3 text-sm font-black text-[#D0FEF5]">
                Pool totals appear after authenticated users submit demo-point forecasts.
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Available matches</h2>
        </div>
        <div className="max-h-[390px] overflow-y-auto pr-1 no-scrollbar">
          <div className="grid gap-3">
            {availableMatches.map((match) => {
              const meta = upcomingMatchMarkets.find((item) => item.id === match.id);
              const kickoff = new Date(match.startsAt);
              const time = formatKickoffTime(kickoff);
              const date = formatKickoffDate(kickoff);
              const marketCount = meta?.markets ?? (match.competition.includes("World Cup") ? 16 : 9);

              return (
              <Link key={match.id} href={`/matches/${match.id}`} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-3 text-[#4A051C] sm:grid-cols-[64px_minmax(0,1fr)_auto] sm:gap-3 sm:p-4">
                <div className="text-sm font-black sm:text-lg">{time}</div>
                <div className="min-w-0">
                  <p className="font-black">{match.homeTeam}</p>
                  <p className="font-black">{match.awayTeam}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#4A051C]"><Clock size={13} /> {date} · {marketCount} markets</p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#094586]">{match.competition}</p>
                </div>
                <div className="flex items-center gap-1 text-[#094586]">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em]">{match.status}</span>
                  <ChevronRight size={18} />
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-[#6FB4EB] bg-[#094586] px-3 py-2 text-xs font-semibold text-[#D0FEF5]">
        <ShieldCheck size={15} className="shrink-0 text-[#6FB4EB]" />
        <span>TxLINE primary feed · simulated fallback labelled · testnet coins only</span>
      </div>
    </AppShell>
  );
}

function formatKickoffTime(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos"
  }).format(date);
}

function formatKickoffDate(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos"
  }).format(date);
}
