"use client";

import { PrivyProvider, usePrivy, type User } from "@privy-io/react-auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID;

type TutelaAuthState = {
  ready: boolean;
  enabled: boolean;
  authenticated: boolean;
  userId: string | null;
  displayName: string;
  email: string | null;
  walletAddress: string | null;
  demoPoints: number;
  activity: ForecastActivity[];
  profileLoading: boolean;
  profileError: string | null;
  authenticatedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  refreshProfile: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
};

export type ForecastActivity = {
  id: string;
  forecastId: string;
  title: string;
  side: "YES" | "NO";
  points: number;
  status: "Pending" | "Won" | "Lost" | "Invalid" | "Refunded";
  createdAt: string;
};

const TutelaAuthContext = createContext<TutelaAuthState | null>(null);

const disabledAuthState: TutelaAuthState = {
  ready: true,
  enabled: false,
  authenticated: false,
  userId: null,
  displayName: "Guest",
  email: null,
  walletAddress: null,
  demoPoints: 0,
  activity: [],
  profileLoading: false,
  profileError: null,
  authenticatedFetch: async () => new Response(JSON.stringify({ error: "Authentication is not configured." }), { status: 503 }),
  refreshProfile: async () => undefined,
  login: () => undefined,
  logout: async () => undefined
};

export function TutelaAuthProvider({ children }: { children: React.ReactNode }) {
  if (!appId) {
    return <TutelaAuthContext.Provider value={disabledAuthState}>{children}</TutelaAuthContext.Provider>;
  }

  return (
    <PrivyProvider
      appId={appId}
      clientId={clientId || undefined}
      config={{
        appearance: {
          accentColor: "#6FB4EB",
          landingHeader: "Play Tutela",
          loginMessage: "Sign in for 1,000 free demo coins. No deposits, no cash-out, no monetary value.",
          logo: "/tutela-logo.png",
          showWalletLoginFirst: false,
          theme: "#094586",
          walletChainType: "solana-only"
        },
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets"
          }
        },
        loginMethods: ["email", "google"]
      }}
    >
      <TutelaAuthBridge>{children}</TutelaAuthBridge>
    </PrivyProvider>
  );
}

function TutelaAuthBridge({ children }: { children: React.ReactNode }) {
  const { authenticated, getAccessToken, login, logout, ready, user } = usePrivy();
  const [demoPoints, setDemoPoints] = useState(0);
  const [activity, setActivity] = useState<ForecastActivity[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const userId = user?.id ?? null;

  const authenticatedFetch = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = await getAccessToken();
    if (!token) return new Response(JSON.stringify({ error: "Sign in to continue." }), { status: 401 });
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }, [getAccessToken]);

  const refreshProfile = useCallback(async () => {
    if (!ready || !authenticated || !userId) {
      setDemoPoints(0);
      setActivity([]);
      setProfileError(null);
      return;
    }

    setProfileLoading(true);
    try {
      const response = await authenticatedFetch("/api/me", { cache: "no-store" });
      const payload = await response.json() as { balance?: number; activity?: ForecastActivity[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to load your Tutela profile.");
      setDemoPoints(payload.balance ?? 0);
      setActivity(payload.activity ?? []);
      setProfileError(null);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Unable to load your Tutela profile.");
    } finally {
      setProfileLoading(false);
    }
  }, [authenticated, authenticatedFetch, ready, userId]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const value = useMemo<TutelaAuthState>(() => {
    const profile = getUserProfile(user);

    return {
      authenticated,
      activity,
      authenticatedFetch,
      demoPoints,
      displayName: profile.displayName,
      email: profile.email,
      enabled: true,
      login: () => login({ loginMethods: ["email", "google"] }),
      logout,
      profileError,
      profileLoading,
      ready,
      refreshProfile,
      userId,
      walletAddress: profile.walletAddress
    };
  }, [activity, authenticated, authenticatedFetch, demoPoints, login, logout, profileError, profileLoading, ready, refreshProfile, user, userId]);

  return <TutelaAuthContext.Provider value={value}>{children}</TutelaAuthContext.Provider>;
}

export function useTutelaAuth() {
  const ctx = useContext(TutelaAuthContext);
  if (!ctx) throw new Error("useTutelaAuth must be used inside TutelaAuthProvider");
  return ctx;
}

function getUserProfile(user: User | null) {
  if (!user) {
    return { displayName: "Guest", email: null, walletAddress: null };
  }

  const linkedAccounts = user.linkedAccounts as unknown as Array<Record<string, unknown>>;
  const emailAccount = linkedAccounts.find((account) => account.type === "email");
  const googleAccount = linkedAccounts.find((account) => account.type === "google_oauth" || account.provider === "google");
  const walletAccount = linkedAccounts.find((account) => account.type === "wallet" || account.type === "solana_wallet");

  const email = getString(emailAccount?.address) ?? getString(googleAccount?.email);
  const googleName = getString(googleAccount?.name);
  const walletAddress = getString(walletAccount?.address);

  return {
    displayName: googleName ?? email?.split("@")[0] ?? "Testnet Player",
    email,
    walletAddress
  };
}

function getString(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}
