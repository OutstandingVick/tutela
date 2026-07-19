import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { QuickForecast } from "@/features/markets/quick-forecast";
import { forecastStatMarkets, upcomingMatchMarkets } from "@/lib/demo";
import { getLiveMatchOrFallback } from "@/lib/live";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MatchMarketPage({ params }: { params: Promise<{ id: string; marketId: string }> }) {
  const { id, marketId } = await params;
  const configuredMatch = upcomingMatchMarkets.find((item) => item.id === id);
  const market = forecastStatMarkets.find((item) => item.id === marketId);
  if (!configuredMatch || !market) notFound();

  const { match } = await getLiveMatchOrFallback(id);

  return (
    <AppShell>
      <Link href={`/matches/${id}`} className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-black text-[#D0FEF5]">
        <ChevronLeft size={18} /> All match markets
      </Link>
      <QuickForecast
        market={{ field: market.field, label: market.label }}
        match={{ id: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam, expectedEndAt: match.expectedEndAt }}
        initiallyClosed={match.status === "completed"}
      />
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#6FB4EB] bg-[#094586] p-3 text-xs font-semibold leading-5 text-[#D0FEF5]">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[#6FB4EB]" />
        <span>The selected condition is fixed in your prediction receipt. Final statistics are authenticated through TxLINE before Tutela evaluates the outcome.</span>
      </div>
    </AppShell>
  );
}
