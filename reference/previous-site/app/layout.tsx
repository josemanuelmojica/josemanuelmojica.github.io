import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "Arχ & Teχt — Be Drawn to Where You Live";
const description =
  "Private real estate across eight American markets, viewed through architecture, neighborhood, and daily life.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") ? "http" : "https");
  const origin = host ? `${protocol}://${host}` : "https://ark-and-text.example";
  const socialImage = `${origin}/og.png`;

  return {
    title,
    description,
    metadataBase: new URL(origin),
    icons: {
      icon: "/maps/japanese-ink-scroll/base/study-01.webp",
    },
    openGraph: {
      type: "website",
      url: origin,
      title,
      description,
      images: [
        {
          url: socialImage,
          width: 1734,
          height: 907,
          alt: "Arχ & Teχt on architectural paper beside a blueprint-blue street network",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
