"use client";

import { useState } from "react";
import { CorporateSection, CorporateSidebar, StatsCard } from "@/components/panel/Sidebars";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { getInstitutionScore } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";

export default function CorporatePanelPage() {
  const { currentUser, institutions, reviews, updateInstitution, createInstitution, tags } =
    useDemoPlatform();
  const [activeSection, setActiveSection] = useState<CorporateSection>("overview");
  const [newInstitutionName, setNewInstitutionName] = useState("");
  const [newInstitutionCity, setNewInstitutionCity] = useState("İstanbul");
  const [newInstitutionDistrict, setNewInstitutionDistrict] = useState("Merkez");
  const ownedInstitutions = institutions.filter((item) => item.ownerUserId === currentUser?.id);
  const institution = ownedInstitutions[0];

  if (!currentUser || currentUser.role !== "institution_manager") {
    return <div className="mx-auto max-w-4xl px-4 py-10">Bu alana erişim için kurumsal giriş yapın.</div>;
  }

  const institutionReviews = institution
    ? reviews.filter((item) => item.institutionId === institution.id)
    : [];
  const score = institution ? getInstitutionScore(reviews, institution.id) : { average: 0, count: 0 };

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr]">
      <CorporateSidebar active={activeSection} onChange={setActiveSection} />
      <section className="space-y-4">
        <PageNav />
        <h1 className="text-2xl font-bold">Kurumsal Dashboard</h1>
        {activeSection === "overview" && (
          <div className="grid gap-3 sm:grid-cols-3">
            <StatsCard label="Kurum Sayım" value={ownedInstitutions.length} />
            <StatsCard label="Ortalama Puan" value={score.average.toFixed(1)} />
            <StatsCard label="Yorum Sayısı" value={institutionReviews.length} />
          </div>
        )}

        {activeSection === "institution-info" && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <h2 className="text-lg font-bold">Kurum Bilgilerim</h2>
            {institution ? (
              <>
                <p>Ad: {institution.name}</p>
                <p>Tür: {institution.type}</p>
                <p>
                  Konum: {institution.city} / {institution.district}
                </p>
                <p>Telefon: {institution.phone}</p>
                <p>Web: {institution.website}</p>
              </>
            ) : (
              <p>Henüz kayıtlı kurum kartınız yok. "Yeni Kurum Ekle" sekmesinden oluşturabilirsiniz.</p>
            )}
          </div>
        )}

        {activeSection === "card-info" && (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <h2 className="text-lg font-bold">Kart Bilgileri</h2>
            {institution ? (
              <>
                <p>Programlar: {institution.programs.join(", ")}</p>
                <p>
                  Fiyat aralığı: ₺{institution.minPrice.toLocaleString("tr-TR")} - ₺
                  {institution.maxPrice.toLocaleString("tr-TR")}
                </p>
                <p>Eğitmen sayısı: {institution.teacherCount}</p>
              </>
            ) : (
              <p>Kurum kartı oluşturulduktan sonra burada listelenir.</p>
            )}
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
            {institution ? (
              <>
                <input
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={institution.name}
                  onChange={(e) => updateInstitution(institution.id, { name: e.target.value })}
                />
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  value={institution.longDescription}
                  onChange={(e) =>
                    updateInstitution(institution.id, { longDescription: e.target.value })
                  }
                />
              </>
            ) : (
              <p className="text-sm text-slate-600">
                Düzenlenecek kurum bulunamadı. Önce "Yeni Kurum Ekle" ile kurum kartı oluşturun.
              </p>
            )}
          </div>
        )}

        {activeSection === "new-institution" && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-bold">Yeni Kurum Ekle</h2>
            <p className="text-xs text-slate-500">
              Kurum yöneticisi olarak yeni kurum kartı oluşturabilirsiniz. Yorum moderasyonu yetkisi
              yalnızca admindedir.
            </p>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Kurum adı"
              value={newInstitutionName}
              onChange={(e) => setNewInstitutionName(e.target.value)}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Şehir"
                value={newInstitutionCity}
                onChange={(e) => setNewInstitutionCity(e.target.value)}
              />
              <input
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="İlçe"
                value={newInstitutionDistrict}
                onChange={(e) => setNewInstitutionDistrict(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                if (!newInstitutionName.trim()) return;
                const defaultTags = tags.slice(0, 2).map((item) => item.id);
                createInstitution({
                  name: newInstitutionName,
                  type: "kurs",
                  city: newInstitutionCity,
                  district: newInstitutionDistrict,
                  address: `${newInstitutionDistrict} / ${newInstitutionCity}`,
                  phone: "0212 000 00 00",
                  website: "https://www.yeni-kurum.demo",
                  shortDescription: "Kurumsal panelden eklenen demo kurum kartı.",
                  longDescription:
                    "Bu kart kurum yöneticisi tarafından demo amaçlı eklenmiştir ve daha sonra düzenlenebilir.",
                  teacherCount: 8,
                  minPrice: 3000,
                  maxPrice: 7000,
                  programs: ["TYT", "AYT"],
                  tags: defaultTags,
                  coverImage:
                    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
                  galleryImages: [],
                  featured: false,
                  ownerUserId: currentUser.id,
                });
                setNewInstitutionName("");
                setActiveSection("overview");
              }}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Kurumu Kaydet
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
