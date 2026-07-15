import { NextResponse, type NextRequest } from "next/server";
import { isAuthError, requireAuthenticatedUser } from "@/lib/server/auth";
import { getUserSnapshot } from "@/lib/server/forecast-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await requireAuthenticatedUser(request);
  if (isAuthError(user)) return user;

  try {
    return NextResponse.json(await getUserSnapshot(user.id), {
      headers: { "Cache-Control": "private, no-store" }
    });
  } catch (error) {
    console.error("Failed to load Tutela profile", error);
    return NextResponse.json({ error: "Participation storage is unavailable." }, { status: 503 });
  }
}
