import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} kursiyera - Demo Platform</p>
        <div className="flex items-center gap-4">
          <Link href="/hakkimizda" className="hover:text-slate-900">
            Hakkımızda
          </Link>
          <Link href="/gizlilik" className="hover:text-slate-900">
            Gizlilik
          </Link>
          <Link href="/iletisim" className="hover:text-slate-900">
            İletişim
          </Link>
        </div>
      </div>
    </footer>
  );
}
