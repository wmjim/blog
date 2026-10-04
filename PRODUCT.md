# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: technical readers who arrive via search engines, RSS, or friends' links — developers, Linux/NixOS users, and learners looking for practical, reproducible setup notes. Secondary: the author re-reading his own notes later.

## Product Purpose

A public personal tech blog ("Void") by an embedded software engineer. It shares practical notes and reflections on C/C++, Rust, Python, Git, and Linux (NixOS), plus embedded development. Success = readers find the site (search/RSS/sitemap) and can comfortably read and learn from it.

## Positioning

Hands-on, first-person field notes from a practicing embedded engineer working at the Linux/NixOS-and-embedded boundary. Write-ups are reproducible and opinionated (e.g. the NixOS+Arch+Ubuntu+Win multi-boot ecosystem piece) rather than generic tutorials.

## Operating Context

- The author writes posts as Markdown/MDX under `src/content/blog/`, organized into category folders (android, linux, nixos, …).
- Publishing is a static Astro build deployed to Cloudflare Workers assets (`https://blog.meng-w1016.workers.dev`). Comments run on Waline; the comment backend is a separate project (`blog-comments-bgst`).
- Posts support KaTeX math, Mermaid diagrams, GitHub-style callouts, code highlighting, TOC, related posts, and archive/category/tag listings; RSS carries `lastmod` for crawlers.
- Site language is Chinese (zh-CN) with English technical terms interleaved; fonts are self-hosted and subset at build time.

## Capabilities and Constraints

- Astro 7 + pnpm, static output, deployed at the domain root (`base: '/'`).
- Customized vhAstro theme: warm-orange accent (`#C2410C`), paper-white ground, **no shadows** — hierarchy comes from hairline borders and whitespace; near-right-angle radii (2px / 4px).
- Self-hosted subsetted fonts (Noto Serif SC, LXGW WenKai Screen, Maple Mono CN, …), split at build.
- Front-end features: full-text search, Swup page transitions, lazy-loaded images + lightbox, music player, comments, friend links, a 动态/talking page, archives with stats.
- Content schema fields: `title`, `date`, `updated`, `categories`, `tags`, `id`, `recommend`, `summary`, `draft`, `hide`, `top`.
- Open decision — identity is inconsistent in the tree: `src/config.ts` uses site/author **Void** (canonical, confirmed); `public/manifest.json` and `src/pages/links/index.md` still use **海上一孤舟**, which is stale and should be reconciled to "Void".

## Brand Commitments

- Site name and author identity: **Void** — `src/config.ts` is canonical authority.
- Voice: practical and first-person ("I did X, here's what happened"), casual-professional Chinese; instructional and personal, not neutral documentation.
- Visual world: **Pocket Reference** (since 2026-10-04) — the blog as one narrow O'Reilly-Nutshell-style pocket manual: warm paper ground, ink text, barn-red bookstamp accents, teal links, mono micro-labels, hairlines and double-rule bookstamps, no shadows. Recorded in DESIGN.md; the pre-2026-10-04 warm-orange/vhAstro look is retired.

## Evidence on Hand

- Real published posts under `src/content/blog/{android,linux,nixos}`: Termux-based Android dev environment; GKD+AdGuard skip-ads; the NixOS+Arch+Ubuntu+Win multi-boot ecosystem piece; a long-term Linux home-directory plan; personal Linux hotkey scheme; MCU dev setup on Linux.
- Author contact: `meng.w1016@outlook.com`; GitHub `github.com/wmjim`.
- Assets: `avator.jpg`, background/pattern images, footer icons, reward QR (`PayQrcode.png`), friend-links avatar.
- **Absences future work must not fabricate:** no testimonials, benchmarks, customer logos, or pricing claims exist; do not invent them.

## Product Principles

1. Reader first — every post earns its place by being findable (search/RSS/sitemap) and readable (typography, TOC, callouts).
2. Field notes over theory — write from hands-on experience with specific, reproducible steps.
3. Personal but public — the author's own learning is the source; accessibility and polish are owed to the reader.
4. One canonical identity — "Void" everywhere; reconcile stale naming rather than letting variants spread.
5. Quiet craft — hierarchy through typography, whitespace, and hairlines; restraint over decoration.
