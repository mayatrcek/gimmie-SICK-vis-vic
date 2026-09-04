import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { IBM_Plex_Sans, Inter_Tight, Instrument_Serif, Sora, Pixelify_Sans, VT323 } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// OVERWORLD text faces + the pixel-homepage faces, self-hosted via next/font.
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ibm-plex-sans", display: "swap" });
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-inter-tight", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });
const sora = Sora({ subsets: ["latin"], weight: ["400", "700", "800"], variable: "--font-sora", display: "swap" });
const pixelify = Pixelify_Sans({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-pixelify", display: "swap" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323", display: "swap" });

const fontVars = [ibmPlexSans, interTight, instrument, sora, pixelify, vt323].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  // Canonical host. Without this every page self-reports as gimmie-sick-vis-vic.vercel.app,
  // which is what Google had indexed. "./" resolves per-route, so each page canonicals itself.
  metadataBase: new URL("https://gimmiesickvis.com"),
  alternates: { canonical: "./" },
  title: "GIMMIE SICK VIS",
  description:
    "Daily dive- and fishing-conditions dashboard for the Victorian coast: swell, wind, sea-surface temperature, chlorophyll and seabed data.",
  // 96x96 (2x48): Google wants a square favicon that's a multiple of 48px and
  // ignores anything smaller, which the old 32px file was. Generated as an exact
  // 3x nearest-neighbour upscale of the 32px flag so the pixel art stays crisp.
  icons: {
    icon: [{ url: "/assets/brand/alpha-dive-flag-96.png", sizes: "96x96", type: "image/png" }],
  },
  openGraph: {
    siteName: "GIMMIE SICK VIS",
    type: "website",
    locale: "en_AU",
    images: ["/assets/home-banner.jpg"],
  },
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
          {/* keeps a gap above the footer and swallows the leftover height on
              short pages so it still sits on the bottom — see .wrap-spacer */}
          <div className="wrap-spacer" aria-hidden="true" />
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
