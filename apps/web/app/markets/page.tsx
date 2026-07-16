import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Swords, Trophy, UsersRound } from "lucide-react";
import { demoMatches } from "@tutela/txline-adapter";
import type { MarketCondition } from "@tutela/types";
import { AppShell } from "@/components/layout/app-shell";
import { ConditionBuilder, type ForecastMatchOption } from "@/features/conditions/condition-builder";
import { contests, formatCoins, upcomingMatchMarkets } from "@/lib/demo";
import { listForecastMarkets, type ForecastMarket } from "@/lib/server/forecast-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supportedInitialFields: MarketCondition["field"][] = ["MatchWinner", "TotalGoals", "TotalCorners", "TotalCards", "BothTeamsScore"];

export default async function MarketsPage({ searchParams }: { searchParams: Promise<{ match?: string; field?: string }> }) {
  const query = await searchParams;
  const playableIds = new Set(upcomingMatchMarkets.map((match) => match.id));
  const matchOptions: ForecastMatchOption[] = demoMatches
    .filter((match) => playableIds.has(match.id))
    .map((match) => ({
      id: match.id,
      title: `${match.homeTeam} vs ${match.awayTeam}`,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      kickoffAt: match.startsAt,
      competition: match.competition
    }))
    .sort((left, right) => Date.parse(left.kickoffAt) - Date.parse(right.kickoffAt));
  const initialMatch = matchOptions.find((match) => match.id === query.match) ?? matchOptions[0];
  const initialField = supportedInitialFields.includes(query.field as MarketCondition["field"])
    ? query.field as MarketCondition["field"]
    : "TotalGoals";

  if (!initialMatch) throw new Error("No playable matches are configured.");

  let forecastMarkets: ForecastMarket[] = [];
  try {
    forecastMarkets = await listForecastMarkets();
  } catch (error) {
    console.warn("Community forecast storage is unavailable", error);
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Create markets</h1>
          <p className="mt-1 text-sm font-semibold text-[#D0FEF5]">Build markets, battle friends, join contests.</p>
        </div>
        <div className="rounded-full bg-[#094586] px-3 py-2 text-sm font-black text-[#6FB4EB]">0 active</div>
      </div>

      <section className="rounded-lg border border-dashed border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">Challenge a friend</h2>
            <p className="mt-1 text-sm text-[#D0FEF5]">Pick a match statistic and send a private link.</p>
          </div>
          <button className="rounded-lg bg-[#6FB4EB] px-4 py-3 text-sm font-black text-[#4A051C]">Invite</button>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Create a market</h2>
          <Swords size={18} className="text-[#6FB4EB]" />
        </div>
        <ConditionBuilder matches={matchOptions} initialMatch={initialMatch} initialField={initialField} />
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Community forecasts</h2>
          <UsersRound size={18} className="text-[#6FB4EB]" />
        </div>
        <div className="grid gap-3">
          {forecastMarkets.length === 0 ? (
            <p className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-4 text-sm font-bold text-[#4A051C]">No submitted forecasts yet. Be the first to create one.</p>
          ) : forecastMarkets.map((market) => (
            <Link key={market.id} href={`/markets/${market.id}`} className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-4 text-[#4A051C]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black">{market.title}</p>
                  <p className="mt-1 text-sm font-semibold text-[#094586]">{market.participantCount} participant{market.participantCount === 1 ? "" : "s"} · {market.status}</p>
                </div>
                <ChevronRight size={18} className="text-[#094586]" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-black">
                <p className="rounded-lg bg-[#094586] px-3 py-2 text-[#D0FEF5]">YES · {market.yesPoints}</p>
                <p className="rounded-lg bg-[#094586] px-3 py-2 text-right text-[#D0FEF5]">NO · {market.noPoints}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Location contests</h2>
          <MapPin size={18} className="text-[#6FB4EB]" />
        </div>
        <div className="grid gap-3">
          {contests.map((contest) => (
            <div key={contest.id} className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black">{contest.title}</p>
                  <p className="mt-1 text-sm text-[#D0FEF5]">{contest.subtitle}</p>
                </div>
                <div className={`rounded-full px-3 py-1 text-xs font-black ${contest.active ? "bg-[#094586] text-[#6FB4EB]" : "bg-[#094586] text-[#D0FEF5]"}`}>
                  {contest.active ? "Open" : "Soon"}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Stat icon={<UsersRound size={16} />} label="Entry" value={formatCoins(contest.entry)} />
                <Stat icon={<Trophy size={16} />} label="Pool" value={formatCoins(contest.prize)} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#094586] px-3 py-2">
      <div className="flex items-center gap-2 text-[#6FB4EB]">{icon}<span className="text-xs font-bold uppercase text-[#D0FEF5]">{label}</span></div>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
