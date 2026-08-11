"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SST_DS } from "@/lib/api/erddap";
import { LEARN_ITEMS, LIVE_ITEMS, type NavItem as Item } from "@/lib/nav";

type Group = { id: string; label: string; items: Item[] };

// The fetches that gate a live page's first paint (SatelliteGallery /
// SstGallery both render a loader until these land). Warmed into the browser
// HTTP cache the first time the Live data menu opens, so by the time a link is
// clicked the page renders from cache instead of spinning.
//
// ponytail: menu-open, not page-load. These are cheap catalogue/metadata
// queries, but firing them for every visitor on every page view still burns
// ERDDAP/CDSE quota for people who never open Live data. Opening the menu is
// the earliest honest signal of intent. Move to page-load only if the quota
// headroom is there. The remaining live pages can't be warmed this way:
// chlorophyll is server-rendered, currents/nepean are cross-origin iframes.
const LIVE_WARM = [
  "/api/satellite/scenes",
  "/api/sst-stretch",
  "/api/sst-times",
  `/api/timestamp?ds=${SST_DS}`,
];
let warmed = false;
function warmLive() {
  if (warmed) return;
  warmed = true;
  for (const url of LIVE_WARM) fetch(url).catch(() => {});
}

const GROUPS: Group[] = [
  { id: "live", label: "Live data", items: LIVE_ITEMS },
  { id: "learn", label: "Learn", items: LEARN_ITEMS },
];

export default function Nav() {
  const pathname = usePathname();
  const [openDD, setOpenDD] = useState<string | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click / route change.
  useEffect(() => {
    setOpenDD(null);
    setNavOpen(false);
  }, [pathname]);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenDD(null);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);
  // The phone menu is a full-screen sheet, so freeze the page under it (this also
  // takes the page scrollbar away). CSS scopes the lock to ≤560px, so resizing to
  // desktop while it's open can't leave the page stuck.
  useEffect(() => {
    if (!navOpen) return;
    document.body.classList.add("nav-locked");
    return () => document.body.classList.remove("nav-locked");
  }, [navOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const groupActive = (g: Group) => g.items.some((i) => isActive(i.href));

  return (
    <div className={`tabs${navOpen ? " nav-open" : ""}`} ref={ref}>
      <Link className="nav-brand" href="/">
        <Image
          className="nav-flag"
          src="/assets/brand/alpha-dive-flag-32.png"
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
        />
        GIMMIE SICK VIS
      </Link>
      <button
        className="nav-toggle"
        type="button"
        aria-label="Menu"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((v) => !v)}
      >
        <span className="nav-burger" aria-hidden="true" />
        <span className="nav-toggle-label">Menu</span>
      </button>
      <div className="tabs-inner" id="primary-nav">
        <Link className={`tab${pathname === "/" ? " active" : ""}`} href="/">
          Home
        </Link>
        <Link className={`tab${isActive("/forecast") ? " active" : ""}`} href="/forecast">
          Forecast
        </Link>

        {GROUPS.map((g) => (
          <Dropdown key={g.id} g={g} open={openDD === g.id} onToggle={setOpenDD} active={groupActive(g)} isActive={isActive} />
        ))}

        <Link className={`tab${isActive("/geo") ? " active" : ""}`} href="/geo/depth">
          Depth map
        </Link>
        <Link className={`tab${isActive("/store") ? " active" : ""}`} href="/store">
          Store
        </Link>
        <Link className={`tab${isActive("/contact") ? " active" : ""}`} href="/contact">
          Contact
        </Link>
        <Link className={`tab${isActive("/about") ? " active" : ""}`} href="/about">
          About
        </Link>
        <Link className={`tab${isActive("/feedback") ? " active" : ""}`} href="/feedback">
          Feedback<span className="tab-badge" aria-label="new" />
        </Link>
      </div>
    </div>
  );
}

function Dropdown({
  g,
  open,
  onToggle,
  active,
  isActive,
}: {
  g: Group;
  open: boolean;
  onToggle: (id: string | null) => void;
  active: boolean;
  isActive: (href: string) => boolean;
}) {
  // hover fires ahead of the click on pointer devices; the click covers touch
  const warm = g.id === "live" ? warmLive : undefined;
  return (
    <div className={`tab-dd${open ? " open" : ""}`} onMouseEnter={warm}>
      <button
        className={`tab${active ? " active" : ""}`}
        onFocus={warm}
        onClick={(e) => {
          e.stopPropagation();
          warm?.();
          onToggle(open ? null : g.id);
        }}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {g.label}
        <span className="tab-caret" aria-hidden="true">
          &#9662;
        </span>
      </button>
      <div className="tab-menu" role="menu" aria-label={g.label} data-open={open}>
        {g.items.map((i) =>
          i.wip ? (
            <span key={i.href} className="tab-menu-item wip" role="menuitem" aria-disabled="true">
              {i.label}
              <em className="wip-tag">WIP</em>
            </span>
          ) : (
            <Link
              key={i.href}
              className={`tab-menu-item${isActive(i.href) ? " active" : ""}`}
              role="menuitem"
              href={i.href}
            >
              {i.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
