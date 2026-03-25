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
        <div className="mt-8 flex flex-col items-center md:mt-10">
          <div
            className="h-px w-[min(100%,11rem)] max-w-[85vw] shrink-0 bg-slate-300"
            aria-hidden
          />
          <div className="footer-pendulum-settle flex flex-col items-center">
            <div
              className="h-7 w-px shrink-0 bg-gradient-to-b from-slate-400 via-orange-400 to-orange-500 sm:h-8"
              aria-hidden
            />
            <a
              href="https://mustafaoner.net"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              aria-label="Powered by MK Digital Systems — mustafaoner.net"
            >
              <div className="flex h-[4.75rem] w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-full border-2 border-orange-500 bg-orange-50 px-1.5 py-1 text-center shadow-sm transition-[box-shadow,transform,border-color] duration-200 ease-out group-hover:scale-[1.03] group-hover:border-orange-600 group-hover:shadow-md sm:h-[5.25rem] sm:w-[5.25rem]">
                <span className="block text-[6px] font-medium leading-tight text-orange-950 sm:text-[7px]">
                  Powered by
                </span>
                <span className="mt-0.5 block text-[6.5px] font-semibold leading-[1.15] text-orange-950 sm:text-[7.5px]">
                  MK Digital Systems
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
