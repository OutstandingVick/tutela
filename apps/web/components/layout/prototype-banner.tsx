"use client";

import { usePathname } from "next/navigation";
import { DEVNET_DISCLOSURE } from "@tutela/config";

export function PrototypeBanner() {
  const pathname = usePathname();

  if (pathname === "/app") {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 border-b border-[#6FB4EB] bg-[#4A051C]/95 px-4 py-2 text-center text-xs font-semibold text-[#D0FEF5] backdrop-blur">
      {DEVNET_DISCLOSURE}
    </div>
  );
}
