"use client";

import { useMemo, useRef, useState } from "react";
import { AlertCircle, BadgeCheck, Code2, Hash, Plus, Trash2 } from "lucide-react";
import { conditionHash } from "@tutela/condition-engine";
import type { ComparisonOperator, ConditionGroup, MarketCondition } from "@tutela/types";
import { validateConditionGroup } from "@tutela/validation";

type SupportedField =
  | "MatchWinner"
  | "TeamGoals"
  | "TotalGoals"
  | "BothTeamsScore"
  | "TeamCards"
  | "TotalCards"
  | "TeamCorners"
  | "TotalCorners";

type TeamSide = "home" | "away";

type DraftCondition = {
  id: number;
  field: SupportedField;
  operator: ComparisonOperator;
  team: TeamSide;
  value: number | boolean;
};

const matches = [
  { id: "wc26-brazil-france", home: "Brazil", away: "France", competition: "World Cup 2026", kickoff: "18 Jul 2026 · 20:00 WAT" },
  { id: "wc26-england-argentina", home: "England", away: "Argentina", competition: "World Cup 2026", kickoff: "15 Jul 2026 · 20:00 WAT" },
  { id: "wc26-spain-portugal", home: "Spain", away: "Portugal", competition: "World Cup 2026", kickoff: "Devnet sample fixture" }
] as const;

const fieldOptions = [
  ["MatchWinner", "Match winner"],
  ["TeamGoals", "Team goals"],
  ["TotalGoals", "Total goals"],
  ["BothTeamsScore", "Both teams to score"],
  ["TeamYellowCards", "Team yellow cards · schema pending", true],
  ["TotalYellowCards", "Total yellow cards · schema pending", true],
  ["TeamRedCards", "Team red cards · schema pending", true],
  ["TotalRedCards", "Total red cards · schema pending", true],
  ["TeamCards", "Team cards"],
  ["TotalCards", "Total cards"],
  ["TeamCorners", "Team corners"],
  ["TotalCorners", "Total corners"]
] as const;

const numericComparisons: Array<[ComparisonOperator, string]> = [
  ["Eq", "Is"],
  ["Neq", "Is not"],
  ["Gt", "Greater than"],
  ["Gte", "At least"],
  ["Lt", "Less than"],
  ["Lte", "At most"]
];

const equalityComparisons = numericComparisons.slice(0, 2);

const initialConditions: DraftCondition[] = [
  { id: 1, field: "MatchWinner", operator: "Eq", team: "home", value: 0 },
  { id: 2, field: "TotalGoals", operator: "Gt", team: "home", value: 2 },
  { id: 3, field: "TotalCorners", operator: "Gte", team: "home", value: 8 }
];

function isTeamField(field: SupportedField) {
  return field === "TeamGoals" || field === "TeamCards" || field === "TeamCorners";
}

function isBooleanField(field: SupportedField) {
  return field === "BothTeamsScore";
}

function toMarketCondition(condition: DraftCondition): MarketCondition {
  if (condition.field === "MatchWinner") {
    return {
      field: condition.field,
      operator: condition.operator,
      scope: "Match",
      value: { kind: "team", value: condition.team === "home" ? "HOME" : "AWAY" }
    };
  }

  if (isBooleanField(condition.field)) {
    return {
      field: condition.field,
      operator: condition.operator,
      scope: "Match",
      value: { kind: "bool", value: Boolean(condition.value) }
    };
  }

  return {
    field: condition.field,
    operator: condition.operator,
    scope: isTeamField(condition.field) ? "Team" : "Match",
    value: { kind: "u16", value: Number(condition.value) },
    ...(isTeamField(condition.field) ? { teamId: condition.team } : {})
  };
}

function readableCondition(condition: DraftCondition, home: string, away: string) {
  const team = condition.team === "home" ? home : away;
  const comparison = numericComparisons.find(([value]) => value === condition.operator)?.[1].toLowerCase() ?? "is";

  switch (condition.field) {
    case "MatchWinner":
      return `${team} wins`;
    case "BothTeamsScore":
      return `both teams to score ${condition.operator === "Neq" ? "is not" : "is"} ${condition.value ? "yes" : "no"}`;
    case "TeamGoals":
      return `${team} goals ${comparison} ${condition.value}`;
    case "TotalGoals":
      return `total goals ${comparison} ${condition.value}`;
    case "TeamCards":
      return `${team} cards ${comparison} ${condition.value}`;
    case "TotalCards":
      return `total cards ${comparison} ${condition.value}`;
    case "TeamCorners":
      return `${team} corners ${comparison} ${condition.value}`;
    case "TotalCorners":
      return `total corners ${comparison} ${condition.value}`;
  }
}

export function InteractiveMarketComposer() {
  const [matchId, setMatchId] = useState<(typeof matches)[number]["id"]>(matches[0].id);
  const [logicalOperator, setLogicalOperator] = useState<"AND" | "OR">("AND");
  const [conditions, setConditions] = useState(initialConditions);
  const nextId = useRef(4);
  const match = matches.find((item) => item.id === matchId) ?? matches[0];

  const group = useMemo<ConditionGroup>(() => ({
    operator: logicalOperator,
    conditions: conditions.map(toMarketCondition)
  }), [conditions, logicalOperator]);
  const errors = useMemo(() => validateConditionGroup(group), [group]);
  const hash = useMemo(() => errors.length === 0 ? conditionHash(group) : null, [errors.length, group]);
  const statement = conditions.map((condition) => readableCondition(condition, match.home, match.away)).join(` ${logicalOperator} `);
  const payload = JSON.stringify({ matchId: match.id, ...group }, null, 2);
  const sdkCode = `import { conditionHash, validateConditionGroup } from "@tutela/sdk";\nimport type { ConditionGroup } from "@tutela/sdk";\n\nconst market = ${JSON.stringify(group, null, 2)} satisfies ConditionGroup;\n\nconst errors = validateConditionGroup(market);\nconst hash = conditionHash(market);`;

  function updateCondition(id: number, patch: Partial<DraftCondition>) {
    setConditions((current) => current.map((condition) => condition.id === id ? { ...condition, ...patch } : condition));
  }

  function changeField(id: number, field: SupportedField) {
    const boolean = isBooleanField(field);
    updateCondition(id, {
      field,
      operator: "Eq",
      team: "home",
      value: boolean ? true : field === "MatchWinner" ? 0 : 1
    });
  }

  function addCondition() {
    if (conditions.length >= 5) return;
    setConditions((current) => [...current, { id: nextId.current++, field: "TotalGoals", operator: "Gte", team: "home", value: 1 }]);
  }

  return (
    <div className="mt-12 grid overflow-hidden border border-[#D0FEF5]/18 lg:grid-cols-2">
      <div className="bg-[#D0FEF5] p-5 text-[#094586] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-black uppercase tracking-[0.14em]">Interactive Devnet preview</p>
          <span className="font-mono text-xs font-bold">{conditions.length} / 5 conditions</span>
        </div>

        <label className="mt-7 block text-sm font-black">
          Sample match
          <select className="mt-2 w-full border border-[#094586]/25 bg-white/55 p-3 font-bold outline-none focus:border-[#094586]" value={matchId} onChange={(event) => setMatchId(event.target.value as (typeof matches)[number]["id"])}>
            {matches.map((item) => <option key={item.id} value={item.id}>{item.home} vs {item.away} · {item.competition} · {item.kickoff}</option>)}
          </select>
        </label>

        <div className="mt-6 grid grid-cols-2 border border-[#094586]/24 p-1" aria-label="Logical operator">
          {(["AND", "OR"] as const).map((operator) => <button key={operator} type="button" onClick={() => setLogicalOperator(operator)} aria-pressed={logicalOperator === operator} className={`px-3 py-3 text-sm font-black ${logicalOperator === operator ? "bg-[#094586] text-[#D0FEF5]" : "hover:bg-white/45"}`}>{operator === "AND" ? "ALL — AND" : "ANY — OR"}</button>)}
        </div>
        <p className="mt-2 text-xs font-bold text-[#094586]/65">{logicalOperator === "AND" ? "Every condition must pass." : "At least one condition must pass."}</p>

        <div className="mt-7 space-y-4">
          {conditions.map((condition, index) => {
            const comparisons = condition.field === "MatchWinner" || isBooleanField(condition.field) ? equalityComparisons : numericComparisons;
            return (
              <fieldset key={condition.id} className="border border-[#094586]/20 bg-white/42 p-4">
                <legend className="px-2 font-mono text-xs font-black">CONDITION {index + 1}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-black">Statistic<select className="mt-1 w-full border border-[#094586]/20 bg-[#D0FEF5] p-2.5 text-sm font-bold" value={condition.field} onChange={(event) => changeField(condition.id, event.target.value as SupportedField)}>{fieldOptions.map(([value, label, disabled]) => <option key={value} value={value} disabled={disabled}>{label}</option>)}</select></label>
                  {(condition.field === "MatchWinner" || isTeamField(condition.field)) && <label className="text-xs font-black">Team or side<select className="mt-1 w-full border border-[#094586]/20 bg-[#D0FEF5] p-2.5 text-sm font-bold" value={condition.team} onChange={(event) => updateCondition(condition.id, { team: event.target.value as TeamSide })}><option value="home">{match.home} · Home</option><option value="away">{match.away} · Away</option></select></label>}
                  <label className="text-xs font-black">Comparison<select className="mt-1 w-full border border-[#094586]/20 bg-[#D0FEF5] p-2.5 text-sm font-bold" value={condition.operator} onChange={(event) => updateCondition(condition.id, { operator: event.target.value as ComparisonOperator })}>{comparisons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  {isBooleanField(condition.field) ? <label className="text-xs font-black">Value<select className="mt-1 w-full border border-[#094586]/20 bg-[#D0FEF5] p-2.5 text-sm font-bold" value={condition.value ? "true" : "false"} onChange={(event) => updateCondition(condition.id, { value: event.target.value === "true" })}><option value="true">Yes</option><option value="false">No</option></select></label> : condition.field !== "MatchWinner" && <label className="text-xs font-black">Value<input className="mt-1 w-full border border-[#094586]/20 bg-[#D0FEF5] p-2.5 text-sm font-bold" type="number" min="0" max="200" value={Number(condition.value)} onChange={(event) => updateCondition(condition.id, { value: Number(event.target.value) })} /></label>}
                </div>
                <button type="button" disabled={conditions.length === 1} onClick={() => setConditions((current) => current.filter((item) => item.id !== condition.id))} className="mt-3 inline-flex items-center gap-2 text-xs font-black disabled:cursor-not-allowed disabled:opacity-35"><Trash2 size={14} /> Remove</button>
              </fieldset>
            );
          })}
        </div>
        <button type="button" onClick={addCondition} disabled={conditions.length >= 5} className="mt-5 inline-flex items-center gap-2 bg-[#094586] px-4 py-3 text-sm font-black text-[#D0FEF5] disabled:cursor-not-allowed disabled:opacity-45"><Plus size={17} /> Add condition</button>
      </div>

      <div className="bg-[#06141F] p-5 sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#6FB4EB]">Live preview</p>
        <h3 className="mt-5 text-2xl font-black leading-tight text-white">{statement || "Add a condition to preview the market."}</h3>

        <div className="mt-7 border-t border-[#D0FEF5]/14 pt-5">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#6FB4EB]"><Code2 size={15} /> Condition payload</p>
          <pre className="mt-3 max-h-64 overflow-auto border border-[#D0FEF5]/12 bg-black/20 p-4 font-mono text-xs leading-6 text-[#D0FEF5]">{payload}</pre>
        </div>
        <div className="mt-6">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#6FB4EB]"><Code2 size={15} /> @tutela/sdk</p>
          <pre className="mt-3 max-h-72 overflow-auto border border-[#D0FEF5]/12 bg-black/20 p-4 font-mono text-xs leading-6 text-[#D0FEF5]">{sdkCode}</pre>
        </div>

        <div className={`mt-6 border p-4 ${errors.length === 0 ? "border-[#6FB4EB]/35 bg-[#094586]/24" : "border-[#6FB4EB]/55 bg-[#4A051C]/55"}`}>
          <p className="flex items-center gap-2 text-sm font-black text-white">{errors.length === 0 ? <BadgeCheck size={18} className="text-[#6FB4EB]" /> : <AlertCircle size={18} className="text-[#6FB4EB]" />}{errors.length === 0 ? "Schema-valid market definition" : `${errors.length} validation issue${errors.length === 1 ? "" : "s"}`}</p>
          {errors.length > 0 && <ul className="mt-3 space-y-1 text-xs font-semibold leading-5 text-[#D0FEF5]/72">{errors.map((error) => <li key={error}>• {error}</li>)}</ul>}
          <div className="mt-4 flex items-start gap-2 border-t border-[#D0FEF5]/14 pt-4"><Hash size={16} className="mt-0.5 shrink-0 text-[#6FB4EB]" /><div><p className="text-xs font-black uppercase tracking-[0.1em] text-[#D0FEF5]/65">Canonical condition hash</p><code className="mt-1 block break-all font-mono text-xs leading-5 text-[#D0FEF5]">{hash ?? "Generated when the definition is valid"}</code></div></div>
        </div>
      </div>
    </div>
  );
}
