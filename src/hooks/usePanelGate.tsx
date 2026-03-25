"use client";

import { useMemo } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { User, UserRole } from "@/types";

/**
 * Supabase yapılandırılmışsa oturum buradan; değilse eski demo currentUser.
 */
export function usePanelGate(allowedRoles: UserRole[]) {
  const { currentUser } = useDemoPlatform();
  const { authUser, authLoading } = useAuthSession();

  return useMemo(() => {
    const supabaseMode = isSupabaseConfigured();
    const user: User | null = supabaseMode ? authUser : currentUser;
    const loading = supabaseMode && authLoading;
    const allowed = Boolean(user && allowedRoles.includes(user.role));
    return { user, loading, allowed, supabaseMode };
  }, [allowedRoles, authUser, authLoading, currentUser]);
}
