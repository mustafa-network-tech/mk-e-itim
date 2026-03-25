"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createBrowserSupabaseClientOrNull } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { User, UserRole } from "@/types";

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: UserRole;
  institution_id: string | null;
};

async function fetchProfileForUser(
  supabase: NonNullable<ReturnType<typeof createBrowserSupabaseClientOrNull>>,
  userId: string,
) {
  const attempts = 3;
  let lastErr: { message: string; code?: string } | null = null;
  for (let i = 0; i < attempts; i++) {
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 120 * i));
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, institution_id")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) {
      return { data: data as ProfileRow, error: null as null };
    }
    lastErr = error ? { message: error.message, code: error.code } : { message: "Profil bulunamadı." };
  }
  return { data: null, error: lastErr };
}

function mapProfileToUser(profile: ProfileRow, email: string): User {
  return {
    id: profile.id,
    role: profile.role,
    name: profile.full_name?.trim() || email.split("@")[0] || "Kullanıcı",
    email,
    institutionId: profile.institution_id ?? undefined,
  };
}

interface AuthSessionContextValue {
  authUser: User | null;
  authLoading: boolean;
  signInWithEmailPassword: (
    email: string,
    password: string,
  ) => Promise<{ ok: false; message: string } | { ok: true; role: UserRole }>;
  signOut: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setAuthUser(null);
      setAuthLoading(false);
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) {
      setAuthUser(null);
      setAuthLoading(false);
      return;
    }
    setAuthLoading(true);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user?.email) {
      setAuthUser(null);
      setAuthLoading(false);
      return;
    }
    const { data: profile, error: profileErr } = await fetchProfileForUser(supabase, user.id);
    if (profileErr || !profile) {
      setAuthUser(null);
      setAuthLoading(false);
      return;
    }
    setAuthUser(mapProfileToUser(profile, user.email));
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    void refreshUser();
    if (!isSupabaseConfigured()) return;
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setAuthLoading(false);
        return;
      }
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void refreshUser();
      }
    });
    return () => subscription.unsubscribe();
  }, [refreshUser]);

  const signInWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured()) {
        return { ok: false as const, message: "Supabase ortam değişkenleri tanımlı değil." };
      }
      const supabase = createBrowserSupabaseClientOrNull();
      if (!supabase) {
        return { ok: false as const, message: "Supabase istemcisi oluşturulamadı." };
      }
      const trimmed = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });
      if (error) {
        return { ok: false as const, message: error.message || "Giriş başarısız." };
      }
      if (!data.user?.email) {
        return { ok: false as const, message: "Oturum alınamadı." };
      }
      const { data: profile, error: profileErr } = await fetchProfileForUser(supabase, data.user.id);
      if (profileErr || !profile) {
        await supabase.auth.signOut();
        const detail = profileErr?.message ? ` (${profileErr.message})` : "";
        return {
          ok: false as const,
          message:
            profileErr && !profile
              ? `Profil okunamadı${detail}. Supabase’te profiles tablosunda bu kullanıcı için satır olduğundan ve SQL migration’ında authenticated için GRANT olduğundan emin olun.`
              : "Bu hesap için profil kaydı yok. SQL ile profiles tablosuna satır ekleyin veya tetikleyiciyi kontrol edin.",
        };
      }
      const role = profile.role;
      setAuthUser(mapProfileToUser(profile, data.user.email));
      return { ok: true as const, role };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setAuthUser(null);
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (supabase) await supabase.auth.signOut();
    setAuthUser(null);
  }, []);

  const value = useMemo(
    () => ({
      authUser,
      authLoading,
      signInWithEmailPassword,
      signOut,
    }),
    [authUser, authLoading, signInWithEmailPassword, signOut],
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) throw new Error("useAuthSession yalnızca AuthSessionProvider içinde kullanılmalıdır.");
  return ctx;
}
