# Gimmie Sick Vis — SEO / Google SERP Appearance Plan

**Handoff brief for Claude Code**
Goal: improve how gimmiesickvis.com looks and performs in Google search results (title/description shown in the SERP, sitelinks eligibility, brand presence) without touching the on-page visual design.

Site is Next.js. Current state observed on the live site (Aug 2026): title tag and OG/Twitter meta are identical across pages ("GIMMIE SICK VIS"), meta description is set and good, no JSON-LD structured data detected, favicon present (dive flag icon).

---

## 1. Unique title tags per route

**Task:** Replace the single static title with per-page titles, most likely via Next.js Metadata API (`generateMetadata` / per-page `metadata` export depending on whether this is App Router or Pages Router — check first).

**Target pages and suggested titles** (Maya: adjust wording/order to match your voice — these are placeholders):

| Route | Suggested title |
|---|---|
| `/` | `GIMMIE SICK VIS \| Victorian Dive & Fishing Conditions Forecast` |
| `/forecast` | `Dive & Fishing Forecast - Victorian Coast \| GIMMIE SICK VIS` |
| `/live/nepean` | `Point Nepean Wave Buoy - Live Swell Data \| GIMMIE SICK VIS` |
| `/live/chlorophyll` | `Chlorophyll Levels - Victorian Coast \| GIMMIE SICK VIS` |
| `/live/sst` | `Sea Surface Temperature - Victorian Coast \| GIMMIE SICK VIS` |
| `/live/currents` | `Ocean Currents - Victorian Coast \| GIMMIE SICK VIS` |
| `/live/altimetry` | `Sea Level / Altimetry Data - Victorian Coast \| GIMMIE SICK VIS` |
| `/live/salinity` | `Salinity Data - Victorian Coast \| GIMMIE SICK VIS` |
| `/live/bathymetry` | `Bathymetry / Seabed Data - Victorian Coast \| GIMMIE SICK VIS` |
| `/live/satellite` | `Satellite Imagery - Victorian Coast \| GIMMIE SICK VIS` |
| `/back-beach` | `Back Beach Forecasting Guide \| GIMMIE SICK VIS` |
| `/geo/depth` | `Depth Map - Victorian Coast \| GIMMIE SICK VIS` |
| `/store` | `Store \| GIMMIE SICK VIS` |
| `/about` | `About \| GIMMIE SICK VIS` |
| `/contact` | `Contact \| GIMMIE SICK VIS` |


---

## 2. Per-page meta descriptions

Homepage description is already solid and can stay as-is:
> "Daily dive- and fishing-conditions dashboard for the Victorian coast: swell, wind, sea-surface temperature, chlorophyll and seabed data."

**Task:** Write a distinct ~120–155 character description for each `/live/*` and other inner page, following the same tone. Claude Code should draft placeholder copy per page, but flag it clearly for Maya to fine-tune rather than shipping AI-drafted copy verbatim.

---

## 3. Structured data (JSON-LD)

**Task:** Add JSON-LD to the homepage `<head>`:

1. **`WebSite` schema** with a `SearchAction` — this is what makes Google eligible to show a sitelinks search box under the result. Only worth it once there's meaningful indexed content, but no harm adding early.
2. **`Organization` schema** — name, logo (use the dive flag icon or a higher-res brand mark if one exists), url, sameAs (links to any socials Maya has for Gimmie Sick Vis, if any).

**⟶ MANUAL ADJUSTMENT SPACE:** Maya to confirm — (a) is there a higher-res logo asset than the 32px dive flag for the `logo` field (Google prefers larger images), (b) any social links to include in `sameAs`.

---

## 4. Sitemap & canonical check

Since GSC redirect issues have come up before, before/alongside the above:

- Confirm `sitemap.xml` is generated (Next.js `sitemap.ts`/`sitemap.xml` route) and includes all routes listed in section 1.
- Confirm every page's canonical tag points to itself (not all pointing back to `/`), unless intentionally consolidating near-duplicate pages.
- Re-submit sitemap in Google Search Console after deploy and check the Pages report a few days later for indexing status.

**⟶ MANUAL ADJUSTMENT SPACE:** Maya to re-check GSC after deploy — this is a "wait and verify" step, not something Claude Code can confirm from the codebase alone.

---

## 5. Favicon / brand consistency

No change needed — the dive flag favicon is already distinctive and consistent across `og:image`/`twitter:image`. Low priority, skip unless doing a broader brand pass.

---

## Suggested order of implementation

1. Title tags (biggest CTR impact, lowest effort)
2. Sitemap/canonical check (foundation — do before or alongside titles)
3. Meta descriptions per page
4. JSON-LD structured data

Each step above has a clearly marked manual-adjustment checkpoint — Claude Code should stop and leave `TODO` comments at those points rather than guessing final copy on Maya's behalf.
