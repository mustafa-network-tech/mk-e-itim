interface SidebarProps<T extends string> {
  active: T;
  onChange: (value: T) => void;
}

export type AdminSection =
  | "dashboard"
  | "institutions"
  | "managers"
  | "reviews"
  | "tags"
  | "hero-featured"
  | "pages";

export type CorporateSection =
  | "overview"
  | "institution-info"
  | "card-info"
  | "reviews-ratings"
  | "edit-card"
  | "new-institution";

export function AdminSidebar({ active, onChange }: SidebarProps<AdminSection>) {
  const items: { id: AdminSection; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "institutions", label: "Kurum Yönetimi" },
    { id: "managers", label: "Yönetici Yönetimi" },
    { id: "reviews", label: "Yorum Moderasyonu" },
    { id: "tags", label: "Etiketler" },
    { id: "hero-featured", label: "Hero / Öne Çıkanlar" },
    { id: "pages", label: "Sayfa İçerikleri" },
  ];
  return (
    <aside className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      <p className="font-bold">Admin Menü</p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`w-full rounded-lg px-3 py-2 text-left transition ${
            active === item.id
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}

export function CorporateSidebar({ active, onChange }: SidebarProps<CorporateSection>) {
  const items: { id: CorporateSection; label: string }[] = [
    { id: "overview", label: "Genel Bakış" },
    { id: "institution-info", label: "Kurum Bilgilerim" },
    { id: "card-info", label: "Kart Bilgileri" },
    { id: "reviews-ratings", label: "Yorumlar ve Puanlar" },
    { id: "edit-card", label: "Kurum Kartını Düzenle" },
    { id: "new-institution", label: "Yeni Kurum Ekle" },
  ];
  return (
    <aside className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
      <p className="font-bold">Kurumsal Panel</p>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`w-full rounded-lg px-3 py-2 text-left transition ${
            active === item.id
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}

export function StatsCard({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  );
}
