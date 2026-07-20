import { Crown, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { leaderboardRows } from "@/lib/demo";

export default function LeaderboardsPage() {
  const top = leaderboardRows.slice(0, 3);
  const rest = leaderboardRows.slice(3);
  return (
    <AppShell>
      <div className="mb-6 flex flex-col items-start justify-between gap-3 min-[390px]:flex-row min-[390px]:items-center">
        <div>
          <h1 className="text-3xl font-black">Leaderboards</h1>
          <p className="mt-1 text-sm font-semibold text-[#D0FEF5]">Global, friends, location and World Cup semifinal tables.</p>
        </div>
        <div className="rounded-full bg-[#094586] px-3 py-2 text-sm font-black text-[#6FB4EB]">
          <TrendingUp className="mr-1 inline" size={15} /> Grassroots #12
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] p-2 text-[#4A051C] min-[390px]:grid-cols-4">
        {["Global", "Friends", "Location", "World Cup"].map((tab, index) => (
          <div key={tab} className={`rounded-lg py-3 text-center text-sm font-black ${index === 0 ? "bg-[#094586] text-[#6FB4EB]" : "text-[#D0FEF5]"}`}>
            {tab}
          </div>
        ))}
      </div>

      <section className="mt-5 grid grid-cols-3 items-end gap-2 text-center">
        <Podium rank={2} name={top[1].name} score={top[1].score} />
        <Podium rank={1} name={top[0].name} score={top[0].score} winner />
        <Podium rank={3} name={top[2].name} score={top[2].score} />
      </section>

      <section className="mt-6 grid gap-2">
        {rest.map((row) => (
          <div key={row.rank} className="grid grid-cols-[26px_38px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-1 py-2 sm:grid-cols-[34px_46px_1fr_auto] sm:gap-3">
            <div className="text-lg font-black text-[#D0FEF5]">{row.rank}</div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#094586] text-sm font-black text-[#6FB4EB] sm:h-10 sm:w-10">{row.name[0]}</div>
            <div className="min-w-0">
              <p className="font-black">{row.name}</p>
              <p className="text-sm font-semibold text-[#D0FEF5]">{row.detail}</p>
            </div>
            <div className="font-black">{row.score.toLocaleString()}</div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}

function Podium({ rank, name, score, winner = false }: { rank: number; name: string; score: number; winner?: boolean }) {
  return (
    <div className={`${winner ? "pb-2" : ""}`}>
      <div className={`mx-auto grid place-items-center rounded-full bg-[#094586] font-black text-[#6FB4EB] ${winner ? "h-20 w-20 border-2 border-[#6FB4EB]" : "h-14 w-14"}`}>
        {winner ? <Crown size={24} className="text-[#6FB4EB]" /> : name[0]}
      </div>
      <p className="mt-2 text-sm font-black text-[#6FB4EB]">{rank === 1 ? "1" : rank}</p>
      <p className="text-sm font-semibold text-[#D0FEF5]">{name}</p>
      <p className="mt-1 font-black">{score.toLocaleString()}</p>
    </div>
  );
}
