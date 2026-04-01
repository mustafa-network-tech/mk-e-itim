"use client";

import { useMemo, useState } from "react";
import { INSTITUTION_DEFAULTS } from "@/data/institutionDefaults";
import {
  formatTryPriceRange,
  getDiscountedPriceFromMin,
  syncInstitutionPriceDisplayFields,
} from "@/lib/discount";
import {
  createEmptyAboutCards,
  longDescriptionFromAboutCards,
  normalizeAboutCards,
} from "@/lib/institutionAboutCards";
import {
  normalizeProgramCards,
  programsArrayFromProgramCards,
} from "@/lib/institutionProgramCards";
import type { InstitutionAboutCard, InstitutionProgramCard } from "@/types";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { categoryDisplayFromExamNavIds, normalizeExamNavIds } from "@/lib/examMenuNav";
import { ExamNavMultiSelect } from "@/components/panel/ExamNavMultiSelect";
import { INSTITUTION_TYPES_SEED } from "@/data/institutionTypesSeed";

const input =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300";
const label = "mb-1 block text-xs font-semibold text-slate-700";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">{children}</h4>
  );
}

function numField(raw: string, fallback: number) {
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

type InstitutionFormProps = {
  /** Kurumsal panel: kart taslak oluşur, admin yayına alır */
  listedOnCreate?: boolean;
  /** Giriş yapan yönetici owner olur; yönetici seçimi gizlenir */
  selfServeManager?: boolean;
};

export function InstitutionForm({
  listedOnCreate = true,
  selfServeManager = false,
}: InstitutionFormProps = {}) {
  const {
    tags,
    gradeLevels,
    users,
    institutions,
    institutionTypes,
    createManager,
    createInstitution,
    currentUser,
  } = useDemoPlatform();
  const examTypes = institutionTypes.length > 0 ? institutionTypes : INSTITUTION_TYPES_SEED;
  /** Her kurumda tek yönetici: zaten bir kuruma atanmış olanlar seçilemez */
  const managers = users.filter(
    (item) =>
      item.role === "institution_manager" &&
      !institutions.some((i) => i.ownerUserId === item.id),
  );

  const defaults = useMemo(() => INSTITUTION_DEFAULTS, []);

  const [name, setName] = useState("");
  const [officialStatus, setOfficialStatus] = useState("");
  const [examNavIds, setExamNavIds] = useState<string[]>(() => [...defaults.examNavIds]);
  const [city, setCity] = useState(defaults.city);
  const [district, setDistrict] = useState(defaults.district);
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(defaults.phone);
  const [website, setWebsite] = useState(defaults.website);
  const [whatsapp, setWhatsapp] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [aboutCards, setAboutCards] = useState<InstitutionAboutCard[]>(() => createEmptyAboutCards());
  const [aboutInstitution, setAboutInstitution] = useState("");
  const [minPrice, setMinPrice] = useState(String(defaults.minPrice));
  const [maxPrice, setMaxPrice] = useState(String(defaults.maxPrice));
  const [rating, setRating] = useState(String(defaults.rating));
  const [reviewCount, setReviewCount] = useState(String(defaults.reviewCount));
  const [programCards, setProgramCards] = useState<InstitutionProgramCard[]>(() =>
    defaults.programCards.map((c) => ({ ...c })),
  );
  const [imagesText, setImagesText] = useState(defaults.images.join("\n"));
  const [featured, setFeatured] = useState(defaults.featured);
  const [topVisible, setTopVisible] = useState(defaults.topVisible ?? true);
  const [managerId, setManagerId] = useState("");
  const [newManagerName, setNewManagerName] = useState("");
  const [newManagerEmail, setNewManagerEmail] = useState("");
  const [newManagerPassword, setNewManagerPassword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [discountActive, setDiscountActive] = useState(defaults.discountActive);
  const [discountPercent, setDiscountPercent] = useState(String(defaults.discountPercent));
  const [discountText, setDiscountText] = useState(defaults.discountText);
  const [discountStartDate, setDiscountStartDate] = useState(defaults.discountStartDate);
  const [discountEndDate, setDiscountEndDate] = useState(defaults.discountEndDate);

  const resetForm = () => {
    setName("");
    setOfficialStatus("");
    setExamNavIds([...defaults.examNavIds]);
    setCity(defaults.city);
    setDistrict(defaults.district);
    setNeighborhood("");
    setAddress("");
    setPhone(defaults.phone);
    setWebsite(defaults.website);
    setWhatsapp("");
    setShortDescription("");
    setAboutCards(createEmptyAboutCards());
    setAboutInstitution("");
    setMinPrice(String(defaults.minPrice));
    setMaxPrice(String(defaults.maxPrice));
    setRating(String(defaults.rating));
    setReviewCount(String(defaults.reviewCount));
    setProgramCards(defaults.programCards.map((c) => ({ ...c })));
    setImagesText(defaults.images.join("\n"));
    setFeatured(defaults.featured);
    setTopVisible(defaults.topVisible ?? true);
    setManagerId("");
    setNewManagerName("");
    setNewManagerEmail("");
    setNewManagerPassword("");
    setSelectedTags([]);
    setSelectedGradeIds([]);
    setDiscountActive(defaults.discountActive);
    setDiscountPercent(String(defaults.discountPercent));
    setDiscountText(defaults.discountText);
    setDiscountStartDate(defaults.discountStartDate);
    setDiscountEndDate(defaults.discountEndDate);
  };

  return (
    <form
      className="space-y-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        void (async () => {
        let ownerId = selfServeManager && currentUser?.id ? currentUser.id : managerId;
        if (!ownerId && newManagerName.trim() && newManagerEmail.trim()) {
          const pwd = newManagerPassword.trim();
          if (!pwd) {
            alert("Yeni yönetici için şifre zorunludur.");
            return;
          }
          const mgrRes = await createManager({
            name: newManagerName.trim(),
            email: newManagerEmail.trim(),
            password: pwd,
          });
          if (!mgrRes.ok) {
            alert(mgrRes.message);
            return;
          }
          ownerId = mgrRes.user.id;
        }
        if (!ownerId) {
          alert("Kurum kartı kaydı için yönetici ataması zorunludur.");
          return;
        }

        const navIds = normalizeExamNavIds(examNavIds);
        if (navIds.length === 0) {
          alert("En az bir kurum türü (LGS, YKS, Yabancı dil, …) seçmelisiniz.");
          return;
        }

        const images = imagesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

        const resolvedAddress =
          address.trim() || `${neighborhood ? `${neighborhood}, ` : ""}${district} / ${city}`.trim();

        const priceSync = syncInstitutionPriceDisplayFields(
          numField(minPrice, defaults.minPrice),
          numField(maxPrice, defaults.maxPrice),
        );
        const cardsNorm = normalizeAboutCards(aboutCards);
        const progNorm = normalizeProgramCards(programCards);

        const created = await createInstitution({
          name: name.trim(),
          officialStatus: officialStatus.trim(),
          ownerUserId: ownerId,
          examNavIds: navIds,
          category: categoryDisplayFromExamNavIds(navIds),
          city: city.trim(),
          district: district.trim(),
          neighborhood: neighborhood.trim(),
          address: resolvedAddress,
          phone: phone.trim(),
          website: website.trim(),
          whatsapp: whatsapp.trim(),
          shortDescription:
            shortDescription.trim() || "Kurum açıklaması kısa özet olarak güncellenebilir.",
          aboutCards: cardsNorm,
          aboutInstitution: aboutInstitution.trim(),
          longDescription: longDescriptionFromAboutCards(cardsNorm),
          price: priceSync.price,
          priceRange: priceSync.priceRange,
          minPrice: priceSync.minPrice,
          maxPrice: priceSync.maxPrice,
          rating: Math.min(5, Math.max(0, numField(rating, defaults.rating))),
          reviewCount: Math.max(0, Math.floor(numField(reviewCount, defaults.reviewCount))),
          programCards: progNorm,
          programs: programsArrayFromProgramCards(progNorm),
          tags: selectedTags,
          images: images.length > 0 ? images : [...defaults.images],
          featured,
          topVisible,
          gradeLevelIds: selectedGradeIds,
          discountActive: discountActive && numField(discountPercent, 0) > 0,
          discountPercent: Math.min(95, Math.max(0, Math.round(numField(discountPercent, 0)))),
          discountText: discountText.trim(),
          discountStartDate: discountStartDate.trim(),
          discountEndDate: discountEndDate.trim(),
          listed: listedOnCreate,
        });
        if (!created.ok) {
          alert(created.message);
          return;
        }
        resetForm();
        })();
      }}
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900">Yeni kurum kartı oluştur</h3>
        <p className="mt-1 text-xs text-slate-500">
          Kurum kartında ve detay sayfasında kullanılan tüm alanları buradan doldurabilirsiniz.
          Boş bıraktığınız metinlerde güvenli varsayılanlar uygulanır.
        </p>
      </div>

      <div className="space-y-4">
        <SectionTitle>Temel bilgiler</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Kurum adı *</label>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn. Örnek Eğitim Merkezi"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Resmi statü / tabela ünvanı (ismin altında ince satır)</label>
            <input
              className={input}
              value={officialStatus}
              onChange={(e) => setOfficialStatus(e.target.value)}
              placeholder="Örn. Özel Öğretim Kursu · MEB izin belge no …"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Kurum türleri (kartta birleşik gösterilir)</label>
            <ExamNavMultiSelect
              types={examTypes}
              idPrefix="new-inst-exam"
              value={examNavIds}
              onChange={setExamNavIds}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Konum</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Şehir</label>
            <input className={input} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className={label}>İlçe</label>
            <input className={input} value={district} onChange={(e) => setDistrict(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Mahalle</label>
            <input
              className={input}
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Örn. Kadıköy Mah."
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Açık adres</label>
            <input
              className={input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Sokak, bina no; boşsa mahalle / ilçe / şehir birleştirilir"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>İletişim</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Telefon</label>
            <input className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={label}>Web sitesi</label>
            <input
              className={input}
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>WhatsApp (numara)</label>
            <input
              className={input}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="905551234567"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Metinler</SectionTitle>
        <div>
          <label className={label}>Kısa açıklama (kart özeti)</label>
          <textarea
            className={input}
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
        </div>
        <div>
          <p className={`${label} mb-2`}>Kurum genel bilgileri — 8 bilgi kartı (detayda bu başlık altında)</p>
          <p className="mb-3 text-xs text-slate-500">
            Her kartta isteğe bağlı kısa başlık ve metin. Boş kartlar sitede yine görünür (içerik yoksa —).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {aboutCards.map((card, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <p className="mb-2 text-xs font-semibold text-slate-600">Kart {i + 1}</p>
                <label className={label}>Başlık (isteğe bağlı)</label>
                <input
                  className={input}
                  value={card.title}
                  onChange={(e) => {
                    const next = [...aboutCards];
                    next[i] = { ...next[i], title: e.target.value };
                    setAboutCards(next);
                  }}
                />
                <label className={`${label} mt-2`}>Metin</label>
                <textarea
                  className={input}
                  rows={3}
                  value={card.body}
                  onChange={(e) => {
                    const next = [...aboutCards];
                    next[i] = { ...next[i], body: e.target.value };
                    setAboutCards(next);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className={label}>Kurum hakkında (detay sayfası)</label>
          <p className="mb-2 text-xs text-slate-500">
            «Kurum genel bilgileri» kartlarından sonra, serbest metin alanı. Boş bırakılabilir.
          </p>
          <textarea
            className={input}
            rows={5}
            value={aboutInstitution}
            onChange={(e) => setAboutInstitution(e.target.value)}
            placeholder="Kurumunuzu anlatan metin…"
          />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Fiyat aralığı (₺)</SectionTitle>
        <p className="text-xs text-slate-500">
          Kart ve detay sayfasında yalnızca bu iki tutar aralığı gösterilir (örn. 100.000 ₺ – 120.000 ₺). Liste
          filtreleri de bu değerlere göre çalışır.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>En düşük (₺)</label>
            <input
              className={input}
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>En yüksek (₺)</label>
            <input
              className={input}
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Görseller</SectionTitle>
        <p className="text-xs text-slate-500">
          Her satıra bir görsel URL’si. İlk satır kapak görseli olarak kullanılır.
        </p>
        <textarea
          className={input}
          rows={4}
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-4">
        <SectionTitle>Programlar (8 kart)</SectionTitle>
        <p className="text-xs text-slate-500">
          Kart başlığı listede görünür; tıklanınca açılan modaldaki metin «Modal metni» alanıdır.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {programCards.map((card, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-600">Program {i + 1}</p>
              <label className={label}>Kart başlığı</label>
              <input
                className={input}
                value={card.title}
                onChange={(e) => {
                  const next = [...programCards];
                  next[i] = { ...next[i], title: e.target.value };
                  setProgramCards(next);
                }}
              />
              <label className={`${label} mt-2`}>Modal metni</label>
              <textarea
                className={input}
                rows={3}
                value={card.body}
                onChange={(e) => {
                  const next = [...programCards];
                  next[i] = { ...next[i], body: e.target.value };
                  setProgramCards(next);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Kursiyera kampanyası (indirim)</SectionTitle>
        <p className="text-xs text-slate-500">
          İndirim, fiyat aralığının <strong>her iki ucuna</strong> aynı yüzde uygulanır; indirimli aralık otomatik
          gösterilir. Şerit metni boşsa sistem üretir.
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="rounded border-slate-300"
            checked={discountActive}
            onChange={(e) => setDiscountActive(e.target.checked)}
          />
          Kampanya aktif
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>İndirim oranı (%)</label>
            <input
              className={input}
              inputMode="numeric"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              disabled={!discountActive}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Şerit metni (isteğe bağlı)</label>
            <input
              className={input}
              value={discountText}
              onChange={(e) => setDiscountText(e.target.value)}
              placeholder="Boş bırakırsanız otomatik metin kullanılır"
              disabled={!discountActive}
            />
          </div>
          <div>
            <label className={label}>Başlangıç (YYYY-AA-GG)</label>
            <input
              className={input}
              type="date"
              value={discountStartDate}
              onChange={(e) => setDiscountStartDate(e.target.value)}
              disabled={!discountActive}
            />
          </div>
          <div>
            <label className={label}>Bitiş (YYYY-AA-GG)</label>
            <input
              className={input}
              type="date"
              value={discountEndDate}
              onChange={(e) => setDiscountEndDate(e.target.value)}
              disabled={!discountActive}
            />
          </div>
        </div>
        {discountActive && numField(discountPercent, 0) > 0
          ? (() => {
              const s = syncInstitutionPriceDisplayFields(
                numField(minPrice, defaults.minPrice),
                numField(maxPrice, defaults.maxPrice),
              );
              const pct = numField(discountPercent, 0);
              return (
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
                  <p className="font-semibold">Önizleme</p>
                  <p className="mt-1">
                    Şerit:{" "}
                    {discountText.trim() ||
                      `Kursiyera'ya özel %${Math.round(pct)} indirim`}
                  </p>
                  <p>
                    Aralık:{" "}
                    <span className="line-through opacity-70">
                      {formatTryPriceRange(s.minPrice, s.maxPrice)}
                    </span>{" "}
                    →{" "}
                    <strong>
                      {formatTryPriceRange(
                        getDiscountedPriceFromMin(s.minPrice, pct),
                        getDiscountedPriceFromMin(s.maxPrice, pct),
                      )}
                    </strong>
                  </p>
                </div>
              );
            })()
          : null}
      </div>

      <div className="space-y-4">
        <SectionTitle>Görünürlük ve puan (özet)</SectionTitle>
        <p className="text-xs text-slate-500">
          Onaylı yorum yoksa kartta bu özet puan ve yorum sayısı gösterilir.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={label}>Özet puan (0–5)</label>
            <input
              className={input}
              inputMode="decimal"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Özet yorum sayısı</label>
            <input
              className={input}
              inputMode="numeric"
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Öne çıkan kurum
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 sm:col-span-2">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={topVisible}
              onChange={(e) => setTopVisible(e.target.checked)}
            />
            Üst vitrinde göster
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Etiketler</SectionTitle>
        <p className="text-xs text-slate-500">
          Arama ve filtrelerle eşleşir. Yeni etiket için Admin → Etiketler bölümünü kullanın.
        </p>
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
              className={`rounded-full px-3 py-1 text-xs ${
                selectedTags.includes(tag.id)
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Hedef sınıflar</SectionTitle>
        <p className="text-xs text-slate-500">Hero ve listelemede sınıf filtresi için. Admin → Sınıf seçenekleri.</p>
        <div className="flex flex-wrap gap-2">
          {gradeLevels.map((gl) => (
            <button
              key={gl.id}
              type="button"
              onClick={() =>
                setSelectedGradeIds((prev) =>
                  prev.includes(gl.id) ? prev.filter((id) => id !== gl.id) : [...prev, gl.id],
                )
              }
              className={`rounded-full px-3 py-1 text-xs ${
                selectedGradeIds.includes(gl.id)
                  ? "bg-amber-700 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {gl.label}
            </button>
          ))}
        </div>
      </div>

      {!selfServeManager ? (
        <div className="space-y-4">
          <SectionTitle>Kurum yöneticisi (tek kişi) *</SectionTitle>
          <p className="text-xs text-slate-500">
            Her kurum kartında yalnızca bir yönetici olur. Listede yalnızca henüz başka kuruma atanmamış
            yöneticiler görünür. Davet akışı için &quot;Yönetici Yönetimi&quot; sekmesini de
            kullanabilirsiniz.
          </p>
          <select
            className={input}
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
          >
            <option value="">Mevcut yönetici seç</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.email}
              </option>
            ))}
          </select>
          <p className="text-xs font-medium text-slate-600">veya bu kartla birlikte yeni hesap oluştur</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              className={input}
              placeholder="Ad soyad"
              value={newManagerName}
              onChange={(e) => setNewManagerName(e.target.value)}
            />
            <input
              className={input}
              type="email"
              placeholder="E-posta (giriş için)"
              value={newManagerEmail}
              onChange={(e) => setNewManagerEmail(e.target.value)}
            />
            <input
              className={input}
              type="password"
              placeholder="İlk şifre (davet)"
              value={newManagerPassword}
              onChange={(e) => setNewManagerPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-600">
          Bu kart sizin hesabınıza atanır. Kayıt <strong>taslak</strong> olarak oluşur; platform
          yöneticisi yayına alana kadar anonim listede görünmez.
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto sm:px-8"
      >
        Kartı kaydet
      </button>
    </form>
  );
}
