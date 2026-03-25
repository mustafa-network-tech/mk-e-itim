"use client";

import { useEffect, useState } from "react";

const INTRO_MS = 2350;
const VISIBLE_MS = 5000;
const EXIT_MS = 450;

function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Header altında: ip + turuncu balon, yukarıdan inip oturur; 5 sn kalır ve kaybolur.
 * (Layout tek mount: sekmede sayfa yenilenene kadar bir kez.)
 */
export function PoweredByBalloon() {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = getReducedMotion();
    const intro = reduced ? 0 : INTRO_MS;

    const showId = requestAnimationFrame(() => setMounted(true));

    const exitTimer = window.setTimeout(() => setExiting(true), intro + VISIBLE_MS);
    const hideTimer = window.setTimeout(() => {
      setMounted(false);
    }, intro + VISIBLE_MS + EXIT_MS);

    return () => {
      cancelAnimationFrame(showId);
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!mounted) return null;

  const reduced = typeof window !== "undefined" && getReducedMotion();

  return (
    <div
      className="pointer-events-none fixed left-1/2 z-40 -translate-x-1/2"
      style={{ top: "max(4.75rem, calc(env(safe-area-inset-top, 0px) + 4rem))" }}
      aria-hidden={exiting}
    >
      <div
        className={`flex flex-col items-center ${reduced || exiting ? "" : "powered-by-balloon-enter"} ${
          exiting ? "powered-by-balloon-exit opacity-0" : "opacity-100"
        }`}
        id="powered-by-balloon-root"
      >
        <div
          className="h-6 w-px shrink-0 bg-gradient-to-b from-slate-400 via-orange-400 to-orange-500 sm:h-7"
          aria-hidden
        />
        <a
          href="https://mustafaoner.net"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto mt-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
          aria-label="Powered by MK Digital Systems — mustafaoner.net"
        >
          <div className="flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-full border-2 border-orange-500 bg-orange-50 px-1.5 py-1 text-center shadow-md transition-[box-shadow,transform,border-color] duration-200 ease-out hover:scale-[1.04] hover:border-orange-600 hover:shadow-lg sm:h-[5.25rem] sm:w-[5.25rem]">
            <span className="block text-[6px] font-medium leading-tight text-orange-950 sm:text-[7px]">
              Powered by
            </span>
            <span className="mt-0.5 block text-[6.5px] font-semibold leading-[1.15] text-orange-950 sm:text-[7.5px]">
              MK Digital Systems
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
