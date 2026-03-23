"use client";

import { useState } from "react";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

export function InstitutionForm() {
  const { tags, users, createManager, createInstitution } = useDemoPlatform();
  const managers = users.filter((item) => item.role === "institution_manager");
  const [name, setName] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("Merkez");
  const [managerId, setManagerId] = useState("");
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <form
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault();
        let ownerId = managerId;
        if (!ownerId && newManagerName && newManagerEmail) {
          ownerId = createManager({
            name: newManagerName,
            email: newManagerEmail,
            password: "Demo123!",
          }).id;
        }
        if (!ownerId) {
          alert("Kurum kartı kaydı için yönetici ataması zorunludur.");
          return;
        }
        createInstitution({
          name,
          type: "kurs",
          city,
          district,
          address: `${district} / ${city}`,
          phone: "0212 000 00 00",
          website: "https://www.demo-kurum.com",
          shortDescription: "Admin panelinden oluşturulan demo kurum kartı.",
          longDescription: "Bu kurum, admin paneli create institution akışı için oluşturulmuştur.",
          teacherCount: 10,
          minPrice: 3000,
          maxPrice: 7000,
          programs: ["TYT", "AYT"],
          tags: selectedTags,
          coverImage:
            "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
          galleryImages: [],
          featured: false,
          ownerUserId: ownerId,
        });
        setName("");
      }}
    >
      <h3 className="text-lg font-bold">Kurum Oluştur (Yönetici Ataması Zorunlu)</h3>
      <input
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="Kurum adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Şehir"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="İlçe"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        />
      </div>
      <select
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        value={managerId}
        onChange={(e) => setManagerId(e.target.value)}
      >
        <option value="">Mevcut yönetici seç</option>
        {managers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} - {m.email}
          </option>
        ))}
      </select>
      <p className="text-xs text-slate-500">veya yeni yönetici oluştur</p>
      <input
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="Yeni yönetici adı"
        value={newManagerName}
        onChange={(e) => setNewManagerName(e.target.value)}
      />
      <input
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="Yeni yönetici e-posta"
        value={newManagerEmail}
        onChange={(e) => setNewManagerEmail(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() =>
              setSelectedTags((prev) =>
                prev.includes(tag.id) ? prev.filter((item) => item !== tag.id) : [...prev, tag.id],
              )
            }
            className={`rounded-full px-3 py-1 text-xs ${selectedTags.includes(tag.id) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            {tag.name}
          </button>
        ))}
      </div>
      <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
        Kurumu Kaydet
      </button>
    </form>
  );
}
