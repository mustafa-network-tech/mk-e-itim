"use client";

import { useState } from "react";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { RatingStars } from "@/components/ui/RatingStars";

export function ReviewSection({ institutionId }: { institutionId: string }) {
  const { reviews, addReview } = useDemoPlatform();
  const items = reviews.filter((item) => item.institutionId === institutionId);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-xl font-bold">Yorumlar ve Puanlar</h3>
      <form
        className="grid gap-2 rounded-xl bg-slate-50 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name || !comment) return;
          addReview({ institutionId, userName: name, rating, comment });
          setName("");
          setComment("");
          setRating(5);
        }}
      >
        <input
          placeholder="Ad Soyad"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">
          Yorumu Gönder
        </button>
      </form>
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-semibold">{item.userName}</p>
              <span className="text-xs text-slate-500">
                {new Date(item.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
            <RatingStars value={item.rating} size="sm" />
            <p className="mt-2 text-sm text-slate-700">{item.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
