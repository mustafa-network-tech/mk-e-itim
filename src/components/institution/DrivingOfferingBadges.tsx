import { drivingSchoolOfferingsLabels } from "@/lib/examMenuNav";

type Variant = "cardDark" | "detailLight";

const chipStyles: Record<Variant, string> = {
  cardDark:
    "rounded-full border border-emerald-400/45 bg-emerald-500/20 px-2.5 py-0.5 text-[0.625rem] font-semibold leading-none text-emerald-50 [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]",
  detailLight:
    "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900",
};

export function DrivingOfferingBadges({
  examNavIds,
  variant,
  className = "flex flex-wrap items-center gap-1.5",
}: {
  examNavIds: readonly string[];
  variant: Variant;
  className?: string;
}) {
  const labels = drivingSchoolOfferingsLabels(examNavIds);
  if (labels.length === 0) return null;
  const chip = chipStyles[variant];
  return (
    <div className={className} role="list" aria-label="Sürücü kursu sundukları">
      {labels.map((label) => (
        <span key={label} className={chip} role="listitem">
          {label}
        </span>
      ))}
    </div>
  );
}
