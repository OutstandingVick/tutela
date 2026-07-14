"use client";

import { useMemo, useState } from "react";
import { conditionHash } from "@tutela/condition-engine";
import { validateConditionGroup } from "@tutela/validation";
import type { BooleanOperator, ConditionGroup, MarketCondition } from "@tutela/types";
import { Plus, Trash2 } from "lucide-react";

const defaultCondition: MarketCondition = {
  field: "TotalGoals",
  operator: "Gte",
  scope: "FullTime",
  value: { kind: "u16", value: 2 }
};

export function ConditionBuilder() {
  const [operator, setOperator] = useState<BooleanOperator>("AND");
  const [conditions, setConditions] = useState<MarketCondition[]>([defaultCondition]);
  const group: ConditionGroup = { operator, conditions };
  const errors = useMemo(() => validateConditionGroup(group), [group]);
  const hash = useMemo(() => conditionHash(group), [group]);

  return (
    <div className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Condition builder</h2>
          <p className="mt-1 text-sm text-[#4A051C]">Flat condition group, max five conditions. No JavaScript evaluation.</p>
        </div>
        <div className="rounded-lg border border-[#6FB4EB] p-1">
          {(["AND", "OR"] as const).map((value) => (
            <button key={value} onClick={() => setOperator(value)} className={`rounded-lg px-3 py-1.5 text-sm font-black ${operator === value ? "bg-[#094586] text-[#6FB4EB]" : "text-[#4A051C]"}`}>
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {conditions.map((condition, index) => (
          <div key={index} className="grid gap-2 rounded-lg border border-[#6FB4EB] bg-[#094586] p-3">
            <Select value={condition.field} onChange={(field) => update(index, { ...condition, field: field as MarketCondition["field"] })} options={["TotalGoals", "TeamGoals", "MatchWinner", "BothTeamsScore", "TotalCorners", "TotalCards", "CleanSheet"]} />
            <Select value={condition.operator} onChange={(op) => update(index, { ...condition, operator: op as MarketCondition["operator"] })} options={["Eq", "Neq", "Gt", "Gte", "Lt", "Lte", "IsTrue", "IsFalse"]} />
            <Select value={condition.scope} onChange={(scope) => update(index, { ...condition, scope: scope as MarketCondition["scope"] })} options={["FullTime", "Match", "Team", "Player"]} />
            <input
              className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] px-3 py-2 text-sm font-semibold text-[#4A051C]"
              value={String(condition.value.value)}
              onChange={(event) => updateValue(index, event.target.value)}
              aria-label="Condition value"
            />
            <button onClick={() => setConditions((items) => items.filter((_, i) => i !== index))} className="grid h-10 place-items-center rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#094586]" aria-label="Remove condition">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => conditions.length < 5 && setConditions((items) => [...items, defaultCondition])}
        disabled={conditions.length >= 5}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#6FB4EB] bg-[#094586] px-3 py-2 text-sm font-black text-[#D0FEF5] disabled:opacity-50"
      >
        <Plus size={16} /> Add condition
      </button>
      <div className="mt-4 break-all rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-3 font-mono text-[11px] text-[#094586]">
        sha256(canonical bytes): {hash}
      </div>
      {errors.length > 0 && (
        <ul className="mt-3 grid gap-1 text-sm font-semibold text-[#6FB4EB]">
          {errors.map((error) => <li key={error}>{error}</li>)}
        </ul>
      )}
    </div>
  );

  function update(index: number, next: MarketCondition) {
    setConditions((items) => items.map((item, i) => (i === index ? next : item)));
  }

  function updateValue(index: number, value: string) {
    setConditions((items) => items.map((item, i) => {
      if (i !== index) return item;
      if (["IsTrue", "IsFalse"].includes(item.operator)) return { ...item, value: { kind: "bool", value: value.toLowerCase() !== "false" } };
      const numeric = Number(value);
      return Number.isFinite(numeric) ? { ...item, value: { kind: "u16", value: numeric } } : { ...item, value: { kind: "team", value } };
    }));
  }
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] px-3 py-2 text-sm font-semibold text-[#4A051C]">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}
