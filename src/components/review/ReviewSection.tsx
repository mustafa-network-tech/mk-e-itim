"use client";

import { useMemo, useState } from "react";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { RatingStars } from "@/components/ui/RatingStars";

const PREVIEW_COUNT = 4;

export function ReviewSection({ institutionId }: { institutionId: string }) {
  const { reviews, addReview } = useDemoPlatform();
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const approved = useMemo(
    () =>
      reviews
        .filter((item) => item.institutionId === institutionId && item.status === "onaylandi")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [reviews, institutionId],
  );

  const visible = expanded ? approved : approved.slice(0, PREVIEW_COUNT);
  const hasMore = approved.length > PREVIEW_COUNT;

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900">Değerlendirme ve yorumlar</h3>

      <form
        className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name || !comment) return;
          addReview({ institutionId, userName: name, rating, comment });
          setName("");
          setComment("");
          setRating(5);
        }}
      >
        <p className="text-sm font-medium text-slate-800">Deneyiminizi paylaşın</p>
        <input
          placeholder="Ad Soyad"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((item) => (
            <option key={item} value={item}>
              {item} yıldız
            </option>
          ))}
        </select>
        <textarea
          rows={3}
          placeholder="Deneyiminizi yazın"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Yorumu Gönder
        </button>
        <p className="text-xs text-slate-500">Yorumlarınız yönetici onayından sonra listelenir.</p>
      </form>

      <div id="yorumlar-listesi" className="scroll-mt-28 space-y-3">
        {approved.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-600">
            Henüz onaylı yorum yok. İlk değerlendirmeyi siz yazabilirsiniz.
          </p>
        ) : (
          visible.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{item.userName}</p>
                <span className="shrink-0 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <RatingStars value={item.rating} size="sm" />
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{item.comment}</p>
            </article>
          ))
        )}
      </div>

      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
        >
          {expanded ? "Daha az göster" : "Tüm yorumları gör"}
        </button>
      ) : null}
    </section>
  );
}
