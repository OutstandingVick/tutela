"use client";

import { Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/providers/wallet-provider";

export function WalletButton({ compact = false }: { compact?: boolean }) {
  const { publicKey, walletName, wallets, connect, disconnect } = useWallet();
  if (publicKey) {
    return (
      <button onClick={disconnect} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[#094586] px-3 py-2 text-xs font-bold text-[#D0FEF5]">
        <LogOut size={14} />
        {compact ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : `${walletName}: ${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`}
      </button>
    );
  }
  return (
    <div className={`flex items-center gap-2 ${compact ? "max-w-[150px] overflow-x-auto no-scrollbar" : ""}`}>
      {(["phantom", "solflare"] as const).map((id) => {
        const detected = wallets.some((wallet) => wallet.id === id);
        return (
          <button
            key={id}
            onClick={() => connect(id)}
            disabled={!detected}
            className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#6FB4EB] bg-[#094586] px-3 py-2 text-xs font-bold text-[#D0FEF5] disabled:cursor-not-allowed disabled:opacity-45"
            title={detected ? `Connect ${id}` : `${id} not detected`}
          >
            <Wallet size={14} />
            {compact ? (id === "phantom" ? "Ph" : "Sf") : id === "phantom" ? "Phantom" : "Solflare"}
          </button>
        );
      })}
    </div>
  );
}
