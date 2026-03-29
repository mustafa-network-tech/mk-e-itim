"use client";

import { useMemo, type ReactNode } from "react";
import { GradeLevel, Institution, InstitutionFilters, Tag } from "@/types";

interface FilterPanelProps {
  filters: InstitutionFilters;
  cities: string[];
  institutions: Institution[];
  tags: Tag[];
  gradeLevels: GradeLevel[];
  onChange: (next: InstitutionFilters) => void;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</p>;
}

export function FilterPanel({
  filters,
  cities,
  institutions,
  tags,
  gradeLevels,
  onChange,
}: FilterPanelProps) {
  const districts = useMemo(() => {
    if (!filters.city) return [];
    const set = new Set(
      institutions.filter((i) => i.city === filters.city).map((i) => i.district).filter(Boolean),
    );
    return [...set].sort();
  }, [institutions, filters.city]);

  const neighborhoods = useMemo(() => {
    if (!filters.city) return [];
    let list = institutions.filter((i) => i.city === filters.city);
    if (filters.district) list = list.filter((i) => i.district === filters.district);
    const set = new Set(list.map((i) => i.neighborhood).filter((n) => n && n.trim()));
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [institutions, filters.city, filters.district]);

  return (
    <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <FieldLabel>Anahtar kelime</FieldLabel>
        <p className="mb-1.5 text-[11px] text-slate-500">
          Hero’dan gelen veya serbest arama; kurum adı, açıklama, kategori, şehir vb. içinde aranır.
        </p>
        <input
          placeholder="Örn. Kadıköfizik, YKS, 5000…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
        />
      </div>

      <div>
        <FieldLabel>Şehir</FieldLabel>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={filters.city}
          onChange={(e) =>
            onChange({
              ...filters,
              city: e.target.value,
              district: undefined,
              neighborhood: undefined,
            })
          }
        >
          <option value="">Tüm şehirler</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {filters.city && districts.length > 0 ? (
        <div>
          <FieldLabel>İlçe</FieldLabel>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={filters.district ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                district: e.target.value || undefined,
                neighborhood: undefined,
              })
            }
          >
            <option value="">Tüm ilçeler</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {filters.city && neighborhoods.length > 0 ? (
        <div>
          <FieldLabel>Mahalle</FieldLabel>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={filters.neighborhood ?? ""}
            onChange={(e) =>
              onChange({ ...filters, neighborhood: e.target.value || undefined })
            }
          >
            <option value="">Tüm mahalleler</option>
            {neighborhoods.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <FieldLabel>Sınıf</FieldLabel>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={filters.gradeLevelId ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              gradeLevelId: e.target.value || undefined,
            })
          }
        >
          <option value="">Tüm sınıflar</option>
          {gradeLevels.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>Fiyat (₺)</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
      </div>

      <div>
        <FieldLabel>Etiketler</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = filters.tags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
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
      </div>

      <div>
        <FieldLabel>Minimum yıldız</FieldLabel>
        <label className="text-sm text-slate-600">{filters.minRating} ve üzeri</label>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={filters.minRating}
          onChange={(e) => onChange({ ...filters, minRating: Number(e.target.value) })}
          className="mt-1 w-full"
        />
      </div>
    </aside>
  );
}
