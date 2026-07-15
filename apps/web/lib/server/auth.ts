import "server-only";

import { PrivyClient } from "@privy-io/node";
import { NextResponse, type NextRequest } from "next/server";

let client: PrivyClient | null = null;

export type AuthenticatedUser = {
  id: string;
};

export async function requireAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  }

  try {
    client ??= new PrivyClient({ appId, appSecret });
    const verified = await client.utils().auth().verifyAuthToken(token);
    return { id: verified.user_id };
  } catch {
    return NextResponse.json({ error: "Your session is invalid or expired. Sign in again." }, { status: 401 });
  }
}

export function isAuthError(value: AuthenticatedUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
