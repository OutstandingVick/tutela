import type { ReactNode } from "react";
import { MapPin, Swords, Trophy, UsersRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ConditionBuilder } from "@/features/conditions/condition-builder";
import { contests, formatCoins } from "@/lib/demo";

export default function MarketsPage() {
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
        <ConditionBuilder />
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
