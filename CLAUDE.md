# True Nord Photography — CLAUDE.md

## Project overview

Static HTML/CSS/JS photography portfolio and print shop for TJ Nordberg, a Minnesota-based fine art landscape and wildlife photographer. Deployed to **truenord.photo** via Cloudflare Pages.

## Stack

- **HTML** — plain multi-page site (no build step, no framework)
- **CSS** — single `styles.css` using CSS custom properties (Vivere Framework v2.0 theme)
- **JS** — single `script.js`, vanilla ES5-compatible IIFE (no bundler, no transpiler)
- **Deployment** — Cloudflare Pages (`wrangler.toml`), `_headers` and `_redirects` for routing
- **Fonts** — Inter (body) + Playfair Display (headings) via Google Fonts, loaded async with preload + noscript fallback

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Landing page — hero pan animation, 6 immersive full-bleed photo sections, contact form |
| `gallery.html` | Masonry gallery with category filter buttons |
| `prints.html` | Print shop with size selector and pricing |
| `about.html` | Photographer bio and gear list |
| `404.html` | Custom error page |

## Design tokens (styles.css `:root`)

- **Accent color:** `#c87941` (Minnesota amber/forest)
- **Fonts:** `--font-main: 'Inter'`, `--font-display: 'Playfair Display'`
- **Spacing:** 4px-based scale (`--space-xs` through `--space-4xl`)
- **Typography:** fluid `clamp()` scale (`--text-xs` through `--text-4xl`)
- Dark mode supported via `@media (prefers-color-scheme: dark)`
- Reduced motion supported via `@media (prefers-reduced-motion: reduce)`

## JS features (script.js)

- Navbar: hide on scroll down, reveal on scroll up, glass blur, mobile toggle
- Scroll reveal: `IntersectionObserver` for `.scroll-fade-up`, `.scroll-scale`, `.scroll-slide-left/right`, `.bento-item`, `.print-card`
- Lightbox: keyboard nav (arrow keys + Escape), touch/pointer swipe support
- Gallery filter: `data-category` attribute filtering with `.gallery-item--hidden`
- Print size selector: `data-price` driven price updates
- Contact form: currently mocked (replace `setTimeout` stub with EmailJS or Formspree)
- LQIP blur-up: inline base64 blur placeholder fades out when main image loads
- Back-to-top button: appears after 400px scroll

## Image conventions

- Format: `.webp` throughout
- Featured images: `assets/images/featured/feat-NN-slug.webp` (1920px wide)
- Gallery images: `assets/images/gallery/xx-slug.webp` (1200px wide)
- Thumbnails: `assets/images/thumbs/xx-slug-thumb.webp` (600px wide)
- LQIP: tiny inline base64 webp blurs embedded directly in HTML

## Coding conventions

- No build tools — keep HTML, CSS, and JS editable directly
- JS is ES5-compatible IIFE style (no `const`/`let`, no arrow functions in production code)
- CSS uses BEM-like class naming (`.block`, `.block__element`, `.block--modifier`)
- Inline `<style>` blocks in HTML are only used for page-specific styles not shared across pages
- All shared styles live in `styles.css`
- Accessibility: skip link, `aria-label`, `aria-current`, `role` attributes, focus-visible states maintained

## Branching workflow

| Branch | Purpose | URL |
|--------|---------|-----|
| `staging` | All active development | `staging.true-nord-photography.pages.dev` |
| `master` | Production only — **never commit directly** | `truenord.photo` (once domain is connected) |

## Deployment — 3-stage workflow

### Stage 1 — Local preview
Make edits, then verify on local dev server before committing anything.
```powershell
npx wrangler pages dev . --port 3456
# Open http://localhost:3456 and verify visually
```

### Stage 2 — Staging
Once local looks correct, commit and push to staging. Verify the live staging URL matches local exactly.
```powershell
git add <files>
git commit -m "description of change"
.\deploy-staging.ps1
# Opens: https://staging.true-nord-photography.pages.dev
# Compare against http://localhost:3456 — they must match before proceeding
```

### Stage 3 — Production
Only after staging is verified and approved.
```powershell
.\deploy-and-purge.ps1
# Merges staging -> master, pushes, optionally purges CDN cache
```

> `deploy-and-purge.ps1` cache purge requires `$env:CF_ZONE_ID` and `$env:CF_API_TOKEN`. Without them the deploy still completes — CDN refreshes naturally within minutes.

**Never push directly to `master`.** Always go local → staging → production.

## Contact

- Email: tj@truenord.photo
- Domain: truenord.photo
