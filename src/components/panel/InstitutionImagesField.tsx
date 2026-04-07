"use client";

import { useRef, useState } from "react";
import { uploadInstitutionImage } from "@/lib/supabase/institutionImageUpload";

type InstitutionImagesFieldProps = {
  /** Mevcut kurum düzenlenirken; yeni kurumda boş — taslak klasörüne yüklenir. */
  institutionId?: string | null;
  images: string[];
  onChange: (urls: string[]) => void;
  fieldId: string;
  /** Textarea satır sayısı */
  textareaRows?: number;
};

export function InstitutionImagesField({
  institutionId,
  images,
  onChange,
  fieldId,
  textareaRows = 4,
}: InstitutionImagesFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setHint(null);
    const r = await uploadInstitutionImage(file, institutionId);
    setBusy(false);
    if (r.ok) {
      onChange([...images, r.publicUrl]);
      setHint("Görsel listeye eklendi. İlk satır kapak görselidir.");
    } else {
      setHint(r.message);
    }
  };

  const textareaValue = images.join("\n");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          id={`${fieldId}-file`}
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={onFile}
        />
        <button
          type="button"
          disabled={busy}
          aria-label="Bilgisayar veya telefondan fotoğraf yükle"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? "Yükleniyor…" : "Fotoğraf yükle"}
        </button>
        <span className="text-xs text-slate-500">
          Bilgisayardan seçin veya mobilde galeri / kamera
        </span>
      </div>
      <p className="text-xs text-slate-500">
        Her satır bir görsel adresi. İlk satır kapak. İsterseniz URL yapıştırabilir veya yükleyerek ekleyebilirsiniz.
      </p>
      <textarea
        id={`${fieldId}-urls`}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        rows={textareaRows}
        value={textareaValue}
        onChange={(e) => {
          setHint(null);
          onChange(
            e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
          );
        }}
        placeholder="https://…"
      />
      {hint ? (
        <p
          className={`text-xs ${hint.includes("eklendi") ? "text-emerald-700" : "text-rose-700"}`}
        >
          {hint}
        </p>
      ) : null}
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- panel önizleme; harici + data URL
            <img
              key={`${i}-${src.slice(0, 48)}`}
              src={src}
              alt=""
              className="h-16 w-24 rounded-md border border-slate-200 object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
