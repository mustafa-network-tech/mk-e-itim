"use client";

import { useState } from "react";
import { CorporateSection, CorporateSidebar, StatsCard } from "@/components/panel/Sidebars";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { getInstitutionScore } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";

export default function CorporatePanelPage() {
  const { currentUser, institutions, reviews, updateInstitution } = useDemoPlatform();
  const [activeSection, setActiveSection] = useState<CorporateSection>("overview");
  const institution = institutions.find((item) => item.ownerUserId === currentUser?.id);

  if (!currentUser || currentUser.role !== "institution_manager") {
    return <div className="mx-auto max-w-4xl px-4 py-10">Bu alana erişim için kurumsal giriş yapın.</div>;
  }

  if (!institution) {
    return <div className="mx-auto max-w-4xl px-4 py-10">Atanmış kurum kartı bulunamadı.</div>;
  }

  const institutionReviews = reviews.filter((item) => item.institutionId === institution.id);
  const score = getInstitutionScore(reviews, institution.id);

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
      <CorporateSidebar active={activeSection} onChange={setActiveSection} />
      <section className="space-y-4">
        <PageNav />
        <h1 className="text-2xl font-bold">Kurumsal Dashboard</h1>
        {activeSection === "overview" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatsCard label="Kurumum" value={institution.name} />
            <StatsCard label="Ortalama Puan" value={score.average.toFixed(1)} />
            <StatsCard label="Yorum Sayısı" value={institutionReviews.length} />
          </div>
        )}

        {activeSection === "institution-info" && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <h2 className="text-lg font-bold">Kurum Bilgilerim</h2>
            <p>Ad: {institution.name}</p>
            <p>Tür: {institution.type}</p>
            <p>
              Konum: {institution.city} / {institution.district}
            </p>
            <p>Telefon: {institution.phone}</p>
            <p>Web: {institution.website}</p>
          </div>
        )}

        {activeSection === "card-info" && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <h2 className="text-lg font-bold">Kart Bilgileri</h2>
            <p>Programlar: {institution.programs.join(", ")}</p>
            <p>
              Fiyat aralığı: ₺{institution.minPrice.toLocaleString("tr-TR")} - ₺
              {institution.maxPrice.toLocaleString("tr-TR")}
            </p>
            <p>Eğitmen sayısı: {institution.teacherCount}</p>
          </div>
        )}

        {activeSection === "reviews-ratings" && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold">Yorumlar ve Puanlar</h2>
            <p className="text-xs text-slate-500">
              Bu alanda kurum yöneticisi sadece görüntüler, yorum moderasyonu sadece admin tarafından yapılır.
            </p>
            {institutionReviews.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-semibold">
                  {item.userName} • {item.rating} yıldız
                </p>
                <p>{item.comment}</p>
                <p className="text-xs text-slate-500">Durum: {item.status}</p>
              </div>
            ))}
          </div>
        )}

        {activeSection === "edit-card" && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold">Kurum Kartını Düzenle</h2>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={institution.name}
              onChange={(e) => updateInstitution(institution.id, { name: e.target.value })}
            />
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={institution.longDescription}
              onChange={(e) => updateInstitution(institution.id, { longDescription: e.target.value })}
            />
          </div>
        )}
      </section>
    </div>
  );
}
