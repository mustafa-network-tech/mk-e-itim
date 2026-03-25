"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

const labelClass = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#111]/55";

const fieldClass =
  "h-10 w-full rounded-[10px] border border-black/[0.08] bg-white px-3 text-sm text-[#1a1a1a] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-[#111]/35 focus:border-black/[0.16] focus:ring-1 focus:ring-black/[0.06]";

const buttonClass =
  "inline-flex h-10 w-full items-center justify-center rounded-[13px] bg-[#1f1f25] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2e2e36] hover:shadow-md hover:-translate-y-px active:translate-y-0 lg:w-auto lg:min-w-[132px]";

const mobileAramaLinkClass =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-[13px] bg-[#1f1f25] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#2e2e36] active:translate-y-0";

export function SearchBar() {
  const { institutions, gradeLevels, tags } = useDemoPlatform();

  const dersSecenekleri = useMemo(
    () => [...tags].sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [tags],
  );
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [priceMin, setPriceMin] = useState("");

  const cities = useMemo(() => [...new Set(institutions.map((i) => i.city))].sort(), [institutions]);

  const districtsForCity = useMemo(() => {
    if (!city) return [];
    const set = new Set(
      institutions.filter((i) => i.city === city).map((i) => i.district).filter(Boolean),
    );
    return [...set].sort();
  }, [institutions, city]);

  useEffect(() => {
    setDistrict("");
  }, [city]);

  const href = useMemo(() => {
    const qs = new URLSearchParams();
    if (city) qs.set("city", city);
    if (district) qs.set("district", district);
    if (subject) qs.set("subject", subject);
    if (grade) qs.set("grade", grade);
    if (priceMin.trim()) qs.set("minPrice", priceMin.trim());
    const q = qs.toString();
    return q ? `/listings?${q}` : "/listings";
  }, [city, district, subject, grade, priceMin]);

  const districtSelect =
    city && districtsForCity.length > 0 ? (
      <>
        <label className={labelClass}>İlçe seçimi</label>
        <select className={fieldClass} value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">Tüm ilçeler</option>
          {districtsForCity.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </>
    ) : null;

  const locationFollowUp =
    city && districtsForCity.length === 0 ? (
      <p className="rounded-[10px] border border-dashed border-black/[0.08] bg-white/50 px-2 py-2 text-center text-[11px] text-[#111]/45">
        Bu şehir için kayıtlı ilçe bulunmuyor.
      </p>
    ) : !city ? (
      <p className="flex min-h-10 items-center justify-center text-sm font-normal text-[#111]/22">
        Merkez
      </p>
    ) : null;

  return (
    <div className="mx-auto w-full max-w-[820px] rounded-[18px] border border-black/[0.06] bg-white/[0.92] p-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[10px] sm:p-3.5">
      {/* Mobil: şehir + Arama → doğrudan listeleme (boş da /listings) */}
      <div className="flex flex-col gap-2 lg:hidden">
        <div className="flex min-w-0 items-end gap-2">
          <div className="min-w-0 flex-1">
            <label className={labelClass}>Şehir</label>
            <select className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Şehir seçin</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <Link href={href} className={mobileAramaLinkClass}>
            Arama
          </Link>
        </div>
        <p className="text-center text-[11px] leading-snug text-[#111]/40">
          Arama ile listeleme sayfasına gidersiniz; tüm filtreleri orada, alttaki «Arama» ile açarsınız.
        </p>
      </div>

      {/* Masaüstü — üst: şehir | ders | sınıf; alt: konum adımı | min fiyat | buton */}
      <div className="hidden flex-col gap-2 lg:flex">
        <div className="grid grid-cols-3 gap-x-3 gap-y-2">
          <div className="min-w-0">
            <label className={labelClass}>Şehir</label>
            <select className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Şehir seçin</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className={labelClass}>Ders seçimi</label>
            <select className={fieldClass} value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Ders seçin</option>
              {dersSecenekleri.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label className={labelClass}>Sınıf seçimi</label>
            <select className={fieldClass} value={grade} onChange={(e) => setGrade(e.target.value)}>
              <option value="">Sınıf seçin</option>
              {gradeLevels.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 items-end gap-x-3">
          <div className="min-w-0 rounded-[10px] border border-black/[0.06] bg-white/[0.55] p-2.5">
            {districtSelect ?? locationFollowUp}
          </div>
          <div className="min-w-0">
            <label className={labelClass}>Minimum fiyat (₺)</label>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Örn. 3000"
              className={fieldClass}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Link href={href} className={buttonClass}>
              Kurumları Bul
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
