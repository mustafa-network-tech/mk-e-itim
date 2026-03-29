import { ImageResponse } from "next/og";

export const alt = "kursiyera — eğitim kurumlarını keşfedin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)",
          color: "#f8fafc",
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        kursiyera
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            fontWeight: 500,
            opacity: 0.9,
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          LGS, YKS ve diğer kurum türlerine göre eğitim kurumlarını keşfedin
        </div>
      </div>
    ),
    { ...size },
  );
}
