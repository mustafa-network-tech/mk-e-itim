import type { InstitutionTypeDef } from "@/types";

/** DB’de satır yoksa veya hata olunca kullanılan varsayılan kurum türleri (sabit `id`, gösterim `label`). */
export const INSTITUTION_TYPES_SEED: InstitutionTypeDef[] = [
  { id: "LGS", label: "LGS", sortOrder: 1 },
  { id: "YKS", label: "YKS", sortOrder: 2 },
  { id: "YABANCI DİL", label: "Yabancı dil", sortOrder: 3 },
  { id: "EHLİYET", label: "Ehliyet", sortOrder: 4 },
  { id: "KPSS", label: "KPSS", sortOrder: 5 },
  { id: "DIGER", label: "Diğer", sortOrder: 6 },
];

export function labelMapFromInstitutionTypes(defs: InstitutionTypeDef[]): Record<string, string> {
  return Object.fromEntries(defs.map((d) => [d.id, d.label]));
}

export function sortInstitutionTypes(defs: InstitutionTypeDef[]): InstitutionTypeDef[] {
  return [...defs].sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id, "tr"));
}
