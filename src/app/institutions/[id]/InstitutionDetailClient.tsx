"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { RatingStars } from "@/components/ui/RatingStars";
import { TagBadge } from "@/components/ui/TagBadge";
import { getPublicRating, institutionWhatsAppHref } from "@/lib/institutions";
import { ReviewSection } from "@/components/review/ReviewSection";
import { PageNav } from "@/components/ui/PageNav";

function DetailSection({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 text-slate-700">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function InstitutionDetailClient() {
  const params = useParams<{ id: string }>();
  const { institutions, tags, reviews } = useDemoPlatform();
  const institution = institutions.find((item) => item.id === params.id);
  if (!institution) return notFound();

  const { average, count } = getPublicRating(institution, reviews);
  const priceHero = institution.price.trim() ? institution.price : institution.priceRange;
  const mapsQuery = encodeURIComponent(
    `${institution.address} ${institution.neighborhood} ${institution.district} ${institution.city}`,
  );
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const waHref = institutionWhatsAppHref(institution);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <PageNav />

      <header className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
        <div className="relative aspect-[21/9] min-h-[220px] w-full bg-slate-200 md:aspect-[3/1]">
          {institution.images[0] ? (
            <Image
              src={institution.images[0]}
              alt={institution.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <p className="text-sm font-medium text-amber-200/95">{institution.category}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">{institution.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2">
                <RatingStars value={average} size="sm" />
                <span>
                  {average.toFixed(1)} / 5 · {count} değerlendirme
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-start md:p-8">
          <div className="space-y-3 text-slate-700">
            <p className="text-sm leading-relaxed">
              <span className="font-medium text-slate-900">Konum: </span>
              {institution.city} / {institution.district}
              {institution.neighborhood ? ` · ${institution.neighborhood}` : ""}
            </p>
            <p className="text-lg font-semibold text-slate-900">{priceHero}</p>
            <p className="text-sm text-slate-600">{institution.priceRange}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {institution.tags.map((tagId) => (
                <TagBadge key={tagId} label={tags.find((t) => t.id === tagId)?.name ?? tagId} />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp ile yazın
            </a>
            {institution.website ? (
              <a
                href={institution.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Web sitesi
              </a>
            ) : null}
            <a
              href={`tel:${institution.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              {institution.phone}
            </a>
          </div>
        </div>
      </header>

      {institution.images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {institution.images.slice(1).map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative h-36 w-52 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <Image
                src={src}
                alt={`${institution.name} galeri ${i + 2}`}
                fill
                className="object-cover"
                sizes="208px"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DetailSection id="aciklama" title="Kurum hakkında">
            <p className="whitespace-pre-line text-base leading-relaxed">{institution.longDescription}</p>
          </DetailSection>

          <DetailSection title="Eğitim yapısı">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Haftalık ders saati" value={`${institution.weeklyHours} saat`} />
              <Stat label="Toplam program saati" value={`${institution.totalHours} saat`} />
              <Stat label="Birebir ders (dönem)" value={institution.oneToOneLessonCount} />
            </div>
          </DetailSection>

          <DetailSection title="Fiziksel imkanlar">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Derslik sayısı" value={institution.classroomCount} />
              <Stat label="Toplam kontenjan" value={institution.capacity} />
              <Stat label="Sınıf mevcudu (ort.)" value={institution.classSize} />
              <Stat label="Kütüphane kapasitesi" value={institution.libraryCapacity} />
            </div>
          </DetailSection>

          <DetailSection title="Eğitim destekleri">
            <ul className="space-y-2 text-sm">
              <li>
                <span className="font-medium text-slate-900">Yayın desteği: </span>
                {institution.hasPublicationSupport ? "Var" : "Yok"}
              </li>
              <li>
                <span className="font-medium text-slate-900">Deneme sınavı (yıllık plan): </span>
                {institution.examCount}
              </li>
              <li>
                <span className="font-medium text-slate-900">Dijital platform: </span>
                {institution.hasDigitalPlatform
                  ? institution.digitalPlatformInfo || "Evet"
                  : "Belirtilmedi / yok"}
              </li>
            </ul>
          </DetailSection>

          <DetailSection title="Kadro ve rehberlik">
            <p className="whitespace-pre-line leading-relaxed">{institution.teacherInfo}</p>
            <p className="mt-4 text-sm">
              <span className="font-medium text-slate-900">Koçluk oranı: </span>
              {institution.coachingRatio}
            </p>
          </DetailSection>

          <DetailSection id="konum" title="Konum">
            <p className="text-sm leading-relaxed">{institution.address}</p>
            <p className="mt-2 text-sm text-slate-600">
              {institution.neighborhood ? `${institution.neighborhood}, ` : ""}
              {institution.district} / {institution.city}
            </p>
            <Link
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Haritada aç →
            </Link>
          </DetailSection>
        </div>

        <aside className="space-y-6 lg:col-span-1">
          <DetailSection id="degerlendirme" title="Özet puan">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-slate-900">{average.toFixed(1)}</span>
              <div>
                <RatingStars value={average} />
                <p className="mt-1 text-sm text-slate-600">{count} onaylı yorum</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Puanlar, platformdaki onaylı kullanıcı değerlendirmelerine göre hesaplanır. Henüz yorum yoksa kurum
              özeti gösterilir.
            </p>
            <a
              href="#yorumlar-bolumu"
              className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Tüm yorumları gör
            </a>
          </DetailSection>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Programlar</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {institution.programs.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div id="yorumlar-bolumu" className="scroll-mt-28">
        <ReviewSection institutionId={institution.id} />
      </div>
    </div>
  );
}
