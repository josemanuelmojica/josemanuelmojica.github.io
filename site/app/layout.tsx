import type { Metadata, Viewport } from "next";
import { EB_Garamond, Work_Sans } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/profile";

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });

const description =
  "José Manuel Garcia designs AI support agents, runs Claude as daily work infrastructure, and builds enablement programs. 66 custom Claude skills, a live MCP support assistant, and 178 of 299 Help Center articles.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${profile.domain}`),
  title: { default: `${profile.name} · AI support operations and enablement`, template: `%s · ${profile.name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.name,
    title: `${profile.name} · AI support operations and enablement`,
    description,
  },
  twitter: { card: "summary", title: profile.name, description },
};

export const viewport: Viewport = { themeColor: "#fffefd" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${workSans.variable} ${garamond.variable}`}>
      <body>
        <a
          href="#main"
          className="no-print fixed top-2 left-2 z-50 -translate-y-[200%] rounded-md bg-ink px-4 py-3 text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
