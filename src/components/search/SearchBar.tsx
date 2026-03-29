"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
 * Hero: serbest metin araması → /listings?q=… (anahtar kelime listelemede filtrelerle birlikte kullanılır).
 */
export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = () => {
    const t = q.trim();
    router.push(t ? `/listings?q=${encodeURIComponent(t)}` : "/listings");
  };

  return (
    <div className="mx-auto w-full max-w-[820px] rounded-[18px] border border-black/[0.06] bg-white/[0.92] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[10px] sm:p-3.5">
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2.5"
      >
        <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-[13px] border border-black/[0.08] bg-white px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <MagnifierIcon className="shrink-0 text-[#111]/45" />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-[#111] outline-none placeholder:text-[#111]/42"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Şehir, kurum türü (LGS, YKS…), sınıf, etiket veya fiyat yazın…"
            aria-label="Kurum ara"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-[13px] bg-[#1f1f25] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2e2e36] active:translate-y-px sm:min-w-[120px]"
        >
          Ara
        </button>
      </form>
      <p className="mt-2 text-center text-[11px] leading-snug text-white/55">
        Yazdığınız ifade listeleme sayfasında anahtar kelime olarak açılır; üst menüden kurum türü (LGS,
        YKS …), yan panelden konum, sınıf, fiyat, etiket ve puanla daraltırsınız.
      </p>
    </div>
  );
}
