"use client";

import { PageNav } from "@/components/ui/PageNav";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";

export default function PrivacyPage() {
  const { staticPages } = useDemoPlatform();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageNav />
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="mb-3 text-2xl font-bold">Gizlilik</h1>
        <p className="whitespace-pre-wrap text-slate-700">{staticPages.privacy}</p>
      </section>
    </div>
  );
}
