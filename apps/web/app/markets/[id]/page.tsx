import { notFound } from "next/navigation";
import Link from "next/link";
import { CircleDollarSign, ShieldCheck, TimerReset } from "lucide-react";
import { conditionHash } from "@tutela/condition-engine";
import { AppShell } from "@/components/layout/app-shell";
import { demoMarkets, formatUsdc, liveStatMarkets } from "@/lib/demo";
import { getForecastMarket } from "@/lib/server/forecast-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submittedMarket = await getForecastMarket(id).catch(() => null);
  const stat = liveStatMarkets.find((item) => item.id === id);
  const market = demoMarkets.find((item) => item.id === id);
  if (!stat && !market && !submittedMarket) notFound();

  if (submittedMarket) {
    const total = submittedMarket.yesPoints + submittedMarket.noPoints;
    return (
      <AppShell>
        <section className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-5 text-[#4A051C]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#094586]">{submittedMarket.status} · demo points only</p>
          <h1 className="mt-3 text-2xl font-black">{submittedMarket.title}</h1>
          <p className="mt-2 text-sm font-semibold">{submittedMarket.participantCount} participant{submittedMarket.participantCount === 1 ? "" : "s"} · {total} points committed</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Pool label="YES pool" value={`${submittedMarket.yesPoints} points`} />
            <Pool label="NO pool" value={`${submittedMarket.noPoints} points`} />
          </div>
          <div className="mt-5 rounded-lg border border-[#6FB4EB] bg-[#094586] p-4 text-[#D0FEF5]">
            <h2 className="font-black">Conditions</h2>
            <p className="mt-2 text-sm">{submittedMarket.operator} across {submittedMarket.conditions.length} condition(s)</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {submittedMarket.conditions.map((condition, index) => (
                <li key={index} className="rounded-lg bg-[#D0FEF5] px-3 py-2 font-semibold text-[#4A051C]">
                  {condition.field} {condition.operator} {String(condition.value.value)}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-5 text-sm font-semibold">Free, non-transferable demo points. No deposits, purchases, prizes, cash-out or monetary value.</p>
        </section>
      </AppShell>
    );
  }

  if (stat) {
    return (
      <AppShell>
        <section className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">Live market · {stat.minute}</p>
              <h1 className="mt-3 text-3xl font-black">{stat.label}</h1>
              <p className="mt-1 text-sm font-semibold text-[#4A051C]">{stat.line} · World Cup test match</p>
            </div>
            <div className="rounded-full bg-[#094586] px-3 py-2 text-sm font-black text-[#6FB4EB]">{stat.status}</div>
          </div>
          <div className="mt-5 rounded-lg border border-[#6FB4EB] bg-[#094586] p-4">
            <p className="text-sm font-black text-[#D0FEF5]">No seeded pool data</p>
            <p className="mt-2 text-xs font-semibold text-[#D0FEF5]">Create an authenticated forecast to start a real demo-point pool. Points are testnet-only and never cashable.</p>
          </div>
          <Link href="/markets" className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#6FB4EB] px-4 py-3 font-black text-[#4A051C]">
            <CircleDollarSign size={18} /> Build forecast
          </Link>
        </section>
        <section className="mt-5 rounded-lg border border-dashed border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
          <div className="flex gap-3">
            <TimerReset className="mt-0.5 text-[#6FB4EB]" size={20} />
            <div>
              <p className="font-black">Settlement path</p>
              <p className="mt-1 text-sm leading-6 text-[#4A051C]">Final statistics are submitted after the match and authenticated through TxLINE&apos;s official devnet program before Tutela evaluates the stored conditions on-chain.</p>
            </div>
          </div>
        </section>
      </AppShell>
    );
  }

  if (!market) notFound();
  const resolvedMarket = market;
  const clientHash = conditionHash(resolvedMarket.conditionGroup);
  const hashMatches = resolvedMarket.conditionHash === clientHash;
  return (
    <AppShell>
      <section className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#6FB4EB]">{resolvedMarket.state}</p>
        <h1 className="mt-3 text-3xl font-black">{resolvedMarket.title}</h1>
        <p className="mt-2 text-sm font-semibold text-[#4A051C]">Creator {resolvedMarket.creator} · {resolvedMarket.participantCount} participants</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Pool label="YES pool" value={formatUsdc(resolvedMarket.yesPool)} />
          <Pool label="NO pool" value={formatUsdc(resolvedMarket.noPool)} />
        </div>
        <div className="mt-5 rounded-lg border border-[#6FB4EB] bg-[#094586] p-4">
          <h2 className="font-black">Conditions</h2>
          <p className="mt-2 text-sm text-[#D0FEF5]">{resolvedMarket.conditionGroup.operator} across {resolvedMarket.conditionGroup.conditions.length} condition(s)</p>
          <ul className="mt-3 grid gap-2 text-sm">
            {resolvedMarket.conditionGroup.conditions.map((condition, index) => (
              <li key={index} className="rounded-lg bg-[#D0FEF5] text-[#4A051C] px-3 py-2 font-semibold">
                {condition.field} {condition.operator} {String(condition.value.value)}
              </li>
            ))}
          </ul>
        </div>
        {!hashMatches && (
          <div className="mt-4 rounded-lg border border-[#6FB4EB] bg-[#094586] p-4 text-sm font-bold text-[#6FB4EB]">
            Client-computed condition hash does not match the market hash. Joining is blocked.
          </div>
        )}
        <button disabled={!hashMatches || resolvedMarket.state !== "Open"} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#6FB4EB] px-4 py-3 font-black text-[#4A051C] disabled:opacity-45">
          <CircleDollarSign size={18} /> Join with test coins
        </button>
        <button disabled={resolvedMarket.state !== "Settled"} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#6FB4EB] px-4 py-3 font-black disabled:opacity-45">
          <ShieldCheck size={18} /> Claim payout
        </button>
      </section>
    </AppShell>
  );
}

function Pool({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#6FB4EB] bg-[#094586] p-4">
      <p className="text-xs font-black uppercase text-[#D0FEF5]">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
