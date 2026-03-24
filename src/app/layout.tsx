import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EducationAdvisorLauncher } from "@/components/education/EducationAdvisorLauncher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "kursiyera",
  description: "Eğitim kurumlarını keşfedin — kurs ve dershane listeleme platformu.",
  openGraph: {
    title: "kursiyera",
    description: "Eğitim kurumlarını keşfedin — kurs ve dershane listeleme platformu.",
    siteName: "kursiyera",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og/og.jpeg",
        width: 1200,
        height: 630,
        alt: "kursiyera",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "kursiyera",
    description: "Eğitim kurumlarını keşfedin — kurs ve dershane listeleme platformu.",
    images: ["/og/og.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <EducationAdvisorLauncher />
        </Providers>
      </body>
    </html>
  );
}
