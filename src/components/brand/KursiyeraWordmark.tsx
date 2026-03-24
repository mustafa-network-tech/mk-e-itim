/** “iyera” için yumuşak altın (parlak değil) */
const GOLD = "#D4AF37";

type Variant = "onDark" | "onLight";

export interface KursiyeraWordmarkProps {
  className?: string;
  /** Beyaz / açık UI: Kurs #111. Koyu şerit: ters kontrast. */
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl",
  lg: "text-3xl sm:text-4xl",
};

/**
 * Kursiyera — sade tipografi.
 * Kurs: #111 | iyera: yumuşak altın | yalnızca “era” hafif italic.
 * “i” noktası ve gövdesi currentColor (altın grubu).
 */
export function KursiyeraWordmark({
  className,
  variant = "onLight",
  size = "md",
}: KursiyeraWordmarkProps) {
  const kursClass = variant === "onLight" ? "text-[#111111]" : "text-white";

  return (
    <span
      className={[
        "inline-flex select-none items-end gap-0 font-sans font-medium tracking-[-0.025em] antialiased",
        sizeClasses[size],
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Kursiyera"
    >
      <span className={`leading-none ${kursClass}`}>Kurs</span>

      <span
        className="inline-flex items-end gap-0 leading-none"
        style={{
          color: GOLD,
          opacity: variant === "onLight" ? 0.82 : 1,
        }}
      >
        <span
          className="relative mx-[0.03em] inline-flex h-[0.88em] w-[0.46em] shrink-0 origin-bottom flex-col items-center justify-end -skew-x-[9deg] skew-y-[2deg]"
          aria-hidden
        >
          <span className="mb-[0.1em] size-[0.2em] min-h-[3px] min-w-[3px] shrink-0 rounded-full bg-current" />
          <span className="h-[0.55em] w-[0.09em] shrink-0 rounded-full bg-current" />
        </span>
        <span className="leading-none">y</span>
        <span className="leading-none italic">era</span>
      </span>
    </span>
  );
}

export function KursiyeraNibIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M16 7 L24 16 L16 25 L8 16 Z" fill={GOLD} fillOpacity={0.85} />
      <path d="M16 11v10" stroke="#111111" strokeOpacity={0.2} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}
