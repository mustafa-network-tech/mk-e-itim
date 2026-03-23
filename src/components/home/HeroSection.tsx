"use client";

import { useEffect, useMemo, useState } from "react";
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
    <section className="relative overflow-hidden rounded-3xl">
      <img src={slide.image} alt={slide.title} className="h-[460px] w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20" />
      <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-center px-6">
        <div className="max-w-2xl text-white">
          <p className="mb-3 text-sm font-semibold text-indigo-200">MK Eğitim</p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Eğitim kariyerinize yön verecek platform
          </h1>
          <p className="mt-4 text-lg text-slate-200">
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
