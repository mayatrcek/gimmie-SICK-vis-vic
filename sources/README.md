# Sources

Official reference material that backs the information shown in the **Victoria Daily Ocean & Dive Map** (`index.html`).

> These files are **not used by the website.** The live app pulls everything from public APIs at runtime. This folder is the provenance / reference layer — the authoritative sources behind any figures, ratings logic, species info, locations, or other claims presented in the app.

## Structure

- **`docs/`** — Markdown documents: write-ups, data-source notes, methodology, citations, and reference material. Start from [`docs/TEMPLATE.md`](docs/TEMPLATE.md).
- **`images/`** — Images used as sources: photographs, screenshots, charts, maps, and figures.

## Conventions

- Use lowercase, hyphenated file names — e.g. `swell-rating-methodology.md`, `kingfish-seasonality.png`.
- In each `docs/` file, record **where the information came from** (link, publication, date accessed) so it can be traced and updated later.
- Reference an image from a doc with a relative link: `![caption](../images/your-image.png)`.

## How this is used

When the app's information changes (rating thresholds, species/seasonality notes, site details, data-source descriptions), add or update the matching source here **first**, then update `index.html` to match. That keeps every claim in the app traceable to an official source.
