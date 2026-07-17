import type { Metadata } from "next";
import { Inter, Inter_Tight, Instrument_Serif, Sora, Pixelify_Sans, VT323 } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TestingNotice from "@/components/TestingNotice";

// OVERWORLD text faces + the pixel-homepage faces, self-hosted via next/font.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-inter-tight", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["400", "700", "800"], variable: "--font-sora", display: "swap" });
const pixelify = Pixelify_Sans({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pixelify", display: "swap" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323", display: "swap" });

const fontVars = [inter, interTight, instrument, sora, pixelify, vt323].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: "GIMMIE SICK VIS",
  description:
    "Daily dive- and fishing-conditions dashboard for the Victorian coast: swell, wind, sea-surface temperature, chlorophyll and seabed data.",
  icons: { icon: "/assets/brand/alpha-dive-flag-32.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        {/* Plain script tag (not next/script): AdSense's verifier reads raw HTML,
            and React hoists async scripts into <head> at SSR time. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8693670921761163"
          crossOrigin="anonymous"
        />
        <div className="wrap">
          <Nav />
          {children}
          <Footer />
        </div>
        <TestingNotice />
      </body>
    </html>
  );
}
