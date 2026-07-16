"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { conditionHash } from "@tutela/condition-engine";
import { validateConditionGroup } from "@tutela/validation";
import type { BooleanOperator, ConditionGroup, MarketCondition } from "@tutela/types";
import { AlertCircle, CheckCircle2, Copy, Plus, Trash2 } from "lucide-react";
import { useTutelaAuth } from "@/providers/tutela-auth-provider";

export type ForecastMatchOption = {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  competition: string;
};

const defaultCondition: MarketCondition = {
  field: "TotalGoals",
  operator: "Gte",
  scope: "FullTime",
  value: { kind: "u16", value: 2 }
};

const fieldOptions: MarketCondition["field"][] = ["MatchWinner", "TotalGoals", "TotalCorners", "TotalCards", "BothTeamsScore"];
const operatorOptions: MarketCondition["operator"][] = ["Eq", "Gt", "Gte", "Lt", "Lte"];
const scopeOptions: MarketCondition["scope"][] = ["FullTime", "RegulationTime", "Match"];

const fieldLabel: Record<MarketCondition["field"], string> = {
  MatchWinner: "Match winner",
  TotalGoals: "Total goals",
  TeamGoals: "Team goals",
  PlayerGoals: "Player goals",
  TotalCorners: "Total corners",
  TeamCorners: "Team corners",
  TotalCards: "Total cards",
  TeamCards: "Team cards",
  BothTeamsScore: "Both teams score",
  FirstGoal: "First goal",
  CleanSheet: "Clean sheet",
  DoubleChance: "Double chance"
};

const operatorLabel: Record<MarketCondition["operator"], string> = {
  Eq: "Exactly",
  Neq: "Not equal to",
  Gt: "More than",
  Gte: "At least",
  Lt: "Less than",
  Lte: "At most",
  IsTrue: "Is true",
  IsFalse: "Is false"
};

const operatorPhrase: Record<MarketCondition["operator"], string> = {
  Eq: "will be exactly",
  Neq: "will not equal",
  Gt: "will be more than",
  Gte: "will be at least",
  Lt: "will be less than",
  Lte: "will be at most",
  IsTrue: "will be true",
  IsFalse: "will be false"
};

const scopeLabel: Record<MarketCondition["scope"], string> = {
  FullTime: "Full match",
  RegulationTime: "Regular time",
  Match: "Match",
  Team: "Team",
  Player: "Player"
};

export function ConditionBuilder({
  matches,
  initialMatch,
  initialField = "TotalGoals"
}: {
  matches: ForecastMatchOption[];
  initialMatch: ForecastMatchOption;
  initialField?: MarketCondition["field"];
}) {
  const { authenticated, authenticatedFetch, demoPoints, enabled, login, refreshProfile } = useTutelaAuth();
  const [selectedMatchId, setSelectedMatchId] = useState(initialMatch.id);
  const [operator, setOperator] = useState<BooleanOperator>("AND");
  const [conditions, setConditions] = useState<MarketCondition[]>([conditionForField(initialField, initialMatch)]);
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [points, setPoints] = useState(25);
  const [closed, setClosed] = useState(false);
  const [submission, setSubmission] = useState<{ state: "idle" | "pending" | "success" | "error"; message?: string }>({ state: "idle" });
  const requestKey = useRef<string | null>(null);
  const group: ConditionGroup = { operator, conditions };
  const errors = useMemo(() => validateConditionGroup(group), [group]);
  const hash = useMemo(() => conditionHash(group), [group]);
  const prediction = useMemo(() => describePrediction(group), [group]);
  const remainingConditions = 5 - conditions.length;
  const selectedMatch = matches.find((match) => match.id === selectedMatchId) ?? initialMatch;

  useEffect(() => {
    const updateClosed = () => setClosed(Date.now() >= Date.parse(selectedMatch.kickoffAt));
    updateClosed();
    const timer = window.setInterval(updateClosed, 30_000);
    return () => window.clearInterval(timer);
  }, [selectedMatch.kickoffAt]);

  return (
    <div className="rounded-lg border border-[#6FB4EB]/70 bg-[#D0FEF5] p-4 text-[#4A051C] shadow-[0_12px_30px_rgba(9,69,134,0.18)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-normal">Build your conditions</h2>
          <p className="mt-1 text-sm font-semibold leading-5 text-[#4A051C]/80">Combine up to five match outcomes using AND or OR.</p>
        </div>
        <span className="rounded-full border border-[#6FB4EB] bg-white/35 px-3 py-1 text-xs font-black text-[#094586]">
          {conditions.length} of 5 conditions
        </span>
      </div>

      <div className="mt-4">
        <label className="mb-4 grid gap-1">
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#094586]">Match</span>
          <select
            value={selectedMatch.id}
            onChange={(event) => selectMatch(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-[#6FB4EB]/70 bg-[#D0FEF5] px-3 py-2 text-sm font-black text-[#4A051C] outline-none focus:border-[#094586] focus:ring-2 focus:ring-[#6FB4EB]"
          >
            {matches.map((match) => (
              <option key={match.id} value={match.id}>{match.title} · {formatKickoff(match.kickoffAt)}</option>
            ))}
          </select>
          <span className="text-xs font-semibold text-[#4A051C]/75">{selectedMatch.competition}</span>
        </label>
        <div className="inline-grid grid-cols-2 rounded-lg border border-[#6FB4EB]/80 bg-white/30 p-1">
          {(["AND", "OR"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setOperator(value)}
              className={`min-h-11 rounded-lg px-3 py-2 text-left text-xs font-black transition ${operator === value ? "bg-[#094586] text-[#D0FEF5]" : "text-[#4A051C] hover:bg-white/40"}`}
            >
              {value === "AND" ? "Match all - AND" : "Match any - OR"}
            </button>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#094586]">
          <CheckCircle2 size={14} />
          {operator === "AND" ? "Every condition must be true" : "At least one condition must be true"}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        {conditions.map((condition, index) => (
          <div key={index} className="rounded-lg border border-[#6FB4EB]/70 bg-white/35 p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2 sm:hidden">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#094586]">Condition {index + 1}</p>
              <RemoveButton onClick={() => remove(index)} />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(74px,0.72fr)_minmax(0,1fr)_44px]">
              <Field label="Statistic" className="col-span-2 sm:col-span-1">
                <Select value={condition.field} onChange={(field) => updateField(index, field as MarketCondition["field"])} options={fieldOptions} labels={fieldLabel} />
              </Field>
              <Field label="Operator">
                <Select
                  value={condition.operator}
                  onChange={(op) => update(index, { ...condition, operator: op as MarketCondition["operator"] })}
                  options={condition.field === "MatchWinner" || condition.field === "BothTeamsScore" ? ["Eq"] : operatorOptions}
                  labels={operatorLabel}
                />
              </Field>
              <Field label="Value">
                {condition.field === "MatchWinner" ? (
                  <select
                    value={String(condition.value.value)}
                    onChange={(event) => update(index, { ...condition, operator: "Eq", value: { kind: "team", value: event.target.value } })}
                    className="min-h-11 w-full rounded-lg border border-[#6FB4EB]/70 bg-[#D0FEF5] px-3 py-2 text-sm font-black text-[#4A051C] outline-none focus:border-[#094586] focus:ring-2 focus:ring-[#6FB4EB]"
                  >
                    <option value={selectedMatch.homeTeam}>{selectedMatch.homeTeam}</option>
                    <option value={selectedMatch.awayTeam}>{selectedMatch.awayTeam}</option>
                    <option value="Draw">Draw</option>
                  </select>
                ) : condition.field === "BothTeamsScore" ? (
                  <select
                    value={String(condition.value.value)}
                    onChange={(event) => update(index, { ...condition, operator: "Eq", value: { kind: "bool", value: event.target.value === "true" } })}
                    className="min-h-11 w-full rounded-lg border border-[#6FB4EB]/70 bg-[#D0FEF5] px-3 py-2 text-sm font-black text-[#4A051C] outline-none focus:border-[#094586] focus:ring-2 focus:ring-[#6FB4EB]"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : (
                  <input
                    className="min-h-11 w-full rounded-lg border border-[#6FB4EB]/70 bg-[#D0FEF5] px-3 py-2 text-sm font-black text-[#4A051C] outline-none transition placeholder:text-[#4A051C]/45 focus:border-[#094586] focus:ring-2 focus:ring-[#6FB4EB]"
                    value={String(condition.value.value)}
                    onChange={(event) => updateValue(index, event.target.value)}
                    aria-label="Condition value"
                    inputMode="numeric"
                  />
                )}
              </Field>
              <Field label="Period" className="col-span-2 sm:col-span-1">
                <Select value={condition.scope} onChange={(scope) => update(index, { ...condition, scope: scope as MarketCondition["scope"] })} options={scopeOptions} labels={scopeLabel} />
              </Field>
              <div className="hidden items-end sm:flex">
                <RemoveButton onClick={() => remove(index)} />
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#4A051C]/75">{describeCondition(condition)}.</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => conditions.length < 5 && setConditions((items) => [...items, defaultCondition])}
          disabled={conditions.length >= 5}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#6FB4EB] bg-white/35 px-3 py-2 text-sm font-black text-[#094586] transition hover:bg-white/55 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Plus size={16} /> Add another condition
        </button>
        <p className="text-xs font-bold text-[#4A051C]/75">
          {remainingConditions > 0 ? `You can add ${remainingConditions} more condition${remainingConditions === 1 ? "" : "s"}` : "Maximum of five conditions reached"}
        </p>
      </div>

      <section className="mt-4 rounded-lg border border-[#6FB4EB] bg-[#094586] p-3 text-[#D0FEF5]">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Your prediction</p>
        <p className="mt-2 text-sm font-black leading-6">{prediction}</p>
      </section>

      <section className="mt-4 rounded-lg border border-[#6FB4EB]/70 bg-white/35 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#094586]">Participate with demo points</p>
            <p className="mt-1 text-sm font-bold">{selectedMatch.title} · maximum 100 points</p>
          </div>
          <p className="text-sm font-black text-[#094586]">{demoPoints.toLocaleString()} available</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["YES", "NO"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSide(value)}
              className={`min-h-11 rounded-lg border border-[#094586] px-3 py-2 text-sm font-black ${side === value ? "bg-[#094586] text-[#D0FEF5]" : "bg-[#D0FEF5] text-[#094586]"}`}
            >
              {value}
            </button>
          ))}
        </div>
        <label className="mt-3 grid gap-1">
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#094586]">Demo points</span>
          <input
            type="number"
            min={1}
            max={100}
            value={points}
            onChange={(event) => setPoints(Number(event.target.value))}
            className="min-h-11 w-full rounded-lg border border-[#6FB4EB]/70 bg-[#D0FEF5] px-3 py-2 text-sm font-black text-[#4A051C] outline-none focus:border-[#094586] focus:ring-2 focus:ring-[#6FB4EB]"
          />
        </label>
        <p className="mt-2 text-xs font-semibold leading-5">Free, non-transferable testnet points only. No deposits, purchases, prizes, cash-out or monetary value.</p>
        <button
          type="button"
          onClick={submitForecast}
          disabled={submission.state === "pending" || closed || errors.length > 0 || points < 1 || points > 100 || (authenticated && points > demoPoints)}
          className="mt-3 min-h-12 w-full rounded-lg bg-[#6FB4EB] px-4 py-3 text-sm font-black text-[#4A051C] transition hover:bg-[#6FB4EB]/85 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {closed ? "Forecast closed" : submission.state === "pending" ? "Submitting..." : authenticated ? `Confirm ${side} · ${points} points` : enabled ? "Sign in to participate" : "Authentication unavailable"}
        </button>
        {submission.message && (
          <p role="status" className={`mt-2 text-sm font-bold ${submission.state === "error" ? "text-[#4A051C]" : "text-[#094586]"}`}>{submission.message}</p>
        )}
      </section>

      {errors.length > 0 && (
        <ul className="mt-3 grid gap-2 text-sm font-bold text-[#4A051C]">
          {errors.map((error) => (
            <li key={error} className="flex gap-2 rounded-lg border border-[#6FB4EB]/70 bg-white/35 px-3 py-2">
              <AlertCircle className="mt-0.5 shrink-0 text-[#094586]" size={16} />
              <span>{humanizeValidationError(error)}</span>
            </li>
          ))}
        </ul>
      )}

      <details className="mt-4 rounded-lg border border-[#6FB4EB]/70 bg-white/25 p-3">
        <summary className="cursor-pointer text-sm font-black text-[#094586]">Advanced details</summary>
        <div className="mt-3 grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#4A051C]/70">Canonical condition hash</p>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(hash)}
              className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#6FB4EB] px-2 py-1 text-xs font-black text-[#094586]"
            >
              <Copy size={13} /> Copy
            </button>
          </div>
          <p className="break-all rounded-lg bg-[#D0FEF5] p-2 font-mono text-xs leading-5 text-[#094586]">{hash}</p>
          <p className="text-xs font-semibold leading-5 text-[#4A051C]/75">
            This fingerprint proves that the displayed conditions match the immutable market configuration.
          </p>
        </div>
      </details>
    </div>
  );

  function update(index: number, next: MarketCondition) {
    setConditions((items) => items.map((item, i) => (i === index ? next : item)));
  }

  function updateField(index: number, field: MarketCondition["field"]) {
    setConditions((items) => items.map((item, i) => {
      if (i !== index) return item;
      if (field === "MatchWinner") return { ...item, field, operator: "Eq", scope: "FullTime", value: { kind: "team", value: selectedMatch.homeTeam } };
      if (field === "BothTeamsScore") return { ...item, field, operator: "Eq", scope: "FullTime", value: { kind: "bool", value: true } };
      return { ...item, field, value: { kind: "u16", value: 1 } };
    }));
  }

  async function submitForecast() {
    if (!authenticated) {
      login();
      return;
    }
    if (closed || errors.length > 0 || points < 1 || points > 100 || points > demoPoints) return;

    requestKey.current ??= crypto.randomUUID();
    setSubmission({ state: "pending" });
    try {
      const response = await authenticatedFetch("/api/forecasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: requestKey.current,
          matchId: selectedMatch.id,
          side,
          points,
          group
        })
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Forecast submission failed.");
      setSubmission({ state: "success", message: "Forecast submitted. Your activity and balance are now updated." });
      requestKey.current = null;
      await refreshProfile();
    } catch (error) {
      setSubmission({ state: "error", message: error instanceof Error ? error.message : "Forecast submission failed." });
    }
  }

  function updateValue(index: number, value: string) {
    setConditions((items) => items.map((item, i) => {
      if (i !== index) return item;
      if (["IsTrue", "IsFalse"].includes(item.operator)) return { ...item, value: { kind: "bool", value: value.toLowerCase() !== "false" } };
      const numeric = Number(value);
      return Number.isFinite(numeric) ? { ...item, value: { kind: "u16", value: numeric } } : { ...item, value: { kind: "team", value } };
    }));
  }

  function remove(index: number) {
    setConditions((items) => items.filter((_, i) => i !== index));
  }

  function selectMatch(matchId: string) {
    const nextMatch = matches.find((match) => match.id === matchId);
    if (!nextMatch) return;
    setSelectedMatchId(nextMatch.id);
    setConditions((items) => items.map((item) => item.field === "MatchWinner"
      ? { ...item, value: { kind: "team", value: nextMatch.homeTeam } }
      : item));
    requestKey.current = null;
    setSubmission({ state: "idle" });
  }
}

function conditionForField(field: MarketCondition["field"], match: ForecastMatchOption): MarketCondition {
  if (field === "MatchWinner") {
    return { field, operator: "Eq", scope: "FullTime", value: { kind: "team", value: match.homeTeam } };
  }
  if (field === "BothTeamsScore") {
    return { field, operator: "Eq", scope: "FullTime", value: { kind: "bool", value: true } };
  }
  return { ...defaultCondition, field };
}

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Lagos"
  }).format(new Date(value));
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`grid gap-1 ${className}`}>
      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#094586]">{label}</span>
      {children}
    </label>
  );
}

function Select<T extends string>({ value, onChange, options, labels }: { value: T; onChange: (value: T) => void; options: T[]; labels: Record<T, string> }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="min-h-11 w-full rounded-lg border border-[#6FB4EB]/70 bg-[#D0FEF5] px-3 py-2 text-sm font-black text-[#4A051C] outline-none transition focus:border-[#094586] focus:ring-2 focus:ring-[#6FB4EB]"
    >
      {options.map((option) => <option key={option} value={option}>{labels[option]}</option>)}
    </select>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Remove condition"
      aria-label="Remove condition"
      className="grid min-h-11 w-11 shrink-0 place-items-center rounded-lg border border-[#6FB4EB]/80 bg-[#D0FEF5] text-[#094586] transition hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-[#6FB4EB]"
    >
      <Trash2 size={16} />
    </button>
  );
}

function describePrediction(group: ConditionGroup) {
  const joiner = ` ${group.operator} `;
  return `${group.conditions.map(describeCondition).join(joiner)}.`;
}

function describeCondition(condition: MarketCondition) {
  const subject = fieldLabel[condition.field].toLowerCase();
  const value = formatValue(condition);
  const period = scopeLabel[condition.scope].toLowerCase();

  if (condition.operator === "IsTrue") return `${subject} will be true during the ${period}`;
  if (condition.operator === "IsFalse") return `${subject} will be false during the ${period}`;
  return `${subject} ${operatorPhrase[condition.operator]} ${value} during the ${period}`;
}

function formatValue(condition: MarketCondition) {
  if (condition.value.kind === "bool") return condition.value.value ? "true" : "false";
  return String(condition.value.value);
}

function humanizeValidationError(error: string) {
  return error
    .replaceAll("TotalGoals", "Total goals")
    .replaceAll("TeamGoals", "Team goals")
    .replaceAll("PlayerGoals", "Player goals")
    .replaceAll("TotalCorners", "Total corners")
    .replaceAll("TeamCorners", "Team corners")
    .replaceAll("TotalCards", "Total cards")
    .replaceAll("TeamCards", "Team cards")
    .replaceAll("BothTeamsScore", "Both teams score")
    .replaceAll("CleanSheet", "Clean sheet")
    .replaceAll("IsTrue", "Is true")
    .replaceAll("IsFalse", "Is false");
}
