"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useDemoPlatform } from "@/hooks/useDemoPlatform";
import { INSTITUTION_TYPES_SEED, sortInstitutionTypes } from "@/data/institutionTypesSeed";
import { SITE_HEADER_LISTINGS_EXAM_ID } from "@/lib/examMenuNav";

function headerEhliyetActive(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
): boolean {
  if (pathname !== "/listings") return false;
  const raw = searchParams.get("exam");
  if (raw == null) return false;
  try {
    return decodeURIComponent(raw) === SITE_HEADER_LISTINGS_EXAM_ID;
  } catch {
    return raw === SITE_HEADER_LISTINGS_EXAM_ID;
  }
}

function NavItem({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative inline-flex shrink-0 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#111]/88 transition-colors hover:text-[#111] sm:text-xs md:text-sm md:font-medium md:normal-case md:tracking-normal"
    >
      <span className="relative z-10 whitespace-nowrap">{children}</span>
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-[#D4AF37] transition-transform duration-300 ease-out ${
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { institutionTypes } = useDemoPlatform();

  const ehliyetLabel = useMemo(() => {
    const list =
      institutionTypes.length > 0
        ? sortInstitutionTypes(institutionTypes)
        : sortInstitutionTypes(INSTITUTION_TYPES_SEED);
    const row = list.find((t) => t.id === SITE_HEADER_LISTINGS_EXAM_ID);
    return row?.label ?? "Ehliyet";
  }, [institutionTypes]);

  const ehliyetHref = `/listings?exam=${encodeURIComponent(SITE_HEADER_LISTINGS_EXAM_ID)}`;

  return (
    <nav
      className="order-3 flex min-w-0 w-full max-w-full basis-full flex-wrap items-center justify-center gap-x-2 gap-y-1.5 sm:gap-x-3 md:order-2 md:w-auto md:basis-auto md:max-w-none md:flex-1 md:justify-end md:gap-x-4 lg:gap-x-5"
      aria-label="Ehliyet kursları — listeleme"
    >
      <NavItem href={ehliyetHref} active={headerEhliyetActive(pathname, searchParams)}>
        {ehliyetLabel}
      </NavItem>
    </nav>
  );
}
