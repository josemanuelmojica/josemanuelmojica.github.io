import type { Metadata, Viewport } from "next";
import { EB_Garamond, Work_Sans } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/profile";

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });

const description =
  "José Manuel Mojica Garcia: AI operations, integrations, and support systems. 60+ Claude skills, the knowledge base behind an AI support agent, and eight CRM integrations owned at API depth.";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${profile.domain}`),
  title: { default: `${profile.name} · AI operations and support systems`, template: `%s · ${profile.name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: profile.name,
    title: `${profile.name} · AI operations and support systems`,
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
