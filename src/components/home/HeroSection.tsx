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
      <img src={slide.image} alt={slide.title} className="h-[460px] w-full object-cover" />
      {/* linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.35)) */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/[0.65] to-black/[0.35]"
        aria-hidden
      />
      {/* Hafif altın katmanı — marka dokunuşu */}
      <div className="absolute inset-0 bg-[rgba(212,175,55,0.08)]" aria-hidden />
      <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6">
        <div className="max-w-2xl">
          <div className="mb-4">
            <KursiyeraWordmark variant="onDark" size="lg" />
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
            Eğitim kariyerinize yön verecek platform
          </h1>
          <p className="mt-4 text-lg text-white/[0.8]">
            Kursları keşfedin, karşılaştırın ve en doğru seçimi yapın
          </p>
        </div>
        <div className="mt-8">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
