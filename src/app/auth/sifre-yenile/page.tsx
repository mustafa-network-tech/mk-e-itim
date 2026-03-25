"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClientOrNull, isBrowserSupabaseActive } from "@/lib/supabase/client";
import { PageNav } from "@/components/ui/PageNav";

/**
 * E-postadaki «şifre sıfırla» linki → /auth/callback → buraya yönlendirilir.
 * Oturum (recovery veya normal) yoksa form gösterilmez; açıklama verilir.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isBrowserSupabaseActive()) {
      setSessionReady(false);
      return;
    }
    const supabase = createBrowserSupabaseClientOrNull();
    if (!supabase) {
      setSessionReady(false);
      return;
    }

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
        return;
      }
      setSessionReady(false);
    };
    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true);
      }
      if (event === "SIGNED_OUT") {
        setSessionReady(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isBrowserSupabaseActive()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageNav />
        <p className="text-slate-600">Supabase ortam değişkenleri tanımlı değil.</p>
      </div>
    );
  }

  if (sessionReady === null) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageNav />
        <p className="text-slate-600">Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageNav />
        <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-6">
          <h1 className="text-xl font-bold text-slate-900">Şifre sıfırlama</h1>
          <p className="text-sm text-slate-700">
            Bu sayfada yeni şifre girebilmek için önce e-postanızdaki sıfırlama bağlantısına tıklamış olmanız
            gerekir. Bağlantı sizi otomatik olarak oturum açmış şekilde buraya getirir.
          </p>
          <ul className="list-inside list-disc text-sm text-slate-600">
            <li>
              <Link href="/kurumsal-giris" className="font-medium text-indigo-600 hover:underline">
                Kurumsal giriş
              </Link>{" "}
              sayfasında «Şifremi unuttum» ile e-posta isteyin.
            </li>
            <li>Supabase’te Site URL ve Redirect URL listesinde bu sitenin adresi olmalı (localhost değilse canlı URL).</li>
          </ul>
          <Link
            href="/kurumsal-giris"
            className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Kurumsal girişe git
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageNav />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Yeni şifrenizi girin</h1>
        <p className="text-sm text-slate-600">
          E-postadaki bağlantıyla geldiniz. Aşağıya yeni şifrenizi yazıp kaydedin; ardından bu şifreyle giriş
          yapabilirsiniz.
        </p>
        <input
          type="password"
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          placeholder="Yeni şifre"
          autoComplete="new-password"
        />
        <input
          type="password"
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={password2}
          onChange={(e) => {
            setPassword2(e.target.value);
            setError("");
          }}
          placeholder="Yeni şifre (tekrar)"
          autoComplete="new-password"
        />
        <button
          type="button"
          className="w-full rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white"
          onClick={async () => {
            if (password.length < 6) {
              setError("Şifre en az 6 karakter olmalıdır.");
              return;
            }
            if (password !== password2) {
              setError("Şifreler eşleşmiyor.");
              return;
            }
            const supabase = createBrowserSupabaseClientOrNull();
            if (!supabase) {
              setError("Bağlantı kurulamadı.");
              return;
            }
            const { error: upErr } = await supabase.auth.updateUser({ password });
            if (upErr) {
              setError(upErr.message || "Şifre güncellenemedi.");
              return;
            }
            setDone(true);
            setTimeout(() => router.push("/kurumsal-giris"), 2000);
          }}
        >
          Şifreyi kaydet
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {done && (
          <p className="text-sm text-emerald-700">Şifre güncellendi. Giriş sayfasına yönlendiriliyorsunuz…</p>
        )}
        <p className="text-center text-xs text-slate-500">
          Zaten giriş yaptıysanız ve sadece şifre değiştirmek istiyorsanız:{" "}
          <Link href="/hesap/sifre" className="text-indigo-600 hover:underline">
            Hesap → Şifre değiştir
          </Link>
        </p>
        <Link href="/kurumsal-giris" className="block text-center text-sm text-indigo-600 hover:underline">
          Kurumsal girişe dön
        </Link>
      </div>
    </div>
  );
}
