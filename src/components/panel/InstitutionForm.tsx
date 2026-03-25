"use client";

import { useMemo, useState } from "react";
import { INSTITUTION_DEFAULTS } from "@/data/institutionDefaults";
import { formatTryAmount, getDiscountedPriceFromMin } from "@/lib/discount";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

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

export function InstitutionForm() {
  const { tags, gradeLevels, users, institutions, createManager, createInstitution } =
    useDemoPlatform();
  /** Her kurumda tek yönetici: zaten bir kuruma atanmış olanlar seçilemez */
  const managers = users.filter(
    (item) =>
      item.role === "institution_manager" &&
      !institutions.some((i) => i.ownerUserId === item.id),
  );

  const defaults = useMemo(() => INSTITUTION_DEFAULTS, []);

  const [name, setName] = useState("");
  const [institutionType, setInstitutionType] = useState<"kurs" | "dershane">("kurs");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState(defaults.city);
  const [district, setDistrict] = useState(defaults.district);
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(defaults.phone);
  const [website, setWebsite] = useState(defaults.website);
  const [whatsapp, setWhatsapp] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceRange, setPriceRange] = useState(defaults.priceRange);
  const [minPrice, setMinPrice] = useState(String(defaults.minPrice));
  const [maxPrice, setMaxPrice] = useState(String(defaults.maxPrice));
  const [rating, setRating] = useState(String(defaults.rating));
  const [reviewCount, setReviewCount] = useState(String(defaults.reviewCount));
  const [teacherCount, setTeacherCount] = useState(String(defaults.teacherCount));
  const [teacherInfo, setTeacherInfo] = useState(defaults.teacherInfo);
  const [programsText, setProgramsText] = useState(defaults.programs.join("\n"));
  const [imagesText, setImagesText] = useState(defaults.images.join("\n"));
  const [weeklyHours, setWeeklyHours] = useState(String(defaults.weeklyHours));
  const [totalHours, setTotalHours] = useState(String(defaults.totalHours));
  const [oneToOneLessonCount, setOneToOneLessonCount] = useState(
    String(defaults.oneToOneLessonCount),
  );
  const [classroomCount, setClassroomCount] = useState(String(defaults.classroomCount));
  const [capacity, setCapacity] = useState(String(defaults.capacity));
  const [classSize, setClassSize] = useState(String(defaults.classSize));
  const [libraryCapacity, setLibraryCapacity] = useState(String(defaults.libraryCapacity));
  const [examCount, setExamCount] = useState(String(defaults.examCount));
  const [coachingRatio, setCoachingRatio] = useState(defaults.coachingRatio);
  const [digitalPlatformInfo, setDigitalPlatformInfo] = useState(defaults.digitalPlatformInfo);
  const [hasPublicationSupport, setHasPublicationSupport] = useState(
    defaults.hasPublicationSupport,
  );
  const [hasDigitalPlatform, setHasDigitalPlatform] = useState(defaults.hasDigitalPlatform);
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
    setInstitutionType("kurs");
    setCategory("");
    setCity(defaults.city);
    setDistrict(defaults.district);
    setNeighborhood("");
    setAddress("");
    setPhone(defaults.phone);
    setWebsite(defaults.website);
    setWhatsapp("");
    setShortDescription("");
    setLongDescription("");
    setPrice("");
    setPriceRange(defaults.priceRange);
    setMinPrice(String(defaults.minPrice));
    setMaxPrice(String(defaults.maxPrice));
    setRating(String(defaults.rating));
    setReviewCount(String(defaults.reviewCount));
    setTeacherCount(String(defaults.teacherCount));
    setTeacherInfo(defaults.teacherInfo);
    setProgramsText(defaults.programs.join("\n"));
    setImagesText(defaults.images.join("\n"));
    setWeeklyHours(String(defaults.weeklyHours));
    setTotalHours(String(defaults.totalHours));
    setOneToOneLessonCount(String(defaults.oneToOneLessonCount));
    setClassroomCount(String(defaults.classroomCount));
    setCapacity(String(defaults.capacity));
    setClassSize(String(defaults.classSize));
    setLibraryCapacity(String(defaults.libraryCapacity));
    setExamCount(String(defaults.examCount));
    setCoachingRatio(defaults.coachingRatio);
    setDigitalPlatformInfo(defaults.digitalPlatformInfo);
    setHasPublicationSupport(defaults.hasPublicationSupport);
    setHasDigitalPlatform(defaults.hasDigitalPlatform);
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
        let ownerId = managerId;
        if (!ownerId && newManagerName.trim() && newManagerEmail.trim()) {
          const pwd = newManagerPassword.trim();
          if (!pwd) {
            alert("Yeni yönetici için şifre zorunludur.");
            return;
          }
          const mgr = createManager({
            name: newManagerName.trim(),
            email: newManagerEmail.trim(),
            password: pwd,
          });
          if (!mgr) {
            alert("Bu e-posta adresi zaten kayıtlı. Mevcut yöneticiyi seçin veya farklı e-posta kullanın.");
            return;
          }
          ownerId = mgr.id;
        }
        if (!ownerId) {
          alert("Kurum kartı kaydı için yönetici ataması zorunludur.");
          return;
        }

        const programs = programsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
        const images = imagesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);

        const resolvedAddress =
          address.trim() || `${neighborhood ? `${neighborhood}, ` : ""}${district} / ${city}`.trim();

        createInstitution({
          name: name.trim(),
          ownerUserId: ownerId,
          type: institutionType,
          category: category.trim() || "Genel",
          city: city.trim(),
          district: district.trim(),
          neighborhood: neighborhood.trim(),
          address: resolvedAddress,
          phone: phone.trim(),
          website: website.trim(),
          whatsapp: whatsapp.trim(),
          shortDescription:
            shortDescription.trim() || "Kurum açıklaması kısa özet olarak güncellenebilir.",
          longDescription:
            longDescription.trim() ||
            "Kurum hakkında detaylı açıklama admin panelinden düzenlenebilir.",
          price: price.trim(),
          priceRange: priceRange.trim() || defaults.priceRange,
          minPrice: numField(minPrice, defaults.minPrice),
          maxPrice: numField(maxPrice, defaults.maxPrice),
          rating: Math.min(5, Math.max(0, numField(rating, defaults.rating))),
          reviewCount: Math.max(0, Math.floor(numField(reviewCount, defaults.reviewCount))),
          teacherCount: Math.max(0, Math.floor(numField(teacherCount, defaults.teacherCount))),
          teacherInfo: teacherInfo.trim() || defaults.teacherInfo,
          programs: programs.length > 0 ? programs : [...defaults.programs],
          tags: selectedTags,
          images: images.length > 0 ? images : [...defaults.images],
          weeklyHours: Math.max(0, numField(weeklyHours, defaults.weeklyHours)),
          totalHours: Math.max(0, numField(totalHours, defaults.totalHours)),
          oneToOneLessonCount: Math.max(
            0,
            Math.floor(numField(oneToOneLessonCount, defaults.oneToOneLessonCount)),
          ),
          classroomCount: Math.max(0, Math.floor(numField(classroomCount, defaults.classroomCount))),
          capacity: Math.max(0, Math.floor(numField(capacity, defaults.capacity))),
          classSize: Math.max(0, Math.floor(numField(classSize, defaults.classSize))),
          libraryCapacity: Math.max(0, Math.floor(numField(libraryCapacity, defaults.libraryCapacity))),
          hasPublicationSupport,
          examCount: Math.max(0, Math.floor(numField(examCount, defaults.examCount))),
          hasDigitalPlatform,
          digitalPlatformInfo: digitalPlatformInfo.trim(),
          coachingRatio: coachingRatio.trim() || defaults.coachingRatio,
          featured,
          topVisible,
          gradeLevelIds: selectedGradeIds,
          discountActive: discountActive && numField(discountPercent, 0) > 0,
          discountPercent: Math.min(95, Math.max(0, Math.round(numField(discountPercent, 0)))),
          discountText: discountText.trim(),
          discountStartDate: discountStartDate.trim(),
          discountEndDate: discountEndDate.trim(),
        });
        resetForm();
      }}
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900">Yeni Kurs / Dershane Kartı Oluştur</h3>
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
          <div>
            <label className={label}>Tür</label>
            <select
              className={input}
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value as "kurs" | "dershane")}
            >
              <option value="kurs">Kurs</option>
              <option value="dershane">Dershane</option>
            </select>
          </div>
          <div>
            <label className={label}>Kategori (kart üst etiketi)</label>
            <input
              className={input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Örn. Matematik · YKS"
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
          <label className={label}>Uzun açıklama (detay sayfası)</label>
          <textarea
            className={input}
            rows={5}
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Fiyat</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Fiyat özeti (tek satır)</label>
            <input
              className={input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Örn. Aylık paketler 4.200 TL'den başlar"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Fiyat aralığı metni</label>
            <input
              className={input}
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              placeholder="Örn. ₺3.500 – ₺8.500 / ay"
            />
          </div>
          <div>
            <label className={label}>Min. fiyat (sayı, filtre için)</label>
            <input
              className={input}
              inputMode="decimal"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Maks. fiyat (sayı, filtre için)</label>
            <input
              className={input}
              inputMode="decimal"
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
        <SectionTitle>Programlar</SectionTitle>
        <p className="text-xs text-slate-500">Her satırda bir program adı.</p>
        <textarea
          className={input}
          rows={4}
          value={programsText}
          onChange={(e) => setProgramsText(e.target.value)}
          placeholder="TYT Matematik&#10;AYT Matematik"
        />
      </div>

      <div className="space-y-4">
        <SectionTitle>Kadro ve kapasite</SectionTitle>
        <div>
          <label className={label}>Öğretmen / kadro özeti</label>
          <textarea
            className={input}
            rows={3}
            value={teacherInfo}
            onChange={(e) => setTeacherInfo(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={label}>Öğretmen sayısı</label>
            <input
              className={input}
              inputMode="numeric"
              value={teacherCount}
              onChange={(e) => setTeacherCount(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Haftalık saat</label>
            <input
              className={input}
              inputMode="numeric"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Toplam saat</label>
            <input
              className={input}
              inputMode="numeric"
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Birebir ders sayısı</label>
            <input
              className={input}
              inputMode="numeric"
              value={oneToOneLessonCount}
              onChange={(e) => setOneToOneLessonCount(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Derslik sayısı</label>
            <input
              className={input}
              inputMode="numeric"
              value={classroomCount}
              onChange={(e) => setClassroomCount(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Toplam kapasite</label>
            <input
              className={input}
              inputMode="numeric"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Sınıf mevcudu</label>
            <input
              className={input}
              inputMode="numeric"
              value={classSize}
              onChange={(e) => setClassSize(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Kütüphane kapasitesi</label>
            <input
              className={input}
              inputMode="numeric"
              value={libraryCapacity}
              onChange={(e) => setLibraryCapacity(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Deneme / sınav sayısı</label>
            <input
              className={input}
              inputMode="numeric"
              value={examCount}
              onChange={(e) => setExamCount(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Koçluk oranı metni</label>
            <input
              className={input}
              value={coachingRatio}
              onChange={(e) => setCoachingRatio(e.target.value)}
              placeholder="1 / 14"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Dijital ve yayın</SectionTitle>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={hasPublicationSupport}
              onChange={(e) => setHasPublicationSupport(e.target.checked)}
            />
            Yayın / materyal desteği
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={hasDigitalPlatform}
              onChange={(e) => setHasDigitalPlatform(e.target.checked)}
            />
            Dijital platform var
          </label>
        </div>
        <div>
          <label className={label}>Dijital platform açıklaması</label>
          <textarea
            className={input}
            rows={2}
            value={digitalPlatformInfo}
            onChange={(e) => setDigitalPlatformInfo(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <SectionTitle>Kursiyera kampanyası (indirim)</SectionTitle>
        <p className="text-xs text-slate-500">
          İndirim, <strong>min. fiyat</strong> (sayısal) üzerinden otomatik hesaplanır; ayrıca indirimli tutar
          elle girilmez. Şerit metni boşsa sistem üretir.
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
        {discountActive && numField(discountPercent, 0) > 0 ? (
          <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
            <p className="font-semibold">Önizleme</p>
            <p className="mt-1">
              Şerit:{" "}
              {discountText.trim() ||
                `Kursiyera'ya özel %${Math.round(numField(discountPercent, 0))} indirim`}
            </p>
            <p>
              Min. tutar:{" "}
              <span className="line-through opacity-70">
                {formatTryAmount(numField(minPrice, defaults.minPrice))}
              </span>{" "}
              →{" "}
              <strong>
                {formatTryAmount(
                  getDiscountedPriceFromMin(
                    numField(minPrice, defaults.minPrice),
                    numField(discountPercent, 0),
                  ),
                )}
              </strong>
            </p>
          </div>
        ) : null}
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

      <button
        type="submit"
        className="w-full rounded-lg bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 sm:w-auto sm:px-8"
      >
        Kartı kaydet
      </button>
    </form>
  );
}
