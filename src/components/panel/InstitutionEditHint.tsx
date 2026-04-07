/** Liste kartı ile kurum detay sayfasında hangi verinin nerede kullanıldığını özetler. */
export function InstitutionEditHint({ variant }: { variant: "admin" | "corporate" }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-xs leading-relaxed text-slate-700">
      <p className="font-semibold text-slate-900">Kart ve kurum sayfası — tek kayıt, iki görünüm</p>
      <ul className="mt-2 list-inside list-disc space-y-1.5">
        <li>
          <strong className="text-slate-800">Liste / kart:</strong> kapak görseli (görsellerin ilki), kategori,
          kurum adı, şehir/ilçe, kısa özet, puan, fiyat aralığı (₺) ve indirim şeridi, WhatsApp; etiketler kartta da kısa
          görünür.
        </li>
        <li>
          <strong className="text-slate-800">Kurum sayfası:</strong> kapak görseli (başlıksız), altında kurum adı ve
          indirim bandı; ardından başlıksız özet (konum, fiyat, etiketler, iletişim), «Kurum genel bilgileri» (8
          kart), «Kurum hakkında» (serbest metin), «Programlar» (2–8 kart + modal), galeri, adres/harita, yorumlar.
        </li>
      </ul>
      {variant === "corporate" ? (
        <p className="mt-2 border-t border-indigo-100 pt-2 text-slate-600">
          Alan seti admin paneliyle aynıdır. Yayındaki kurumda değişiklikler <strong>onaya</strong> gider;
          yalnızca <strong>yeni etiket adı</strong> tanımlama admin içindedir (mevcut etiketleri
          seçebilirsiniz).
        </p>
      ) : (
        <p className="mt-2 border-t border-indigo-100 pt-2 text-slate-600">
          Aşağıda alanları &quot;kart&quot; ve &quot;sayfa&quot; olarak grupladık; tam alan seti için üstteki
          yeni kurum formunu kullanın. Siz (genel admin) <strong>Kaydet</strong> dediğinizde değişiklikler{" "}
          <strong>doğrudan</strong> veritabanına yazılır, ek onay adımı yok. Yalnızca{" "}
          <strong>kurum yöneticisinin</strong> yayındaki karta gönderdiği talepler ayrı kutuda listelenir;
          ilgili kurumu <strong>Düzenle</strong> deyince formun üstünde onay / red butonları görünür.
        </p>
      )}
    </div>
  );
}
