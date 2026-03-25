/**
 * Ortam değişkenleri: kök dizinde `.env.local` (repoya eklenmez).
 * Supabase Dashboard > Project Settings > API
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
/** Legacy "anon" veya yeni "publishable" (sb_publishable_...) anahtar */
const anonOrPublishable =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  "";

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonOrPublishable);
}

/** İstemci tarafında da kullanılabilir (public URL + public key). */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  if (!url || !anonOrPublishable) {
    throw new Error(
      "Supabase yapılandırması eksik: .env.local içinde NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY (veya NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) tanımlayın.",
    );
  }
  return { url, anonKey: anonOrPublishable };
}

export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY yalnızca güvenilir sunucu kodunda kullanılır; .env.local içinde tanımlayın.",
    );
  }
  return key;
}
