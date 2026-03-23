"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function PageNav() {
  const router = useRouter();
  return (
    <div className="mb-4 flex items-center gap-2">
      <button
        onClick={() => router.back()}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        Geri Dön
      </button>
      <Link
        href="/"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        Ana Sayfa
      </Link>
    </div>
  );
}
