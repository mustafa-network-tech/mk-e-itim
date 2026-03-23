import Link from "next/link";

interface TagBadgeProps {
  label: string;
  href?: string;
}

export function TagBadge({ label, href }: TagBadgeProps) {
  const className =
    "rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600";
  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }
  return <span className={className}>{label}</span>;
}
