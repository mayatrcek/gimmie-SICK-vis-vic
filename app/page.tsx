import Link from "next/link";
import Image from "next/image";
import QuickScroll from "@/components/QuickScroll";

const HERO_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCm38URIzWfOZJxYBaurCzTAuRp-mUcHAdINfFsc-6rSNw0ZNDUp5yTPhEUP8Nv7vrnDKZHsK3AJmBjntthJsssDefwoxii7eNiqfDvDFsvMEYbfUflTlJjUc0ucxk4d7f3TyD5NLuJE84ASbZxkXYeXVVUadQ9tCQm6JcJB3BSMEzh4KCIeA0Ig3Ss0HIv3VNTcZgBq_kxbESBGCEKBZ62shqCXbTMr18HXIgPJIsHJJtGNa2saqM0c1knGSHIBDw0lZXjTEF-Cr8";

type Channel = { title: string; href: string; cls: string };
const CHANNELS: Channel[] = [
  { title: "Forecast", href: "/forecast", cls: "bg-primary text-bone" },
  { title: "Live Data", href: "/live/chlorophyll", cls: "bg-bone text-ink-soft" },
  { title: "Learn", href: "/fish", cls: "bg-secondary text-bone" },
  { title: "Underwater Geography", href: "/geo/habitat", cls: "bg-tertiary text-bone" },
];

export default function Home() {
  return (
    <div className="home">
      <QuickScroll to="summary" />
      {/* Quest Star Backdrop */}
      <div className="fixed inset-0 pointer-events-none opacity-10 flex items-center justify-center">
        <div className="w-[800px] h-[800px] quest-star" />
      </div>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="home-hero-bg w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url("${HERO_BG}")`, imageRendering: "pixelated" }}
          />
          <div className="absolute inset-0 bg-ink-soft/40 mix-blend-overlay" />
        </div>
        <div className="absolute left-0 w-full top-1/4 -translate-y-1/2 z-10 px-md">
          <h1 className="home-display font-display-xxl text-display-xl md:text-display-xxl text-bone drop-shadow-[8px_8px_0px_rgba(25,19,16,1)] mb-xxs hero-title-entrance">
            GIMME SICK VIS
          </h1>
          <div className="home-tagline inline-flex flex-col md:flex-row items-center gap-md bg-ink-soft text-parchment py-sm px-xl border-2 border-primary shadow-[6px_6px_0px_0px_#2e5dd6]">
            <span className="font-hud-md text-hud-md tracking-[0.2em] uppercase">
              Daily Ocean &amp; Dive Update
            </span>
            <span className="hidden md:block w-px h-6 bg-parchment/30" />
            <span className="font-hud-md text-hud-md italic opacity-90">
              Region: VICTORIA_COAST_GRID_7
            </span>
          </div>
        </div>
      </section>

      {/* Feature marquee */}
      <div className="w-full overflow-hidden">
        <section className="bg-ink-soft border-y-2 border-primary py-sm relative overflow-hidden">
          <div className="animate-marquee">
            {[0, 1].map((n) => (
              <div
                key={n}
                className={`flex items-center font-display-font text-hud-md text-bone uppercase tracking-widest whitespace-nowrap gap-xl${
                  n === 1 ? " ml-xl" : ""
                }`}
              >
                {[
                  "REAL-TIME SWELL DATA",
                  "VICTORIAN COASTAL INTEL",
                  "SATELLITE CHLOROPHYLL",
                  "SEA SURFACE TEMP",
                  "PRECISION DIVE PLANNING",
                ].map((t) => (
                  <span key={t} className="flex items-center gap-md">
                    {t}
                    <Image
                      className="dive-flag"
                      src="/assets/brand/alpha-dive-flag-32.png"
                      alt=""
                      aria-hidden="true"
                      width={36}
                      height={36}
                    />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Summary */}
      <section id="summary" className="bg-parchment py-xxxl px-bleed" style={{ scrollMarginTop: "var(--tabh)" }}>
        <div className="max-w-page-max mx-auto">
          <div className="bg-parchment p-xxl border-2 border-ink-soft shadow-[8px_8px_0px_0px_#3A332A]">
            <h2 className="home-h2 font-display-lg text-headline-lg text-ink-soft mb-md uppercase">
              SUMMARY
            </h2>
            <p className="font-hud-md text-hud-md text-ink-soft opacity-70 leading-relaxed uppercase">
              A daily dive- and fishing-conditions dashboard for the Victorian coast. It brings
              real-time swell, wind, sea-surface temperature, chlorophyll and seabed data from marine
              models and satellite feeds together, so you can tell at a glance whether tomorrow is
              worth an early start.
            </p>
          </div>
        </div>
      </section>

      {/* Nav channels */}
      <section className="py-xxxl px-bleed max-w-page-max mx-auto bg-ink-soft">
        <div className="mb-xxl">
          <h2 className="home-h1 font-display-xl text-display-xl uppercase text-bone">NAV_CHANNELS</h2>
          <p className="font-hud-md text-hud-md text-parchment opacity-70 max-w-[36rem]">
            ACCESS REAL-TIME ENVIRONMENTAL DATA AND OPERATIONAL INTELLIGENCE CHANNELS.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
          {CHANNELS.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className={`channel-card-animate block relative border-2 border-ink-soft group overflow-hidden shadow-[6px_6px_0px_0px_#2e5dd6] cursor-pointer ${c.cls}`}
            >
              <div className="aspect-video flex items-center justify-center py-md">
                <h3 className="font-headline-md text-headline-md uppercase text-center px-md">
                  {c.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Find your drop */}
      <section className="py-xxxl px-bleed max-w-page-max mx-auto text-center">
        <div className="max-w-2xl mx-auto bg-bone p-xxl border-2 border-ink-soft shadow-[12px_12px_0px_0px_#2e5dd6]">
          <h3 className="home-h2 font-display-lg text-headline-lg text-ink-soft mb-md uppercase">
            Find_Your_Drop
          </h3>
          <div className="relative mb-xl">
            <input
              className="w-full bg-parchment border-2 border-ink-soft p-md font-hud-md text-hud-md focus:ring-0 focus:outline-none focus:shadow-[4px_4px_0px_0px_#2e5dd6] transition-all"
              placeholder="ENTER_COORDINATES_OR_SITE_NAME..."
              type="text"
            />
            <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-ink-soft text-3xl">
              search
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-sm">
            <button
              type="button"
              className="bg-primary text-on-primary px-xl py-md font-hud-md text-hud-md border-2 border-ink-soft shadow-[4px_4px_0px_0px_#3A332A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all uppercase"
            >
              SEARCH_STATIONS
            </button>
            <button
              type="button"
              className="bg-bone text-ink-soft px-xl py-md font-hud-md text-hud-md border-2 border-ink-soft shadow-[4px_4px_0px_0px_#3A332A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all uppercase"
            >
              RANDOM_EXPEDITION
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
