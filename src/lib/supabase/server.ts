import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/config";

/**
 * Server Component, Server Action ve Route Handler’da kullanın.
 * Çerez yazımı her zaman mümkün değildir; hata yutulur — oturum yenileme middleware’de yapılır.
 */
export async function createServerSupabaseClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* Server Component içinde set çağrısı engellenebilir */
        }
      },
    },
  });
}
