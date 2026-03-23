"use client";

import { DemoPlatformProvider } from "@/hooks/useDemoPlatform";

export function Providers({ children }: { children: React.ReactNode }) {
  return <DemoPlatformProvider>{children}</DemoPlatformProvider>;
}
