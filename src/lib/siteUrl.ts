/**
 * Şifre sıfırlama redirectTo kökü.
 * Localhost’ta her zaman mevcut origin; aksi halde NEXT_PUBLIC_SITE_URL veya origin.
 */
export function getPublicSiteUrlForRedirect(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return origin;
    }
    return fromEnv || origin;
  }
  return fromEnv;
}
