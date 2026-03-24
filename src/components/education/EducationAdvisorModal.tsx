"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import type { Tag } from "@/types";
import type { AdvisorQuestion, AdvisorStepKey } from "@/types/advisor";
import {
  ADVISOR_SUBJECT_TAG_IDS,
  AdvisorPriceRangeId,
  PRICE_RANGE_OPTIONS,
  buildAdvisorListingsHref,
  resolveCity,
} from "@/lib/educationAdvisor";

type ChatRole = "assistant" | "user";

interface ChatLine {
  id: string;
  role: ChatRole;
  text: string;
}

const CITY_ERROR = "Bu şehirde hizmetimiz bulunmuyor. Lütfen başka bir şehir yazın.";

function nextId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sortQuestions(list: AdvisorQuestion[]): AdvisorQuestion[] {
  return [...list].sort((a, b) => a.order - b.order);
}

export function EducationAdvisorModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { institutions, gradeLevels, tags, advisorQuestions } = useDemoPlatform();
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => sortQuestions(advisorQuestions), [advisorQuestions]);
  const cities = useMemo(
    () => [...new Set(institutions.map((i) => i.city))].sort((a, b) => a.localeCompare(b, "tr")),
    [institutions],
  );

  const subjectTags: Tag[] = useMemo(() => {
    const order = new Map<string, number>(ADVISOR_SUBJECT_TAG_IDS.map((id, i) => [id, i]));
    const allowed = new Set<string>(ADVISOR_SUBJECT_TAG_IDS as readonly string[]);
    return tags
      .filter((t) => allowed.has(t.id))
      .sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
  }, [tags]);

  const [messages, setMessages] = useState<ChatLine[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [cityInput, setCityInput] = useState("");
  const [districtValue, setDistrictValue] = useState("");
  const [collected, setCollected] = useState<{
    city?: string;
    district?: string;
    gradeLevelId?: string;
    subjectTagId?: string | null;
  }>({});

  const current = sorted[stepIndex];
  const currentKey: AdvisorStepKey | undefined = current?.stepKey;

  const districts = useMemo(() => {
    const c = collected.city;
    if (!c) return [];
    const set = new Set(
      institutions.filter((i) => i.city === c).map((i) => i.district).filter(Boolean),
    );
    return [...set].sort((a, b) => a.localeCompare(b, "tr"));
  }, [institutions, collected.city]);

  const reset = useCallback(() => {
    const list = sortQuestions(advisorQuestions);
    setStepIndex(0);
    setCityInput("");
    setDistrictValue("");
    setCollected({});
    setMessages(
      list.length > 0
        ? [{ id: nextId(), role: "assistant", text: list[0].prompt }]
        : [
            {
              id: nextId(),
              role: "assistant",
              text: "Danışman soruları henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.",
            },
          ],
    );
  }, [advisorQuestions]);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const appendAssistant = (text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "assistant", text }]);
  };
  const appendUser = (text: string) => {
    setMessages((m) => [...m, { id: nextId(), role: "user", text }]);
  };

  const advanceAfterUser = (nextAssistantText: string) => {
    setStepIndex((i) => i + 1);
    appendAssistant(nextAssistantText);
  };

  const handleSendCity = () => {
    if (currentKey !== "city") return;
    const resolved = resolveCity(cityInput, cities);
    if (!resolved) {
      appendAssistant(CITY_ERROR);
      return;
    }
    appendUser(resolved);
    setCollected((c) => ({ ...c, city: resolved }));
    setCityInput("");
    const nextQ = sorted[stepIndex + 1];
    if (nextQ) advanceAfterUser(nextQ.prompt);
  };

  const handleSendDistrict = () => {
    if (currentKey !== "district" || !districtValue) return;
    if (!districts.includes(districtValue)) return;
    appendUser(districtValue);
    setCollected((c) => ({ ...c, district: districtValue }));
    setDistrictValue("");
    const nextQ = sorted[stepIndex + 1];
    if (nextQ) advanceAfterUser(nextQ.prompt);
  };

  const handlePickGrade = (id: string) => {
    if (currentKey !== "grade") return;
    const label = gradeLevels.find((g) => g.id === id)?.label ?? id;
    appendUser(label);
    setCollected((c) => ({ ...c, gradeLevelId: id }));
    const nextQ = sorted[stepIndex + 1];
    setStepIndex((i) => i + 1);
    if (nextQ) appendAssistant(nextQ.prompt);
  };

  const handleSubject = (tagId: string | null) => {
    if (currentKey !== "subject") return;
    if (tagId) {
      const name = tags.find((t) => t.id === tagId)?.name ?? tagId;
      appendUser(name);
      setCollected((c) => ({ ...c, subjectTagId: tagId }));
    } else {
      appendUser("Atladım");
      setCollected((c) => ({ ...c, subjectTagId: null }));
    }
    const nextQ = sorted[stepIndex + 1];
    setStepIndex((i) => i + 1);
    if (nextQ) appendAssistant(nextQ.prompt);
  };

  const handlePrice = (rangeId: AdvisorPriceRangeId) => {
    if (currentKey !== "price") return;
    const opt = PRICE_RANGE_OPTIONS.find((o) => o.id === rangeId);
    if (!opt) return;
    const { city, district, gradeLevelId } = collected;
    if (!city || !district || !gradeLevelId) return;
    appendUser(opt.label);
    appendAssistant("Tamam, kriterlerinize uygun kurumları listeliyorum…");
    const href = buildAdvisorListingsHref({
      city,
      district,
      gradeLevelId,
      subjectTagId: collected.subjectTagId,
      minPrice: opt.minPrice,
      maxPrice: opt.maxPrice,
    });
    router.push(href);
    onClose();
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  const body = (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <p id="advisor-modal-title" className="text-base font-semibold text-slate-900">
              Eğitim Danışmanı
            </p>
            <p className="text-xs text-slate-500">Sorulara sırayla yanıt verin</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Kapat"
          >
            ✕
          </button>
        </header>

        <div ref={scrollRef} className="min-h-[220px] flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((line) => (
            <div
              key={line.id}
              className={`flex ${line.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  line.role === "user"
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {line.text}
              </div>
            </div>
          ))}
        </div>

        <footer className="border-t border-slate-100 bg-slate-50/90 px-4 py-3">
          {!sorted.length ? null : currentKey === "city" ? (
            <div className="flex gap-2">
              <input
                type="text"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-[#D4AF37]/30 focus:ring-2"
                placeholder="Şehir yazın…"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCity()}
              />
              <button
                type="button"
                onClick={handleSendCity}
                className="shrink-0 rounded-xl bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Gönder
              </button>
            </div>
          ) : currentKey === "district" ? (
            <div className="space-y-2">
              {districts.length === 0 ? (
                <p className="text-center text-xs text-amber-800">
                  Bu şehir için kayıtlı ilçe yok. Pencereyi kapatıp farklı şehir deneyin.
                </p>
              ) : (
                <>
                  <select
                    value={districtValue}
                    onChange={(e) => setDistrictValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
                  >
                    <option value="">İlçe seçiniz</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!districtValue}
                    onClick={handleSendDistrict}
                    className="w-full rounded-xl bg-[#111111] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Gönder
                  </button>
                </>
              )}
            </div>
          ) : currentKey === "grade" ? (
            <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
              {gradeLevels.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handlePickGrade(g.id)}
                  className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-800 hover:border-[#D4AF37]/60"
                >
                  {g.label}
                </button>
              ))}
            </div>
          ) : currentKey === "subject" ? (
            <div className="space-y-2">
              <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {subjectTags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSubject(t.id)}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-800 hover:border-[#D4AF37]/60"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleSubject(null)}
                className="w-full rounded-xl border-2 border-slate-300 bg-white py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Atla
              </button>
            </div>
          ) : currentKey === "price" ? (
            <div className="flex flex-col gap-2">
              {PRICE_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePrice(opt.id)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-semibold text-slate-900 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500">Tamamlandı.</p>
          )}
        </footer>
      </div>
    </div>
  );

  return createPortal(body, document.body);
}
