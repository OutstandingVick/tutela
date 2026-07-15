"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TutelaAuthProvider } from "@/providers/tutela-auth-provider";
import { WalletProvider } from "@/providers/wallet-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <TutelaAuthProvider>
        <WalletProvider>{children}</WalletProvider>
      </TutelaAuthProvider>
    </QueryClientProvider>
  );
}
