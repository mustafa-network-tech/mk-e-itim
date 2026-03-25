import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InstitutionDetailClient } from "./InstitutionDetailClient";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fallback = {
    title: "Kurum | kursiyera",
    description: "Eğitim kurumu detay sayfası.",
  };
  if (!isSupabaseConfigured()) {
    return fallback;
  }
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("institutions")
      .select("name, short_description, images")
      .eq("id", id)
      .maybeSingle();
    if (!data) {
      return fallback;
    }
    const images = (data.images as string[] | null) ?? [];
    return {
      title: `${data.name} | kursiyera`,
      description: data.short_description,
      openGraph: {
        title: data.name,
        description: data.short_description,
        images: images[0] ? [{ url: images[0] }] : undefined,
      },
    };
  } catch {
    return fallback;
  }
}

export default function InstitutionDetailPage() {
  return <InstitutionDetailClient />;
}
