"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBrowserSupabasePublicOverride } from "@/lib/supabase/browserOverride";
import { getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/** İstemcide: layout’tan bağlanan override veya build-time NEXT_PUBLIC. */
export function isBrowserSupabaseActive(): boolean {
  const o = getBrowserSupabasePublicOverride();
  if (o?.url && o?.anonKey) return true;
  return isSupabaseConfigured();
}

function resolveBrowserPublic(): { url: string; anonKey: string } | null {
  const o = getBrowserSupabasePublicOverride();
  if (o?.url && o?.anonKey) {
    return { url: o.url, anonKey: o.anonKey };
  }
  if (!isSupabaseConfigured()) return null;
  const { url, anonKey } = getSupabasePublicEnv();
  return { url, anonKey };
}

/** Client Component’lerde ve tarayıcıda kullanın (singleton). */
export function createBrowserSupabaseClient() {
  const r = resolveBrowserPublic();
  if (!r) {
    const { url, anonKey } = getSupabasePublicEnv();
    return createBrowserClient(url, anonKey);
  }
  return createBrowserClient(r.url, r.anonKey);
}

/** Ortam eksikse null döner; oturum sağlayıcısı sessizce devre dışı kalır. */
export function createBrowserSupabaseClientOrNull(): SupabaseClient | null {
  const r = resolveBrowserPublic();
  if (!r) return null;
  return createBrowserClient(r.url, r.anonKey);
}
