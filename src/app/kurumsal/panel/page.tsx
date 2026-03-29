"use client";

import { useEffect, useRef, useState } from "react";
import { CorporateSection, CorporateSidebar, StatsCard } from "@/components/panel/Sidebars";
import { INSTITUTION_TYPES_SEED } from "@/data/institutionTypesSeed";
import { InstitutionEditHint } from "@/components/panel/InstitutionEditHint";
import { InstitutionEditorFields } from "@/components/panel/InstitutionEditorFields";
import { InstitutionForm } from "@/components/panel/InstitutionForm";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { usePanelGate } from "@/hooks/usePanelGate";
import { getPublicRating } from "@/lib/institutions";
import {
  buildInstitutionPersistencePayload,
  formatInstitutionSaveError,
  mergeInstitutionWithPending,
} from "@/lib/institutionSavePayload";
import { PageNav } from "@/components/ui/PageNav";
import type { Institution } from "@/types";

export default function CorporatePanelPage() {
  const { user: panelUser, loading: panelLoading, allowed: panelAllowed } = usePanelGate([
    "institution_manager",
  ]);
  const {
    institutions,
    reviews,
    updateInstitution,
    tags,
    gradeLevels,
    instructors,
    addInstructor,
    removeInstructor,
    updateInstitutionTags,
    institutionTypes,
    submitInstitutionPendingReview,
    createTag,
  } = useDemoPlatform();
  const examTypesForForms =
    institutionTypes.length > 0 ? institutionTypes : INSTITUTION_TYPES_SEED;

  const ownedInstitutions = institutions.filter((item) => item.ownerUserId === panelUser?.id);
  const institution = ownedInstitutions[0];

  const [activeSection, setActiveSection] = useState<CorporateSection>("overview");
  const [newInstructorName, setNewInstructorName] = useState("");
  const [newInstructorBranch, setNewInstructorBranch] = useState("");
  const [newCardTagName, setNewCardTagName] = useState("");
  const [showNewInstitutionForm, setShowNewInstitutionForm] = useState(false);
  const [institutionEditDraft, setInstitutionEditDraft] = useState<Institution | null>(null);
  const [institutionDraftDirty, setInstitutionDraftDirty] = useState(false);
  const [institutionFormMessage, setInstitutionFormMessage] = useState<string | null>(null);
  const [institutionSaveBusy, setInstitutionSaveBusy] = useState(false);
  const institutionDraftDirtyRef = useRef(false);
  const prevInstitutionIdRef = useRef<string>("");

  useEffect(() => {
    const id = institution?.id ?? "";
    if (id !== prevInstitutionIdRef.current) {
      institutionDraftDirtyRef.current = false;
      setInstitutionDraftDirty(false);
      prevInstitutionIdRef.current = id;
    }
    if (!institution) {
      setInstitutionEditDraft(null);
      setInstitutionDraftDirty(false);
      return;
    }
    if (!institutionDraftDirtyRef.current) {
      setInstitutionEditDraft({ ...mergeInstitutionWithPending(institution) });
      setInstitutionDraftDirty(false);
    }
  }, [institution]);

  const patchInstitutionDraft = (patch: Partial<Institution>) => {
    institutionDraftDirtyRef.current = true;
    setInstitutionDraftDirty(true);
    setInstitutionFormMessage(null);
    setInstitutionEditDraft((d) => (d ? { ...d, ...patch } : null));
  };

  const handleCancelInstitutionDraft = () => {
    if (!institution) return;
    institutionDraftDirtyRef.current = false;
    setInstitutionDraftDirty(false);
    setInstitutionEditDraft({ ...mergeInstitutionWithPending(institution) });
    setInstitutionFormMessage("Form kayıtlı veriye göre sıfırlandı.");
    setTimeout(() => setInstitutionFormMessage(null), 3000);
  };

  const handleSaveInstitutionDraft = async () => {
    if (!institution || !institutionEditDraft) return;
    const d = institutionEditDraft;
    setInstitutionSaveBusy(true);
    try {
      setInstitutionFormMessage("Gönderiliyor…");
      if (!institution.listed) {
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
        return;
      }
      const r = await submitInstitutionPendingReview(d.id, d);
      if (!r.ok) {
        setInstitutionFormMessage(`Gönderilemedi: ${formatInstitutionSaveError(r.message)}`);
        return;
      }
      institutionDraftDirtyRef.current = false;
      setInstitutionDraftDirty(false);
      setInstitutionFormMessage(
        "Değişiklik talebiniz platform yöneticisine iletildi. Onaylanana kadar sitede yayındaki metin görünür.",
      );
      setTimeout(() => setInstitutionFormMessage(null), 6500);
    } finally {
      setInstitutionSaveBusy(false);
    }
  };

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

  const saveLabel = institution?.listed === false ? "Kaydet" : "Onaya gönder";

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
      <CorporateSidebar active={activeSection} onChange={setActiveSection} />
      <section className="space-y-4">
        <PageNav />
        <h1 className="text-2xl font-bold">Kurumsal panel</h1>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-800">Yetki özeti</p>
          <p className="mt-1">
            Admin paneli ile <strong>aynı kurum alanlarını</strong> burada düzenlersiniz. Kurum{" "}
            <strong>yayındaysa</strong> değişiklikler doğrudan siteye yazılmaz;{" "}
            <strong>platform yöneticisinin onayı</strong> gerekir. <strong>Taslak</strong> kurumda (yönetici
            yeni kart oluşturduysa) kayıtlar doğrudan sizin taslağınıza yazılır; yönetici yayına alınca herkes
            görür. Etiket tanımı yalnızca admin içindir; mevcut etiketleri seçebilirsiniz. Eğitmen
            ekleme/çıkarma anında kaydolur.
          </p>
        </div>

        {!institution ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            <p className="font-semibold">Henüz atanmış kurum kartınız yok</p>
            <p className="mt-2 text-amber-900/90">
              Aşağıdan <strong>Yeni kurum talebi</strong> ile taslak oluşturabilirsiniz; yönetici inceleyip
              yayına alır. Davetle açılan hesaplarda admin sizi kuruma bağlayabilir.
            </p>
          </div>
        ) : ownedInstitutions.length > 1 ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            Veri tutarsızlığı: hesabınıza birden fazla kurum bağlı görünüyor. Yalnızca ilki düzenlenir;
            yöneticiden düzeltmesini isteyin.
          </p>
        ) : null}

        {activeSection === "overview" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatsCard label="Kurum" value={institution ? 1 : 0} />
            <StatsCard label="Ortalama puan" value={score.average.toFixed(1)} />
            <StatsCard label="Yorum sayısı" value={institutionReviews.length} />
          </div>
        )}

        {activeSection === "institution-edit" && (
          <div className="space-y-4">
            {!institution ? (
              <div
                id="kurumsal-yeni-kurum"
                className="scroll-mt-24 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Yeni kurum talebi (taslak)</h2>
                    <p className="mt-1 text-xs text-slate-600">
                      Formu doldurun; kart taslak olarak oluşur. Platform yöneticisi yayına alınca listede
                      görünür.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewInstitutionForm((v) => !v)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
                  >
                    {showNewInstitutionForm ? "Formu gizle" : "Formu aç"}
                  </button>
                </div>
                {showNewInstitutionForm ? (
                  <InstitutionForm listedOnCreate={false} selfServeManager />
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-bold text-slate-900">Kurum düzenleme</h2>
                <InstitutionEditHint variant="corporate" />
                {institution.pendingSubmittedAt ? (
                  <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                    <strong>Onay bekleyen bir talebiniz var</strong> (
                    {new Date(institution.pendingSubmittedAt).toLocaleString("tr-TR")}). Yönetici işlemi
                    bitirene kadar sitede önceki yayındaki bilgiler görünür; aşağıda son gönderdiğiniz taslağı
                    görmeye devam edebilirsiniz.
                  </p>
                ) : null}
                {!institution.listed ? (
                  <p className="mt-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
                    Bu kurum <strong>taslak</strong>; ziyaretçi listelerinde yok. Düzenlemeler doğrudan
                    kaydedilir. Yayın için platform yöneticisine başvurun.
                  </p>
                ) : null}
                {institutionFormMessage ? (
                  <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800">
                    {institutionFormMessage}
                  </p>
                ) : null}
                {institutionEditDraft && institutionEditDraft.id === institution.id ? (
                  <InstitutionEditorFields
                    draft={institutionEditDraft}
                    onPatch={patchInstitutionDraft}
                    examTypesForForms={examTypesForForms}
                    sectionIdPrefix="kurumsal"
                    fieldIdPrefix={`kurumsal-inst-${institutionEditDraft.id}`}
                    tags={tags}
                    gradeLevels={gradeLevels}
                    allowCreateTag={false}
                    newCardTagName={newCardTagName}
                    setNewCardTagName={setNewCardTagName}
                    createTag={createTag}
                    instructors={institutionInstructors}
                    newInstructorName={newInstructorName}
                    setNewInstructorName={setNewInstructorName}
                    newInstructorBranch={newInstructorBranch}
                    setNewInstructorBranch={setNewInstructorBranch}
                    addInstructor={addInstructor}
                    removeInstructor={removeInstructor}
                    showListingVisibility={false}
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
                        {institutionSaveBusy ? "Bekleyin…" : saveLabel}
                      </button>
                    </div>
                  </InstitutionEditorFields>
                ) : (
                  <p className="text-sm text-slate-600">Form yükleniyor…</p>
                )}
              </div>
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
