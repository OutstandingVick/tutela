"use client";

import { Camera, ChevronRight, Coins, FileText, LogOut, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { useTutelaAuth } from "@/providers/tutela-auth-provider";

export default function ProfilePage() {
  const { activity, authenticated, demoPoints, displayName, email, enabled, login, logout, profileError, profileLoading, ready, userId, walletAddress } = useTutelaAuth();
  const initials = displayName.slice(0, 1).toUpperCase();
  const committedPoints = activity.reduce((total, item) => total + item.points, 0);
  const settled = activity.filter((item) => item.status === "Won" || item.status === "Lost");
  const wins = settled.filter((item) => item.status === "Won").length;

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">Profile</h1>
        <div className="rounded-full bg-[#094586] px-3 py-2 text-sm font-black text-[#6FB4EB]">{demoPoints.toLocaleString()} coins</div>
      </div>

      <section className="flex items-center gap-4">
        <div className="relative grid h-20 w-20 place-items-center rounded-full bg-[#094586] text-3xl font-black text-[#6FB4EB]">
          {authenticated ? initials : "T"}
          <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-[#6FB4EB] text-[#4A051C]"><Camera size={15} /></span>
        </div>
        <div>
          <h2 className="text-2xl font-black">{authenticated ? displayName : "Testnet Player"}</h2>
          <p className="text-sm font-semibold text-[#D0FEF5]">
            {authenticated ? email ?? "Signed in with Privy" : "Sign in to claim 1,000 demo coins"}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#D0FEF5]">
            <Wallet size={15} /> {walletAddress ? truncate(walletAddress) : userId ? truncate(userId) : "No wallet linked yet"}
          </p>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-4 text-[#4A051C]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-black">{authenticated ? "Signed in for testnet play" : "Create your Tutela account"}</p>
            <p className="mt-1 text-sm font-semibold">
              {authenticated
                ? "Your free demo points are stored against this Privy account. They cannot be bought, transferred, cashed out or redeemed."
                : "Use email or Google through Privy. New users receive 1,000 free demo coins for devnet forecasting only."}
            </p>
          </div>
          {authenticated ? (
            <button onClick={logout} className="focus-ring rounded-lg bg-[#094586] px-4 py-3 text-sm font-black text-[#D0FEF5]">
              <LogOut size={16} />
            </button>
          ) : (
            <button
              onClick={login}
              disabled={!ready || !enabled}
              className="focus-ring rounded-lg bg-[#094586] px-4 py-3 text-sm font-black text-[#D0FEF5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enabled ? "Sign up" : "Auth off"}
            </button>
          )}
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-[#6FB4EB] p-1">
        <div className="rounded-lg bg-[#094586] py-3 text-center text-sm font-black text-[#6FB4EB]">You</div>
        <div className="rounded-lg py-3 text-center text-sm font-black text-[#D0FEF5]">Receipts</div>
      </div>

      <section className="mt-5 grid grid-cols-3 gap-2">
        <Tile value={String(activity.length)} label="forecasts" />
        <Tile value={String(committedPoints)} label="points played" accent />
        <Tile value={settled.length > 0 ? `${Math.round((wins / settled.length) * 100)}%` : "-"} label="hit rate" good />
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Coins</h2>
        <div className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-5 text-center">
          <Coins className="mx-auto text-[#6FB4EB]" size={30} />
          <p className="mt-2 text-5xl font-black">{demoPoints.toLocaleString()}</p>
          <p className="mt-2 text-sm font-semibold text-[#D0FEF5]">testnet coins · never cashable · no monetary value</p>
          <button disabled className="mt-5 cursor-not-allowed rounded-lg bg-[#6FB4EB]/70 px-5 py-3 text-sm font-black text-[#4A051C]">No purchases or cash-out</button>
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-[#D0FEF5]">Activity & bets</h2>
        {profileError && <p className="mb-3 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-3 text-sm font-bold text-[#4A051C]">{profileError}</p>}
        <div className="grid gap-3">
          {profileLoading ? (
            <p className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-4 text-sm font-bold text-[#4A051C]">Loading your activity...</p>
          ) : activity.length === 0 ? (
            <p className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-4 text-sm font-bold text-[#4A051C]">No forecasts yet. Create one to see it here.</p>
          ) : activity.map((item) => (
            <div key={item.id} className="grid grid-cols-[34px_1fr_auto] items-center gap-3 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
              <ShieldCheck size={22} className="text-[#6FB4EB]" />
              <div>
                <p className="font-black">{item.title}</p>
                <p className="text-sm font-semibold text-[#094586]">{item.side} · {item.points} points · {item.status}</p>
                <p className="text-xs font-semibold text-[#4A051C]/70">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <ChevronRight size={18} className="text-[#094586]" />
            </div>
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
          <p className="text-2xl font-black text-[#6FB4EB]">{settled.length}</p>
        </div>
      </section>
    </AppShell>
  );
}

function truncate(value: string) {
  return value.length > 14 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value;
}

function Tile({ value, label, accent = false, good = false }: { value: string; label: string; accent?: boolean; good?: boolean }) {
  return (
    <div className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] px-3 py-4 text-center">
      <p className={`text-2xl font-black ${accent ? "text-[#094586]" : good ? "text-[#6FB4EB]" : "text-[#D0FEF5]"}`}>{value}</p>
      <p className="mt-1 text-sm font-semibold text-[#D0FEF5]">{label}</p>
    </div>
  );
}
