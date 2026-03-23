interface RatingStarsProps {
  value: number;
  size?: "sm" | "md";
}

export function RatingStars({ value, size = "md" }: RatingStarsProps) {
  const rounded = Math.round(value);
  const className = size === "sm" ? "text-sm" : "text-base";
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < rounded ? "text-amber-400" : "text-slate-300"}>
          ★
        </span>
      ))}
    </div>
  );
}
