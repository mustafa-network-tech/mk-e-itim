"use client";

import Link from "next/link";

function MagnifierIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

/**
 * Hero: gösterimlik arama alanı; tıklanınca /arama (filtre sayfası).
 * Metin kutusu ve mercek yalnızca görsel — gerçek arama /arama üzerinde yapılır.
 */
export function SearchBar() {
  return (
    <div className="mx-auto w-full max-w-[820px] rounded-[18px] border border-black/[0.06] bg-white/[0.92] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[10px] sm:p-3.5">
      <Link
        href="/arama"
        className="flex h-11 w-full items-center gap-3 rounded-[13px] border border-black/[0.08] bg-white px-3.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:border-black/[0.14] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
        aria-label="Arama ve filtreler sayfasına git"
      >
        <MagnifierIcon className="shrink-0 text-[#111]/45" />
        <span className="min-w-0 flex-1 truncate text-sm text-[#111]/40">
          Kurs, kurum veya konu ara…
        </span>
      </Link>
      <p className="mt-2 text-center text-[11px] leading-snug text-white/55">
        Tıklayınca tüm filtreleri seçebileceğiniz arama sayfası açılır; «Ara» ile ana sayfada sonuçları
        görürsünüz.
      </p>
    </div>
  );
}
