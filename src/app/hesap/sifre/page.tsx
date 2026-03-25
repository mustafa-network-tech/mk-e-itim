"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClientOrNull, isBrowserSupabaseActive } from "@/lib/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { PageNav } from "@/components/ui/PageNav";

/**
 * Giriş yapmış kullanıcı: e-posta gerekmez, doğrudan yeni şifre belirler.
 */
export default function AccountChangePasswordPage() {
  const router = useRouter();
  const { authUser, authLoading, signOut } = useAuthSession();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!isBrowserSupabaseActive()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageNav />
        <p className="text-slate-600">Supabase yapılandırılmamış.</p>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageNav />
        <p className="text-slate-600">Yükleniyor…</p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <PageNav />
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-bold">Şifre değiştir</h1>
          <p className="mt-2 text-sm text-slate-600">
            Bu sayfa yalnızca giriş yapmış hesaplar içindir. Önce kurumsal giriş yapın veya şifrenizi unuttuysanız
            giriş sayfasından «Şifremi unuttum» kullanın.
          </p>
          <Link
            href="/kurumsal-giris"
            className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Kurumsal giriş
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageNav />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Şifre değiştir</h1>
        <p className="text-sm text-slate-600">
          Oturum: <span className="font-medium text-slate-800">{authUser.email}</span>. E-posta gerekmez; yeni şifrenizi
          aşağıya yazın.
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
          }}
        >
          Şifreyi güncelle
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {done && (
          <div className="space-y-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            <p>Şifre güncellendi. İsterseniz güvenlik için bir kez çıkış yapıp yeni şifreyle tekrar giriş yapın.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                onClick={() => void signOut().then(() => router.push("/kurumsal-giris"))}
              >
                Çıkış yap ve girişe git
              </button>
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-emerald-600 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              >
                Ana sayfa
              </Link>
            </div>
          </div>
        )}
        <Link href="/kurumsal-giris" className="block text-center text-sm text-slate-500 hover:text-indigo-600">
          ← Geri
        </Link>
      </div>
    </div>
  );
}
