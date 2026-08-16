import type { Metadata } from "next";
import { publicPath } from "./lib/publicPath";
import { resolveSiteUrl } from "./lib/siteUrl";
import "./globals.css";

const title = "Arχ & Teχt — Be Drawn to Where You Live";
const description =
  "Private real estate and practical RealScout learning, organized around where people are trying to go next.";
const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-src https://challenges.cloudflare.com",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "worker-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  referrer: "strict-origin-when-cross-origin",
  icons: { icon: publicPath("/maps/japanese-ink-scroll/base/study-01.webp") },
  openGraph: {
    type: "website",
    title,
    description,
    images: [{
      url: publicPath("/og.png"),
      width: 1734,
      height: 907,
      alt: "Arχ & Teχt on architectural paper beside a blueprint-blue street network",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [publicPath("/og.png")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {process.env.NODE_ENV === "production" && (
          <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
