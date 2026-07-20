"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronLeft, Coins, LogOut, PlusCircle, Trophy, UserRound } from "lucide-react";
import { useTutelaAuth } from "@/providers/tutela-auth-provider";

const nav = [
  { label: "Markets", href: "/matches", Icon: BarChart3 },
  { label: "Create", href: "/markets", Icon: PlusCircle },
  { label: "Ranks", href: "/leaderboards", Icon: Trophy },
  { label: "You", href: "/profile", Icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { authenticated, demoPoints, displayName, enabled, login, logout, ready } = useTutelaAuth();
  const isDetailPage = pathname.startsWith("/matches/") || pathname.startsWith("/markets/");

  return (
    <div className="tutela-shell-page">
      <div className="tutela-phone-frame tutela-app-frame tutela-app-content relative mx-auto">
        <header className="tutela-shell-header px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              {isDetailPage ? (
                <Link
                  href="/matches"
                  aria-label="Back to matches"
                  title="Back to matches"
                  className="focus-ring inline-flex h-10 w-10 items-center justify-start text-[#D0FEF5] transition hover:text-[#6FB4EB]"
                >
                  <ChevronLeft size={34} strokeWidth={2.25} aria-hidden="true" />
                </Link>
              ) : (
                <Link href="/matches" className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#D0FEF5] p-1.5">
                    <img src="/tutela-logo.png" alt="Tutela" className="h-full w-full object-contain" />
                  </span>
                  <span className="block text-xl font-black tracking-normal text-[#D0FEF5]">Tutela</span>
                </Link>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              {authenticated ? (
                <button
                  onClick={logout}
                  className="focus-ring inline-flex max-w-[190px] items-center gap-1.5 rounded-full bg-[#094586] px-3 py-1.5 text-sm font-black text-[#6FB4EB]"
                  title={`Signed in as ${displayName}. Click to sign out.`}
                >
                  <Coins size={16} className="shrink-0" />
                  <span>{demoPoints.toLocaleString()}</span>
                  <LogOut size={14} className="shrink-0 opacity-80" />
                </button>
              ) : (
                <button
                  onClick={login}
                  disabled={!ready || !enabled}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-[#094586] px-3 py-1.5 text-sm font-black text-[#6FB4EB] disabled:cursor-not-allowed disabled:opacity-60"
                  title={enabled ? "Sign in with email or Google" : "Set NEXT_PUBLIC_PRIVY_APP_ID to enable sign in"}
                >
                  <Coins size={16} />
                  <span>{enabled ? "Sign in" : "Auth off"}</span>
                </button>
              )}
            </div>
          </div>
          {authenticated ? (
            <p className="mt-3 text-xs font-semibold text-[#D0FEF5]">
              {displayName} · demo coins only · no monetary value
            </p>
          ) : null}
        </header>
        <main className="tutela-shell-main px-4 pb-4 no-scrollbar sm:px-5 sm:pb-5">{children}</main>
        <nav className="tutela-bottom-nav z-40 grid-cols-4 border-t border-[#094586] px-2 py-2 backdrop-blur">
          {nav.map(({ label, href, Icon }) => {
            const active = pathname === href || (href !== "/matches" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`grid min-w-0 place-items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-bold sm:px-2 sm:text-xs ${active ? "text-[#6FB4EB]" : "text-[#D0FEF5]"}`}>
                <Icon size={21} strokeWidth={active ? 2.5 : 2} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
