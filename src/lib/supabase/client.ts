"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/config";

/** Client Component’lerde ve tarayıcıda kullanın (singleton). */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
