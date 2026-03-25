import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Supabase e-posta doğrulama / şifre sıfırlama (PKCE) dönüş adresi.
 * Dashboard → Authentication → URL Configuration → Redirect URLs’e ekleyin:
 *   https://SİTE/auth/callback
 *   http://localhost:3000/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/kurumsal-giris";
  const next = nextRaw.startsWith("/") ? nextRaw : "/kurumsal-giris";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/kurumsal-giris?error=supabase`);
  }

  if (code) {
    const supabase = await createSupabaseRouteHandlerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/kurumsal-giris?error=auth`);
}
