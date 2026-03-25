"use client";

import { AuthSessionProvider } from "@/hooks/useAuthSession";
import { DemoPlatformProvider } from "@/hooks/useDemoPlatform";
import { bindBrowserSupabasePublic } from "@/lib/supabase/browserOverride";
import type { SupabasePublicConfig } from "@/lib/supabase/runtimePublic";

export function Providers({
  children,
  supabasePublic,
}: {
  children: React.ReactNode;
  supabasePublic: SupabasePublicConfig | null;
}) {
  bindBrowserSupabasePublic(supabasePublic);
  return (
    <DemoPlatformProvider supabasePublic={supabasePublic}>
      <AuthSessionProvider>
        {children}
      </AuthSessionProvider>
    </DemoPlatformProvider>
  );
}
