import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "kursiyera",
    short_name: "kursiyera",
    description:
      "Eğitim kurumlarını keşfedin — LGS, YKS, KPSS ve diğer kurum türlerine göre arayın.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    lang: "tr",
    dir: "ltr",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
