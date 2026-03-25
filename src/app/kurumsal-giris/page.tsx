"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { createBrowserSupabaseClientOrNull } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getPublicSiteUrlForRedirect } from "@/lib/siteUrl";
import { PageNav } from "@/components/ui/PageNav";

function KurumsalGirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login: demoLogin } = useDemoPlatform();
  const { signInWithEmailPassword } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const urlError = searchParams.get("error");
  const urlErrorText =
    urlError === "auth"
      ? "Bağlantı geçersiz veya süresi dolmuş. Aşağıdan şifre sıfırlama isteyin."
      : urlError === "supabase"
        ? "Sunucu yapılandırması eksik."
        : "";

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageNav />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Kurumsal giriş</h1>
        <p className="text-sm text-slate-600">
          Açık üyelik veya kendi kendine kayıt yoktur. Kurum yöneticisi hesabı yalnızca platform
          yöneticisinin davetiyle açılır; size iletilen e-posta ve şifre ile giriş yapın.
          {isSupabaseConfigured() ? (
            <span className="mt-2 block text-slate-500">
              Oturum Supabase Auth üzerinden açılır; admin veya kurum rolü{" "}
              <code className="rounded bg-slate-100 px-1">profiles</code> tablosunda tanımlı olmalıdır.
            </span>
          ) : null}
        </p>
        {urlErrorText ? <p className="text-sm text-rose-600">{urlErrorText}</p> : null}
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="E-posta"
          autoComplete="email"
        />
        <input
          type="password"
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Şifre"
          autoComplete="current-password"
        />
        <button
          type="button"
          className="w-full rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white"
          onClick={async () => {
            if (isSupabaseConfigured()) {
              const result = await signInWithEmailPassword(email.trim(), password);
              if (!result.ok) {
                setError(result.message);
                return;
              }
              router.push(result.role === "admin" ? "/admin/panel" : "/kurumsal/panel");
              return;
            }
            const role = demoLogin(email, password);
            if (!role) {
              setError("E-posta veya şifre hatalı (yerel demo kapalıysa Supabase env ekleyin).");
              return;
            }
            router.push(role === "admin" ? "/admin/panel" : "/kurumsal/panel");
          }}
        >
          Giriş Yap
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {isSupabaseConfigured() ? (
          <div className="border-t border-slate-100 pt-4">
            <button
              type="button"
              className="text-sm font-medium text-indigo-600 hover:underline"
              onClick={() => {
                setShowForgot((v) => !v);
                setResetMessage("");
                setError("");
              }}
            >
              Şifremi unuttum
            </button>
            {showForgot ? (
              <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">
                  E-postanıza sıfırlama bağlantısı gider. Üretimde linkin doğru siteye gitmesi için
                  Vercel’de <code className="rounded bg-white px-1">NEXT_PUBLIC_SITE_URL</code> ve
                  Supabase Redirect URL listesini kontrol edin.
                </p>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Hesap e-postanız"
                  type="email"
                />
                <button
                  type="button"
                  disabled={resetLoading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                  onClick={async () => {
                    const em = resetEmail.trim() || email.trim();
                    if (!em) {
                      setResetMessage("E-posta girin.");
                      return;
                    }
                    const supabase = createBrowserSupabaseClientOrNull();
                    if (!supabase) {
                      setResetMessage("Bağlantı kurulamadı.");
                      return;
                    }
                    setResetLoading(true);
                    setResetMessage("");
                    const base = getPublicSiteUrlForRedirect();
                    const redirectTo = `${base}/auth/callback?next=${encodeURIComponent("/auth/sifre-yenile")}`;
                    const { error: reErr } = await supabase.auth.resetPasswordForEmail(em, {
                      redirectTo,
                    });
                    setResetLoading(false);
                    if (reErr) {
                      setResetMessage(reErr.message || "İstek gönderilemedi.");
                      return;
                    }
                    setResetMessage("E-postanızı kontrol edin; gelen bağlantıya tıklayın, ardından yeni şifreyi kaydedin.");
                  }}
                >
                  Sıfırlama bağlantısı gönder
                </button>
                {resetMessage ? <p className="text-xs text-slate-700">{resetMessage}</p> : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function CorporateLoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-xl px-4 py-10 text-slate-600">Yükleniyor…</div>}>
      <KurumsalGirisForm />
    </Suspense>
  );
}
