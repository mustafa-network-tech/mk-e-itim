"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { InstitutionProgramCard } from "@/types";
import { normalizeProgramCards, PROGRAM_MODAL_ITEM_COUNT } from "@/lib/institutionProgramCards";

export function InstitutionProgramCardsSection({ cards }: { cards: InstitutionProgramCard[] }) {
  const list = normalizeProgramCards(cards);
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const current = open !== null ? list[open] : null;
  const modalTitle = current?.title.trim() || (open !== null ? `Program ${open + 1}` : "");

  const modal =
    mounted &&
    open !== null &&
    createPortal(
      <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          aria-label="Kapat"
          onClick={close}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="program-modal-title"
          className="relative z-[81] flex max-h-[min(88vh,720px)] w-full max-w-lg flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 id="program-modal-title" className="pr-2 text-base font-semibold text-slate-900">
              {modalTitle}
            </h3>
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
            >
              Kapat
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-3">
              {Array.from({ length: PROGRAM_MODAL_ITEM_COUNT }, (_, idx) => {
                const item = current?.modalItems[idx] ?? { title: "", subtitle: "" };
                const t = item.title.trim();
                const s = item.subtitle.trim();
                const isEmpty = !t && !s;
                return (
                  <li
                    key={idx}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/65 px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] backdrop-blur-[2px]"
                  >
                    {isEmpty ? (
                      <p className="text-sm text-slate-400">Bu kutu boş.</p>
                    ) : (
                      <div className="space-y-1">
                        {t ? (
                          <p className="text-sm font-semibold leading-snug text-slate-900">{t}</p>
                        ) : null}
                        {s ? (
                          <p className="text-sm leading-relaxed text-slate-600">{s}</p>
                        ) : null}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <section
        id="programlar"
        className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
        aria-labelledby="programlar-heading"
      >
        <h2 id="programlar-heading" className="text-lg font-semibold tracking-tight text-slate-900">
          Programlar
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {list.map((c, i) => {
            const label = c.title.trim() || `Program ${i + 1}`;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpen(i)}
                className="group flex min-h-[4.5rem] flex-col items-start justify-center rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
              >
                <span className="text-sm font-semibold text-slate-900 group-hover:text-indigo-950">
                  {label}
                </span>
                <span className="mt-1 text-xs text-slate-500">Detayları görmek için tıklayın</span>
              </button>
            );
          })}
        </div>
      </section>
      {modal}
    </>
  );
}
