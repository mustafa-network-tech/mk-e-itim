import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} kursiyera</p>
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
        <p className="mt-8 text-center md:mt-10">
          <a
            href="https://mustafaoner.net"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[11px] font-medium tracking-wide text-slate-400 transition-colors duration-200 ease-out hover:text-slate-600"
          >
            Powered by MK Digital Systems
          </a>
        </p>
      </div>
    </footer>
  );
}
