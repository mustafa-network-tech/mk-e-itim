"use client";

import { useState } from "react";
import { InstitutionForm } from "@/components/panel/InstitutionForm";
import { AdminSection, AdminSidebar, StatsCard } from "@/components/panel/Sidebars";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { usePanelGate } from "@/hooks/usePanelGate";
import { formatTryAmount, getDiscountedPriceFromMin, getDiscountRibbonText } from "@/lib/discount";
import { getPublicRating } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";
import type { AdvisorStepKey } from "@/types/advisor";

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
    staticPages,
    updateStaticPage,
    advisorQuestions,
    updateAdvisorQuestion,
  } = useDemoPlatform();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [moderationMessage, setModerationMessage] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
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
            <InstitutionForm />
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-lg font-bold">Kurumlar Yönetimi</h3>
              <p className="mb-3 text-xs text-slate-500">
                Bu alanda admin yeni kurs/dershane ekleyebilir, kart oluşturabilir ve kurumları yönetebilir.
              </p>
              <div className="space-y-2">
                {institutions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2 text-sm"
                  >
                    <p>
                      {item.name} • {item.city}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedInstitutionId(item.id)}
                        className="rounded-md bg-indigo-100 px-2 py-1 text-indigo-700"
                      >
                        Kartı Düzenle
                      </button>
                      <button
                        onClick={() => toggleFeatured(item.id)}
                        className="rounded-md bg-slate-100 px-2 py-1"
                      >
                        {item.featured ? "Öne Çıkandan Kaldır" : "Öne Çıkar"}
                      </button>
                      <button
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
            {selectedInstitutionId && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-lg font-bold">Seçili Kart Düzenleme</h3>
                {(() => {
                  const selected = institutions.find((i) => i.id === selectedInstitutionId);
                  if (!selected) return <p className="text-sm text-slate-500">Kurum bulunamadı.</p>;
                  const selectedInstructors = instructors.filter(
                    (ins) => ins.institutionId === selected.id,
                  );
                  return (
                    <div className="space-y-3">
                      <input
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={selected.name}
                        onChange={(e) => updateInstitution(selected.id, { name: e.target.value })}
                      />
                      <textarea
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={selected.longDescription}
                        onChange={(e) =>
                          updateInstitution(selected.id, { longDescription: e.target.value })
                        }
                      />
                      <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-3">
                        <p className="text-sm font-bold text-slate-900">Kursiyera indirimi</p>
                        <p className="mt-1 text-xs text-slate-600">
                          İndirim <strong>min. fiyat</strong> üzerinden hesaplanır (kart ve detayda
                          gösterilir).
                        </p>
                        <label className="mt-2 flex items-center gap-2 text-sm text-slate-800">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300"
                            checked={selected.discountActive}
                            onChange={(e) =>
                              updateInstitution(selected.id, { discountActive: e.target.checked })
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
                              value={selected.discountPercent}
                              onChange={(e) =>
                                updateInstitution(selected.id, {
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
                              value={selected.discountText}
                              onChange={(e) =>
                                updateInstitution(selected.id, { discountText: e.target.value })
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
                              value={selected.discountStartDate}
                              onChange={(e) =>
                                updateInstitution(selected.id, {
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
                              value={selected.discountEndDate}
                              onChange={(e) =>
                                updateInstitution(selected.id, { discountEndDate: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        {selected.discountActive && selected.discountPercent > 0 ? (
                          <p className="mt-2 text-xs text-slate-700">
                            Şerit: <strong>{getDiscountRibbonText(selected)}</strong> · Min:{" "}
                            <span className="line-through opacity-70">
                              {formatTryAmount(selected.minPrice)}
                            </span>{" "}
                            →{" "}
                            <strong>
                              {formatTryAmount(
                                getDiscountedPriceFromMin(
                                  selected.minPrice,
                                  selected.discountPercent,
                                ),
                              )}
                            </strong>
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold">Etiketler</p>
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => {
                            const active = selected.tags.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() =>
                                  updateInstitutionTags(
                                    selected.id,
                                    active
                                      ? selected.tags.filter((t) => t !== tag.id)
                                      : [...selected.tags, tag.id],
                                  )
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
                              if (!newCardTagName.trim()) return;
                              const newTagId = newCardTagName.toLowerCase().replaceAll(" ", "-");
                              createTag(newCardTagName);
                              if (!selected.tags.includes(newTagId)) {
                                updateInstitutionTags(selected.id, [...selected.tags, newTagId]);
                              }
                              setNewCardTagName("");
                            }}
                          >
                            Etiket Ekle
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-semibold">Hedef sınıflar</p>
                        <p className="mb-2 text-xs text-slate-500">
                          Hero ve listelemede sınıf filtresi bu seçimlere göre çalışır.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {gradeLevels.map((gl) => {
                            const active = selected.gradeLevelIds.includes(gl.id);
                            return (
                              <button
                                key={gl.id}
                                type="button"
                                onClick={() =>
                                  updateInstitution(selected.id, {
                                    gradeLevelIds: active
                                      ? selected.gradeLevelIds.filter((id) => id !== gl.id)
                                      : [...selected.gradeLevelIds, gl.id],
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
                          {selectedInstructors.map((ins) => (
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
                              addInstructor(selected.id, newInstructorName, newInstructorBranch);
                              setNewInstructorName("");
                              setNewInstructorBranch("");
                            }}
                          >
                            Eğitmen Ekle
                          </button>
                        </div>
                      </div>
                    </div>
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
                  const created = createManager({ name: n, email: em, password: pwd });
                  if (!created) {
                    setInviteFeedback("Bu e-posta zaten kayıtlı.");
                    return;
                  }
                  setInviteName("");
                  setInviteEmail("");
                  setInvitePassword("");
                  setInviteFeedback(
                    `Yönetici kaydı oluşturuldu. Supabase Auth bağlandığında giriş bilgileri e-posta ile iletilebilir.`,
                  );
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
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const t = newTagName.trim();
                      if (!t) {
                        setTagActionMessage("Etiket adı yazın.");
                        return;
                      }
                      if (tags.some((x) => x.name.toLowerCase() === t.toLowerCase())) {
                        setTagActionMessage("Bu isimde bir etiket zaten var.");
                        return;
                      }
                      createTag(t);
                      setNewTagName("");
                      setTagActionMessage("Etiket eklendi. Hero aramada hemen görünür.");
                    }
                  }}
                />
              </div>
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                onClick={() => {
                  const t = newTagName.trim();
                  if (!t) {
                    setTagActionMessage("Etiket adı yazın.");
                    return;
                  }
                  if (tags.some((x) => x.name.toLowerCase() === t.toLowerCase())) {
                    setTagActionMessage("Bu isimde bir etiket zaten var.");
                    return;
                  }
                  createTag(t);
                  setNewTagName("");
                  setTagActionMessage("Etiket eklendi. Hero aramada hemen görünür.");
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
