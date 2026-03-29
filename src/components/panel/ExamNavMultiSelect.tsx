"use client";

import type { InstitutionTypeDef } from "@/types";
import { sortInstitutionTypes } from "@/data/institutionTypesSeed";
import { normalizeExamNavIds, type ExamNavValue } from "@/lib/examMenuNav";

type Props = {
  types: InstitutionTypeDef[];
  value: string[];
  onChange: (next: string[]) => void;
  idPrefix?: string;
  /** true iken hiç seçim yoksa kırmızı çerçeve */
  showError?: boolean;
};

export function ExamNavMultiSelect({ types, value, onChange, idPrefix = "exam-nav", showError }: Props) {
  const normalized = normalizeExamNavIds(value);
  const sorted = sortInstitutionTypes(types);

  const toggle = (v: ExamNavValue) => {
    const set = new Set<ExamNavValue>(normalized);
    if (set.has(v)) {
      if (set.size <= 1) return;
      set.delete(v);
    } else {
      set.add(v);
    }
    const orderIds = sorted.map((t) => t.id);
    onChange(orderIds.filter((id) => set.has(id as ExamNavValue)));
  };

  return (
    <div
      className={`rounded-xl border p-3 ${
        showError && normalized.length === 0
          ? "border-red-300 bg-red-50/40"
          : "border-slate-200 bg-slate-50/50"
      }`}
      role="group"
      aria-label="Kurum türleri"
    >
      <p className="mb-2 text-[11px] text-slate-600">
        Kurum türünüz üst menüdeki filtreyle aynı sabit kodlara bağlıdır; görünen adları yalnızca admin
        değiştirir. <strong className="text-slate-800">En az bir tür zorunludur;</strong> birden fazla
        seçebilirsiniz.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {sorted.map((item) => {
          const checked = normalized.includes(item.id as ExamNavValue);
          const id = `${idPrefix}-${item.id}`;
          return (
            <li key={item.id}>
              <label
                htmlFor={id}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                  checked
                    ? "border-indigo-400 bg-indigo-50 text-indigo-950"
                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.id as ExamNavValue)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{item.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
