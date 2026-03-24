"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "kursiyera-dev-notice-dismissed";
const AUTO_DISMISS_MS = 10000;
const GOLD = "#D4AF37";

const WHATSAPP_PRESET_MESSAGE =
  "Merhaba, MK Eğitim platformu hakkında iş birliği için ulaşıyorum.";

function buildWhatsAppHref(): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE?.replace(/\D/g, "") ?? "";
  const text = encodeURIComponent(WHATSAPP_PRESET_MESSAGE);
  if (phone.length >= 10) {
    return `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
  }
  return `https://api.whatsapp.com/send?text=${text}`;
}

export function DevelopmentNoticeModal() {
  const [phase, setPhase] = useState<"hidden" | "entering" | "visible" | "leaving">("hidden");
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    autoCloseRef.current = null;
    leaveTimerRef.current = null;
  }, []);

  const dismiss = useCallback(
    (remember: boolean) => {
      clearTimers();
      setPhase("leaving");
      leaveTimerRef.current = setTimeout(() => {
        setPhase("hidden");
        if (remember && typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_KEY, "1");
        }
        leaveTimerRef.current = null;
      }, 320);
    },
    [clearTimers],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    const id = requestAnimationFrame(() => {
      setPhase("entering");
      requestAnimationFrame(() => setPhase("visible"));
    });

    autoCloseRef.current = setTimeout(() => dismiss(true), AUTO_DISMISS_MS);

    return () => {
      cancelAnimationFrame(id);
      clearTimers();
    };
  }, [clearTimers, dismiss]);

  useEffect(() => {
    if (phase !== "visible" && phase !== "entering" && phase !== "leaving") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (phase === "visible" || phase === "entering")) {
        dismiss(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, dismiss]);

  if (phase === "hidden") return null;

  const backdropOpen = phase === "entering" || phase === "visible" || phase === "leaving";
  const backdropOpaque = phase === "visible";
  const panelOpen = phase === "entering" || phase === "visible" || phase === "leaving";
  const panelExpanded = phase === "visible";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      {backdropOpen ? (
        <button
          type="button"
          aria-label="Bildirimi kapat"
          className={`absolute inset-0 border-0 bg-[#0a0a0c]/70 backdrop-blur-[6px] transition-opacity duration-300 ease-out ${
            backdropOpaque ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => dismiss(true)}
        />
      ) : null}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dev-notice-title"
        className={`relative z-[101] w-full max-w-[min(100%,28rem)] transition-all duration-300 ease-out ${
          panelOpen
            ? panelExpanded
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0"
            : "scale-95 opacity-0"
        }`}
      >
        <div
          className="dev-notice-noise relative overflow-hidden rounded-2xl border border-[#D4AF37]/35 bg-[#141416] px-8 pb-10 pt-12 shadow-[0_0_0_1px_rgba(212,175,55,0.12),0_32px_64px_-16px_rgba(0,0,0,0.65),0_0_100px_-30px_rgba(212,175,55,0.18)]"
          style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
        >
          <div
            className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full opacity-[0.22] blur-3xl"
            style={{
              background: `radial-gradient(ellipse at center, ${GOLD} 0%, transparent 68%)`,
            }}
          />

          <button
            type="button"
            onClick={() => dismiss(true)}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors duration-300 hover:bg-white/5 hover:text-[#D4AF37]"
            aria-label="Kapat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <div className="relative text-center">
            <p
              id="dev-notice-title"
              className="text-balance text-2xl font-semibold tracking-tight text-zinc-100 sm:text-[1.65rem] sm:leading-snug"
            >
              Platform Geliştirme Aşamasında
            </p>
            <p className="mx-auto mt-5 max-w-sm text-pretty text-[0.9375rem] leading-relaxed text-zinc-400">
              Eğitim kurumlarını keşfetmenin yeni yolu çok yakında hizmetinizde olacak.
            </p>
            <p className="mt-8 text-xs font-medium tracking-[0.14em] text-zinc-600">
              Powered by MK Digital Systems
            </p>

            <a
              href={buildWhatsAppHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="group mx-auto mt-10 inline-flex items-center gap-2.5 text-[0.9375rem] font-medium text-zinc-200 transition-[color,filter,text-decoration-color] duration-300 hover:text-[#D4AF37] hover:underline hover:decoration-[#D4AF37]/90 hover:underline-offset-4"
              style={{
                textDecorationThickness: "1px",
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/25 text-[#D4AF37] transition-[border-color,box-shadow,color] duration-300 group-hover:border-[#D4AF37]/55 group-hover:text-[#e8c85c] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                aria-hidden
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </span>
              İş birliği için ulaşın
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
