"use client";

import { useEffect, useMemo, useState } from "react";
import { KursiyeraWordmark } from "@/components/brand/KursiyeraWordmark";
import type { HeroSlide } from "@/types";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { SearchBar } from "@/components/search/SearchBar";

const HERO_FALLBACK: HeroSlide[] = [
  {
    id: "hero-fallback",
    title: "Aradığın eğitim kurumunu hemen bul",
    subtitle: "Türkiye'nin en kapsamlı kurum inceleme platformu",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1800&q=80",
  },
];

export function HeroSection() {
  const { heroSlides } = useDemoPlatform();
  const slides = heroSlides.length > 0 ? heroSlides : HERO_FALLBACK;
  const [index, setIndex] = useState(0);
  const slide = useMemo(() => slides[index % slides.length], [slides, index]);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#111111]">
      <img
        src={slide.image}
        alt={slide.title}
        className="h-[380px] w-full object-cover sm:h-[400px] md:h-[420px]"
      />
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
            {slide.title}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/[0.82] md:text-lg">
            {slide.subtitle}
          </p>
        </div>
        <div className="mt-5 w-full shrink-0 md:mt-6">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
