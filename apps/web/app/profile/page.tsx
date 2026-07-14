import Link from "next/link";
import { Camera, ChevronRight, Coins, FileText, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { coinBalance, demoActivity, formatCoins } from "@/lib/demo";

export default function ProfilePage() {
  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">Profile</h1>
        <div className="rounded-full bg-[#094586] px-3 py-2 text-sm font-black text-[#6FB4EB]">{formatCoins(coinBalance)}</div>
      </div>

      <section className="flex items-center gap-4">
        <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#094586] text-3xl font-black text-[#6FB4EB]">
          T
          <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-[#6FB4EB] text-[#4A051C]"><Camera size={15} /></span>
        </div>
        <div>
          <h2 className="text-2xl font-black">Testnet Keeper</h2>
          <p className="text-sm font-semibold text-[#D0FEF5]">@tutela-user · joined Jul 2026</p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#D0FEF5]"><Wallet size={15} /> 52uL...hCZV</p>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-[#6FB4EB] p-1">
        <div className="rounded-lg bg-[#094586] py-3 text-center text-sm font-black text-[#6FB4EB]">You</div>
        <div className="rounded-lg py-3 text-center text-sm font-black text-[#D0FEF5]">Receipts</div>
      </div>

      <section className="mt-5 grid grid-cols-3 gap-2">
        <Tile value="2" label="markets" />
        <Tile value="x3" label="best streak" accent />
        <Tile value="67%" label="hit rate" good />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Coins</h2>
        <div className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-5 text-center">
          <Coins className="mx-auto text-[#6FB4EB]" size={30} />
          <p className="mt-2 text-5xl font-black">{coinBalance.toLocaleString()}</p>
          <p className="mt-2 text-sm font-semibold text-[#D0FEF5]">testnet coins · never cashable · no monetary value</p>
          <button className="mt-5 rounded-lg bg-[#6FB4EB] px-5 py-3 text-sm font-black text-[#4A051C]">Top up test coins</button>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Activity & bets</h2>
        <div className="grid gap-3">
          {demoActivity.map((item) => (
            <Link key={item.id} href={item.explorerUrl} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
              <ShieldCheck size={22} className="text-[#6FB4EB]" />
              <div>
                <p className="font-black">{item.title}</p>
                <p className="text-sm font-semibold text-[#D0FEF5]">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <ChevronRight size={18} className="text-[#D0FEF5]" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Wrapped summary</h2>
        <div className="rounded-lg border border-dashed border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black">Generate your Tutela wrap</p>
              <p className="mt-1 text-sm text-[#D0FEF5]">Markets traded, stats called, proof receipts and streaks.</p>
            </div>
            <button className="rounded-lg bg-[#6FB4EB] px-4 py-3 text-sm font-black text-[#4A051C]"><Sparkles size={16} /></button>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Verified</h2>
        <div className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
          <FileText size={22} className="text-[#6FB4EB]" />
          <div>
            <p className="font-black">On-chain receipts</p>
            <p className="text-sm font-semibold text-[#D0FEF5]">verified settlement references</p>
          </div>
          <p className="text-2xl font-black text-[#6FB4EB]">2</p>
        </div>
      </section>
    </AppShell>
  );
}

function Tile({ value, label, accent = false, good = false }: { value: string; label: string; accent?: boolean; good?: boolean }) {
  return (
    <div className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] px-3 py-4 text-center">
      <p className={`text-2xl font-black ${accent ? "text-[#094586]" : good ? "text-[#6FB4EB]" : "text-[#D0FEF5]"}`}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#D0FEF5]">{label}</p>
    </div>
  );
}
