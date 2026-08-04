"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { label: string; href: string };
type Group = { id: string; label: string; items: Item[] };

const GROUPS: Group[] = [
  {
    id: "live",
    label: "Live data",
    items: [
      { label: "Point Nepean wave buoy", href: "/live/nepean" },
      { label: "Chlorophyll", href: "/live/chlorophyll" },
      { label: "Sea temperature", href: "/live/sst" },
      { label: "Currents", href: "/live/currents" },
      { label: "Altimetry", href: "/live/altimetry" },
      { label: "Salinity", href: "/live/salinity" },
      { label: "Bathymetry", href: "/live/bathymetry" },
      { label: "Satellite imagery", href: "/live/satellite" },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    items: [
      { label: "Fish guide", href: "/fish" },
      { label: "Back beach forecasting", href: "/back-beach" },
    ],
  },
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
  return (
    <div className={`tab-dd${open ? " open" : ""}`}>
      <button
        className={`tab${active ? " active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
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
        {g.items.map((i) => (
          <Link
            key={i.href}
            className={`tab-menu-item${isActive(i.href) ? " active" : ""}`}
            role="menuitem"
            href={i.href}
          >
            {i.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
