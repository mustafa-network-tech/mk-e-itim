import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * RLS’yi bypass eder — yalnızca API route, Server Action veya cron gibi güvenilir sunucu kodunda kullanın.
 * İstemci bundle’ına dahil etmeyin.
 */
export function createAdminSupabaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase public env eksik; önce NEXT_PUBLIC_SUPABASE_URL ve anon/publishable key tanımlayın.");
  }
  const { url } = getSupabasePublicEnv();
  const serviceKey = getServiceRoleKey();
  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
