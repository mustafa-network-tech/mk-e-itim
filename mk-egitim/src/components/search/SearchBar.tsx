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

  return (
    <div className="grid gap-3 rounded-2xl bg-white/95 p-4 shadow-xl md:grid-cols-4">
      <select
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      >
        <option value="">Şehir seçimi</option>
        {cities.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      >
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
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
        value={priceMin}
        onChange={(e) => setPriceMin(e.target.value)}
      />
      <Link
        href={`/listings?city=${city}&tags=${tag ? [tag].join(",") : ""}&minPrice=${priceMin}`}
        className="flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Arama
      </Link>
    </div>
  );
}
