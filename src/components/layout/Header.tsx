"use client";

import Link from "next/link";
import { Suspense } from "react";
import { KursiyeraWordmark } from "@/components/brand/KursiyeraWordmark";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { HeaderNav } from "@/components/layout/HeaderNav";

export function Header() {
  const { currentUser, logout: demoLogout } = useDemoPlatform();
  const { authUser, signOut: authSignOut } = useAuthSession();
  const supabaseMode = isSupabaseConfigured();
  const signedIn = supabaseMode ? authUser : currentUser;
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3.5 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="group shrink-0 rounded-md px-2 py-1.5 transition-opacity duration-200 hover:opacity-[0.88] sm:px-3"
        >
          <span className="relative inline-block pb-0.5 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-[#D4AF37] after:transition after:duration-300 after:ease-out group-hover:after:scale-x-100">
            <KursiyeraWordmark variant="onLight" size="md" />
          </span>
        </Link>
        <Suspense
          fallback={
            <nav
              className="hidden h-8 min-w-[200px] md:block"
              aria-hidden
            />
          }
        >
          <HeaderNav />
        </Suspense>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Link
            href="/kurumsal-giris"
            className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm font-semibold text-[#111111] transition-opacity duration-200 hover:opacity-80"
          >
            Kurumsal Giriş
          </Link>
          {supabaseMode && authUser ? (
            <Link
              href="/hesap/sifre"
              className="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm font-semibold text-[#111111] transition-opacity duration-200 hover:opacity-80"
            >
              Şifre değiştir
            </Link>
          ) : null}
          {signedIn && (
            <button
              type="button"
              className="rounded-xl bg-[#111111] px-3 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              onClick={() => {
                if (supabaseMode) void authSignOut();
                else demoLogout();
              }}
            >
              Çıkış
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
