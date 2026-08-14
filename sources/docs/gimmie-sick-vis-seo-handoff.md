# Gimmie Sick Vis — SEO Handoff for Claude Code

Two things to implement: (1) homepage title/meta description update, (2) site structure changes to give Google a clear shot at showing sitelinks (like surf-forecast.com does) in search results.

---

## 1. Homepage metadata

Find the root metadata export (likely `src/app/layout.tsx`, or `src/app/page.tsx` if the homepage sets its own). Update the `title` and `description`:

```tsx
export const metadata: Metadata = {
  title: "GIMMIE SICK VIS - The Ultimate Forecasting Tool For Victorian Divers",
  description: "Dive forecasting, access to premium live data and a learning database open to all Victorian divers.",
  // keep existing openGraph, icons, etc. as-is — just update openGraph.title /
  // twitter.title to match the new title if they're set separately
};
```

**Important:** if this lives in the root `layout.tsx`, it cascades as the default for any page that doesn't export its own `metadata`. Confirm that spot/location pages and conditions pages each have their own distinct `title` + `description` exports so they don't inherit this one — duplicate titles across pages work against goal #2 below.

---

## 2. Site structure for sitelinks eligibility

**Context:** Google generates sitelinks (the indented sub-links under a search result, like surf-forecast.com has for Victoria / Victoria Surf Map / Australia / etc.) algorithmically — they can't be requested directly. Google shows them when it's confident about a site's structure and the site has enough trust/traffic. What we *can* control is making the site structure as clear a candidate as possible. This is a medium-term project (results likely take months, not days), but the technical groundwork should go in now.

### a) Clean, consistent nested URL routes

Move toward a predictable hierarchy Google can map, e.g.:

```
/                          → homepage
/conditions                → today's conditions overview
/spots/mornington-peninsula
/spots/phillip-island
/spots/portland
/spots/[other-regions]
/about
```

Audit current routing against this pattern and flag any inconsistent URL structures.

### b) Strong internal linking / persistent nav

Ensure the main site nav (header or prominent homepage links) consistently surfaces the pages you'd want as sitelink candidates — e.g. Conditions, Locations/Spots, About. These should be the same links, in the same place, across all pages, since Google tends to pick pages that are linked to prominently and repeatedly.

### c) Per-page SEO fundamentals

For each spot/region page and the conditions page:
- Unique `title` (following the homepage's voice/tone but distinct — not a copy-paste)
- Unique `description`
- No `noindex` accidentally applied

### d) Sitemap.xml

- Generate/update `sitemap.xml` to include all spot pages, conditions page, and about page with correct `lastmod` values
- Confirm it's referenced in `robots.txt`
- After deploy, resubmit in Google Search Console

### e) Crawlability check

- Confirm no unintended `noindex` tags or robots.txt disallows on the pages listed above
- Confirm all these pages return 200 (no redirect chains or broken links in the nav)

---

## Notes for Claude Code

- This is Maya's Next.js (App Router) project, deployed on Vercel — repo: `mayatrcek/gimmie-SICK-vis-vic`
- There's an existing per-page SEO title/meta implementation plan in progress — check for any partially-done work before starting fresh
- Domain is the apex `gimmiesickvis.com` (www → apex 301 redirect already handled per prior GSC work)
