"use client";

import { useState } from "react";
import { InstitutionForm } from "@/components/panel/InstitutionForm";
import { AdminSection, AdminSidebar, StatsCard } from "@/components/panel/Sidebars";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { getInstitutionScore } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";

export default function AdminPanelPage() {
  const {
    currentUser,
    institutions,
    users,
    reviews,
    tags,
    createTag,
    toggleFeatured,
    deleteInstitution,
    updateReviewStatus,
  } = useDemoPlatform();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [moderationMessage, setModerationMessage] = useState("");

  if (!currentUser || currentUser.role !== "admin") {
    return <div className="mx-auto max-w-4xl px-4 py-10">Bu alana erişim için admin girişi yapın.</div>;
  }

  const avgRating =
    institutions.length === 0
      ? 0
      : institutions.reduce((acc, item) => acc + getInstitutionScore(reviews, item.id).average, 0) /
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-lg font-bold">Hero / Öne Çıkanlar</h3>
            <p className="text-sm text-slate-600">
              Bu bölümde hero slaytları ve öne çıkan kurum görünürlüğü admin tarafından yönetilir.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
