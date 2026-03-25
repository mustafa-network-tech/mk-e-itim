import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/config";

/**
 * Route Handler’da oturum çerezlerinin yazılabilmesi için — try/catch yok.
 */
export async function createSupabaseRouteHandlerClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
