"use client";

import { useRef, useState } from "react";
import { uploadHeroSlideImage } from "@/lib/supabase/heroImageUpload";

type HeroImageUrlFieldProps = {
  value: string;
  onChange: (url: string) => void;
  /** Benzersiz id parçası (file input + erişilebilirlik) */
  fieldId: string;
};

export function HeroImageUrlField({ value, onChange, fieldId }: HeroImageUrlFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setHint(null);
    const r = await uploadHeroSlideImage(file);
    setBusy(false);
    if (r.ok) {
      onChange(r.publicUrl);
      setHint("Görsel yüklendi.");
    } else {
      setHint(r.message);
    }
  };

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
          aria-label="Cihazdan görsel yükle"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? "Yükleniyor…" : "Cihazdan yükle"}
        </button>
        <span className="text-xs text-slate-500">veya URL yapıştırın</span>
      </div>
      <input
        id={`${fieldId}-url`}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        placeholder="Görsel URL (https://…)"
        value={value}
        onChange={(e) => {
          setHint(null);
          onChange(e.target.value);
        }}
      />
      {hint ? (
        <p
          className={`text-xs ${hint === "Görsel yüklendi." ? "text-emerald-700" : "text-rose-700"}`}
        >
          {hint}
        </p>
      ) : null}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin önizleme; harici + data URL
        <img
          src={value}
          alt=""
          className="max-h-28 w-auto rounded-lg border border-slate-200 object-cover"
        />
      ) : null}
    </div>
  );
}
