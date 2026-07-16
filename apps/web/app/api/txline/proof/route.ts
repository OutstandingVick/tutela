import { NextResponse, type NextRequest } from "next/server";
import { TXLINE_FIXTURE_MAP, createSportsDataAdapter, loadTxLineConfigFromEnv } from "@tutela/txline-adapter";
import { isAuthError, requireAuthenticatedUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const user = await requireAuthenticatedUser(request);
  if (isAuthError(user)) return user;
  const matchId = request.nextUrl.searchParams.get("matchId");
  if (!matchId || !TXLINE_FIXTURE_MAP[matchId]) {
    return NextResponse.json({ error: "Unknown TxLINE fixture." }, { status: 400 });
  }
  try {
    const adapter = createSportsDataAdapter({ source: "txline", txline: loadTxLineConfigFromEnv() });
    const proof = await adapter.getFinalProof(matchId);
    if (proof.simulated || proof.verifierLabel !== "txline" || !proof.raw) {
      return NextResponse.json({ error: "An authenticated TxLINE proof is not available." }, { status: 409 });
    }
    return NextResponse.json({ ...proof, fixtureId: TXLINE_FIXTURE_MAP[matchId] }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    console.error("TxLINE proof fetch failed", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 503 });
  }
}
