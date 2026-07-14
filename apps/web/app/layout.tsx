import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { PrototypeBanner } from "@/components/layout/prototype-banner";

export const metadata: Metadata = {
  title: "Tutela",
  description: "Verifiable parametric football markets on Solana devnet."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PrototypeBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
