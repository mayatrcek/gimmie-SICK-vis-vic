---
version: alpha
name: OVERWORLD
description: An editorial pixel-art design system where chunky 16-bit landscapes punch through giant blocky display type on warm parchment. Layouts fracture the grid through asymmetric margins, full-bleed image breakouts, slightly rotated sticker badges, and hard offset block shadows.
colors:
  parchment: "#F2EAD6"
  bone: "#FFFAEF"
  ink: "#161310"
  ink-soft: "#3A332A"
  border-tan: "#D9CDB3"
  border-strong: "#161310"
  sky-cobalt: "#2E5DD6"
  sunset-vermillion: "#E2522E"
  pine-moss: "#2F6E4F"
  primary: "#2E5DD6"
  secondary: "#E2522E"
  tertiary: "#2F6E4F"
  surface: "#FFFAEF"
  surface-sunken: "#F2EAD6"
  on-surface: "#161310"
  on-primary: "#FFFAEF"
  on-secondary: "#FFFAEF"
  border: "#D9CDB3"
  focus: "#2E5DD6"
  error: "#E2522E"
  success: "#2F6E4F"
typography:
  display-font: "Pixelify Sans, ui-monospace, monospace"
  body-font: "Inter, ui-sans-serif, system-ui, sans-serif"
  hud-font: "VT323, ui-monospace, Menlo, monospace"
  display-xxl:
    fontFamily: "{typography.display-font}"
    fontSize: "128px"
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontWeight: 700
  display-xl:
    fontFamily: "{typography.display-font}"
    fontSize: "96px"
    lineHeight: 0.94
    letterSpacing: "-0.015em"
    fontWeight: 700
  display-lg:
    fontFamily: "{typography.display-font}"
    fontSize: "72px"
    lineHeight: 0.96
    letterSpacing: "-0.01em"
    fontWeight: 700
  headline-lg:
    fontFamily: "{typography.display-font}"
    fontSize: "44px"
    lineHeight: 1.02
    fontWeight: 700
  headline-md:
    fontFamily: "{typography.display-font}"
    fontSize: "28px"
    lineHeight: 1.1
    fontWeight: 600
  body-lg:
    fontFamily: "{typography.body-font}"
    fontSize: "18px"
    lineHeight: 1.55
    fontWeight: 400
  body-md:
    fontFamily: "{typography.body-font}"
    fontSize: "16px"
    lineHeight: 1.6
    fontWeight: 400
  body-sm:
    fontFamily: "{typography.body-font}"
    fontSize: "14px"
    lineHeight: 1.55
    fontWeight: 500
  label-sm:
    fontFamily: "{typography.hud-font}"
    fontSize: "18px"
    lineHeight: 1
    letterSpacing: "0.04em"
    textTransform: "uppercase"
  hud-md:
    fontFamily: "{typography.hud-font}"
    fontSize: "22px"
    lineHeight: 1
    letterSpacing: "0.02em"
  hud-sm:
    fontFamily: "{typography.hud-font}"
    fontSize: "16px"
    lineHeight: 1
    letterSpacing: "0.04em"
rounded:
  none: "0px"
  sm: "0px"
  md: "0px"
  lg: "0px"
  xl: "0px"
  full: "0px"
spacing:
  px: "2px"
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
  xxxl: "64px"
  bleed: "96px"
  gutter: "32px"
  page-max: "1280px"
elevation:
  shadow-flush: "0 0 0 0 #161310"
  shadow-tap: "2px 2px 0 0 #161310"
  shadow-card: "6px 6px 0 0 #161310"
  shadow-card-lg: "10px 10px 0 0 #161310"
  shadow-button: "4px 4px 0 0 #161310"
  shadow-cobalt: "4px 4px 0 0 #2E5DD6"
  shadow-vermillion: "4px 4px 0 0 #E2522E"
border:
  hairline:
    width: "1px"
    color: "{colors.border-tan}"
  ink:
    width: "2px"
    color: "{colors.ink}"
  ink-thick:
    width: "3px"
    color: "{colors.ink}"
components:
  button-primary:
    backgroundColor: "{colors.sky-cobalt}"
    textColor: "{colors.bone}"
    typography: "{typography.label-sm}"
    padding: "14px 22px"
    rounded: "{rounded.none}"
    border: "2px solid {colors.ink}"
    shadow: "{elevation.shadow-button}"
  button-primary-hover:
    backgroundColor: "#1F47B0"
    textColor: "{colors.bone}"
    shadow: "{elevation.shadow-flush}"
    transform: "translate(4px, 4px)"
  button-secondary:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    padding: "14px 22px"
    rounded: "{rounded.none}"
    border: "2px solid {colors.ink}"
    shadow: "{elevation.shadow-button}"
  button-secondary-hover:
    backgroundColor: "{colors.parchment}"
    shadow: "{elevation.shadow-flush}"
    transform: "translate(4px, 4px)"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    padding: "12px 18px"
    border: "2px solid {colors.ink}"
    shadow: "{elevation.shadow-flush}"
  input-field:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    placeholderColor: "{colors.ink-soft}"
    typography: "{typography.hud-md}"
    padding: "12px 14px"
    border: "2px solid {colors.ink}"
    rounded: "{rounded.none}"
    height: "48px"
    shadow: "{elevation.shadow-tap}"
  input-field-focus:
    border: "2px solid {colors.sky-cobalt}"
    shadow: "{elevation.shadow-cobalt}"
  card:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    padding: "24px"
    border: "2px solid {colors.ink}"
    rounded: "{rounded.none}"
    shadow: "{elevation.shadow-card}"
    cornerNotch: "10px"
  card-sunken:
    backgroundColor: "{colors.parchment}"
    border: "2px solid {colors.ink}"
    shadow: "{elevation.shadow-tap}"
  badge-primary:
    backgroundColor: "{colors.sky-cobalt}"
    textColor: "{colors.bone}"
    typography: "{typography.label-sm}"
    padding: "4px 10px"
    border: "2px solid {colors.ink}"
    rotation: "-2deg"
  badge-vermillion:
    backgroundColor: "{colors.sunset-vermillion}"
    textColor: "{colors.bone}"
    typography: "{typography.label-sm}"
    padding: "4px 10px"
    border: "2px solid {colors.ink}"
    rotation: "1deg"
  badge-moss:
    backgroundColor: "{colors.pine-moss}"
    textColor: "{colors.bone}"
    typography: "{typography.label-sm}"
    padding: "4px 10px"
    border: "2px solid {colors.ink}"
    rotation: "-1deg"
  checkbox:
    size: "20px"
    backgroundColor: "{colors.bone}"
    border: "2px solid {colors.ink}"
    rounded: "{rounded.none}"
  checkbox-checked:
    backgroundColor: "{colors.sky-cobalt}"
    border: "2px solid {colors.ink}"
    tickColor: "{colors.bone}"
  tabs-track:
    backgroundColor: "{colors.parchment}"
    border: "2px solid {colors.ink}"
    padding: "0"
  tabs-active:
    backgroundColor: "{colors.bone}"
    textColor: "{colors.ink}"
    underline: "4px solid {colors.sky-cobalt}"
    typography: "{typography.label-sm}"
  tabs-inactive:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label-sm}"
---

## Overview

OVERWORLD is a pixel-art editorial design system for worldbuilders, indie game studios, devlogs, and cartographers of imaginary places. It is built around one bold premise: pixel art should be treated like fine print, framed by giant blocky display type on warm parchment, the way a vintage 16-bit splash screen would feel if it were redesigned as a high-end print magazine.

The vibe is loud, hand-applied, slightly out of register, and unapologetic about its grid. Every chrome edge is square, every shadow is solid, every divider is stepped. Type and image share the same pixel grammar, and the layout is allowed (encouraged) to break the column rules — full-bleed images push past container edges, headlines overlap art, small VT323 marginalia float in the gutters like HUD readouts on a save-state screen.

The system should feel like:
- a centered hero cartridge label, not a sidebar of CTAs
- a print broadsheet that decided to render itself in 16-bit color
- a designer's notebook where layouts are pinned with rotated stickers

The system should not feel like:
- a generic SaaS template with rounded cards and soft shadows
- a children's pixel-game UI with rainbow accents
- a brutalist mono-only zine with no warmth

Essential traits to preserve in every downstream artifact:
- zero border-radius anywhere on chrome (curves only exist inside pixel-art image content)
- hard solid offset block shadows in `ink`, never blurred
- one dominant centered display headline per page that visibly overlaps imagery
- VT323 HUD marginalia placed asymmetrically, not centered
- the Quest Star compass mark used as wordmark partner, oversized faded background ornament, and inline glyph

## Colors

The palette is warm-parchment-anchored with three saturated 16-bit accents and a strict ink for type/borders/shadows.

- `parchment` `#F2EAD6` — the entire system's primary background. Used on the page, behind heroes, and as the sunken surface inside layered cards. Warm cream, never gray.
- `bone` `#FFFAEF` — raised surface for cards, popovers, secondary buttons, and inputs. Slightly cooler than parchment so cards visibly lift on the page.
- `ink` `#161310` — display type, body type, 2px borders, and 100% of the offset block shadows. Near-black with a brown undertone; never use pure `#000`.
- `ink-soft` `#3A332A` — secondary copy, captions inside body paragraphs, deactivated tab labels. Use sparingly.
- `border-tan` `#D9CDB3` — soft horizontal rules, divider hairlines between content blocks, and table row separators where an ink border would feel too heavy.
- `sky-cobalt` `#2E5DD6` — the primary accent. Used for primary buttons, link underlines, focus blocks, active tab markers, the largest badge fills, and one in three pixel-art image overlays. Saturated, almost ultramarine.
- `sunset-vermillion` `#E2522E` — secondary accent for status pills, alert callouts, urgent badges, and one decorative sticker per page. Never pair vermillion against cobalt without ink between them.
- `pine-moss` `#2F6E4F` — tertiary accent for success states, nature/worldbuilding tags, and the third sticker color in a card cluster.

Contrast rules:
- Body copy: `ink` on `parchment` or `bone` only. Never on accents.
- Inverse type: `bone` on `ink`, `sky-cobalt`, `sunset-vermillion`, or `pine-moss`. Never on `parchment`.
- Borders: always `ink` at 2px on chrome; `border-tan` at 1px only for type-level rules.
- Focus ring: 4px `sky-cobalt` offset shadow replacing the ink shadow on inputs and focused controls.

## Typography

Three registers, intentionally mixed, never blended.

- **Display — Pixelify Sans 700** is the loud voice. Set hero headlines at 96-128px, section headlines at 44-72px, and button labels at 14-16px. Track tight (-0.01 to -0.02em) and allow the type to overlap imagery and break out of container edges in hero compositions.
- **Body — Inter 400/500** is the humane voice. Set body at 16-18px, line-height 1.55-1.6, max measure ~64ch. Inter is the only register that handles long-form reading; reserve it for paragraphs, list items, and any text over two lines.
- **HUD — VT323** is the marginalia voice. Set at 16-22px for captions, badge chrome, terminal-style labels, timestamps, breadcrumbs, status readouts, and tiny print. VT323 is intentionally chunky on screen — never use it for a paragraph.

Mix rules:
- Every page should have all three registers visible, but never within the same sentence.
- Captions next to a headline should always be VT323, never Inter, so the registers stay distinct.
- Buttons use Pixelify Sans labels in uppercase or small all-caps style; never VT323 on a button.
- Lead with the headline itself. No eyebrow/kicker label above headings.

Font loading: three Google Fonts (Pixelify Sans 400-700, Inter 400-700, VT323 400). Preconnect to fonts.googleapis.com and fonts.gstatic.com to keep first paint snappy on the loud display sizes.

## Layout

OVERWORLD is built on a 12-column grid with a wide 1280px page maximum, but the grid exists to be broken. Heroes are centered; supporting content uses asymmetric two-up or three-up splits with deliberately unequal margins.

Page rhythm:
- Outer page padding: 32px on small viewports, 64px on medium, 96px (bleed) on large.
- Section vertical spacing: 96-128px between major sections, 48px between sub-sections inside one section.
- Maximum measure for body text: ~640px regardless of viewport. Centered or set against a left rail.

Hero pattern (centered):
- One full-width centered display headline (Pixelify Sans, 96-128px).
- A short VT323 HUD strip directly under the headline (status badge + coordinates + version, separated by `//`).
- A single supporting Inter paragraph at ~520px, centered.
- A primary + secondary button pair, centered, side by side.
- A full-bleed pixel-art image directly under the hero, breaking out past the container edges by 64-96px on either side.
- The Quest Star ornament sits behind or near the headline at very low opacity (~12%).

Feature / card grids:
- Three-up grid of cards with intentionally unequal vertical offsets (every other card translated 12-24px on the y-axis so the row staircases).
- Cards may carry a single rotated sticker badge in the top-left or top-right (-2 to +2 degrees).
- Use the `staircase` divider between major sections — a 4px-tall ink staircase pattern, never a flat 1px rule.

Image treatment:
- Pixel-art images are always rendered with `image-rendering: pixelated` so they keep crisp edges at any size.
- Every pixel-art image carries the `scanline` overlay class for a faint horizontal scanline (about 2px on / 2px off at 6% opacity).
- Hero images break out of the container; in-card images stay contained but use a 2px ink border with a 6px ink offset shadow.

Sidebars and marginalia:
- The left and right gutters (above 1024px) are used for VT323 micro-readouts: section number, coordinates, build version, "press start" annotations.
- Marginalia is anchored to the corner of the section, not centered — embrace asymmetry.

Stacking on smaller screens:
- Below 768px, the grid collapses to a single column and bleed becomes 24px.
- Headlines clamp from 128px down to ~56px using `clamp()`.
- Side gutters and marginalia hide; hero centering remains.
- Card staircase offsets reset to zero on touch widths.

Section patterns to reuse:
- **Hero**: centered display + HUD strip + paragraph + button pair + full-bleed image.
- **Feature triad**: three cards with staircase offsets, each with a Quest Star bullet.
- **Quest log**: vertical list of `card-sunken` rows with VT323 timestamps in the gutter.
- **Newsletter / call-to-action**: parchment block with one ink input, one cobalt submit button, and a vermillion sticker badge rotated -2deg.
- **Footer**: dense VT323 grid, ink-on-parchment, with the Quest Star mark left-aligned.

## Elevation & Depth

Depth comes from hard offset block shadows. There is no Gaussian blur, no glassmorphism, no soft elevation in this system.

- `shadow-tap` (2px 2px 0 ink) — small lifts on inputs and inline chips.
- `shadow-button` (4px 4px 0 ink) — buttons at rest.
- `shadow-card` (6px 6px 0 ink) — standard card elevation.
- `shadow-card-lg` (10px 10px 0 ink) — the single hero card or featured artwork.
- `shadow-cobalt` and `shadow-vermillion` — colored shadow swap for focused inputs and "live" status cards.

Interaction model — the physical-press metaphor:
- Buttons at rest carry `shadow-button` and have no transform.
- On hover, no shadow change but the cursor reads pointer; on `:active` the button translates by `(4px, 4px)` and the shadow collapses to flush (`shadow-flush`). The total visual ink does not move — the button has been pressed into its shadow.
- Inputs swap from `shadow-tap` to `shadow-cobalt` on `:focus` and shift their border color to `sky-cobalt`.

Layering rules:
- Never stack more than two cards behind each other; the trading-card-sleeve metaphor stops working past two.
- Sticker badges sit on top of their parent card with a small offset shadow of their own.
- The Quest Star background ornament always sits behind everything at 10-15% opacity.

## Shapes

Zero border-radius. Everywhere. Every corner is square unless the corner is intentionally notched.

- **Notched cards** use a clip-path with 8-10px square notches on two opposite corners (typically top-right and bottom-left). The notch is a hard pixel cut, never a curve. The notch reveals the parchment background through the card.
- **Staircase dividers** are 4px tall and stepped at 8px horizontal intervals. They replace `<hr>` between major sections and feel like a pixel-art horizon line.
- **Rotated stickers** are pure rectangles applied at -2deg, -1deg, +1deg, or +2deg. Never wider rotations.
- **Quest Star** — the 12-point compass rose carved from rectangles — appears as the brand mark, an oversized faded section ornament (200-360px, opacity 0.10-0.14), and as inline bullet glyphs (12-16px) in lists.
- **Pixel image frames** — 2px ink border with a 6px ink offset shadow. No inner padding, no rounded mat.

Avoid all curves on chrome. The only curves in the system come from the photographic/painterly content inside pixel-art images.

## Components

**Buttons.** Two primary variants and a ghost. All share Pixelify Sans labels in uppercase tracking, a 2px ink border, and a 4px ink offset shadow. `btn-primary` fills sky-cobalt; `btn-secondary` fills bone; `btn-ghost` is transparent with the ink border only. Active state translates the button by the shadow distance and collapses the shadow to flush, mimicking a physical button press.

**Inputs.** Single-line `<input>` and `<textarea>` use a 2px ink border, bone fill, VT323 placeholder text, and the `shadow-tap` resting elevation. Focus swaps the border to sky-cobalt and the shadow to `shadow-cobalt`. Inputs never use floating labels — labels are stacked above in VT323 uppercase.

**Cards.** Bone surface, 2px ink border, 6px ink offset shadow, optional 10px notched corners. The "trading-card" hero variant uses `shadow-card-lg`. Cards may carry one rotated sticker badge and one VT323 timestamp in the bottom-right.

**Checkbox.** A 20px ink-bordered square. Unchecked is bone fill. Checked fills sky-cobalt with a 3-pixel stepped ink tick (composed from three rectangles, not an SVG check curve).

**Tabs.** Segmented track in `parchment` with a 2px ink border. Each tab is its own ink-bordered cell. Active tab fills `bone` with a 4px sky-cobalt underline marker that sits inside the cell, flush to the bottom edge.

**Badges / stickers.** Rectangles with 2px ink border, VT323 label, and one of three accent fills. Stickers carry an optional -2deg to +2deg rotation. Never rotate non-sticker chrome.

**Pixel image.** A `<figure>` with `image-rendering: pixelated`, a 2px ink border, a 6px ink offset shadow, and the `scanline` overlay layered on top via a `::after` pseudo-element. The `figcaption` is VT323 ink-soft, left-aligned beneath the frame.

**Quest Star.** The signature inline SVG. Used as: (1) brand mark beside the OVERWORLD wordmark; (2) oversized section background ornament at 10-14% opacity; (3) inline list-bullet glyph at 12-16px. Always uses `currentColor` so the surrounding palette controls its tone.

**Icon library.** Phosphor Icons (Bold weight) — https://phosphoricons.com/ — license MIT. Used inline via the official web font (`<i class="ph-bold ph-compass"></i>`). Paired with VT323 labels for action chips, feature markers, and inline accents inside cards. Use one weight only across the whole system.

Accessibility:
- All interactive elements have a visible focus state — focused buttons/links gain a 3px sky-cobalt offset outline; focused inputs swap to the cobalt shadow.
- Body type is Inter at 16-18px — never use VT323 for paragraph copy.
- Contrast: ink on parchment ≈ 13.4:1; ink on bone ≈ 15:1; bone on sky-cobalt ≈ 6.2:1.
- Decorative scanlines and the Quest Star ornament are marked `aria-hidden="true"` so screen readers skip them.
- Respect `prefers-reduced-motion`: the press translation collapses to a 1px translate with no shadow shift.

Framework adaptation:
- All component classes are framework-agnostic semantic classes (`.btn`, `.btn-primary`, `.card`, `.input`, `.tabs`).
- React, Vue, or Astro consumers can wrap each class in a single component without restructuring the markup.
- The press metaphor relies only on `transform` and `box-shadow`; works in every modern browser without JS.

## Do's and Don'ts

Do:
- Lead sections with the headline itself.
- Use one centered hero per page with a full-bleed pixel-art image that breaks past the container edges.
- Mix all three type registers (Pixelify Sans / Inter / VT323) on every page so the system reads as authored.
- Use the press-into-shadow metaphor consistently across buttons.
- Use Phosphor Bold icons paired with VT323 labels, never with Inter.
- Let pixel-art images render pixelated and carry the scanline overlay.
- Stagger card rows with intentional staircase offsets above 1024px.
- Apply rotated stickers sparingly — at most one per card, at most three across a hero.
- Use the Quest Star at three scales: tiny bullet, brand mark, oversized background ornament.

Don't:
- Don't put an eyebrow/kicker label above headlines — no all-caps category, no `// chapter 01` line, no decorative pre-title. Start with the heading.
- Don't round any chrome corner. Zero border-radius. Notched corners are pixel cuts, not curves.
- Don't use Gaussian blur, glass, gradients on chrome, or soft elevation. Shadows are solid block offsets in ink.
- Don't use VT323 for body paragraphs or any text that runs more than two lines.
- Don't smooth pixel-art images with bicubic upscaling — always set `image-rendering: pixelated`.
- Don't mix icon libraries. Phosphor Bold only.
- Don't center every section. The system depends on asymmetric gutters and marginalia — only heroes are centered.
- Don't pair vermillion directly against cobalt without an ink border or ink rule between them.
- Don't use rotation greater than ±2 degrees on stickers. The system is hand-applied, not chaotic.
- Don't let interactive states rely on color alone — pair color swaps with the press translate or focus shadow.
