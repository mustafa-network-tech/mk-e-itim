"use client";

import Link from "next/link";
import { Suspense } from "react";
import { KursiyeraWordmark } from "@/components/brand/KursiyeraWordmark";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { isBrowserSupabaseActive } from "@/lib/supabase/client";
import { HeaderNav } from "@/components/layout/HeaderNav";

export function Header() {
  const { currentUser, logout: demoLogout } = useDemoPlatform();
  const { authUser, signOut: authSignOut } = useAuthSession();
  const supabaseMode = isBrowserSupabaseActive();
  const signedIn = supabaseMode ? authUser : currentUser;
  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-3.5 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="group order-1 shrink-0 rounded-md px-2 py-1.5 transition-opacity duration-200 hover:opacity-[0.88] sm:px-3"
        >
          <span className="relative inline-block pb-0.5 after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-[#D4AF37] after:transition after:duration-300 after:ease-out group-hover:after:scale-x-100">
            <KursiyeraWordmark variant="onLight" size="md" />
          </span>
        </Link>
        <Suspense
          fallback={
            <nav
              className="order-3 h-8 min-h-8 w-full basis-full md:order-2 md:w-auto md:flex-1 md:basis-auto"
              aria-hidden
            />
          }
        >
          <HeaderNav />
        </Suspense>
        <div className="order-2 flex shrink-0 flex-wrap items-center justify-end gap-2 md:order-3">
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
