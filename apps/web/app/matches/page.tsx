import Link from "next/link";
import { ChevronRight, Clock, Flame, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { liveStatMarkets, upcomingMatchMarkets } from "@/lib/demo";
import { formatMatchClock, formatScoreline, getLiveMatchOrFallback, listLiveMatchesOrFallback } from "@/lib/live";

const TONIGHT_MATCH_ID = "worldcup-sf-england-argentina-2026-07-15";

export default async function MatchesPage() {
  const featuredLiveMarkets = liveStatMarkets.slice(0, 2);
  const { matches, live: listIsLive } = await listLiveMatchesOrFallback();
  const currentMatch = matches.find((match) => match.id === TONIGHT_MATCH_ID) ?? matches[0];
  const { match: liveMatch, live: detailIsLive } = await getLiveMatchOrFallback(currentMatch.id);
  const live = listIsLive || detailIsLive;

  return (
    <AppShell>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-normal text-[#D0FEF5]">Match markets</h1>
            <p className="mt-1 text-sm font-semibold text-[#D0FEF5]">Trade live football stats with testnet coins.</p>
          </div>
          <div className="rounded-full bg-[#094586] px-3 py-2 text-sm font-black text-[#6FB4EB]">{live ? "TxLINE · Live" : "TxLINE"}</div>
        </div>
      </div>

      <Link href={`/matches/${currentMatch.id}`} className="block rounded-lg border border-[#094586] bg-[#D0FEF5] p-4 text-[#4A051C] transition hover:border-[#6FB4EB]">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-[#4A051C]">
          <span>{liveMatch.homeTeam} v {liveMatch.awayTeam}</span>
          <span className="text-[#6FB4EB]">{formatMatchClock(liveMatch)}</span>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <p className="text-xl font-black">{liveMatch.homeTeam}</p>
          </div>
          <div className="rounded-lg bg-[#094586] px-3 py-2 text-lg font-black text-[#D0FEF5]">{formatScoreline(liveMatch)}</div>
          <div className="text-right">
            <p className="text-xl font-black">{liveMatch.awayTeam}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end text-xs font-black text-[#094586]">
          <span className="inline-flex items-center gap-1">View all live markets <ChevronRight size={14} /></span>
        </div>
      </Link>

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Live stat markets</h2>
            <p className="mt-1 text-sm text-[#D0FEF5]">Proof-ready cards and corners. Feed-derived markets are labelled before use.</p>
          </div>
          <Flame size={18} className="text-[#6FB4EB]" />
        </div>
        <div className="grid gap-3">
          {featuredLiveMarkets.map((market) => (
            <Link key={market.id} href={`/markets/${market.id}`} className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4 transition hover:border-[#6FB4EB]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-black">{market.label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#4A051C]">{market.line} · {market.volume} coins matched</p>
                </div>
                <div className="rounded-full bg-[#094586] px-3 py-1 text-xs font-black text-[#6FB4EB]">{market.status}</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-[#094586] px-3 py-2">
                  <p className="text-xs font-bold text-[#D0FEF5]">YES</p>
                  <p className="text-2xl font-black text-[#6FB4EB]">{market.yes}%</p>
                </div>
                <div className="rounded-lg bg-[#094586] px-3 py-2 text-right">
                  <p className="text-xs font-bold text-[#D0FEF5]">NO</p>
                  <p className="text-2xl font-black text-[#D0FEF5]">{market.no}%</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Upcoming matches</h2>
        </div>
        <div className="max-h-[390px] overflow-y-auto pr-1 no-scrollbar">
          <div className="grid gap-3">
            {matches.map((match) => {
              const meta = upcomingMatchMarkets.find((item) => item.id === match.id);
              const kickoff = new Date(match.startsAt);
              const time = formatKickoffTime(kickoff);
              const date = formatKickoffDate(kickoff);
              const marketCount = meta?.markets ?? (match.competition.includes("World Cup") ? 16 : 9);
              const liquidity = meta?.liquidity ?? (match.competition.includes("World Cup") ? 980 : 360);

              return (
              <Link key={match.id} href={`/matches/${match.id}`} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
                <div className="text-lg font-black">{time}</div>
                <div>
                  <p className="font-black">{match.homeTeam}</p>
                  <p className="font-black">{match.awayTeam}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#4A051C]"><Clock size={13} /> {date} · {marketCount} markets</p>
                  <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#094586]">{match.competition}</p>
                </div>
                <div className="flex items-center gap-1 text-[#094586]">
                  <span className="text-xs font-bold">{liquidity}</span>
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
