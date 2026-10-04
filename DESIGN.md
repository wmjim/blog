---
name: Void — Pocket Reference
description: A personal tech blog rendered as one narrow O'Reilly Nutshell-style pocket technical manual: warm paper, ink, barn-red bookstamps, monospace micro-labels, hairlines and no content shadows.
colors:
  paper: "#fffdf8"
  panel: "#f4f1e9"
  code-surface: "#f7f5ee"
  ink: "#2b2721"
  barn-red: "#b8392c"
  link-teal: "#1f6f8f"
  link-teal-hover: "#174f68"
  hairline: "#ddd8c8"
  hairline-strong: "#c7c1ad"
  semantic-info: "#3253b4"
  semantic-success: "#1c7a52"
  semantic-warning: "#a8620f"
  semantic-import: "#8a4bb0"
  night-ground: "#1a1815"
  night-paper: "#e6e0d4"
  night-panel: "#24211d"
  night-code-surface: "#141210"
  night-hairline: "#3a352d"
  night-barn-red: "#e0776a"
  night-link-teal: "#6fb8d4"
typography:
  display:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "clamp(1.8rem, 4vw, 2.35rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "0"
  headline:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "1.8rem"
    fontWeight: 600
    lineHeight: 1.24
    letterSpacing: "0"
  title:
    fontFamily: "'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', serif"
    fontSize: "1.45rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0"
  body:
    fontFamily: "'LXGW WenKai Screen', 'LXGW WenKai', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: "0"
  label:
    fontFamily: "'Maple Mono CN', 'Maple Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace"
    fontSize: "0.7rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
  mono:
    fontFamily: "'Maple Mono CN', 'Maple Mono', 'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "0"
rounded:
  sm: "2px"
  md: "3px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
components:
  article-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "1.5rem 0"
  article-meta:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    size: "auto"
  callout:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.9rem 1.05rem"
  code-block:
    backgroundColor: "{colors.code-surface}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "1rem 1.125rem"
  tag-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.28rem 0.65rem"
  pagination-item:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    size: "2.25rem"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: "2.25rem"
    padding: "0 0.875rem"
---

# Design System: Void — Pocket Reference

## Overview

**Creative North Star: "The Pocket Reference"**

The whole blog is one narrow O'Reilly Nutshell-style pocket technical manual. Every page is a spread from the same book: warm paper ground, ink body, a barn-red bookstamp, monospace micro-labels, and hairlines doing all the structural work. Nothing is a "card"; a post is a numbered catalog entry, a section is a bookstamp-ruled chapter, a callout is a margin note in a cream panel.

The world refuses the personal-blog default of centered single column plus avatar header plus card grid. Identity comes from the book's binding vocabulary instead — a hairline masthead, a running head stamped VOID in uppercase mono, red `§` section marks, and an index-style table of contents rail. Removal of the site name should still read as the same manual.

Density is reading-first: prose is the product, hierarchy is carried by type and whitespace, and every decorative element must double as a wayfinding device. Depth is not simulated on content — no card shadows — but floating layers (search overlay, mobile drawer) are allowed a single soft shadow because they must detach from the page.

**Key Characteristics:**
- Warm paper `#fffdf8` ground and cream `#f4f1e9` panels; ink `#2b2721` body set at runtime.
- Barn red `#b8392c` is a markup ink, never a surface: category labels, `§` marks, side headings, bookstamp, bookmark squares.
- Hairlines (`#ddd8c8` / `#c7c1ad`) plus the 2px-ink-over-1px-hairline "bookstamp" as the only section device.
- Monospace micro-labels: uppercase, ~0.14em tracking, 600–700 weight.
- Flat content surfaces, near-square radii (2px / 3px), no shadow on any content element.

## Colors

A warm-paper / black-ink / barn-red / teal-ink palette in which the accent acts as printed markup, not as a fill.

### Primary
- **Barn Red** (#b8392c): the bookstamp ink. Only on category labels, `§` section marks, aside / TOC side headings, the running-head binding rule, bookmark squares and the top mark on section headers. Also aliased as the error semantic. It is a marking color; it never fills a large surface.
- **Barn Red (Night)** (#e0776a): the lightened red for dark reading mode — same role, legible on deep ink.

### Secondary
- **Teal Link** (#1f6f8f): every clickable text — inline links, nav items (default state), list titles on hover. The hover deepens to #174f68.
- **Teal Link (Night)** (#6fb8d4): lightened link teal; hover #97cee4.

### Tertiary
- **Semantic Set** — Info #3253b4, Success #1c7a52, Warning #a8620f, Import #8a4bb0, Default #BEC4CC: the color of a callout's accent bar, its title, and its icon. Each has a 24–28% alpha border tint (`rgb(from … / 24%)`) and a low-alpha fill for the button variants.

### Neutral
- **Warm Paper** (#fffdf8): page ground, table background, list ground — the page *is* the paper, full-bleed, no outer card.
- **Cream Panel** (#f4f1e9): the recessed panel for callouts, the article summary box, and blockquotes.
- **Code Surface** (#f7f5ee): a second, slightly paler cream reserved for code blocks only, so code reads as its own material against the panel.
- **Ink** (#2b2721): body, all headings, metadata. Not declared in Base.less — injected at runtime by `src/config.ts` (`Theme["--vh-font-color"]`) via Layout.astro's inline `:root` style, which overrides Base.less defaults. Alpha ramps derive from it: 88% (body strong), 66% (secondary / metadata / captions), 36%, 16%, 6% (table zebra, inline-code fill).
- **Hairline** (#ddd8c8) and **Hairline Strong** (#c7c1ad): every divider, border, table rule, and the metadata separator ticks.

### Named Rules
**The Markup-Ink Rule.** Barn red is ink, not paint. It appears only on labels, `§` marks, side headings, the binding rule, and bookmark marks — never as a filled surface, never on body text. If red is covering more than the marks, it is wrong.

**The Two-Inks Rule.** Red marks structure; teal marks interactivity. Body links and nav adopt teal; the moment a mark is a destination, red yields to teal on hover.

**The No-Gray-Secondary Rule.** Secondary text is ink at 66% (`rgb(from var(--vh-font-color) r g b / 66%)`), never a neutral gray — secondary text stays warm-toned paper ink.

## Typography

**Display Font:** Noto Serif SC (with Songti SC / STSong / SimSun / serif)
**Body Font:** LXGW WenKai Screen (with LXGW WenKai / PingFang SC / Hiragino Sans GB / system-ui)
**Label/Mono Font:** Maple Mono CN (with Maple Mono / SF Mono / Cascadia Code / JetBrains Mono)

**Character:** Three voices of one manual — a kai reading face for the body that keeps long Chinese prose soft and personal, a heavy Song serif for chapter headings and post titles, and a monospace for every micro-label, date, tag, and code line. The serif/mono pair carries the "reference book" authority; the kai keeps it human.

### Hierarchy
- **Display** (600, masthead `1.8rem` → `2.35rem` at ≥768px, lh 1.1–1.16): site name in the masthead only. Ink, never red.
- **Headline** (600, article `h1` `1.8rem` → `1.5rem` below 999px, lh 1.24; base `h1` `1.75rem`): the chapter title. Metadata sits *below* it in mono.
- **Title** (600, `h2` `1.45rem`, `h3` `1.1875rem`, `h4` `1.0625rem`; list-card title `1.375rem` → `1.5rem` at ≥768px): section and entry titles. `h2` alone earns the `§` marker and a hairline rule above it; `h3`–`h6` separate by size alone.
- **Body** (400, `1rem` → `1.0625rem` at ≥768px, lh 1.8; paragraphs at `--vh-font-88`, list items at 66%): the reading column. Half-line measure is capped by the layout (46rem column), not by the type.
- **Label** (600–700, `0.7rem`, tracking `0.14em`, uppercase, mono): category labels, aside/TOC side headings, summary labels, `置顶` badge. Site name runs a wider `0.22em`.
- **Meta** (400–700, `0.72rem`, mono, uppercase): the article metadata band, dates, read-time, tags.

### Named Rules
**The Serif-For-Heading Rule.** Headings and post titles are Noto Serif SC at weight 600 only — the self-hosted subset carries just one true weight, so hierarchy steps by size, never by weight.

**The Zero-Tracking Rule.** Chinese serif headings set `letter-spacing: 0`. Negative tracking is for Latin word-shapes; on Song characters it cramps the face.

**The Mono-Is-Not-Costume Rule.** Monospace is used for real code, dates, tags, and measurement labels — the manual's printed apparatus. It is never used to make a headline "look technical."

## Layout

A single centered reading column capped at **46rem** — the manual's page measure — with the site container at `--vh-main-max-width: 1360px` and a `--vh-aside-width: 280px` rail. Content is a flex row (`row-reverse`) so the aside/TOC lands on the right; below **888px** it stacks to a column, below **1150px** the article TOC collapses to a floating drawer button.

The article page narrows to "TOC + body" only: `.article-wrapper` is `46rem + aside + gap` wide, centered, so the body column keeps its 46rem measure even with the rail attached. The masthead and list are also pinned to 46rem, so a reader's eye never changes measure between the list, the masthead, and an article.

Spacing rhythm is a rem scale: `0.25 / 0.5 / 0.75 / 1 / 1.5 / 2rem`. Section gaps are `1.75rem` (masthead, aside items); list entries separate by `1.5rem` vertical padding plus a hairline; heading tops are generous (`h2` margin-top `2.35rem` plus `0.75rem` padding above its rule) and bottoms tight (`0.7rem`) — more air above a heading than below. Header height is fixed at `3.5rem` so sticky offsets in Header, TOC, and Aside all agree.

## Elevation & Depth

**The manual is flat.** Every content surface — list entries, callouts, code, tables, images, cards — sets `box-shadow: none` via the token set (`--vh-shadow-*` all resolve to `none`). Depth and grouping are conveyed by hairlines, the 2px/1px bookstamp rule, cream-vs-paper tonal shifts, and whitespace; nothing floats.

The single exception is true floating layers, which must visibly detach: the mobile TOC drawer (`-8px 0 32px rgba(0,0,0,0.12)`), the search overlay (`0 12px 40px rgba(0,0,0,0.15)`), and the site header's frosted backdrop (`saturate(180%) blur(20px)` over `--vh-white-88`). These are overlays over the manual, not pages of it.

### Shadow Vocabulary
- **None (content)** (`var(--vh-shadow-sm|md|lg)` → `none`): the default for all in-flow surfaces.
- **Overlay lift** (`-8px 0 32px rgba(0,0,0,0.12)` / `0 12px 40px rgba(0,0,0,0.15)`): mobile drawer and search panel only.

### Named Rules
**The Flat-At-Rest Rule.** Content surfaces never cast a shadow, at rest or on hover. Hover is answered with a hairline color shift, a red dot, or a background tint — not with lift.

**The Shadow-Means-Floating Rule.** A shadow may appear only when the element is physically above the page (modal, drawer, sticky frosted bar). If it lives in the reading flow, it gets a hairline instead.

## Shapes

Near-square by doctrine. Radii top out at **2px** (`--vh-radius-sm`) for inline and chip forms and **3px** (`--vh-radius-md`) for containers — enough to soften a corner, never enough to read as a rounded card. The only true circles are genuinely circular controls: the back-to-top button, the TOC mobile button, language dots, GitHub avatars, and the archive timeline node.

The recurring silhouette is the **bookstamp**: a `2px solid` ink top rule immediately followed by a `1px` hairline, with a short barn-red mark (2.75–3rem × 0.28rem) at the top-left corner. It opens the masthead and every article head. A smaller barn-red square (`0.5rem`) stamps the header brand; a tiny (`0.3rem`) red square is the "you are here" pixel on hovered list entries and active TOC items.

Borders are always 1px hairlines, except the deliberate structural thickenings: the 2px ink bookstamp rule, the 2px red binding line at the running head's base, and the `2px × 2.25–2.5rem` top accent bar on callouts and the summary box. There is no clipping, no inset panel bevel, no left color bar.

## Components

### Navigation (Running Head)
The sticky header is the manual's running head: `--vh-white-88` paper over a frosted backdrop, a hairline bottom border, and a 2px barn-red binding line inset at its base. The site name is uppercase mono at `0.92rem`/`0.22em` tracking with a `0.5rem` red square to its left; nav items are mono `0.76rem`/`0.08em` in teal, the active one switched to red, bold, with a persistent red underline. The site name and tagline proper live in the masthead below (`.vh-masthead`), not the header.

- **Shape:** square; height `3.5rem`, max-width `1360px`.
- **States:** hover → teal; active → red + underlined; icons are 0.95–1.15rem inline SVG in one stroke.
- **Mobile (≤888px):** text nav items hide; a menu button opens the drawer.

### Masthead (Cover Stamp)
The masthead is the book's cover page-tab: a bookstamp (2px ink top rule + hairline bottom) with a `2.75rem` red top mark, the site name in Display serif ink, and the tagline in 66% ink at `0.95–1.05rem`.

- **Corner Style:** square.
- **Background:** transparent (paper).
- **Border:** bookstamp, top `2px solid` ink, bottom `1px` hairline.
- **Padding:** `1.5rem 0 1.25rem` → `1.75rem 0 1.5rem` at ≥768px.

### Article Header + Metadata Band
Every article opens with the same bookstamp and a `3rem` red top mark. The `h1` is ink serif; beneath it a monospace metadata band (`0.72rem`, uppercase) holds date, category, word-count and read-time, each item separated by a `1px × 0.7rem` hairline tick. Category items are red and link to their index; dates are plain text.

- **Shape:** square; gap `0.5rem` row / `0.85rem` column.
- **Border:** hairline separators between items.

### Article List (Catalog Entries)
Entries, not cards: no thumbnail, no container fill, no shadow. Each entry is a hairline-separated row with a red uppercase mono category label, an ink serif title (`1.375rem` → `1.5rem`), mono date and read-time, a 66% excerpt, and a mono tag list. On hover a `0.3rem` red square appears in the left margin.

- **Corner Style:** square.
- **Border:** `1px` hairline top (first entry none).
- **Internal Padding:** `1.5rem` vertical.

### TOC Rail (Thumb Index)
The TOC is a thumb-index rail at `280px`: a red uppercase mono title (`0.7rem`/`0.14em`) followed by a hairline that runs to the edge, then entries indented by level. Level 2 is `0.82rem` at 88% ink, level 3 is `0.78rem` at 66%. The active entry turns red with a `0.32rem` red square in the left margin. The rail scrolls with a 3px near-invisible scrollbar.

- **Shape:** square.
- **States:** hover → red; active → red + bookmark square.
- **Mobile (≤1150px):** collapses to a fixed circular button and a right-side drawer with an overlay.

### Callouts (Margin Notes)
Cream `#f4f1e9` panel, `1px` hairline border, `2px` radius, and a **top accent bar** (`2px × 2.25rem`, top-left) colored by type — never a left color bar. The title row carries a `1rem` SVG icon mask in the accent color; body text is 66% ink at `0.875rem`. Variants: `.vh-note` (neutral 36% ink), `note-info`, `note-success`, `note-warning`, `note-error`, `note-import`.

- **Corner Style:** 2px.
- **Background:** cream panel.
- **Border:** hairline + top accent bar.
- **Internal Padding:** `0.9rem 1.05rem`.

### Code Blocks
A cream `#f7f5ee` panel, `1px` hairline, `3px` radius, `1rem 1.125rem` padding. Lines are numbered by a counter whose left gutter is closed by a `1px` strong-hairline rule; line numbers are 66% ink, code is `0.875rem`/1.75 mono. A copy affordance sits top-right at 45% opacity, resolving to full opacity on hover and swapping its icon to a success-colored check. Inline code is a 6% ink ﬁll with no border, `2px 5px` padding.

- **Corner Style:** 3px.
- **Background:** code surface.

### Tag Chips (Index Terms)
Square-cornered chips (`2px`) with a `1px` strong-hairline `#c7c1ad` border, mono `0.72rem` label at 66% ink. On hover the chip inverts to a solid barn-red fill with white text — the one place red fills, and only a small chip.

- **Shape:** 2px radius.
- **State:** hover → red fill / white text.

### Pagination
Square-ish `2.25rem` tiles with a `3px` radius and hairline border on paper. Hover tints the border red-28% and shifts up `1px`; the active tile is a solid red fill with paper text; disabled drops to 25% opacity.

## Do's and Don'ts

### Do:
- **Do** keep the reading column at 46rem and center it, so list, masthead, and article share one measure.
- **Do** open every major section with the bookstamp — `2px` ink top rule + `1px` hairline bottom + short red top-left mark.
- **Do** set every micro-label in Maple Mono CN, uppercase, `0.14em` tracking (`0.7rem`).
- **Do** use barn red strictly as markup ink: labels, `§` marks, side headings, binding line, bookmark squares.
- **Do** convey grouping with hairlines and cream-vs-paper tonal shifts; content shadows stay `none`.
- **Do** set secondary text as ink at 66%, not gray.
- **Do** use 2px / 3px radii, reserving circles for genuinely circular controls.

### Don't:
- **Don't** put a shadow on any in-flow content surface; a shadow means the element is floating.
- **Don't** fill a large surface with barn red, or set body text in it — red marks, teal interacts.
- **Don't** use a colored `border-left`/`border-right` bar on callouts, quotes, or list items; callouts use a top accent bar.
- **Don't** introduce card containers, thumbnails, or rounded-card silhouettes into the list — entries are hairline-separated rows.
- **Don't** put a kicker or eyebrow above a heading; let the serif heading carry its own weight.
- **Don't** tighten letter-spacing on Chinese serif headings (keep `letter-spacing: 0`).
- **Don't** step heading hierarchy by font weight — the serif subset has one weight (600); step by size.
