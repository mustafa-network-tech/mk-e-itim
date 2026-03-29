/** Canlıda mutlaka NEXT_PUBLIC_SITE_URL (https://alanadiniz.com) ayarlayın; meta, sitemap ve OAuth/şifre yönlendirmeleri bunu kullanır. */
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
