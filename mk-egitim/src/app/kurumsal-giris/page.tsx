"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { PageNav } from "@/components/ui/PageNav";

export default function CorporateLoginPage() {
  const router = useRouter();
  const { login } = useDemoPlatform();
  const [email, setEmail] = useState("ayse@zirvematematik.demo");
  const [password, setPassword] = useState("Demo123!");
  const [error, setError] = useState("");
  const fillDemoUser = (nextEmail: string, nextPassword: string) => {
    setEmail(nextEmail);
    setPassword(nextPassword);
    setError("");
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <PageNav />
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Kurumsal Giriş</h1>
        <div className="grid gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => fillDemoUser("ayse@zirvematematik.demo", "Demo123!")}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Ayşe Zirve Matematik Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemoUser("mehmet@akademibasari.demo", "Demo123!")}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Mehmet Akademi Başarı Demo
          </button>
          <button
            type="button"
            onClick={() => fillDemoUser("admin@mkegitim.demo", "Admin123!")}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Sistem Admin Demo
          </button>
        </div>
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta"
        />
        <input
          type="password"
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
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
