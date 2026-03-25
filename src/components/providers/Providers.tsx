"use client";

import { DevelopmentNoticeModal } from "@/components/DevelopmentNoticeModal";
import { AuthSessionProvider } from "@/hooks/useAuthSession";
import { DemoPlatformProvider } from "@/hooks/useDemoPlatform";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoPlatformProvider>
      <AuthSessionProvider>
        {children}
        <DevelopmentNoticeModal />
      </AuthSessionProvider>
    </DemoPlatformProvider>
  );
}
