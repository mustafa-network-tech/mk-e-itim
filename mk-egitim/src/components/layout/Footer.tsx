export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-slate-600 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} MK Eğitim - Demo Platform</p>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-900">
            Hakkımızda
          </a>
          <a href="#" className="hover:text-slate-900">
            Gizlilik
          </a>
          <a href="#" className="hover:text-slate-900">
            İletişim
          </a>
        </div>
      </div>
    </footer>
  );
}
