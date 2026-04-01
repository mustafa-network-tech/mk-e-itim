"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { RatingStars } from "@/components/ui/RatingStars";
import { TagBadge } from "@/components/ui/TagBadge";
import { getPublicRating, institutionWhatsAppHref } from "@/lib/institutions";
import { KURSIYERA_TEKLIF_WHATSAPP_MESSAGE } from "@/lib/discount";
import {
  InstitutionDetailDiscountBand,
  InstitutionPriceBlock,
} from "@/components/institution/InstitutionPriceBlock";
import { InstitutionProgramCardsSection } from "@/components/institution/InstitutionProgramCardsSection";
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

export function InstitutionDetailClient() {
  const params = useParams<{ id: string }>();
  const { institutions, tags, reviews } = useDemoPlatform();
  const institution = institutions.find((item) => item.id === params.id);
  if (!institution) return notFound();

  const { average, count } = getPublicRating(institution, reviews);
  const mapsQuery = encodeURIComponent(
    `${institution.address} ${institution.neighborhood} ${institution.district} ${institution.city}`,
  );
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const waHref = institutionWhatsAppHref(institution, KURSIYERA_TEKLIF_WHATSAPP_MESSAGE);

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
        </div>

        <InstitutionDetailDiscountBand institution={institution} />

        <div className="border-t border-slate-100 px-6 py-5 md:px-8">
          <p className="text-sm font-medium text-amber-800">{institution.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{institution.name}</h1>
          {institution.officialStatus.trim() ? (
            <p className="mt-2 max-w-3xl text-sm leading-snug text-slate-600 md:text-[0.9375rem]">
              {institution.officialStatus.trim()}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2">
              <RatingStars value={average} size="sm" />
              <span>
                {average.toFixed(1)} / 5 · {count} değerlendirme
              </span>
            </span>
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
          <section
            id="genel-bilgiler"
            className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
            aria-label="Konum, fiyat ve iletişim"
          >
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
              <div className="space-y-3 text-slate-700">
                <p className="text-sm leading-relaxed">
                  <span className="font-medium text-slate-900">Konum: </span>
                  {institution.city} / {institution.district}
                  {institution.neighborhood ? ` · ${institution.neighborhood}` : ""}
                </p>
                <InstitutionPriceBlock institution={institution} variant="detailLight" />
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
                  Teklif Al
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
          </section>

          <section
            id="aciklama"
            className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
            aria-labelledby="kurum-genel-bilgileri-heading"
          >
            <h2 id="kurum-genel-bilgileri-heading" className="text-lg font-semibold tracking-tight text-slate-900">
              Kurum genel bilgileri
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {institution.aboutCards.map((card, i) => (
                <div
                  key={i}
                  className="flex min-h-[7rem] flex-col rounded-xl border border-slate-100 bg-slate-50/90 p-4"
                >
                  {card.title.trim() ? (
                    <h3 className="text-sm font-semibold text-slate-900">{card.title.trim()}</h3>
                  ) : null}
                  <p
                    className={`whitespace-pre-line text-sm leading-relaxed text-slate-700 ${
                      card.title.trim() ? "mt-2" : ""
                    }`}
                  >
                    {card.body.trim() ? card.body.trim() : "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            id="kurum-hakkinda"
            className="scroll-mt-28 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6"
            aria-labelledby="kurum-hakkinda-heading"
          >
            <h2 id="kurum-hakkinda-heading" className="text-lg font-semibold tracking-tight text-slate-900">
              Kurum hakkında
            </h2>
            <div className="mt-4 text-sm leading-relaxed text-slate-700">
              {institution.aboutInstitution.trim() ? (
                <p className="whitespace-pre-line">{institution.aboutInstitution.trim()}</p>
              ) : (
                <p className="text-slate-500">Bu alan kurum tarafından henüz doldurulmadı.</p>
              )}
            </div>
          </section>

          <InstitutionProgramCardsSection cards={institution.programCards} />

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
        </aside>
      </div>

      <div id="yorumlar-bolumu" className="scroll-mt-28">
        <ReviewSection institutionId={institution.id} />
      </div>
    </div>
  );
}
