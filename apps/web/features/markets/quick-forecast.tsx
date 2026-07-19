"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { ConditionGroup, MarketCondition } from "@tutela/types";
import { useTutelaAuth } from "@/providers/tutela-auth-provider";

type QuickMarket = {
  field: MarketCondition["field"];
  label: string;
};

type QuickMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  expectedEndAt: string;
};

export function QuickForecast({ market, match, initiallyClosed }: { market: QuickMarket; match: QuickMatch; initiallyClosed: boolean }) {
  const { authenticated, authenticatedFetch, demoPoints, enabled, login, refreshProfile } = useTutelaAuth();
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [points, setPoints] = useState(25);
  const [numericValue, setNumericValue] = useState(defaultNumericValue(market.field));
  const [winner, setWinner] = useState<"HOME" | "DRAW" | "AWAY">("HOME");
  const [bothTeamsScore, setBothTeamsScore] = useState(true);
  const [closed, setClosed] = useState(initiallyClosed);
  const [submission, setSubmission] = useState<{ state: "idle" | "pending" | "success" | "error"; message?: string; forecastId?: string }>({ state: "idle" });
  const requestKey = useRef<string | null>(null);

  const condition = useMemo<MarketCondition>(() => {
    if (market.field === "MatchWinner") {
      return { field: "MatchWinner", operator: "Eq", scope: "FullTime", value: { kind: "team", value: winner } };
    }
    if (market.field === "BothTeamsScore") {
      return { field: "BothTeamsScore", operator: "Eq", scope: "FullTime", value: { kind: "bool", value: bothTeamsScore } };
    }
    return { field: market.field, operator: "Gte", scope: "FullTime", value: { kind: "u16", value: numericValue } };
  }, [bothTeamsScore, market.field, numericValue, winner]);

  const group = useMemo<ConditionGroup>(() => ({ operator: "AND", conditions: [condition] }), [condition]);
  const prediction = describePrediction(condition, match);

  useEffect(() => {
    const updateClosed = () => setClosed(initiallyClosed || Date.now() >= Date.parse(match.expectedEndAt));
    updateClosed();
    const timer = window.setInterval(updateClosed, 30_000);
    return () => window.clearInterval(timer);
  }, [initiallyClosed, match.expectedEndAt]);

  function resetSubmission() {
    requestKey.current = null;
    setSubmission({ state: "idle" });
  }

  async function submit() {
    if (!authenticated) {
      login();
      return;
    }
    if (closed || points < 1 || points > 100 || points > demoPoints) return;

    requestKey.current ??= crypto.randomUUID();
    setSubmission({ state: "pending" });
    try {
      const response = await authenticatedFetch("/api/forecasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: requestKey.current,
          matchId: match.id,
          side,
          points,
          group
        })
      });
      const payload = await response.json() as { error?: string; forecastId?: string };
      if (!response.ok) throw new Error(payload.error ?? "Prediction submission failed.");
      setSubmission({ state: "success", message: "Prediction placed. Your balance and activity are updated.", forecastId: payload.forecastId });
      requestKey.current = null;
      await refreshProfile();
    } catch (error) {
      setSubmission({ state: "error", message: error instanceof Error ? error.message : "Prediction submission failed." });
    }
  }

  return (
    <section className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-5 text-[#4A051C]">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">{market.label} · single market</p>
      <h1 className="mt-3 text-3xl font-black">Place your prediction</h1>
      <p className="mt-2 text-sm font-semibold">{match.homeTeam} v {match.awayTeam}</p>

      <div className="mt-5 rounded-lg border border-[#6FB4EB]/70 bg-white/35 p-4">
        {market.field === "MatchWinner" ? (
          <label className="grid gap-1">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#094586]">Result</span>
            <select value={winner} onChange={(event) => { setWinner(event.target.value as "HOME" | "DRAW" | "AWAY"); resetSubmission(); }} className="min-h-12 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] px-3 font-black outline-none focus:ring-2 focus:ring-[#6FB4EB]">
              <option value="HOME">{match.homeTeam}</option>
              <option value="DRAW">Draw</option>
              <option value="AWAY">{match.awayTeam}</option>
            </select>
          </label>
        ) : market.field === "BothTeamsScore" ? (
          <label className="grid gap-1">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#094586]">Both teams score</span>
            <select value={String(bothTeamsScore)} onChange={(event) => { setBothTeamsScore(event.target.value === "true"); resetSubmission(); }} className="min-h-12 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] px-3 font-black outline-none focus:ring-2 focus:ring-[#6FB4EB]">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
        ) : (
          <label className="grid gap-1">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-[#094586]">Full-time total · at least</span>
            <input type="number" min={0} max={100} value={numericValue} onChange={(event) => { setNumericValue(Number(event.target.value)); resetSubmission(); }} className="min-h-12 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] px-3 font-black outline-none focus:ring-2 focus:ring-[#6FB4EB]" />
          </label>
        )}

        <div className="mt-4 rounded-lg bg-[#094586] p-4 text-[#D0FEF5]">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6FB4EB]">Market condition</p>
          <p className="mt-2 text-sm font-black leading-6">{prediction}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {(["YES", "NO"] as const).map((value) => (
          <button key={value} type="button" onClick={() => { setSide(value); resetSubmission(); }} className={`min-h-14 rounded-lg border border-[#094586] px-3 text-sm font-black ${side === value ? "bg-[#094586] text-[#D0FEF5]" : "bg-[#D0FEF5] text-[#094586]"}`}>
            {value} · {value === "YES" ? "it happens" : "it does not"}
          </button>
        ))}
      </div>

      <label className="mt-4 grid gap-1">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#094586]">Demo points</span>
        <input type="number" min={1} max={100} value={points} onChange={(event) => { setPoints(Number(event.target.value)); resetSubmission(); }} className="min-h-12 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] px-3 font-black outline-none focus:ring-2 focus:ring-[#6FB4EB]" />
      </label>
      <div className="mt-2 flex items-center justify-between gap-3 text-xs font-bold">
        <span>Maximum 100 points</span>
        <span>{demoPoints.toLocaleString()} available</span>
      </div>

      <button type="button" onClick={submit} disabled={submission.state === "pending" || closed || points < 1 || points > 100 || (authenticated && points > demoPoints)} className="mt-4 min-h-12 w-full rounded-lg bg-[#6FB4EB] px-4 py-3 font-black text-[#4A051C] disabled:cursor-not-allowed disabled:opacity-55">
        {closed ? "Market closed" : submission.state === "pending" ? "Placing prediction..." : authenticated ? `Place ${side} · ${points} points` : enabled ? "Sign in to place prediction" : "Authentication unavailable"}
      </button>

      {submission.message ? (
        <div role="status" className={`mt-3 rounded-lg border border-[#6FB4EB] p-3 text-sm font-bold ${submission.state === "success" ? "bg-white/40 text-[#094586]" : "text-[#4A051C]"}`}>
          <p className="flex items-center gap-2">{submission.state === "success" ? <CheckCircle2 size={17} /> : null}{submission.message}</p>
          {submission.forecastId ? <Link href={`/markets/${submission.forecastId}`} className="mt-2 inline-block underline">View prediction receipt</Link> : null}
        </div>
      ) : null}

      <p className="mt-4 text-xs font-semibold leading-5">Free, non-transferable Devnet demo points only. No deposits, purchases, prizes, cash-out or monetary value.</p>
    </section>
  );
}

function defaultNumericValue(field: MarketCondition["field"]) {
  if (field === "TotalCorners") return 8;
  if (field === "TotalCards") return 4;
  return 2;
}

function describePrediction(condition: MarketCondition, match: QuickMatch) {
  if (condition.field === "MatchWinner") {
    const result = condition.value.value === "HOME" ? match.homeTeam : condition.value.value === "AWAY" ? match.awayTeam : "The match";
    return condition.value.value === "DRAW" ? "The match will end in a draw." : `${result} will win the match.`;
  }
  if (condition.field === "BothTeamsScore") return condition.value.value ? "Both teams will score." : "Both teams will not score.";
  const labels: Partial<Record<MarketCondition["field"], string>> = {
    TotalGoals: "total goals",
    TotalCorners: "total corners",
    TotalCards: "total cards"
  };
  return `There will be at least ${String(condition.value.value)} ${labels[condition.field] ?? "events"} by full time in ${match.homeTeam} v ${match.awayTeam}.`;
}
