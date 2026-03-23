"use client";

import { InstitutionFilters, Tag } from "@/types";

interface FilterPanelProps {
  filters: InstitutionFilters;
  cities: string[];
  tags: Tag[];
  onChange: (next: InstitutionFilters) => void;
}

export function FilterPanel({ filters, cities, tags, onChange }: FilterPanelProps) {
  return (
    <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <input
        placeholder="Kurum adı veya anahtar kelime"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
      />
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={filters.city}
        onChange={(e) => onChange({ ...filters, city: e.target.value })}
      >
        <option value="">Tüm şehirler</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Min fiyat"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={filters.minPrice ?? ""}
          onChange={(e) =>
            onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })
          }
        />
        <input
          type="number"
          placeholder="Max fiyat"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>
      <select
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value as InstitutionFilters["type"] })}
      >
        <option value="">Kurum türü</option>
        <option value="kurs">Kurs</option>
        <option value="dershane">Dershane</option>
      </select>
      <label className="text-sm text-slate-600">Minimum yıldız: {filters.minRating}</label>
      <input
        type="range"
        min={0}
        max={5}
        step={1}
        value={filters.minRating}
        onChange={(e) => onChange({ ...filters, minRating: Number(e.target.value) })}
        className="w-full"
      />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const selected = filters.tags.includes(tag.id);
          return (
            <button
              key={tag.id}
              className={`rounded-full px-3 py-1 text-xs ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}
              onClick={() =>
                onChange({
                  ...filters,
                  tags: selected
                    ? filters.tags.filter((item) => item !== tag.id)
                    : [...filters.tags, tag.id],
                })
              }
            >
              {tag.name}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
