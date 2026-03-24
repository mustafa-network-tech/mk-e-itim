"use client";

import { useEffect, useMemo, useState } from "react";
import { KursiyeraWordmark } from "@/components/brand/KursiyeraWordmark";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { SearchBar } from "@/components/search/SearchBar";

export function HeroSection() {
  const { heroSlides } = useDemoPlatform();
  const [index, setIndex] = useState(0);
  const slide = useMemo(() => heroSlides[index % heroSlides.length], [heroSlides, index]);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % heroSlides.length), 4500);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#111111]">
      <img src={slide.image} alt={slide.title} className="h-[400px] w-full object-cover md:h-[420px]" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/[0.65] to-black/[0.35]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[rgba(212,175,55,0.08)]" aria-hidden />
      <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col px-4 pb-7 pt-10 sm:px-6 md:pb-9 md:pt-12">
        <div className="min-h-0 flex-1" aria-hidden />
        <div className="max-w-2xl shrink-0">
          <div className="mb-3 md:mb-4">
            <KursiyeraWordmark variant="onDark" size="lg" />
          </div>
          <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
            Eğitim kariyerinize yön verecek platform
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/[0.82] md:text-lg">
            Kursları keşfedin, karşılaştırın ve en doğru seçimi yapın
          </p>
        </div>
        <div className="mt-5 w-full shrink-0 md:mt-6">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
