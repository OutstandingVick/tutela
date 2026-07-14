"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Coins, PlusCircle, Trophy, UserRound } from "lucide-react";

const nav = [
  { label: "Markets", href: "/matches", Icon: BarChart3 },
  { label: "Create", href: "/markets", Icon: PlusCircle },
  { label: "Ranks", href: "/leaderboards", Icon: Trophy },
  { label: "You", href: "/profile", Icon: UserRound }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="tutela-shell-page px-3 py-4 md:px-6">
      <div className="tutela-phone-frame relative mx-auto w-full max-w-[473px] overflow-hidden rounded-lg border border-[#6FB4EB] shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <header className="tutela-shell-header px-5 pb-3 pt-5">
          <div className="flex items-start justify-between gap-4">
            <Link href="/matches" className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#D0FEF5] p-1.5">
                <img src="/tutela-logo.png" alt="Tutela" className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-xl font-black tracking-normal text-[#D0FEF5]">Tutela</span>
              </span>
            </Link>
            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#094586] px-3 py-1.5 text-sm font-black text-[#6FB4EB]">
                <Coins size={16} />
                <span>1,000</span>
              </div>
            </div>
          </div>
        </header>
        <main className="tutela-shell-main px-5 pb-5 no-scrollbar">{children}</main>
        <nav className="tutela-bottom-nav z-40 grid-cols-4 border-t border-[#094586] px-2 py-2 backdrop-blur">
          {nav.map(({ label, href, Icon }) => {
            const active = pathname === href || (href !== "/matches" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`grid place-items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold ${active ? "text-[#6FB4EB]" : "text-[#D0FEF5]"}`}>
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
