/**
 * NEXT_PUBLIC_SITE_URL: canlıda sitenin domain’i (https + kök), örn. https://www.ornek.com.tr
 * Sonunda / olmamalı. Boşsa Vercel URL veya localhost kullanılır; sitemap, robots, metadataBase buna bağlıdır.
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

/** Tarayıcıda Supabase redirectTo vb. için aynı kök URL (client’ta da NEXT_PUBLIC_SITE_URL ile derlenir). */
export function getPublicSiteUrlForRedirect(): string {
  return getSiteOrigin();
}
