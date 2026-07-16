"use client";

import { PublicKey } from "@solana/web3.js";
import { createContext, useContext, useEffect, useState } from "react";
import { discoverWallets, type WalletProvider as BrowserWallet } from "@tutela/solana-client";

type WalletState = {
  publicKey: PublicKey | null;
  walletName: string | null;
  provider: BrowserWallet | null;
  wallets: ReturnType<typeof discoverWallets>;
  connect: (id: "phantom" | "solflare") => Promise<void>;
  disconnect: () => Promise<void>;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<ReturnType<typeof discoverWallets>>([]);
  const [provider, setProvider] = useState<BrowserWallet | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);

  useEffect(() => {
    setWallets(discoverWallets());
    const timer = window.setInterval(() => setWallets(discoverWallets()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  async function connect(id: "phantom" | "solflare") {
    const wallet = wallets.find((item) => item.id === id);
    if (!wallet) throw new Error(`${id} wallet was not detected.`);
    const result = await wallet.provider.connect();
    setProvider(wallet.provider);
    setPublicKey(new PublicKey(result.publicKey));
    setWalletName(wallet.name);
  }

  async function disconnect() {
    await provider?.disconnect?.();
    setProvider(null);
    setPublicKey(null);
    setWalletName(null);
  }

  return (
    <WalletContext.Provider value={{ publicKey, walletName, provider, wallets, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
