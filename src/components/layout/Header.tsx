"use client";

import Link from "next/link";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

export function Header() {
  const { currentUser, logout } = useDemoPlatform();
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl font-bold text-slate-900">
          MK Eğitim
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          <Link href="/listings">Kurslar & Dershaneler</Link>
          <Link href="/listings?featured=true">Öne Çıkanlar</Link>
          <Link href="/listings?sort=top">En Yüksek Puanlılar</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/kurumsal-giris"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Kurumsal Giriş
          </Link>
          {currentUser && (
            <button
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              onClick={logout}
            >
              Çıkış
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
