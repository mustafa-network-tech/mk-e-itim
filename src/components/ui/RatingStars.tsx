interface RatingStarsProps {
  value: number;
  size?: "sm" | "md";
  /** Kart / koyu zemin üzerinde daha yumuşak boş yıldız */
  tone?: "light" | "dark";
}

export function RatingStars({ value, size = "md", tone = "light" }: RatingStarsProps) {
  const rounded = Math.round(value);
  const className = size === "sm" ? "text-sm" : "text-base";
  const filled = "text-amber-400";
  const empty = tone === "dark" ? "text-white/22" : "text-slate-300";
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rounded ? filled : empty}>
          ★
        </span>
      ))}
    </div>
  );
}
