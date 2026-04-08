import type { NextConfig } from "next";

/** Kurum galerisi vb. Supabase Storage public URL’leri için `next/image` izni (build sırasında env okunur). */
function supabaseStorageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    const host = new URL(raw).hostname;
    return host || null;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseStorageHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
