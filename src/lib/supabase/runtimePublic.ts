/**
 * Sunucu bileşenlerinde (ör. root layout) çağrılır.
 * Vercel’de runtime ortam değişkenleri burada doğru okunur; istemci paketindeki
 * build-time gömülü NEXT_PUBLIC_* eksik olsa bile prop ile tarayıcıya aktarılabilir.
 */
export type SupabasePublicConfig = { url: string; anonKey: string };

export function getSupabasePublicForBrowser(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";
  if (!url || !anon) return null;
  return { url, anonKey: anon };
}
