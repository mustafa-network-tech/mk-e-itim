"use client";

import Image from "next/image";
import { useState } from "react";
import { EducationAdvisorModal } from "@/components/education/EducationAdvisorModal";

const ADVISOR_IMAGE =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=128&h=128&q=80";

export function EducationAdvisorLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="advisor-fab group fixed bottom-5 right-4 z-[60] flex h-[3.75rem] w-[3.75rem] items-center justify-center outline-none sm:bottom-6 sm:right-6 focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
        aria-label="Eğitim Danışmanı — sohbet ile kurs bul"
        title="Eğitim Danışmanı"
      >
        <span className="advisor-fab-pulse relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_4px_20px_rgba(0,0,0,0.18),0_0_0_1px_rgba(212,175,55,0.35)] ring-2 ring-[#D4AF37]/30 transition-[box-shadow,ring-color] duration-200 group-hover:shadow-[0_6px_28px_rgba(0,0,0,0.22),0_0_0_2px_rgba(212,175,55,0.45)] group-hover:ring-[#D4AF37]/55 group-active:opacity-90">
          <Image
            src={ADVISOR_IMAGE}
            alt=""
            width={56}
            height={56}
            className="h-full w-full object-cover object-top"
            sizes="56px"
          />
        </span>
      </button>
      <EducationAdvisorModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
