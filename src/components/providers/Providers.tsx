"use client";

import { DevelopmentNoticeModal } from "@/components/DevelopmentNoticeModal";
import { DemoPlatformProvider } from "@/hooks/useDemoPlatform";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoPlatformProvider>
      {children}
      <DevelopmentNoticeModal />
    </DemoPlatformProvider>
  );
}
