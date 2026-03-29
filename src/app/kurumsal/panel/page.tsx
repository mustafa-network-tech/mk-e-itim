"use client";

import { useState } from "react";
import { CorporateSection, CorporateSidebar, StatsCard } from "@/components/panel/Sidebars";
import { ExamNavMultiSelect } from "@/components/panel/ExamNavMultiSelect";
import { INSTITUTION_TYPES_SEED } from "@/data/institutionTypesSeed";
import { InstitutionEditHint } from "@/components/panel/InstitutionEditHint";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { usePanelGate } from "@/hooks/usePanelGate";
import { getPublicRating } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm";

export default function CorporatePanelPage() {
  const { user: panelUser, loading: panelLoading, allowed: panelAllowed } = usePanelGate([
    "institution_manager",
  ]);
  const {
    institutions,
    reviews,
    updateInstitution,
    tags,
    instructors,
    addInstructor,
    removeInstructor,
    updateInstitutionTags,
    institutionTypes,
  } = useDemoPlatform();
  const examTypesForForms =
    institutionTypes.length > 0 ? institutionTypes : INSTITUTION_TYPES_SEED;
  const [activeSection, setActiveSection] = useState<CorporateSection>("overview");
  const [newInstructorName, setNewInstructorName] = useState("");
  const [newInstructorBranch, setNewInstructorBranch] = useState("");

  const ownedInstitutions = institutions.filter((item) => item.ownerUserId === panelUser?.id);
  const institution = ownedInstitutions[0];

  if (panelLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Oturum kontrol ediliyor…</div>;
  }
  if (!panelAllowed || !panelUser) {
    return <div className="mx-auto max-w-4xl px-4 py-10">Bu alana erişim için kurumsal giriş yapın.</div>;
  }

  const institutionReviews = institution
    ? reviews.filter((item) => item.institutionId === institution.id)
    : [];
  const institutionInstructors = institution
    ? instructors.filter((item) => item.institutionId === institution.id)
    : [];
  const score = institution ? getPublicRating(institution, reviews) : { average: 0, count: 0 };

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
      <CorporateSidebar active={activeSection} onChange={setActiveSection} />
      <section className="space-y-4">
        <PageNav />
        <h1 className="text-2xl font-bold">Kurumsal panel</h1>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Yetki özeti</p>
          <p className="mt-1">
            Etiket tanımlama, sınıf seçenekleri, hero görselleri, site sayfa metinleri ve yeni kurum
            kartı oluşturma yalnızca <strong>platform yöneticisi</strong> içindir. Bu panelde size atanmış
            kurumun <strong>metin ve iletişim</strong> alanlarını, kart özetini ve eğitmen satırlarını
            düzenlersiniz.
          </p>
        </div>

        {!institution ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <p className="font-semibold">Henüz kurum kartınız atanmadı</p>
            <p className="mt-2 text-amber-900/90">
              Hesabınız yönetici davetiyle açıldıysa, platform yöneticisi yeni kurum kartını oluştururken
              sizi &quot;kurum yöneticisi&quot; olarak seçmelidir. Atama yapıldığında bu panelde kurum
              bilgileriniz görünür.
            </p>
          </div>
        ) : ownedInstitutions.length > 1 ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            Veri tutarsızlığı: hesabınıza birden fazla kurum bağlı görünüyor. Yalnızca ilki
            düzenlenir; yöneticiden düzeltmesini isteyin.
          </p>
        ) : null}

        {activeSection === "overview" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatsCard label="Kurum" value={institution ? 1 : 0} />
            <StatsCard label="Ortalama puan" value={score.average.toFixed(1)} />
            <StatsCard label="Yorum sayısı" value={institutionReviews.length} />
          </div>
        )}

        {activeSection === "institution-info" && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold text-slate-900">Kurum bilgilerim</h2>
            <InstitutionEditHint variant="corporate" />
            {!institution ? (
              <p className="text-sm text-slate-600">
                Atanmış kurum olunca iletişim ve konum alanlarını buradan düzenlersiniz.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Kurum adı</label>
                  <input
                    className={inputClass}
                    value={institution.name}
                    onChange={(e) => updateInstitution(institution.id, { name: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Resmi statü / tabela ünvanı (ismin altı)
                  </label>
                  <input
                    className={inputClass}
                    value={institution.officialStatus}
                    onChange={(e) =>
                      updateInstitution(institution.id, { officialStatus: e.target.value })
                    }
                    placeholder="Örn. Özel Öğretim Kursu"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Şehir</label>
                  <input
                    className={inputClass}
                    value={institution.city}
                    onChange={(e) => updateInstitution(institution.id, { city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">İlçe</label>
                  <input
                    className={inputClass}
                    value={institution.district}
                    onChange={(e) => updateInstitution(institution.id, { district: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Telefon</label>
                  <input
                    className={inputClass}
                    value={institution.phone}
                    onChange={(e) => updateInstitution(institution.id, { phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Web sitesi</label>
                  <input
                    className={inputClass}
                    value={institution.website}
                    onChange={(e) => updateInstitution(institution.id, { website: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">WhatsApp</label>
                  <input
                    className={inputClass}
                    value={institution.whatsapp}
                    onChange={(e) => updateInstitution(institution.id, { whatsapp: e.target.value })}
                    placeholder="Ülke kodlu numara"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "card-info" && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold text-slate-900">Kart bilgileri</h2>
            <p className="text-xs text-slate-600">
              Listelerde ve küçük kartta görünen kategori ve kısa özet. Program / fiyat özetleri yönetici
              kaydından gelir.
            </p>
            {!institution ? (
              <p className="text-sm text-slate-600">Kurum atanınca bu bölüm dolar.</p>
            ) : (
              <>
                <div className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50/90 p-3 text-sm sm:grid-cols-3">
                  <p>
                    <span className="text-slate-500">Programlar: </span>
                    {institution.programs.length ? institution.programs.join(", ") : "—"}
                  </p>
                  <p>
                    <span className="text-slate-500">Fiyat aralığı: </span>₺
                    {institution.minPrice.toLocaleString("tr-TR")} – ₺
                    {institution.maxPrice.toLocaleString("tr-TR")}
                  </p>
                  <p>
                    <span className="text-slate-500">Eğitmen (özet): </span>
                    {institution.teacherCount}
                  </p>
                  <p className="sm:col-span-3 text-xs text-slate-500">
                    Bu üç alanı değiştirmek için platform yöneticinize başvurun.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    Kurum türleri (en az biri zorunlu)
                  </label>
                  <ExamNavMultiSelect
                    types={examTypesForForms}
                    idPrefix={`corp-inst-${institution.id}`}
                    value={institution.examNavIds}
                    onChange={(next) => updateInstitution(institution.id, { examNavIds: next })}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Kısa özet (kart)</label>
                  <textarea
                    className={inputClass}
                    rows={4}
                    value={institution.shortDescription}
                    onChange={(e) =>
                      updateInstitution(institution.id, { shortDescription: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeSection === "edit-card" && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold text-slate-900">Kurum kartını düzenle</h2>
            <p className="text-xs text-slate-600">
              Detay sayfası metni, sitede görünen etiketler ve eğitmen satırları.
            </p>
            {!institution ? (
              <p className="text-sm text-slate-600">Kurum atanınca düzenleme alanları açılır.</p>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Uzun açıklama</label>
                  <textarea
                    className={inputClass}
                    rows={8}
                    value={institution.longDescription}
                    onChange={(e) =>
                      updateInstitution(institution.id, { longDescription: e.target.value })
                    }
                  />
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold">Etiketler</p>
                  <p className="mb-2 text-xs text-slate-500">
                    Yeni etiket tanımı yalnızca admin panelindedir.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const active = institution.tags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() =>
                            updateInstitutionTags(
                              institution.id,
                              active
                                ? institution.tags.filter((t) => t !== tag.id)
                                : [...institution.tags, tag.id],
                            )
                          }
                          className={`rounded-full px-3 py-1 text-xs ${
                            active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-sm font-semibold">Eğitmenler</p>
                  <div className="space-y-2">
                    {institutionInstructors.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 p-2 text-sm"
                      >
                        <span>
                          {item.name} – {item.branch}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeInstructor(item.id)}
                          className="rounded-md bg-rose-100 px-2 py-1 text-rose-700"
                        >
                          Çıkar
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <input
                      className={inputClass}
                      placeholder="Eğitmen adı"
                      value={newInstructorName}
                      onChange={(e) => setNewInstructorName(e.target.value)}
                    />
                    <input
                      className={inputClass}
                      placeholder="Branş"
                      value={newInstructorBranch}
                      onChange={(e) => setNewInstructorBranch(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        if (!newInstructorName.trim() || !newInstructorBranch.trim()) return;
                        addInstructor(institution.id, newInstructorName, newInstructorBranch);
                        setNewInstructorName("");
                        setNewInstructorBranch("");
                      }}
                    >
                      Eğitmen ekle
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeSection === "reviews-ratings" && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold">Yorumlar ve puanlar</h2>
            <p className="text-xs text-slate-500">
              Yorumları görüntüleyebilirsiniz; onay / red işlemleri yalnızca platform yöneticisindedir.
            </p>
            {institutionReviews.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz yorum yok.</p>
            ) : (
              institutionReviews.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-semibold">
                    {item.userName} • {item.rating} yıldız
                  </p>
                  <p>{item.comment}</p>
                  <p className="text-xs text-slate-500">Durum: {item.status}</p>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}
