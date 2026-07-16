"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTutelaAuth } from "@/providers/tutela-auth-provider";

export default function AppWelcomePage() {
  const router = useRouter();
  const { authenticated, enabled, login, ready } = useTutelaAuth();
  const [continueAfterLogin, setContinueAfterLogin] = useState(false);

  useEffect(() => {
    if (continueAfterLogin && authenticated) {
      router.push("/matches");
    }
  }, [authenticated, continueAfterLogin, router]);

  function enterApp() {
    if (!ready || !enabled) return;
    if (authenticated) {
      router.push("/matches");
      return;
    }

    setContinueAfterLogin(true);
    login();
  }

  return (
    <main className="tutela-frame-page text-[#D0FEF5]">
      <section
        className="tutela-welcome-frame tutela-app-frame tutela-app-content mx-auto flex flex-col px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(2.5rem+env(safe-area-inset-top))] sm:px-10"
        aria-labelledby="welcome-title"
      >
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="welcome-logo-motion relative h-20 w-20 sm:h-24 sm:w-24">
            <Image src="/tutela-logo.png" alt="Tutela logo" fill priority sizes="96px" className="object-contain" />
          </div>

          <div className="welcome-copy-motion mt-2">
            <h1 id="welcome-title" className="text-5xl font-black leading-none tracking-normal text-[#D0FEF5] sm:text-6xl">
              Tutela
            </h1>
            <p className="mt-4 text-xl font-black leading-tight text-white">
               Watch the game. Predict every moment.
            </p>
            
          </div>
        </div>

        <div className="welcome-cta-motion mt-5">
          <button
            type="button"
            onClick={enterApp}
            disabled={!ready || !enabled}
            className="focus-ring flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[1.25rem] bg-[#6FB4EB] px-6 py-4 text-base font-black text-[#041827] transition hover:bg-[#D0FEF5] active:scale-[0.99] sm:min-h-[60px]"
          >
            <span>{authenticated ? "Explore matches" : "Sign up & Play"}</span>
            <ArrowRight size={19} aria-hidden="true" />
          </button>

          <div className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#D0FEF5]/58">
            <span className="h-2 w-2 rounded-full bg-[#6FB4EB]" aria-hidden="true" />
            <span>Powered by TxLINE</span>
          </div>
        </div>
      </section>
    </main>
  );
}
