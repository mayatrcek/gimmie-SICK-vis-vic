# GIMMIE SICK VIS — Copy Rewrite (Casual Tone Pass)

Goal: rewrite all subtitles/body text site-wide to match the casual, laconic
Aussie-diver voice established by the tagline below. Keep data, links, and
safety disclaimers accurate — only the tone/wording should change.

**Reference tagline (already decided, don't change):**
> GIMMIE SICK VIS

---

## Home (`/`)

**Summary**
> Chasing the best diving and fishing days with live data and a bit of local
> know-how. Built to help you find sick vis when it counts.

**Nav channels intro**
> Jump into the good stuff — swell, sea temp, chlorophyll, and where the fish
> are biting.

*(Leave the actual nav links/labels — Forecast, Live Data, Learn, Underwater
Geography — as-is unless it's cleaner to lowercase/de-jargon them too.)*

---

## About (`/about`)

**Intro paragraph** (replaces "This is a personal dive- and fishing-conditions
dashboard...")
> A weekend project turned obsession — pulling swell, wind, sea temp,
> chlorophyll and seabed data into one spot so I can tell if tomorrow's worth
> the early start.

**"Testing status" section → rename to "Still cooking"**
> This thing's a work in progress — some bits might be broken or change
> without warning. [Feedback](/feedback) welcome if something's acting up.

**"Who's 'us'" section → rename to "Who built this"**
> Just Maya — first-year comp-sci student, diver, and fisherman on the
> Victorian coast — with a hand from Claude (Anthropic's AI) to get the maps
> and data feeds talking to each other.

**Data-sources paragraph** — keep as-is (factual, no tone needed), just make
sure it still reads clean after the intro rewrite above.

**Final disclaimer** ("Ratings and seabed labels are indicative...") — **leave
unchanged**. This is a safety-relevant line and should stay clear/formal.

---

## Fish guide (`/fish`)

**Section header:** "Target species" → **"What's biting"**

**Intro paragraph**
> Fish worth chasing around Victoria right now, from the shore or the boat.
> Green tags mean it's a good time to go. Always check current
> [VFA size & bag limits](https://vfa.vic.gov.au/recreational-fishing/recreational-fishing-guide)
> before you keep anything — pics are stylised, not real photos.

*(Species names, scientific names, season windows, and location tags are
factual — leave those as-is.)*

---

## Seabed habitat (`/geo/habitat`)

**Intro paragraph**
> What's actually down there — seabed habitat mapped over satellite imagery,
> with depth lines from DEECA. Tap the seabed to see what you're looking at.

**Section header:** "Seabed types — simple guide" → **"The seabed, decoded"**

*(Individual habitat-type descriptions — Reef & rocky bottom, Seagrass
meadow, Kelp & seaweed, etc. — are fine as-is, they're already plain and
clear. Leave them.)*

---

## Footer (appears on every page)

Current text reads as leftover template placeholder jargon that clashes with
the site's casual dive-shop vibe:

> PROTOCOL_VO_1 / SATELLITE_LINK / GRID_COORD_REF
> ©2024 OVERWORLD_DYNAMICS // QUEST_STAR_SYSTEM

Replace with:

> Links / Data sources / Contact
> © 2026 Built by Maya, in the water more than at the desk

*(The actual data-source attribution line — Open-Meteo, NASA JPL MUR, NOAA
CoastWatch, etc. — is factual, keep it, just make sure it sits under the
new footer heading cleanly.)*

---

## Live-data pages (`/live/nepean`, `/live/chlorophyll`, `/live/sst`,
`/live/currents`, `/live/altimetry`, `/live/salinity`) and `/geo/depth`

I wasn't able to pull the current copy on these pages directly, so:

1. Find any subtitles/intro/body text on these pages (page titles, short
   descriptions above each data panel, empty-state or loading text, etc.)
2. Rewrite in the same casual, first-person, no-jargon voice used above —
   short sentences, plain words, a bit of dry humour where it fits, no
   corporate/gamer-tech jargon (avoid ALL_CAPS_SNAKE_CASE labels, "protocol",
   "grid coord", "intel", "operational", etc.)
3. Keep all actual data values, units, station names, and scientific/technical
   labels (e.g. buoy names, species names, coordinate systems) unchanged —
   only touch the surrounding prose.
4. Any safety/disclaimer text (e.g. "not for navigation or safety-of-life
   decisions") should stay clear and unchanged in tone.

---

## Style notes for consistency

- First person where it fits ("I", "my") — this is Maya's personal project,
  not a company product.
- Short sentences. Contractions are fine (it's, don't, that's).
- No corporate/dashboard jargon: avoid "operational intelligence," "real-time
  environmental data channels," "precision," "protocol," etc.
- A little dry humour is welcome but don't force it into safety-critical text.
- Keep all links, data attributions, and disclaimers factually intact —
  only the wrapping prose changes.
