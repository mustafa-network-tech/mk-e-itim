"use client";

import type { SupabasePublicConfig } from "@/lib/supabase/runtimePublic";

let browserOverride: SupabasePublicConfig | null = null;

/** Root Providers render’ında sunucudan gelen public config’i bağlar. */
export function bindBrowserSupabasePublic(cfg: SupabasePublicConfig | null) {
  browserOverride = cfg;
}

export function getBrowserSupabasePublicOverride(): SupabasePublicConfig | null {
  return browserOverride;
}
