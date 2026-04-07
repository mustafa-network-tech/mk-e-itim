"use client";

import type { ReactNode } from "react";
import { ExamNavMultiSelect } from "@/components/panel/ExamNavMultiSelect";
import { InstitutionImagesField } from "@/components/panel/InstitutionImagesField";
import {
  formatTryPriceRange,
  getDiscountedPriceFromMin,
  getDiscountRibbonText,
  syncInstitutionPriceDisplayFields,
} from "@/lib/discount";
import {
  longDescriptionFromAboutCards,
  INSTITUTION_ABOUT_CARD_TITLES,
  normalizeAboutCards,
} from "@/lib/institutionAboutCards";
import {
  createEmptyProgramCardRow,
  INSTITUTION_PROGRAM_CARD_MAX,
  INSTITUTION_PROGRAM_CARD_MIN,
  normalizeProgramCards,
  programsArrayFromProgramCards,
  PROGRAM_MODAL_ITEM_COUNT,
} from "@/lib/institutionProgramCards";
import type {
  GradeLevel,
  Institution,
  InstitutionTypeDef,
  Instructor,
  Tag,
} from "@/types";

export type InstitutionEditorFieldsProps = {
  draft: Institution;
  onPatch: (patch: Partial<Institution>) => void;
  examTypesForForms: InstitutionTypeDef[];
  sectionIdPrefix: string;
  fieldIdPrefix: string;
  tags: Tag[];
  gradeLevels: GradeLevel[];
  allowCreateTag: boolean;
  newCardTagName: string;
  setNewCardTagName: (v: string) => void;
  createTag: (name: string) => string | null | Promise<string | null>;
  instructors: Instructor[];
  newInstructorName: string;
  setNewInstructorName: (v: string) => void;
  newInstructorBranch: string;
  setNewInstructorBranch: (v: string) => void;
  addInstructor: (institutionId: string, name: string, branch: string) => void | Promise<void>;
  removeInstructor: (instructorId: string) => void | Promise<void>;
  showListingVisibility: boolean;
  children?: ReactNode;
};

export function InstitutionEditorFields({
  draft,
  onPatch,
  examTypesForForms,
  sectionIdPrefix,
  fieldIdPrefix,
  tags,
  gradeLevels,
  allowCreateTag,
  newCardTagName,
  setNewCardTagName,
  createTag,
  instructors,
  newInstructorName,
  setNewInstructorName,
  newInstructorBranch,
  setNewInstructorBranch,
  addInstructor,
  removeInstructor,
  showListingVisibility,
  children,
}: InstitutionEditorFieldsProps) {
  return (
    <div className="space-y-6">
<div
                        id={`${sectionIdPrefix}-kurum-bilgileri`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-slate-50/90 p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">
                          Kurum bilgileri (iletişim) — kurumsal «Kurum bilgilerim»
                        </h4>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Kurum adı
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.name}
                              onChange={(e) => onPatch({ name: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Resmi statü / tabela ünvanı (ismin altı)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.officialStatus}
                              onChange={(e) => onPatch({ officialStatus: e.target.value })}
                              placeholder="Örn. Özel Öğretim Kursu"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">Şehir</label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.city}
                              onChange={(e) => onPatch({ city: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">İlçe</label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.district}
                              onChange={(e) => onPatch({ district: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Mahalle (detay «Konum»)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.neighborhood}
                              onChange={(e) => onPatch({ neighborhood: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Açık adres (detay sayfası)
                            </label>
                            <textarea
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              rows={2}
                              value={draft.address}
                              onChange={(e) => onPatch({ address: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Telefon
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.phone}
                              onChange={(e) => onPatch({ phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Web sitesi
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.website}
                              onChange={(e) => onPatch({ website: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              WhatsApp
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.whatsapp}
                              onChange={(e) => onPatch({ whatsapp: e.target.value })}
                              placeholder="Ülke kodlu numara"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        id={`${sectionIdPrefix}-kart-bilgileri`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-slate-50/90 p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">
                          Liste ve kartta görünenler — kurumsal «Kart bilgileri»
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Kurum türleri: LGS, YKS, … üst menü ve listeleme filtresiyle aynıdır. En az biri
                          zorunludur; çoklu seçimde kurum ilgili her menüde görünür. Kart metni otomatik
                          üretilir.
                        </p>
                        <div className="mt-3">
                          <ExamNavMultiSelect
                            types={examTypesForForms}
                            idPrefix={fieldIdPrefix}
                            value={draft.examNavIds}
                            onChange={(next) => onPatch({ examNavIds: next })}
                          />
                        </div>
                        <label className="mb-1 mt-3 block text-xs font-semibold text-slate-700">
                          Kısa özet (kartta ~2 satır)
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          rows={3}
                          value={draft.shortDescription}
                          onChange={(e) =>
                            onPatch({ shortDescription: e.target.value })
                          }
                        />
                        <p className="mb-1 mt-4 block text-xs font-semibold text-slate-700">
                          Fiyat aralığı (₺)
                        </p>
                        <p className="mb-2 text-xs text-slate-500">
                          Kart ve detayda yalnızca bu aralık gösterilir; kayıtta metin alanları otomatik eşitlenir.
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              En düşük (₺)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              step={1}
                              value={draft.minPrice}
                              onChange={(e) => {
                                const minPrice = Number(e.target.value) || 0;
                                onPatch({
                                  ...syncInstitutionPriceDisplayFields(minPrice, draft.maxPrice),
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              En yüksek (₺)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              step={1}
                              value={draft.maxPrice}
                              onChange={(e) => {
                                const maxPrice = Number(e.target.value) || 0;
                                onPatch({
                                  ...syncInstitutionPriceDisplayFields(draft.minPrice, maxPrice),
                                });
                              }}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Özet puan (yorum yoksa)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              value={draft.rating}
                              onChange={(e) =>
                                onPatch({
                                  rating: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Yorum sayısı (yorum yoksa gösterim)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              step={1}
                              value={draft.reviewCount}
                              onChange={(e) =>
                                onPatch({
                                  reviewCount: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        id={`${sectionIdPrefix}-detay-metni`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-white p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">
                          Kurum genel bilgileri — 8 kart
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Detayda «Kurum genel bilgileri» altında 2 sütunlu grid. Başlıklar sabit; yalnızca alt metin
                          düzenlenir. Boş metin — gösterilir.
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {normalizeAboutCards(draft.aboutCards).map((card, i) => (
                            <div
                              key={i}
                              className="rounded-lg border border-slate-200 bg-slate-50/90 p-3"
                            >
                              <p className="mb-2 text-sm font-semibold leading-snug text-slate-900">
                                {INSTITUTION_ABOUT_CARD_TITLES[i]}
                              </p>
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Alt metin
                              </label>
                              <textarea
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                rows={3}
                                value={card.body}
                                onChange={(e) => {
                                  const list = normalizeAboutCards(draft.aboutCards);
                                  list[i] = { ...list[i], body: e.target.value };
                                  onPatch({
                                    aboutCards: list,
                                    longDescription: longDescriptionFromAboutCards(list),
                                  });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <label className="mb-1 mt-4 block text-xs font-semibold text-slate-700">
                          Kurum hakkında (serbest metin)
                        </label>
                        <p className="mb-2 text-xs text-slate-500">
                          Detayda «Kurum genel bilgileri» ile «Programlar» arasında gösterilir; boş bırakılabilir.
                        </p>
                        <textarea
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          rows={5}
                          value={draft.aboutInstitution ?? ""}
                          onChange={(e) => onPatch({ aboutInstitution: e.target.value })}
                          placeholder="Kurumunuzu anlatan metin…"
                        />
                      </div>

                      <div
                        id={`${sectionIdPrefix}-programlar-gorseller`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-white p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">Programlar ve görseller</h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Programlar: en az 2, en fazla 8 kart; başlık listede ve WhatsApp teklifinde kullanılır.
                          Modala 8 şeffaf kutu yansır. Görseller: kapak için ilk satır önemli.
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {normalizeProgramCards(draft.programCards).map((card, i) => (
                            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-600">Program {i + 1}</p>
                                {normalizeProgramCards(draft.programCards).length >
                                INSTITUTION_PROGRAM_CARD_MIN ? (
                                  <button
                                    type="button"
                                    className="rounded-md border border-rose-200 bg-white px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
                                    onClick={() => {
                                      const list = normalizeProgramCards(draft.programCards);
                                      list.splice(i, 1);
                                      const next = normalizeProgramCards(list);
                                      onPatch({
                                        programCards: next,
                                        programs: programsArrayFromProgramCards(next),
                                      });
                                    }}
                                  >
                                    Kaldır
                                  </button>
                                ) : null}
                              </div>
                              <label className="mb-1 block text-xs font-semibold text-slate-700">
                                Kart başlığı
                              </label>
                              <input
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                value={card.title}
                                onChange={(e) => {
                                  const list = normalizeProgramCards(draft.programCards);
                                  list[i] = { ...list[i], title: e.target.value };
                                  onPatch({
                                    programCards: list,
                                    programs: programsArrayFromProgramCards(list),
                                  });
                                }}
                              />
                              <p className="mb-1 mt-3 text-xs font-semibold text-slate-700">
                                Modal kutuları (8)
                              </p>
                              <div className="space-y-3">
                                {Array.from({ length: PROGRAM_MODAL_ITEM_COUNT }, (_, j) => (
                                  <div
                                    key={j}
                                    className="rounded-lg border border-slate-200/80 bg-white/90 px-2 py-2 sm:px-3"
                                  >
                                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                      Kutu {j + 1}
                                    </p>
                                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                                      Başlık
                                    </label>
                                    <input
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                      value={card.modalItems[j]?.title ?? ""}
                                      placeholder={`Başlık ${j + 1}`}
                                      onChange={(e) => {
                                        const list = normalizeProgramCards(draft.programCards);
                                        const items = list[i].modalItems.map((m) => ({ ...m }));
                                        items[j] = { ...items[j], title: e.target.value };
                                        list[i] = { ...list[i], modalItems: items };
                                        onPatch({
                                          programCards: list,
                                          programs: programsArrayFromProgramCards(list),
                                        });
                                      }}
                                    />
                                    <label className="mb-1 mt-2 block text-xs font-semibold text-slate-700">
                                      Alt metin
                                    </label>
                                    <input
                                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                      value={card.modalItems[j]?.subtitle ?? ""}
                                      placeholder="Kısa açıklama"
                                      onChange={(e) => {
                                        const list = normalizeProgramCards(draft.programCards);
                                        const items = list[i].modalItems.map((m) => ({ ...m }));
                                        items[j] = { ...items[j], subtitle: e.target.value };
                                        list[i] = { ...list[i], modalItems: items };
                                        onPatch({
                                          programCards: list,
                                          programs: programsArrayFromProgramCards(list),
                                        });
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={
                            normalizeProgramCards(draft.programCards).length >=
                            INSTITUTION_PROGRAM_CARD_MAX
                          }
                          onClick={() => {
                            const list = normalizeProgramCards(draft.programCards);
                            if (list.length >= INSTITUTION_PROGRAM_CARD_MAX) return;
                            const next = [...list, createEmptyProgramCardRow()];
                            onPatch({
                              programCards: next,
                              programs: programsArrayFromProgramCards(next),
                            });
                          }}
                          className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Program ekle (
                          {normalizeProgramCards(draft.programCards).length}/
                          {INSTITUTION_PROGRAM_CARD_MAX})
                        </button>
                        <label className="mb-1 mt-3 block text-xs font-semibold text-slate-700">
                          Kurum fotoğrafları
                        </label>
                        <InstitutionImagesField
                          institutionId={draft.id}
                          images={draft.images ?? []}
                          onChange={(urls) => onPatch({ images: urls })}
                          fieldId={`${fieldIdPrefix}-institution-images`}
                          textareaRows={4}
                        />
                      </div>

                      {showListingVisibility ? (
                        <div
                          id={`${sectionIdPrefix}-liste-gorunurluk`}
                          className="scroll-mt-28 rounded-xl border border-slate-100 bg-slate-50/90 p-4"
                        >
                          <h4 className="text-sm font-bold text-slate-900">Liste ve vitrin</h4>
                          <div className="mt-3 flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-800">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300"
                                checked={draft.featured}
                                onChange={(e) => onPatch({ featured: e.target.checked })}
                              />
                              Öne çıkan
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate-800">
                              <input
                                type="checkbox"
                                className="rounded border-slate-300"
                                checked={draft.topVisible ?? true}
                                onChange={(e) =>
                                  onPatch({ topVisible: e.target.checked })
                                }
                              />
                              Üst vitrinde göster
                            </label>
                          </div>
                        </div>
                      ) : null}

                      <div
                        id={`${sectionIdPrefix}-indirim-etiket`}
                        className="scroll-mt-28 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3"
                      >
                        <p className="text-sm font-bold text-slate-900">
                          Kursiyera indirimi — «Kurum kartını düzenle» (kampanya)
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          İndirim fiyat aralığının <strong>her iki ucuna</strong> aynı yüzde uygulanır.
                        </p>
                        <label className="mt-2 flex items-center gap-2 text-sm text-slate-800">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={draft.discountActive}
                            onChange={(e) =>
                              onPatch({ discountActive: e.target.checked })
                            }
                          />
                          Kampanya aktif
                        </label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              İndirim (%)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              max={95}
                              value={draft.discountPercent}
                              onChange={(e) =>
                                onPatch({
                                  discountPercent: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Şerit metni (boş = otomatik)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              value={draft.discountText}
                              onChange={(e) =>
                                onPatch({ discountText: e.target.value })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Başlangıç
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              type="date"
                              value={draft.discountStartDate}
                              onChange={(e) =>
                                onPatch({
                                  discountStartDate: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Bitiş
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              type="date"
                              value={draft.discountEndDate}
                              onChange={(e) =>
                                onPatch({ discountEndDate: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        {draft.discountActive && draft.discountPercent > 0
                          ? (() => {
                              const s = syncInstitutionPriceDisplayFields(
                                draft.minPrice,
                                draft.maxPrice,
                              );
                              const p = draft.discountPercent;
                              return (
                                <p className="mt-2 text-xs text-slate-700">
                                  Şerit: <strong>{getDiscountRibbonText(draft)}</strong> · Aralık:{" "}
                                  <span className="line-through opacity-70">
                                    {formatTryPriceRange(s.minPrice, s.maxPrice)}
                                  </span>{" "}
                                  →{" "}
                                  <strong>
                                    {formatTryPriceRange(
                                      getDiscountedPriceFromMin(s.minPrice, p),
                                      getDiscountedPriceFromMin(s.maxPrice, p),
                                    )}
                                  </strong>
                                </p>
                              );
                            })()
                          : null}
                      </div>
                      <div id={`${sectionIdPrefix}-etiket-sinif-egitmen`} className="scroll-mt-28">
                        <p className="mb-1 text-sm font-semibold">
                          Etiketler, hedef sınıflar, eğitmenler — «Kurum kartını düzenle»
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const active = draft.tags.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() =>
                                  onPatch({
                                    tags: active
                                      ? draft.tags.filter((t) => t !== tag.id)
                                      : [...draft.tags, tag.id],
                                  })
                                }
                                className={`rounded-full px-3 py-1 text-xs ${
                                  active
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {tag.name}
                              </button>
                            );
                          })}
                        </div>
                        {allowCreateTag ? (
                          <div className="mt-2 flex gap-2">
                            <input
                              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              placeholder="Yeni etiket adı"
                              value={newCardTagName}
                              onChange={(e) => setNewCardTagName(e.target.value)}
                            />
                            <button
                              type="button"
                              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                              onClick={() => {
                                void (async () => {
                                  if (!newCardTagName.trim()) return;
                                  const newTagId = await createTag(newCardTagName);
                                  if (newTagId && !draft.tags.includes(newTagId)) {
                                    onPatch({ tags: [...draft.tags, newTagId] });
                                  }
                                  setNewCardTagName("");
                                })();
                              }}
                            >
                              Etiket Ekle
                            </button>
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500">
                            Yeni etiket tanımı yalnızca platform yöneticisi içindir.
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold">Hedef sınıflar</p>
                        <p className="mb-2 text-xs text-slate-500">
                          Hero ve listelemede sınıf filtresi bu seçimlere göre çalışır.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {gradeLevels.map((gl) => {
                            const active = draft.gradeLevelIds.includes(gl.id);
                            return (
                              <button
                                key={gl.id}
                                type="button"
                                onClick={() =>
                                  onPatch({
                                    gradeLevelIds: active
                                      ? draft.gradeLevelIds.filter((id) => id !== gl.id)
                                      : [...draft.gradeLevelIds, gl.id],
                                  })
                                }
                                className={`rounded-full px-3 py-1 text-xs ${
                                  active
                                    ? "bg-amber-700 text-white"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {gl.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold">Eğitmenler</p>
                        <div className="space-y-2">
                          {instructors.map((ins) => (
                            <div
                              key={ins.id}
                              className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm"
                            >
                              <span>
                                {ins.name} - {ins.branch}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeInstructor(ins.id)}
                                className="rounded-md bg-rose-100 px-2 py-1 text-rose-700"
                              >
                                Çıkar
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                          <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="Eğitmen adı"
                            value={newInstructorName}
                            onChange={(e) => setNewInstructorName(e.target.value)}
                          />
                          <input
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            placeholder="Branş"
                            value={newInstructorBranch}
                            onChange={(e) => setNewInstructorBranch(e.target.value)}
                          />
                          <button
                            type="button"
                            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                            onClick={() => {
                              if (!newInstructorName.trim() || !newInstructorBranch.trim()) return;
                              addInstructor(draft.id, newInstructorName, newInstructorBranch);
                              setNewInstructorName("");
                              setNewInstructorBranch("");
                            }}
                          >
                            Eğitmen Ekle
                          </button>
                        </div>
                      </div>
      {children}
    </div>
  );
}
