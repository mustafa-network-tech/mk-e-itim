import type { Metadata } from "next";
import { institutions } from "@/data/mockData";
import { InstitutionDetailClient } from "./InstitutionDetailClient";

export async function generateStaticParams() {
  return institutions.map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const inst = institutions.find((i) => i.id === id);
  if (!inst) {
    return { title: "Kurum | kursiyera", description: "Eğitim kurumu detay sayfası." };
  }
  return {
    title: `${inst.name} | kursiyera`,
    description: inst.shortDescription,
    openGraph: {
      title: inst.name,
      description: inst.shortDescription,
      images: inst.images[0] ? [{ url: inst.images[0] }] : undefined,
    },
  };
}

export default function InstitutionDetailPage() {
  return <InstitutionDetailClient />;
}
