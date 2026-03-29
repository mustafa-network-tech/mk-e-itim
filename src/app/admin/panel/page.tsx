"use client";

import { useEffect, useRef, useState } from "react";
import { InstitutionEditorFields } from "@/components/panel/InstitutionEditorFields";
import { InstitutionForm } from "@/components/panel/InstitutionForm";
import { AdminSection, AdminSidebar, StatsCard } from "@/components/panel/Sidebars";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { usePanelGate } from "@/hooks/usePanelGate";
import {
  buildInstitutionPersistencePayload,
  formatInstitutionSaveError,
} from "@/lib/institutionSavePayload";
import { getPublicRating } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";
import { InstitutionEditHint } from "@/components/panel/InstitutionEditHint";
import { INSTITUTION_TYPES_SEED, sortInstitutionTypes } from "@/data/institutionTypesSeed";
import type { AdvisorStepKey } from "@/types/advisor";
import type { Institution } from "@/types";

const ADVISOR_STEP_HINT: Record<AdvisorStepKey, string> = {
  city: "Kullanıcı şehir yazar; listede yoksa uyarı verilir.",
  district: "Şehre göre ilçe listesi; seçim zorunlu.",
  grade: "Sınıf düğmeleri; veri sınıf seçeneklerinden gelir.",
  subject: "Ders etiketleri + «Atla»; isteğe bağlı filtre.",
  price: "Üç sabit fiyat aralığı; serbest giriş yok.",
};

export default function AdminPanelPage() {
  const { user: panelUser, loading: panelLoading, allowed: panelAllowed } = usePanelGate(["admin"]);
  const {
    institutions,
    users,
    reviews,
    tags,
    gradeLevels,
    heroSlides,
    instructors,
    createTag,
    createManager,
    addGradeLevel,
    removeGradeLevel,
    toggleFeatured,
    deleteInstitution,
    updateReviewStatus,
    addHeroSlide,
    removeHeroSlide,
    addInstructor,
    removeInstructor,
    updateInstitutionTags,
    updateInstitution,
    approveInstitutionPending,
    clearInstitutionPending,
    setInstitutionListed,
    staticPages,
    updateStaticPage,
    advisorQuestions,
    updateAdvisorQuestion,
    institutionTypes,
    updateInstitutionType,
    platformLoading,
  } = useDemoPlatform();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [moderationMessage, setModerationMessage] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [showNewInstitutionForm, setShowNewInstitutionForm] = useState(false);
  const [newInstructorName, setNewInstructorName] = useState("");
  const [newInstructorBranch, setNewInstructorBranch] = useState("");
  const [newCardTagName, setNewCardTagName] = useState("");
  const [newGradeLevelLabel, setNewGradeLevelLabel] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [tagActionMessage, setTagActionMessage] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState("");
  const [institutionTypeDrafts, setInstitutionTypeDrafts] = useState<
    Record<string, { label: string; sortOrder: string }>
  >({});
  const [institutionEditDraft, setInstitutionEditDraft] = useState<Institution | null>(null);
  const [institutionDraftDirty, setInstitutionDraftDirty] = useState(false);
  const [institutionFormMessage, setInstitutionFormMessage] = useState<string | null>(null);
  const [institutionSaveBusy, setInstitutionSaveBusy] = useState(false);
  const institutionDraftDirtyRef = useRef(false);
  const prevSelectedInstitutionIdRef = useRef<string>("");

  const examTypesForForms =
    institutionTypes.length > 0 ? institutionTypes : INSTITUTION_TYPES_SEED;

  const openNewInstitutionForm = () => {
    setShowNewInstitutionForm(true);
    queueMicrotask(() =>
      document.getElementById("admin-yeni-kurum")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  };

  useEffect(() => {
    const next: Record<string, { label: string; sortOrder: string }> = {};
    for (const t of institutionTypes) {
      next[t.id] = { label: t.label, sortOrder: String(t.sortOrder) };
    }
    setInstitutionTypeDrafts(next);
  }, [institutionTypes]);

  useEffect(() => {
    if (selectedInstitutionId !== prevSelectedInstitutionIdRef.current) {
      institutionDraftDirtyRef.current = false;
      setInstitutionDraftDirty(false);
      prevSelectedInstitutionIdRef.current = selectedInstitutionId;
    }
    if (!selectedInstitutionId) {
      setInstitutionEditDraft(null);
      setInstitutionDraftDirty(false);
      return;
    }
    const row = institutions.find((i) => i.id === selectedInstitutionId);
    if (!row) return;
    if (!institutionDraftDirtyRef.current) {
      setInstitutionEditDraft({ ...row });
      setInstitutionDraftDirty(false);
    }
    /** institutionDraftDirty: Kayıt sonrası liste referansı değişmese bile taslak sunucu satırıyla hizalanır. */
  }, [selectedInstitutionId, institutions, institutionDraftDirty]);

  const patchInstitutionDraft = (patch: Partial<Institution>) => {
    institutionDraftDirtyRef.current = true;
    setInstitutionDraftDirty(true);
    setInstitutionFormMessage(null);
    setInstitutionEditDraft((d) => (d ? { ...d, ...patch } : null));
  };

  const handleSaveInstitutionDraft = async () => {
    if (!institutionEditDraft) return;
    const d = institutionEditDraft;
    setInstitutionSaveBusy(true);
    try {
      setInstitutionFormMessage("Kaydediliyor…");
      const r1 = await updateInstitution(d.id, buildInstitutionPersistencePayload(d));
      if (!r1.ok) {
        setInstitutionFormMessage(`Kayıt başarısız: ${formatInstitutionSaveError(r1.message)}`);
        return;
      }
      const r2 = await updateInstitutionTags(d.id, d.tags);
      if (!r2.ok) {
        setInstitutionFormMessage(`Kayıt başarısız: ${formatInstitutionSaveError(r2.message)}`);
        return;
      }
      institutionDraftDirtyRef.current = false;
      setInstitutionDraftDirty(false);
      setInstitutionFormMessage("Kayıt tamamlandı.");
      setTimeout(() => setInstitutionFormMessage(null), 4000);
    } finally {
      setInstitutionSaveBusy(false);
    }
  };

  const handleCancelInstitutionDraft = () => {
    const row = institutions.find((i) => i.id === selectedInstitutionId);
    institutionDraftDirtyRef.current = false;
    setInstitutionDraftDirty(false);
    setInstitutionEditDraft(row ? { ...row } : null);
    setInstitutionFormMessage("Taslak sıfırlandı (sunucudaki son hâl).");
    setTimeout(() => setInstitutionFormMessage(null), 3500);
  };

  if (panelLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Oturum kontrol ediliyor…</div>;
  }
  if (!panelAllowed || !panelUser) {
    return <div className="mx-auto max-w-4xl px-4 py-10">Bu alana erişim için admin girişi yapın.</div>;
  }

  const avgRating =
    institutions.length === 0
      ? 0
      : institutions.reduce((acc, item) => acc + getPublicRating(item, reviews).average, 0) /
        institutions.length;

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
      <AdminSidebar active={activeSection} onChange={setActiveSection} />
      <section className="space-y-4">
        <PageNav />
        <h1 className="text-2xl font-bold">Admin Paneli</h1>
        {activeSection === "dashboard" && (
          <div className="grid gap-3 sm:grid-cols-5">
            <StatsCard label="Toplam Kurum" value={institutions.length} />
            <StatsCard
              label="Toplam Yönetici"
              value={users.filter((u) => u.role === "institution_manager").length}
            />
            <StatsCard label="Toplam Yorum" value={reviews.length} />
            <StatsCard label="Ort. Puan" value={avgRating.toFixed(1)} />
            <StatsCard label="Öne Çıkan" value={institutions.filter((i) => i.featured).length} />
          </div>
        )}

        {activeSection === "institutions" && (
          <>
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-slate-900">Kurum düzenlemesi</h2>
              <InstitutionEditHint variant="admin" />
              <div className="rounded-xl border border-sky-100 bg-sky-50/90 px-4 py-3 text-xs leading-relaxed text-slate-700">
                <p className="font-semibold text-slate-900">
                  Kurumsal paneldeki menülerin admin karşılığı
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>
                    <strong>Kurum bilgilerim</strong> → Kurumu listeden seçtikten sonra aşağıda{" "}
                    <strong>Kurum bilgileri (iletişim)</strong> kutusu (tür, ad, şehir, iletişim).
                  </li>
                  <li>
                    <strong>Kart bilgileri</strong> → <strong>Liste ve kartta görünenler</strong> (kategori,
                    kısa özet).
                  </li>
                  <li>
                    <strong>Kurum kartını düzenle</strong> → Uzun metin, eğitim yapısı, fiziksel imkanlar,
                    destekler, kadro, programlar, görseller, indirim, etiketler, sınıflar ve eğitmenler.
                  </li>
                </ul>
                <p className="mt-2 border-t border-sky-100/80 pt-2 text-slate-600">
                  Sayfa açıldığında yalnızca <strong>kurum listesi</strong> görünür. Yeni kayıt formu
                  kapalıdır; <strong>Yeni kurum formunu aç</strong> ile açılır. Mevcut kurumda tüm detay
                  alanları (fiziksel imkanlar, programlar, konum vb.) seçip düzenledikten sonra{" "}
                  <strong>Kaydet</strong> kullanın — sizin için bu işlem <strong>anında geçerlidir</strong>{" "}
                  (kurum yöneticisindeki «onaya gönder» gibi ara adım yoktur).
                </p>
              </div>
              <nav
                className="flex flex-wrap gap-2 text-xs font-medium text-slate-700"
                aria-label="Kurum sayfası bölümleri"
              >
                <a
                  href="#admin-onay-bekleyen"
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-950 hover:bg-amber-100"
                >
                  Yönetici onayı
                </a>
                <a
                  href="#admin-kurum-listesi"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
                >
                  Kurum listesi
                </a>
                <a
                  href="#admin-yeni-kurum"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50"
                  onClick={(e) => {
                    e.preventDefault();
                    openNewInstitutionForm();
                  }}
                >
                  Yeni kurum
                </a>
                <a
                  href="#admin-kurum-duzenle"
                  className={`rounded-lg border px-3 py-1.5 ${
                    selectedInstitutionId
                      ? "border-slate-200 bg-white hover:bg-slate-50"
                      : "cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400"
                  }`}
                  aria-disabled={!selectedInstitutionId}
                  onClick={(e) => {
                    if (!selectedInstitutionId) e.preventDefault();
                  }}
                >
                  Seçili kurum düzenleme
                </a>
              </nav>
            </div>
            <div
              id="admin-onay-bekleyen"
              className="scroll-mt-24 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950"
            >
              <h3 className="text-base font-bold text-amber-950">Kurum yöneticisi — onay bekleyen talepler</h3>
              <p className="mt-2 text-xs leading-relaxed text-amber-950/90">
                <strong>Genel admin</strong> olarak yeni kurum oluşturduğunuzda veya listeden bir kurumu
                düzenleyip <strong>Kaydet</strong> dediğinizde kayıt <strong>doğrudan uygulanır</strong>. Burada
                yalnızca <strong>kurum yöneticisinin</strong> yayındaki kart için gönderdiği değişiklik
                taslağı listelenir. Bir satıra <strong>İncele</strong> deyin; açılan düzenleme ekranının üstünde{" "}
                <strong>Onayla ve uygula</strong> ile canlı veriye yazılır, <strong>Reddet</strong> ile talep
                silinir (yayındaki metin değişmez).
              </p>
              {institutions.some((i) => i.pendingSubmittedAt) ? (
                <ul className="mt-3 space-y-2 border-t border-amber-200/80 pt-3 text-xs">
                  {institutions
                    .filter((i) => i.pendingSubmittedAt)
                    .map((i) => (
                      <li
                        key={i.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2"
                      >
                        <span>
                          <span className="font-semibold text-slate-900">{i.name}</span>
                          <span className="text-slate-600"> · {i.city}</span>
                          <span className="block text-[11px] text-slate-500">
                            Gönderim: {new Date(i.pendingSubmittedAt!).toLocaleString("tr-TR")}
                          </span>
                        </span>
                        <button
                          type="button"
                          className="shrink-0 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                          onClick={() => {
                            setSelectedInstitutionId(i.id);
                            queueMicrotask(() =>
                              document.getElementById("admin-kurum-duzenle")?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              }),
                            );
                          }}
                        >
                          İncele / onayla
                        </button>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="mt-3 border-t border-amber-200/80 pt-3 text-xs text-amber-900/80">
                  Şu an bekleyen yönetici talebi yok. Talep geldiğinde hem burada hem kurum listesinde{" "}
                  <span className="rounded bg-amber-200 px-1 py-0.5 font-semibold text-amber-950">
                    Onay bekliyor
                  </span>{" "}
                  etiketi görünür.
                </p>
              )}
            </div>
            <div
              id="admin-kurum-listesi"
              className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Kayıtlı kurumlar</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Kurumu <strong>Düzenle</strong> ile seçince aşağıda tüm alanlar açılır; sizin{" "}
                    <strong>Kaydet</strong> işleminiz doğrudan sunucuya yazılır. Sarı{" "}
                    <strong>Onay bekliyor</strong> etiketi, kurum yöneticisinin gönderdiği taslağı ifade eder —
                    o kurumda üstte <strong>Onayla ve uygula</strong> / <strong>Reddet</strong> görünür.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openNewInstitutionForm}
                  className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Yeni kurum formunu aç
                </button>
              </div>
              <div className="space-y-2">
                {institutions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                  >
                    <p className="flex flex-wrap items-center gap-2">
                      <span>
                        {item.name} • {item.city}
                      </span>
                      {!item.listed ? (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sky-800">
                          Taslak
                        </span>
                      ) : null}
                      {item.pendingSubmittedAt ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
                          Onay bekliyor
                        </span>
                      ) : null}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInstitutionId(item.id)}
                        className="rounded-md bg-indigo-100 px-2 py-1 text-indigo-700"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(item.id)}
                        className="rounded-md bg-slate-100 px-2 py-1"
                      >
                        {item.featured ? "Öne Çıkandan Kaldır" : "Öne Çıkar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteInstitution(item.id)}
                        className="rounded-md bg-rose-100 px-2 py-1 text-rose-700"
                      >
                        Sistemden Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="admin-yeni-kurum"
              className="scroll-mt-24 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4"
            >
              {!showNewInstitutionForm ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-600">
                    Yeni kurum kartı oluşturmak için formu açın. Varsayılan görünümde yalnızca liste
                    üsttedir.
                  </p>
                  <button
                    type="button"
                    onClick={openNewInstitutionForm}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Yeni kurum formunu aç
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Yeni kurum (tam kayıt)</h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Tüm alanlarla yeni kart; bitince formu kapatarak listeye dönebilirsiniz.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewInstitutionForm(false)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Formu kapat
                    </button>
                  </div>
                  <InstitutionForm />
                </>
              )}
            </div>
            {selectedInstitutionId && (
              <div
                id="admin-kurum-duzenle"
                className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <h3 className="mb-1 text-lg font-bold">Seçili kurum</h3>
                <p className="mb-2 text-xs text-slate-500">
                  {institutions.find((i) => i.id === selectedInstitutionId)?.name ?? ""} — kurumsal paneldeki
                  alanları (detay sayfasındaki bölümler dahil) buradan düzenlersiniz.{" "}
                  <strong>Kaydet</strong> tüm bu alanları sunucuya yazar; eğitmen ekleme/çıkarma anında
                  kaydolur.
                </p>
                {institutionFormMessage ? (
                  <p className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
                    {institutionFormMessage}
                  </p>
                ) : null}
                {(() => {
                  if (!institutions.find((i) => i.id === selectedInstitutionId)) {
                    return <p className="text-sm text-slate-500">Kurum bulunamadı.</p>;
                  }
                  const draft = institutionEditDraft;
                  if (!draft || draft.id !== selectedInstitutionId) {
                    return <p className="text-sm text-slate-600">Kurum formu yükleniyor…</p>;
                  }
                  const selectedInstructors = instructors.filter(
                    (ins) => ins.institutionId === draft.id,
                  );
                  return (
                    <>
                    {(() => {
                    const liveInstitution = institutions.find((i) => i.id === selectedInstitutionId);
                    return (
                      <>
                        {liveInstitution && !liveInstitution.listed ? (
                          <div className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-950">
                            <p className="font-semibold">Taslak kurum (henüz yayında değil)</p>
                            <p className="mt-1">
                              Anonim ziyaretçiler bu kartı görmez. İnceleyip yayına alabilirsiniz.
                            </p>
                            <button
                              type="button"
                              className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                              onClick={() => {
                                void setInstitutionListed(liveInstitution.id, true);
                              }}
                            >
                              Yayına al (listed)
                            </button>
                          </div>
                        ) : null}
                        {liveInstitution?.pendingSubmittedAt ? (
                          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                            <p className="font-semibold">Kurum yöneticisi değişiklik talebi</p>
                            <p className="mt-1">
                              Gönderim:{" "}
                              {new Date(liveInstitution.pendingSubmittedAt).toLocaleString("tr-TR")}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white"
                                onClick={() => {
                                  void approveInstitutionPending(liveInstitution.id);
                                }}
                              >
                                Onayla ve uygula
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900"
                                onClick={() => {
                                  void clearInstitutionPending(liveInstitution.id);
                                }}
                              >
                                Reddet (taslağı sil)
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                  <InstitutionEditorFields
                    draft={draft}
                    onPatch={patchInstitutionDraft}
                    examTypesForForms={examTypesForForms}
                    sectionIdPrefix="admin"
                    fieldIdPrefix={`admin-inst-${draft.id}`}
                    tags={tags}
                    gradeLevels={gradeLevels}
                    allowCreateTag
                    newCardTagName={newCardTagName}
                    setNewCardTagName={setNewCardTagName}
                    createTag={createTag}
                    instructors={selectedInstructors}
                    newInstructorName={newInstructorName}
                    setNewInstructorName={setNewInstructorName}
                    newInstructorBranch={newInstructorBranch}
                    setNewInstructorBranch={setNewInstructorBranch}
                    addInstructor={addInstructor}
                    removeInstructor={removeInstructor}
                    showListingVisibility
                  >
                      <div className="sticky bottom-2 z-10 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-white/95 pt-4 backdrop-blur-sm">
                        <button
                          type="button"
                          disabled={!institutionDraftDirty || institutionSaveBusy}
                          onClick={handleCancelInstitutionDraft}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          İptal
                        </button>
                        <button
                          type="button"
                          disabled={!institutionDraftDirty || institutionSaveBusy}
                          onClick={() => {
                            void handleSaveInstitutionDraft();
                          }}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {institutionSaveBusy ? "Bekleyin…" : "Kaydet"}
                        </button>
                      </div>
                  </InstitutionEditorFields>
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {activeSection === "managers" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-bold">Yönetici daveti</h3>
              <p className="mt-1 text-xs text-slate-500">
                Sistemde açık kayıt yoktur. Kurum yöneticisi hesapları yalnızca sizin oluşturduğunuz
                davet ile açılır. Davet sonrası kişi &quot;Kurumsal giriş&quot;ten e-posta ve şifreyle
                girer. Ardından bir kurum kartı oluştururken veya düzenlerken bu kişiyi yönetici olarak
                atayın — her yöneticiye yalnızca tek kurum bağlanır.
              </p>
              {inviteFeedback ? (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  {inviteFeedback}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Ad soyad</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    value={inviteName}
                    onChange={(e) => {
                      setInviteName(e.target.value);
                      setInviteFeedback("");
                    }}
                    placeholder="Örn. Ayşe Yılmaz"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">E-posta</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      setInviteFeedback("");
                    }}
                    placeholder="yonetici@kurum.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-slate-700">
                    İlk şifre (davet e-postasında iletilecek)
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    type="password"
                    value={invitePassword}
                    onChange={(e) => {
                      setInvitePassword(e.target.value);
                      setInviteFeedback("");
                    }}
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <button
                type="button"
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={() => {
                  void (async () => {
                  const n = inviteName.trim();
                  const em = inviteEmail.trim();
                  if (!n || !em) {
                    setInviteFeedback("Ad ve e-posta zorunludur.");
                    return;
                  }
                  const pwd = invitePassword.trim();
                  if (!pwd) {
                    setInviteFeedback("İlk şifre zorunludur.");
                    return;
                  }
                  const created = await createManager({ name: n, email: em, password: pwd });
                  if (!created.ok) {
                    setInviteFeedback(created.message);
                    return;
                  }
                  setInviteName("");
                  setInviteEmail("");
                  setInvitePassword("");
                  setInviteFeedback(
                    `Yönetici kaydı oluşturuldu. Giriş bilgileri ile kurumsal panelden oturum açılabilir.`,
                  );
                  })();
                }}
              >
                Daveti oluştur
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-lg font-bold">Kurum yöneticileri</h3>
              <div className="space-y-2 text-sm">
                {users.filter((u) => u.role === "institution_manager").length === 0 ? (
                  <p className="text-slate-500">Henüz yönetici yok.</p>
                ) : (
                  users
                    .filter((u) => u.role === "institution_manager")
                    .map((manager) => {
                      const assigned = institutions.find((i) => i.ownerUserId === manager.id);
                      return (
                        <div key={manager.id} className="rounded-lg border border-slate-200 p-3">
                          <p className="font-semibold">{manager.name}</p>
                          <p className="text-slate-600">{manager.email}</p>
                          <p className="text-slate-600">
                            Bağlı kurum: {assigned ? assigned.name : "Henüz kurum atanmadı"}
                          </p>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "reviews" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-lg font-bold">Yorum Moderasyonu</h3>
            {moderationMessage && (
              <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                {moderationMessage}
              </p>
            )}
            <div className="space-y-2">
              {reviews.map((review) => {
                const institution = institutions.find((i) => i.id === review.institutionId);
                return (
                  <div key={review.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <p className="font-semibold">
                      {review.userName} • {institution?.name}
                    </p>
                    <p className="text-slate-700">{review.comment}</p>
                    <p className="text-xs text-slate-500">Durum: {review.status}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (panelUser.role !== "admin") return;
                          updateReviewStatus(review.id, "onaylandi");
                          setModerationMessage("Yorum başarıyla onaylandı.");
                        }}
                        className="cursor-pointer rounded-md bg-emerald-100 px-2 py-1 text-emerald-700"
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (panelUser.role !== "admin") return;
                          updateReviewStatus(review.id, "reddedildi");
                          setModerationMessage("Yorum reddedildi.");
                        }}
                        className="cursor-pointer rounded-md bg-rose-100 px-2 py-1 text-rose-700"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === "tags" && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div>
              <h3 className="text-lg font-bold">Etiket Yönetimi</h3>
              <p className="mt-1 text-xs text-slate-500">
                Burada eklediğiniz her etiket, hero &quot;Ders seçimi&quot; ve kurum kartı etiketlerinde
                kullanılabilir. Kurumu bu etiketle eşleştirmek için Kurum Yönetimi → Kartı Düzenle
                bölümünden ilgili etiketi işaretleyin.
              </p>
            </div>
            {tagActionMessage ? (
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-700">{tagActionMessage}</p>
            ) : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label className="mb-1 block text-xs font-semibold text-slate-700">Yeni etiket adı</label>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Örn. Altyazı M.K., Fizik, Satranç…"
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    setTagActionMessage("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    e.preventDefault();
                    void (async () => {
                      const t = newTagName.trim();
                      if (!t) {
                        setTagActionMessage("Etiket adı yazın.");
                        return;
                      }
                      if (tags.some((x) => x.name.toLowerCase() === t.toLowerCase())) {
                        setTagActionMessage("Bu isimde bir etiket zaten var.");
                        return;
                      }
                      const id = await createTag(t);
                      if (!id) {
                        setTagActionMessage("Etiket eklenemedi (yetki veya ağ hatası).");
                        return;
                      }
                      setNewTagName("");
                      setTagActionMessage("Etiket eklendi. Hero aramada hemen görünür.");
                    })();
                  }}
                />
              </div>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={() => {
                  void (async () => {
                  const t = newTagName.trim();
                  if (!t) {
                    setTagActionMessage("Etiket adı yazın.");
                    return;
                  }
                  if (tags.some((x) => x.name.toLowerCase() === t.toLowerCase())) {
                    setTagActionMessage("Bu isimde bir etiket zaten var.");
                    return;
                  }
                  const id = await createTag(t);
                  if (!id) {
                    setTagActionMessage("Etiket eklenemedi (yetki veya ağ hatası).");
                    return;
                  }
                  setNewTagName("");
                  setTagActionMessage("Etiket eklendi. Hero aramada hemen görünür.");
                  })();
                }}
              >
                Etiket ekle
              </button>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600">Mevcut etiketler ({tags.length})</p>
              <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/80 p-2 text-sm">
                {tags.length === 0 ? (
                  <li className="text-xs text-slate-500">Henüz etiket yok.</li>
                ) : (
                  tags
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                    .map((tag) => (
                      <li
                        key={tag.id}
                        className="flex flex-wrap items-baseline justify-between gap-2 rounded-md bg-white px-2 py-1.5"
                      >
                        <span className="font-medium text-slate-800">{tag.name}</span>
                        <code className="text-[10px] text-slate-400">id: {tag.id}</code>
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
        )}

        {activeSection === "institution-types" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-lg font-bold">Kurum türlerini düzenle</h3>
            <p className="mb-4 text-xs text-slate-500">
              <strong>Sabit kod</strong> (ör. LGS, YKS) URL ve veritabanında değişmez; yalnızca{" "}
              <strong>görünen ad</strong> ve menü <strong>sırası</strong> güncellenir. Kayıt sonrası üst menü
              ve kurum kartları yeni etiketleri kullanır.
            </p>
            {platformLoading && institutionTypes.length === 0 ? (
              <p className="text-sm text-slate-600">Kurum türleri yükleniyor…</p>
            ) : institutionTypes.length === 0 ? (
              <p className="text-sm text-amber-800">
                Henüz kurum türü satırı yok. Supabase&apos;de{" "}
                <code className="rounded bg-amber-100 px-1">institution_types</code> migration&apos;ını
                uygulayıp sayfayı yenileyin.
              </p>
            ) : (
              <ul className="space-y-3">
                {sortInstitutionTypes(institutionTypes).map((t) => {
                  const d = institutionTypeDrafts[t.id];
                  return (
                    <li
                      key={t.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:flex-row sm:flex-wrap sm:items-end"
                    >
                      <div className="min-w-[140px] shrink-0">
                        <p className="text-[10px] font-semibold uppercase text-slate-500">Sabit kod</p>
                        <code className="text-xs text-slate-800">{t.id}</code>
                      </div>
                      <div className="min-w-[160px] flex-1">
                        <label className="mb-1 block text-xs font-semibold text-slate-700">
                          Görünen ad
                        </label>
                        <input
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          value={d?.label ?? t.label}
                          onChange={(e) =>
                            setInstitutionTypeDrafts((prev) => ({
                              ...prev,
                              [t.id]: {
                                label: e.target.value,
                                sortOrder: d?.sortOrder ?? String(t.sortOrder),
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="w-24 shrink-0">
                        <label className="mb-1 block text-xs font-semibold text-slate-700">Sıra</label>
                        <input
                          type="number"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          value={d?.sortOrder ?? String(t.sortOrder)}
                          onChange={(e) =>
                            setInstitutionTypeDrafts((prev) => ({
                              ...prev,
                              [t.id]: {
                                label: d?.label ?? t.label,
                                sortOrder: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                        onClick={() => {
                          const dr = institutionTypeDrafts[t.id];
                          const label = (dr?.label ?? t.label).trim();
                          const so = Number(dr?.sortOrder ?? t.sortOrder);
                          void updateInstitutionType(t.id, {
                            label,
                            sortOrder: Number.isFinite(so) ? so : t.sortOrder,
                          });
                        }}
                      >
                        Kaydet
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {activeSection === "grade-levels" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-lg font-bold">Sınıf seçenekleri</h3>
            <p className="mb-3 text-xs text-slate-500">
              Hero arama ve listeleme filtresinde görünen sınıf listesi. Yeni satır ekleyebilir veya
              kaldırabilirsiniz; kaldırılan kimlik kurum kartlarından da düşer.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {gradeLevels.map((gl) => (
                <div
                  key={gl.id}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm"
                >
                  <span>{gl.label}</span>
                  <button
                    type="button"
                    onClick={() => removeGradeLevel(gl.id)}
                    className="text-xs font-medium text-rose-600 hover:underline"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Örn. 5. sınıf"
                value={newGradeLevelLabel}
                onChange={(e) => setNewGradeLevelLabel(e.target.value)}
              />
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  const t = newGradeLevelLabel.trim();
                  if (!t) return;
                  addGradeLevel(t);
                  setNewGradeLevelLabel("");
                }}
              >
                Sınıf ekle
              </button>
            </div>
          </div>
        )}

        {activeSection === "hero-featured" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="mb-2 text-lg font-bold">Hero / Öne Çıkanlar</h3>
              <p className="mb-3 text-sm text-slate-600">
                Bu bölümde sadece admin hero görsellerini yönetir ve kurumları öne çıkarır.
              </p>
              <div className="grid gap-2">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Hero başlığı"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Hero alt başlığı"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                />
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Görsel URL"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!heroTitle.trim() || !heroSubtitle.trim() || !heroImage.trim()) return;
                    addHeroSlide({
                      title: heroTitle,
                      subtitle: heroSubtitle,
                      image: heroImage,
                    });
                    setHeroTitle("");
                    setHeroSubtitle("");
                    setHeroImage("");
                  }}
                  className="w-fit rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  Hero Slide Ekle
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="mb-3 font-bold">Mevcut Hero Slaytları</h4>
              <div className="space-y-2">
                {heroSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                  >
                    <p>{slide.title}</p>
                    <button
                      type="button"
                      onClick={() => removeHeroSlide(slide.id)}
                      className="rounded-md bg-rose-100 px-2 py-1 text-rose-700"
                    >
                      Sil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="mb-3 font-bold">Öne Çıkan Kurumlar</h4>
              <div className="space-y-2">
                {institutions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                  >
                    <p>{item.name}</p>
                    <button
                      type="button"
                      onClick={() => toggleFeatured(item.id)}
                      className="rounded-md bg-slate-100 px-2 py-1"
                    >
                      {item.featured ? "Öne Çıkandan Kaldır" : "Öne Çıkar"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {activeSection === "pages" && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-bold">Sayfa İçerikleri (Sadece Admin)</h3>
            <p className="text-xs text-slate-500">
              Hakkımızda, Gizlilik ve İletişim içerikleri yalnızca admin tarafından düzenlenir.
            </p>
            <div>
              <label className="mb-1 block text-sm font-semibold">Hakkımızda</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={4}
                value={staticPages.about}
                onChange={(e) => updateStaticPage("about", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Gizlilik</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={4}
                value={staticPages.privacy}
                onChange={(e) => updateStaticPage("privacy", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">İletişim</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                rows={4}
                value={staticPages.contact}
                onChange={(e) => updateStaticPage("contact", e.target.value)}
              />
            </div>
          </div>
        )}

        {activeSection === "advisor" && (
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-bold">Eğitim Danışmanı — sohbet metinleri</h3>
            <p className="text-xs text-slate-600">
              Sağ alttaki danışman balonunda sırayla gösterilir. Sadece <strong>metinleri</strong>{" "}
              değiştirirsiniz; adım sırası ve filtre mantığı sabittir. Kurumsal panel kullanıcıları bu
              alanı görmez — yalnızca platform yöneticisi (admin).
            </p>
            <div className="space-y-4">
              {[...advisorQuestions]
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Adım {q.order} · {q.stepKey}
                      </span>
                      <span className="text-[11px] text-slate-500">{ADVISOR_STEP_HINT[q.stepKey]}</span>
                    </div>
                    <label className="sr-only" htmlFor={`advisor-q-${q.id}`}>
                      Soru metni
                    </label>
                    <textarea
                      id={`advisor-q-${q.id}`}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      value={q.prompt}
                      onChange={(e) => updateAdvisorQuestion(q.id, e.target.value)}
                    />
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
