export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" }) {
  const tones = {
    neutral: "border-[#6FB4EB] bg-[#094586] text-[#D0FEF5]",
    good: "border-[#6FB4EB]/30 bg-[#094586] text-[#6FB4EB]",
    warn: "border-[#094586]/40 bg-[#094586] text-[#6FB4EB]"
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
