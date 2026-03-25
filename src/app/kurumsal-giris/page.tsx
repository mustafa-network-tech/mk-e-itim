"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { PageNav } from "@/components/ui/PageNav";

export default function CorporateLoginPage() {
  const router = useRouter();
  const { login } = useDemoPlatform();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageNav />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Kurumsal giriş</h1>
        <p className="text-sm text-slate-600">
          Açık üyelik veya kendi kendine kayıt yoktur. Kurum yöneticisi hesabı yalnızca platform
          yöneticisinin davetiyle açılır; size iletilen e-posta ve şifre ile giriş yapın.
        </p>
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
          className="w-full rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white"
          onClick={() => {
            const role = login(email, password);
            if (!role) {
              setError("E-posta veya şifre hatalı.");
              return;
            }
            router.push(role === "admin" ? "/admin/panel" : "/kurumsal/panel");
          }}
        >
          Giriş Yap
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
}
