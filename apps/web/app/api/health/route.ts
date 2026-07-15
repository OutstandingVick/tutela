import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const checks = {
    database: hasPostgresUrl(process.env.DATABASE_URL),
    privy: Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID && process.env.PRIVY_APP_SECRET),
    txline: Boolean(process.env.TXLINE_API_BASE_URL && process.env.TXLINE_API_TOKEN)
  };
  const ready = checks.database && checks.privy && checks.txline;
  return NextResponse.json({ ready, checks, network: "solana-devnet", realMoney: false }, { status: ready ? 200 : 503 });
}

function hasPostgresUrl(value: string | undefined) {
  return Boolean(value?.startsWith("postgres://") || value?.startsWith("postgresql://"));
}
