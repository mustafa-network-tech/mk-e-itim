"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

export function SearchBar() {
  const { tags, institutions } = useDemoPlatform();
  const [city, setCity] = useState("");
  const [tag, setTag] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const cities = [...new Set(institutions.map((i) => i.city))];

  const field =
    "rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm text-[#111111] outline-none focus:border-black/[0.12]";

  return (
    <div
      className="grid gap-3 rounded-[14px] border border-black/[0.08] bg-white p-4 shadow-[0_8px_20px_rgba(0,0,0,0.08)] md:grid-cols-4"
    >
      <select className={field} value={city} onChange={(e) => setCity(e.target.value)}>
        <option value="">Şehir seçimi</option>
        {cities.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select className={field} value={tag} onChange={(e) => setTag(e.target.value)}>
        <option value="">Etiket seçimi</option>
        {tags.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Fiyat min"
        className={field}
        value={priceMin}
        onChange={(e) => setPriceMin(e.target.value)}
      />
      <Link
        href={`/listings?city=${city}&tags=${tag ? [tag].join(",") : ""}&minPrice=${priceMin}`}
        className="flex items-center justify-center rounded-xl bg-[#111111] px-3 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
      >
        Arama
      </Link>
    </div>
  );
}
