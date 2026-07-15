"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { WELCOME_SCREEN_ENABLED, WELCOME_STORAGE_KEY } from "@/lib/welcome";

export default function AppWelcomePage() {
  const router = useRouter();

  useEffect(() => {
    if (!WELCOME_SCREEN_ENABLED || getWelcomeCompleted()) {
      router.replace("/matches");
    }
  }, [router]);

  function enterApp() {
    setWelcomeCompleted();
    router.push("/matches");
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#020B12] px-3 py-3 text-[#D0FEF5] sm:px-5 sm:py-5">
      <section
        className="mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-[38rem] flex-col overflow-hidden rounded-[2rem] border border-[#6FB4EB]/35 bg-[radial-gradient(circle_at_50%_38%,rgba(111,180,235,0.17),transparent_18rem),linear-gradient(180deg,#03111B_0%,#020B12_48%,#03111B_100%)] px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(2.5rem+env(safe-area-inset-top))] shadow-[0_28px_90px_rgba(0,0,0,0.44)] sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[2.6rem] sm:px-10"
        aria-labelledby="welcome-title"
      >
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="welcome-logo-motion relative h-20 w-20 sm:h-24 sm:w-24">
            <Image src="/tutela-logo.png" alt="Tutela logo" fill priority sizes="96px" className="object-contain" />
          </div>

          <div className="welcome-copy-motion mt-8">
            <h1 id="welcome-title" className="text-5xl font-black leading-none tracking-normal text-[#D0FEF5] sm:text-6xl">
              Tutela
            </h1>
            <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-[#6FB4EB]" />
            <p className="mt-8 text-2xl font-black leading-tight text-white sm:text-3xl">
              Read the match. Verify the outcome.
            </p>
            <p className="mx-auto mt-4 max-w-[24rem] text-base font-semibold leading-7 text-[#D0FEF5]/72 sm:text-lg">
              Complex football predictions, resolved through verifiable data on Solana.
            </p>
          </div>
        </div>

        <div className="welcome-cta-motion mt-10">
          <button
            type="button"
            onClick={enterApp}
            className="focus-ring flex min-h-[56px] w-full items-center justify-center gap-3 rounded-[1.25rem] bg-[#6FB4EB] px-6 py-4 text-base font-black text-[#041827] transition hover:bg-[#D0FEF5] active:scale-[0.99] sm:min-h-[60px]"
          >
            <span>Explore matches</span>
            <ArrowRight size={19} aria-hidden="true" />
          </button>

          <p className="mt-5 text-center text-sm font-semibold text-[#D0FEF5]/68">
            Solana Devnet · Test credits have no monetary value
          </p>

          <div className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-[#D0FEF5]/58">
            <span className="h-2 w-2 rounded-full bg-[#6FB4EB]" aria-hidden="true" />
            <span>Powered by TxLINE</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function getWelcomeCompleted() {
  try {
    return window.localStorage.getItem(WELCOME_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function setWelcomeCompleted() {
  try {
    window.localStorage.setItem(WELCOME_STORAGE_KEY, "true");
  } catch {
    // Storage can be unavailable in restricted browser contexts. The CTA should still enter the app.
  }
}
