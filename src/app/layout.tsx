import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { getSupabasePublicForBrowser } from "@/lib/supabase/runtimePublic";
import { getSiteOrigin } from "@/lib/siteUrl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PoweredByBalloon } from "@/components/layout/PoweredByBalloon";
import { ConditionalEducationAdvisorLauncher } from "@/components/education/ConditionalEducationAdvisorLauncher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const siteUrl = getSiteOrigin();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "kursiyera",
    template: "%s | kursiyera",
  },
  description:
    "Eğitim kurumlarını keşfedin — LGS, YKS, KPSS ve diğer kurum türlerine göre arayın.",
  applicationName: "kursiyera",
  referrer: "strict-origin-when-cross-origin",
  appleWebApp: {
    capable: true,
    title: "kursiyera",
    statusBarStyle: "default",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "kursiyera",
    description:
      "Eğitim kurumlarını keşfedin — LGS, YKS, KPSS ve diğer kurum türlerine göre arayın.",
    siteName: "kursiyera",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kursiyera",
    description:
      "Eğitim kurumlarını keşfedin — LGS, YKS, KPSS ve diğer kurum türlerine göre arayın.",
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabasePublic = getSupabasePublicForBrowser();
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}>
      <body className="flex min-h-dvh flex-col bg-slate-50">
        <Providers supabasePublic={supabasePublic}>
          <Header />
          <PoweredByBalloon />
          <main className="min-w-0 flex-auto">{children}</main>
          <Footer />
          <ConditionalEducationAdvisorLauncher />
        </Providers>
      </body>
    </html>
  );
}
