import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatusPill } from "@/components/ui/status-pill";

export default async function VerifyPage() {
  return (
    <AppShell>
      <section className="rounded-lg border border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-5">
        <StatusPill tone="warn">TxLINE target · simulated fallback shown</StatusPill>
        <h1 className="mt-4 text-3xl font-black">Verification</h1>
        <p className="mt-2 text-sm leading-6 text-[#D0FEF5]">
          Proof submission never moves funds. Devnet TxLINE configuration is documented, and this page shows the labelled fallback until live credentials and endpoint paths are configured.
        </p>
        <dl className="mt-5 grid gap-3">
          <Row label="Primary fixture" value="France v Spain · FIFA World Cup 2026 Semifinal · July 14, 2026" />
          <Row label="Secondary fixture" value="England v Argentina · FIFA World Cup 2026 Semifinal · July 15, 2026" />
          <Row label="Proof status" value="Awaiting final TxLINE proof package" />
          <Row label="Verifier target" value="TxLINE validate_stat integration boundary" />
        </dl>
      </section>
      <section className="mt-5 rounded-lg border border-dashed border-[#6FB4EB] bg-[#D0FEF5] text-[#4A051C] p-4">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 text-[#6FB4EB]" size={20} />
          <div>
            <p className="font-black">Reference keeper</p>
            <p className="mt-1 text-sm leading-6 text-[#D0FEF5]">The keeper can poll final proof packages and simulate validation transactions. It has no authority over user collateral.</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#6FB4EB] bg-[#094586] p-3">
      <dt className="text-xs font-black uppercase tracking-[0.14em] text-[#D0FEF5]">{label}</dt>
      <dd className="mt-1 break-all font-mono text-xs text-[#D0FEF5]">{value}</dd>
    </div>
  );
}
