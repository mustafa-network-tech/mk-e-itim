"use client";

import { usePathname } from "next/navigation";
import { EducationAdvisorLauncher } from "@/components/education/EducationAdvisorLauncher";

/** Kurum detayında (`/institutions/[id]`) danışman FAB gösterilmez; sayfa yerel WhatsApp düğmesi kullanır. */
export function ConditionalEducationAdvisorLauncher() {
  const pathname = usePathname() ?? "";
  if (/^\/institutions\/[^/]+\/?$/.test(pathname)) return null;
  return <EducationAdvisorLauncher />;
}
