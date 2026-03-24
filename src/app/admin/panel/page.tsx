"use client";

import { useState } from "react";
import { InstitutionForm } from "@/components/panel/InstitutionForm";
import { AdminSection, AdminSidebar, StatsCard } from "@/components/panel/Sidebars";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { getPublicRating } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";

export default function AdminPanelPage() {
  const {
    currentUser,
    institutions,
    users,
    reviews,
    tags,
    heroSlides,
    instructors,
    createTag,
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

  if (!currentUser || currentUser.role !== "admin") {
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-3 text-lg font-bold">Yönetici Yönetimi</h3>
            <div className="space-y-2 text-sm">
              {users
                .filter((u) => u.role === "institution_manager")
                .map((manager) => {
                  const assigned = institutions.find((i) => i.ownerUserId === manager.id);
                  return (
                    <div key={manager.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold">{manager.name}</p>
                      <p className="text-slate-600">{manager.email}</p>
                      <p className="text-slate-600">
                        Atanan kurum: {assigned ? assigned.name : "Atama yok"}
                      </p>
                    </div>
                  );
                })}
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
                          if (currentUser.role !== "admin") return;
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
                          if (currentUser.role !== "admin") return;
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-lg font-bold">Etiket Yönetimi</h3>
            <button
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => createTag(`Yeni Etiket ${tags.length + 1}`)}
            >
              Yeni Etiket Ekle
            </button>
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
      </section>
    </div>
  );
}
