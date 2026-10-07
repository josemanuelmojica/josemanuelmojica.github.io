import type { Metadata, Viewport } from "next";
import { EB_Garamond, Work_Sans } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/components/site-provider";
import { BackgroundMap } from "@/components/map/background-map";
import { SiteHeader } from "@/components/shell/site-header";
import { SiteFooter } from "@/components/shell/site-footer";
import { MotionDock } from "@/components/shell/motion-dock";
import { PageFrame } from "@/components/shell/page-frame";

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-garamond", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Arχ & Teχt · Be drawn to where you live", template: "%s · Arχ & Teχt" },
  description: "Editorial maps of Colorado's Front Range with live REColorado listings through RealScout.",
};

export const viewport: Viewport = { themeColor: "#fffefd" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${workSans.variable} ${garamond.variable}`}>
      <body>
        <a
          href="#main"
          className="fixed top-2 left-2 z-[100] -translate-y-[200%] rounded-lg bg-ink px-4 py-3 text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        <SiteProvider>
          <BackgroundMap />
          <SiteHeader />
          <PageFrame>
            <main id="main">{children}</main>
            <SiteFooter />
          </PageFrame>
          <MotionDock />
        </SiteProvider>
      </body>
    </html>
  );
}
