"use client";

import { PrivyProvider, usePrivy, type User } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STARTING_DEMO_POINTS = 1_000;
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
  login: () => void;
  logout: () => Promise<void>;
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
  const { authenticated, login, logout, ready, user } = usePrivy();
  const [demoPoints, setDemoPoints] = useState(0);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!ready || !authenticated || !userId) {
      setDemoPoints(0);
      return;
    }

    const storageKey = getDemoPointStorageKey(userId);
    const stored = window.localStorage.getItem(storageKey);
    if (stored === null) {
      window.localStorage.setItem(storageKey, String(STARTING_DEMO_POINTS));
      setDemoPoints(STARTING_DEMO_POINTS);
      return;
    }

    const parsed = Number.parseInt(stored, 10);
    setDemoPoints(Number.isFinite(parsed) ? parsed : STARTING_DEMO_POINTS);
  }, [authenticated, ready, userId]);

  const value = useMemo<TutelaAuthState>(() => {
    const profile = getUserProfile(user);

    return {
      authenticated,
      demoPoints,
      displayName: profile.displayName,
      email: profile.email,
      enabled: true,
      login: () => login({ loginMethods: ["email", "google"] }),
      logout,
      ready,
      userId,
      walletAddress: profile.walletAddress
    };
  }, [authenticated, demoPoints, login, logout, ready, user, userId]);

  return <TutelaAuthContext.Provider value={value}>{children}</TutelaAuthContext.Provider>;
}

export function useTutelaAuth() {
  const ctx = useContext(TutelaAuthContext);
  if (!ctx) throw new Error("useTutelaAuth must be used inside TutelaAuthProvider");
  return ctx;
}

function getDemoPointStorageKey(userId: string) {
  return `tutela.demo-points.${userId}`;
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
