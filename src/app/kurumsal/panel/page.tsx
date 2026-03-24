"use client";

import { useState } from "react";
import { CorporateSection, CorporateSidebar, StatsCard } from "@/components/panel/Sidebars";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { getPublicRating } from "@/lib/institutions";
import { PageNav } from "@/components/ui/PageNav";

export default function CorporatePanelPage() {
  const {
    currentUser,
    institutions,
    reviews,
    updateInstitution,
    createInstitution,
    tags,
    instructors,
    addInstructor,
    removeInstructor,
    updateInstitutionTags,
    createTag,
  } = useDemoPlatform();
  const [activeSection, setActiveSection] = useState<CorporateSection>("overview");
  const [newInstitutionName, setNewInstitutionName] = useState("");
  const [newInstitutionCity, setNewInstitutionCity] = useState("İstanbul");
  const [newInstitutionDistrict, setNewInstitutionDistrict] = useState("Merkez");
  const [newInstructorName, setNewInstructorName] = useState("");
  const [newInstructorBranch, setNewInstructorBranch] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const ownedInstitutions = institutions.filter((item) => item.ownerUserId === currentUser?.id);
  const institution = ownedInstitutions[0];

  if (!currentUser || currentUser.role !== "institution_manager") {
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
                <div>
                  <p className="mb-1 text-sm font-semibold">Etiketler</p>
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
                  <div className="mt-2 flex gap-2">
                    <input
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Yeni etiket adı"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        if (!newTagName.trim()) return;
                        const newTagId = newTagName.toLowerCase().replaceAll(" ", "-");
                        createTag(newTagName);
                        if (!institution.tags.includes(newTagId)) {
                          updateInstitutionTags(institution.id, [...institution.tags, newTagId]);
                        }
                        setNewTagName("");
                      }}
                    >
                      Etiket Ekle
                    </button>
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
                          {item.name} - {item.branch}
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
                        addInstructor(institution.id, newInstructorName, newInstructorBranch);
                        setNewInstructorName("");
                        setNewInstructorBranch("");
                      }}
                    >
                      Eğitmen Ekle
                    </button>
                  </div>
                </div>
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
                  website: "https://www.yeni-kurum.demo",
                  shortDescription: "Kurumsal panelden eklenen demo kurum kartı.",
                  longDescription:
                    "Bu kart kurum yöneticisi tarafından demo amaçlı eklenmiştir ve daha sonra düzenlenebilir.",
                  tags: defaultTags,
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
