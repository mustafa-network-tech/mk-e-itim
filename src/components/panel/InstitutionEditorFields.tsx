"use client";

import type { ReactNode } from "react";
import { ExamNavMultiSelect } from "@/components/panel/ExamNavMultiSelect";
import {
  formatTryAmount,
  getDiscountedPriceFromMin,
  getDiscountRibbonText,
} from "@/lib/discount";
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
                          Fiyat özeti (kart / liste)
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Tek satır fiyat metni
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.price}
                              onChange={(e) => onPatch({ price: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Fiyat aralığı metni
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              value={draft.priceRange}
                              onChange={(e) => onPatch({ priceRange: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Min. fiyat (₺, indirim hesabı)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              step={1}
                              value={draft.minPrice}
                              onChange={(e) =>
                                onPatch({
                                  minPrice: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Max. fiyat (₺)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              step={1}
                              value={draft.maxPrice}
                              onChange={(e) =>
                                onPatch({
                                  maxPrice: Number(e.target.value) || 0,
                                })
                              }
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
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">
                              Öğretmen sayısı (kart)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              step={1}
                              value={draft.teacherCount}
                              onChange={(e) =>
                                onPatch({
                                  teacherCount: Math.max(0, Math.floor(Number(e.target.value) || 0)),
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
                          Kurum sayfası (detay) — «Kurum kartını düzenle» uzun metin
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Bu metin yalnızca kurum detay URL&apos;sinde &quot;Kurum hakkında&quot; bölümünde
                          gösterilir.
                        </p>
                        <label className="mb-1 mt-3 block text-xs font-semibold text-slate-700">
                          Uzun açıklama
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          rows={8}
                          value={draft.longDescription}
                          onChange={(e) =>
                            onPatch({ longDescription: e.target.value })
                          }
                        />
                      </div>

                      <div
                        id={`${sectionIdPrefix}-egitim-yapisi`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-slate-50/90 p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">
                          Eğitim yapısı — kurum detay sayfası
                        </h4>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Haftalık ders saati
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.weeklyHours}
                              onChange={(e) =>
                                onPatch({
                                  weeklyHours: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Toplam program saati
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.totalHours}
                              onChange={(e) =>
                                onPatch({
                                  totalHours: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Birebir ders (dönem)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.oneToOneLessonCount}
                              onChange={(e) =>
                                onPatch({
                                  oneToOneLessonCount: Math.max(
                                    0,
                                    Math.floor(Number(e.target.value) || 0),
                                  ),
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        id={`${sectionIdPrefix}-fiziksel-imkanlar`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-slate-50/90 p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">
                          Fiziksel imkanlar — kurum detay sayfası
                        </h4>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Derslik sayısı
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.classroomCount}
                              onChange={(e) =>
                                onPatch({
                                  classroomCount: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Toplam kontenjan
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.capacity}
                              onChange={(e) =>
                                onPatch({
                                  capacity: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Sınıf mevcudu (ort.)
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.classSize}
                              onChange={(e) =>
                                onPatch({
                                  classSize: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Kütüphane kapasitesi
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.libraryCapacity}
                              onChange={(e) =>
                                onPatch({
                                  libraryCapacity: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        id={`${sectionIdPrefix}-egitim-destekleri`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-white p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">
                          Eğitim destekleri — kurum detay sayfası
                        </h4>
                        <div className="mt-3 space-y-3">
                          <label className="flex items-center gap-2 text-sm text-slate-800">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300"
                              checked={draft.hasPublicationSupport}
                              onChange={(e) =>
                                onPatch({ hasPublicationSupport: e.target.checked })
                              }
                            />
                            Yayın desteği
                          </label>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Deneme sınavı (yıllık plan, adet)
                            </label>
                            <input
                              className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              type="number"
                              min={0}
                              value={draft.examCount}
                              onChange={(e) =>
                                onPatch({
                                  examCount: Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                            />
                          </div>
                          <label className="flex items-center gap-2 text-sm text-slate-800">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300"
                              checked={draft.hasDigitalPlatform}
                              onChange={(e) =>
                                onPatch({ hasDigitalPlatform: e.target.checked })
                              }
                            />
                            Dijital platform var
                          </label>
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-700">
                              Dijital platform açıklaması
                            </label>
                            <input
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              value={draft.digitalPlatformInfo}
                              onChange={(e) =>
                                onPatch({ digitalPlatformInfo: e.target.value })
                              }
                              placeholder="Örn. Canlı ders + ödev takibi"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        id={`${sectionIdPrefix}-kadro-rehberlik`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-slate-50/90 p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">
                          Kadro ve rehberlik — kurum detay sayfası
                        </h4>
                        <label className="mb-1 mt-3 block text-xs font-semibold text-slate-700">
                          Kadro metni
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          rows={5}
                          value={draft.teacherInfo}
                          onChange={(e) => onPatch({ teacherInfo: e.target.value })}
                        />
                        <label className="mb-1 mt-3 block text-xs font-semibold text-slate-700">
                          Koçluk oranı
                        </label>
                        <input
                          className="w-full max-w-md rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          value={draft.coachingRatio}
                          onChange={(e) => onPatch({ coachingRatio: e.target.value })}
                          placeholder="Örn. 1:12"
                        />
                      </div>

                      <div
                        id={`${sectionIdPrefix}-programlar-gorseller`}
                        className="scroll-mt-28 rounded-xl border border-slate-100 bg-white p-4"
                      >
                        <h4 className="text-sm font-bold text-slate-900">Programlar ve görseller</h4>
                        <p className="mt-1 text-xs text-slate-500">
                          Programlar detay sayfası yan sütununda listelenir. Görseller: kapak için ilk satır
                          önemli; her satır bir görsel URL&apos;si.
                        </p>
                        <label className="mb-1 mt-3 block text-xs font-semibold text-slate-700">
                          Programlar (her satır bir program)
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          rows={5}
                          value={(draft.programs ?? []).join("\n")}
                          onChange={(e) =>
                            onPatch({
                              programs: e.target.value
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                        <label className="mb-1 mt-3 block text-xs font-semibold text-slate-700">
                          Görsel URL&apos;leri
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          rows={4}
                          value={(draft.images ?? []).join("\n")}
                          onChange={(e) =>
                            onPatch({
                              images: e.target.value
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
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
                          İndirim <strong>min. fiyat</strong> üzerinden hesaplanır (kart ve detayda
                          gösterilir).
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
                        {draft.discountActive && draft.discountPercent > 0 ? (
                          <p className="mt-2 text-xs text-slate-700">
                            Şerit: <strong>{getDiscountRibbonText(draft)}</strong> · Min:{" "}
                            <span className="line-through opacity-70">
                              {formatTryAmount(draft.minPrice)}
                            </span>{" "}
                            →{" "}
                            <strong>
                              {formatTryAmount(
                                getDiscountedPriceFromMin(
                                  draft.minPrice,
                                  draft.discountPercent,
                                ),
                              )}
                            </strong>
                          </p>
                        ) : null}
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
