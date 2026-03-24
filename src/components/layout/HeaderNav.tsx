"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type NavKey = "kurs" | "dershane" | "featured" | "top";

function navActive(
  pathname: string,
  searchParams: ReturnType<typeof useSearchParams>,
  key: NavKey,
): boolean {
  if (pathname !== "/listings") return false;
  const section = searchParams.get("section");
  const legacyType = searchParams.get("type");
  const legacyFeatured = searchParams.get("featured") === "true";
  const legacySort = searchParams.get("sort") === "top";

  let active: NavKey | null = null;
  if (section === "kurs" || section === "dershane" || section === "featured" || section === "top") {
    active = section;
  } else if (legacySort) {
    active = "top";
  } else if (legacyType === "kurs") {
    active = "kurs";
  } else if (legacyType === "dershane") {
    active = "dershane";
  } else if (legacyFeatured) {
    active = "featured";
  }

  return active === key;
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
      className="group relative inline-flex pb-1.5 text-sm font-medium text-[#111]/88 transition-colors hover:text-[#111]"
    >
      <span className="relative z-10">{children}</span>
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

  return (
    <nav className="hidden max-w-[min(100vw-8rem,520px)] flex-wrap items-center justify-end gap-x-5 gap-y-2 text-sm md:flex md:max-w-none md:gap-x-7">
      <NavItem href="/listings?section=kurs" active={navActive(pathname, searchParams, "kurs")}>
        Kurslar
      </NavItem>
      <NavItem href="/listings?section=dershane" active={navActive(pathname, searchParams, "dershane")}>
        Dershaneler
      </NavItem>
      <NavItem href="/listings?section=featured" active={navActive(pathname, searchParams, "featured")}>
        Öne Çıkanlar
      </NavItem>
      <NavItem href="/listings?section=top" active={navActive(pathname, searchParams, "top")}>
        En Yüksek Puanlılar
      </NavItem>
    </nav>
  );
}
