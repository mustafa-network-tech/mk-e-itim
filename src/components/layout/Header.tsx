"use client";

import Link from "next/link";
import { KursiyeraWordmark } from "@/components/brand/KursiyeraWordmark";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

export function Header() {
  const { currentUser, logout } = useDemoPlatform();
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="group shrink-0 rounded-md px-2 py-1.5 transition-opacity duration-200 hover:opacity-[0.88] sm:px-3"
        >
          <span className="relative inline-block after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-[#D4AF37] after:transition after:duration-300 after:ease-out group-hover:after:scale-x-100">
            <KursiyeraWordmark variant="onLight" size="md" />
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#111111] md:flex">
          <Link href="/listings" className="transition-opacity duration-200 hover:opacity-70">
            Kurslar & Dershaneler
          </Link>
          <Link href="/listings?featured=true" className="transition-opacity duration-200 hover:opacity-70">
            Öne Çıkanlar
          </Link>
          <Link href="/listings?sort=top" className="transition-opacity duration-200 hover:opacity-70">
            En Yüksek Puanlılar
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/kurumsal-giris"
            className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm font-semibold text-[#111111] transition-opacity duration-200 hover:opacity-80"
          >
            Kurumsal Giriş
          </Link>
          {currentUser && (
            <button
              type="button"
              className="rounded-xl bg-[#111111] px-3 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
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
