"use client";

import { useEffect, useMemo, useState } from "react";
import { KursiyeraWordmark } from "@/components/brand/KursiyeraWordmark";
import { DEFAULT_HERO_ROTATING_TITLES } from "@/data/heroRotatingDefaults";
import type { HeroSlide } from "@/types";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { SearchBar } from "@/components/search/SearchBar";

const ROTATE_MS = 4000;

const HERO_FALLBACK: HeroSlide[] = [
  {
    id: "hero-fallback",
    title: "Aradığın eğitim kurumunu hemen bul",
    subtitle: "Türkiye'nin en kapsamlı kurum inceleme platformu",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1800&q=80",
  },
];

function displayRotatingTitles(raw: string[] | undefined): string[] {
  return [0, 1, 2, 3].map((i) => {
    const t = (raw?.[i] ?? "").trim();
    const fallback = (DEFAULT_HERO_ROTATING_TITLES[i] ?? "").trim();
    return t || fallback || "Aradığın eğitim kurumunu hemen bul";
  });
}

export function HeroSection() {
  const { heroSlides, heroRotatingTitles } = useDemoPlatform();
  const slides = heroSlides.length > 0 ? heroSlides : HERO_FALLBACK;
  const titles = useMemo(() => displayRotatingTitles(heroRotatingTitles), [heroRotatingTitles]);

  const [slideIndex, setSlideIndex] = useState(0);
  const slide = useMemo(() => slides[slideIndex % slides.length], [slides, slideIndex]);

  const [titleIndex, setTitleIndex] = useState(0);
  const fullTitle = titles[titleIndex % titles.length] ?? titles[0];

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex((prev) => (prev + 1) % slides.length), 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % 4);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#111111]">
      <div className="relative min-h-[440px] md:min-h-[420px]">
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/[0.65] to-black/[0.35]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[rgba(212,175,55,0.08)]" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-[440px] max-w-7xl flex-col px-4 pb-7 pt-10 sm:px-6 md:min-h-[420px] md:pb-9 md:pt-12">
          <div className="min-h-0 flex-1" aria-hidden />
          <div className="mx-auto flex w-full max-w-3xl shrink-0 flex-col items-center px-2 text-center">
            <div className="mb-3 flex justify-center md:mb-4">
              <KursiyeraWordmark variant="onDark" size="lg" />
            </div>
            <h1
              key={titleIndex}
              className="hero-rotating-title-blink w-full min-h-[2.75rem] text-3xl font-bold leading-tight text-white md:min-h-[3.25rem] md:text-4xl lg:min-h-[3.5rem] lg:text-[2.65rem] lg:leading-[1.12]"
            >
              {fullTitle}
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/[0.82] md:text-lg">{slide.subtitle}</p>
          </div>
          <div className="mt-5 w-full shrink-0 md:mt-6">
            <SearchBar />
          </div>
        </div>
      </div>
    </section>
  );
}
