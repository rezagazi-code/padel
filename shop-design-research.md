# Shop Design Research — Light Theme + Bubble Buttons (Oct 2026)

Research for the PadelPro gear shop redesign: user wants the shop panel **fully light** (opposite of the dark app), **bubble-like glossy buttons**, brighter, chic — not childish. Plus: how to show product photos instantly without heavy load.

Method: searched Awwwards SOTD / CSS Design Awards / FWA 2025–2026 winners filtered for light e-commerce, plus the 2025 "liquid glass" and "jelly/bubble button" technique literature. Awwwards does not publish hex codes, so award-site specs below are derived from public design breakdowns and the sites' documented visual language; button/glass specs come from published open-source recipes (attributed).

---

## 1. The 2025–2026 technique landscape

### 1a. Apple "Liquid Glass" (WWDC25, iOS 26) — the legitimizer of glass/bubble UI
Apple's 2025 design language made refractive glass the mainstream premium idiom. Public web re-implementations (open-source cheatsheets) converge on this recipe:

```css
.liquid-glass {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.35);   /* one precise hairline rim */
  border-radius: 2rem;
  box-shadow:
    0 8px 32px rgba(31, 38, 135, 0.20),          /* ambient depth */
    inset 0 4px 20px rgba(255, 255, 255, 0.30);  /* inner light */
}
```

Key interaction rules distilled from the Apple-style cheatsheets:
- **Hover (desktop):** `transform: scale(1.025)` + border highlight brightens.
- **Press:** `transform: scale(0.96)`, blur gets thinner, and a **radial glow blooms from the press point** (`--press-x/--press-y` written by a pointerdown listener; CSS draws `radial-gradient(circle at var(--press-x) var(--press-y), rgba(255,255,255,.55), transparent 60%)` that scales up while `:active`).
- **Tinted primary actions:** brand color at **~84% opacity** keeps white text at 5.2–5.5:1 contrast; below ~78% it fails over pale backdrops. (Directly applicable to our light shop.)
- **Caution from the same sources:** glass needs something behind it to refract. Over a flat solid background it reads as a flat pill — so keep bubble buttons *glossy-opaque* (painted gloss) rather than true transparent glass on light pages, or put them over imagery/gradient washes.
- Accessibility: honor `prefers-reduced-transparency` (fall back to frostier/solid) and `prefers-reduced-motion` (kill wobble).

### 1b. "Jelly UI" bubble buttons (open-source, 2026) — the exact bubble recipe
A 2026 open-source template ("100 CSS designs" series) ships glossy candy-like buttons. The core technique (MIT-style free template, demo at mmrahmanbappi.github.io/100-css-designs/01-soft-tactile-ui/009-jelly-ui/demo.html):

```css
.jelly { position: relative; border-radius: 999px; background: <brand gradient>; }
.jelly::before {           /* the gloss dome */
  content: ""; position: absolute;
  top: 5px; left: 14%; right: 14%; height: 38%;
  border-radius: 20px;
  background: linear-gradient(rgba(255,255,255,.75), rgba(255,255,255,0));
}
.jelly:hover { animation: wob .6s; }
@keyframes wob {
  30% { transform: scale(1.12, .88); }
  50% { transform: scale(.92, 1.08); }
  70% { transform: scale(1.04, .96); }
}
.jelly:active { transform: scale(.94); }   /* squish */
```

Steal-worthy points: gloss is a **separate pseudo-element occupying the top ~38%**, fading white→transparent; playfulness comes from **non-uniform scale** (squash & stretch), not plain scale. For a *chic* (not childish) version: keep the gloss dome + squish, drop the wobble or make it very subtle.

### 1c. Shine-sweep micro-interaction (widely used on award CTAs)
```css
.btn-shine { position: relative; overflow: hidden; }
.btn-shine::before {
  content: ""; position: absolute; top: 0; left: -100px;
  width: 100px; height: 100%;
  background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,.30), rgba(255,255,255,0) 70%);
  animation: shine 2.8s linear infinite;
}
.btn-shine:hover::before { animation: none; }
@keyframes shine { 0% { left: -100px; } 20%, 100% { left: 100%; } }
```
A slow light sweep every ~3s reads premium on light pages; pause on hover/touch.

---

## 2. Award-winning light e-commerce references (2025–2026)

### A. Odd Ritual — Awwwards SOTD + Developer Award, Apr 11 2026 (E-commerce)
- URL: listed on awwwards.com/websites/e-commerce ; live site via Webflow showcase ("Odd Ritual" by Geoff Dawes; stack: Webflow + Shopify + GSAP + Lenis).
- What it is: golf-culture apparel brand ("good times, on and off the course") — light, airy, editorial product storytelling.
- Why it won: commerce fused with editorial motion — product imagery treated like magazine spreads, buttery page transitions (barba.js), but the *buy* path stays one tap away.
- **Steal this:**
  - Background: warm off-white paper `#FAF8F3`, product photography on seamless `#FFFFFF`.
  - Product cards: no card chrome at all — full-bleed product photo, then name/price in 13px letterspaced caps beneath; price in semibold, no boxes.
  - Accent: single ink color `#1A1A1A` + one seasonal accent; restraint is the luxury signal.
  - Micro-interaction: image crossfade on hover (desktop) / swipe gallery dots (mobile); quick-add pill slides up over the image on hover.

### B. SŌM — Awwwards SOTD + Developer Award, Apr 4 2026 (E-commerce)
- URL: listed on awwwards.com/websites/e-commerce.
- Why it won: developer-award-grade build; commerce with avant-garde art direction, still instantly shoppable.
- **Steal this:**
  - Oversized display typography as the hero (product *names* set huge, ~10vw), prices small and quiet.
  - Sticky "add" control that follows scroll on product pages.
  - Lesson for us: let one element be loud (the product photo or the price), everything else whispers.

### C. Outfit — Awwwards "E-commerce Honors" Apr 2026 + SOTD May 11 2026
- URL: listed on awwwards.com/websites/fashion and /websites/e-commerce.
- Why it won: category-defining fashion commerce — lookbook-style collections that convert.
- **Steal this:**
  - Collection rows: horizontal snap-scroll rails of product cards (perfect for our category chips → product rails).
  - Cards: `border-radius: 18–22px`, soft shadow `0 10px 30px rgba(0,0,0,.08)`, image fills card top, info on white below.
  - Badges: tiny uppercase pills (10–11px, letterspacing .08em) — "NEW" / "−20%" — top-start corner over the image.

### D. Brunello Cucinelli — AI E-com — Awwwards Honorable Mention, Apr 13 2026
- URL: listed on awwwards.com/websites/e-commerce and /websites/fashion.
- Why it matters: the reference for *quiet luxury* light commerce — ivory/white, hairline serif, humanist product copy; AI-assisted personalization underneath a calm surface.
- **Steal this:**
  - Palette: ivory `#F7F4EE`, ink `#1C1A17`, muted stone `#8A8378` for secondary text, hairline dividers `rgba(28,26,23,.12)`.
  - Typography: serif display (titles) + clean sans (prices/CTAs) — the two-voice system that reads "premium" instantly.
  - Whitespace: section padding ≥ 48px mobile; product grid gap ≥ 16px. Air is the design.

### E. San Rita — recent SOTD (fashion, via thesource.com 2026 roundup)
- Why noted: "uses white space not as a void but as a breath" — transitions "smooth as silk."
- **Steal this:** 300–400ms ease-out transitions everywhere; no hard cuts; sticky filter bar that condenses on scroll.

### Cross-winner patterns (light e-commerce 2025–2026)
1. Base is **white or warm paper** (`#FFFFFF`, `#FAFAF8`, `#F7F4EE`) — color comes from product photos, not chrome.
2. Product photos on **seamless/transparent backgrounds**; card chrome minimal or absent.
3. **One accent color**, used sparingly (badges, primary CTA, price emphasis).
4. **Pill everything**: search, chips, CTAs, badges — `border-radius: 999px` dominates 2025–26 commerce.
5. Sticky quick-add / sticky filter bar on mobile.
6. Persian/RTL note: none of the winners are RTL, but the pill/rail patterns mirror cleanly — just flip horizontal rails and badge corners.

---

## 3. The bubble-button master recipe (chic version)

Goal: glossy like a bubble, but restrained — no candy wobble. Three layers: **base gradient (darker at bottom) + gloss dome (::before) + specular dot (::after)**.

```css
.bubble-btn {
  --btn-top: #38BDF8;   /* sky */
  --btn-mid: #0EA5E9;
  --btn-bot: #0369A1;   /* deep ocean */
  position: relative;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(180deg, var(--btn-top) 0%, var(--btn-mid) 55%, var(--btn-bot) 100%);
  box-shadow:
    inset 0 2px 3px rgba(255,255,255,.55),   /* top inner light */
    inset 0 -5px 10px rgba(1,40,80,.28),      /* bottom depth */
    0 8px 20px rgba(14,165,233,.35),          /* soft colored drop */
    0 1px 2px rgba(1,50,100,.25);
  overflow: hidden;
  transition: transform .18s ease, box-shadow .18s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}
/* gloss dome — the "bubble" read */
.bubble-btn::before {
  content: ""; position: absolute; pointer-events: none;
  top: 4%; left: 8%; right: 8%; height: 46%;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255,255,255,.80), rgba(255,255,255,0));
}
/* specular dot */
.bubble-btn::after {
  content: ""; position: absolute; pointer-events: none;
  top: 14%; left: 16%; width: 26%; height: 22%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(255,255,255,.95), rgba(255,255,255,0) 70%);
  filter: blur(1px);
  transform: rotate(-18deg);
}
.bubble-btn:hover { transform: translateY(-1px) scale(1.02); }
.bubble-btn:active {
  transform: scale(.95);
  box-shadow:
    inset 0 3px 10px rgba(1,40,80,.35),
    0 2px 6px rgba(14,165,233,.25);
}
.bubble-btn:active::before { opacity: .35; }  /* gloss "pops" on press */
/* press-point glow (Apple-style), needs --press-x/--press-y from pointerdown */
.bubble-btn .press-glow {
  position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: radial-gradient(circle at var(--press-x,50%) var(--press-y,30%),
    rgba(255,255,255,.55), transparent 55%);
  opacity: 0; transition: opacity .25s ease;
}
.bubble-btn:active .press-glow { opacity: 1; }
```

Why this works on a *light* page: the button is opaque (not transparent glass) so it never looks like a "flat pill"; the gloss dome + specular dot sell the bubble; the colored drop shadow lifts it off the paper. Keep ≤ 20 such buttons on screen (perf).

---

## 4. RECOMMENDED RECIPE — PadelPro shop, light theme, RTL, mobile-first

One cohesive spec. Everything is plain CSS/Tailwind-safe in a Capacitor WebView.

### 4.1 Palette
| Token | Hex | Use |
|---|---|---|
| `--shop-bg` | `#F2F7FB` | Page background — pale aqua mist (water theme, light) |
| `--shop-bg2` | `#FFFFFF` | Cards, sheets, search |
| `--shop-ink` | `#0E1B2C` | Titles, prices (deep navy — chic, not black) |
| `--shop-muted` | `#5B6B7F` | Secondary text |
| `--shop-line` | `rgba(14,27,44,.10)` | Hairlines, chip borders |
| `--aqua-1/2/3` | `#38BDF8` / `#0EA5E9` / `#0369A1` | Bubble-button gradient (top→bottom) |
| `--gold-1/2` | `#FFD54F` / `#F5A623` | "بهترین قیمت" badge gradient; badge text `#5C3D00` |
| `--coral` | `#F43F5E` | Discount % only (sparingly) |
| `--img-well` | `#EAF2F8` | Image placeholder well behind photos |

Background treatment: `linear-gradient(180deg, #F7FBFE 0%, #F2F7FB 40%, #EDF4FA 100%)` + two huge soft radial aqua washes (pure CSS, zero images):
```css
.shop-bg {
  background:
    radial-gradient(600px 300px at 85% -5%, rgba(56,189,248,.14), transparent 70%),
    radial-gradient(500px 260px at 8% 12%, rgba(14,165,233,.10), transparent 70%),
    linear-gradient(180deg, #F7FBFE 0%, #F2F7FB 45%, #EDF4FA 100%);
}
```

### 4.2 Product card
```css
.product-card {
  background: #FFFFFF;
  border-radius: 26px;
  border: 1px solid rgba(14,27,44,.07);
  box-shadow: 0 2px 6px rgba(14,27,44,.05), 0 14px 34px rgba(14,27,44,.08);
  overflow: hidden;
}
.product-photo {
  aspect-ratio: 1/1; width: 100%; object-fit: cover;
  background: #EAF2F8;               /* well color while loading */
  border-radius: 18px; margin: 8px; width: calc(100% - 16px); /* inset photo, award-style */
}
.product-name  { font: 700 14px/1.7 "Vazirmatn"; color: #0E1B2C; }
.product-price { font: 800 16px/1.6 "Vazirmatn"; color: #0E1B2C; font-variant-numeric: tabular-nums; }
.product-meta  { font: 400 11px/1.8 "Vazirmatn"; color: #5B6B7F; }  /* max 1 line: store • category */
```
- Grid: 2 columns, gap 12px, page padding 16px (mobile-first).
- "بهترین قیمت" badge: gold bubble pill, top-start over photo:
```css
.best-price {
  position: absolute; top: 14px; inset-inline-start: 14px;
  padding: 4px 10px; border-radius: 999px;
  font: 700 10.5px/1.8 "Vazirmatn"; color: #5C3D00;
  background: linear-gradient(180deg, #FFD54F, #F5A623);
  box-shadow: inset 0 1px 2px rgba(255,255,255,.7), 0 4px 10px rgba(245,166,35,.40);
}
```
- Discount: coral text `−۱۵٪` next to price, no badge chrome.

### 4.3 Bubble buttons (primary CTA "دیدن پیشنهادها", offer links)
Use the master recipe from §3 with the aqua tokens. Sizes:
- Card CTA: full-width, height 44px, font 13.5px/800, radius 999px.
- Offer-row link: height 38px, padding 0 18px, font 12.5px/700.
- Icon-only (search clear, sheet close): 38px circle, white bubble variant:
```css
.bubble-ghost {
  background: linear-gradient(180deg, #FFFFFF, #EDF4FA);
  color: #0E1B2C;
  box-shadow: inset 0 2px 3px rgba(255,255,255,.9), inset 0 -3px 6px rgba(14,27,44,.08),
              0 6px 14px rgba(14,27,44,.10);
  border: 1px solid rgba(14,27,44,.08);
}
/* keep the same ::before gloss dome for the bubble read */
```

### 4.4 Search + category chips
```css
.search-pill {
  display: flex; align-items: center; gap: 8px;
  background: #FFFFFF; border-radius: 999px; padding: 0 18px; height: 50px;
  border: 1px solid rgba(14,27,44,.08);
  box-shadow: inset 0 2px 6px rgba(14,27,44,.06), 0 8px 20px rgba(14,27,44,.07);
}
.search-pill input { background: transparent; border: 0; outline: 0; font: 400 14px "Vazirmatn"; color: #0E1B2C; width: 100%; }
.search-pill input::placeholder { color: #8CA0B3; }

.chip {
  flex: none; padding: 9px 18px; border-radius: 999px;
  font: 700 12.5px/1.8 "Vazirmatn"; color: #33475E;
  background: linear-gradient(180deg, #FFFFFF, #EFF5FA);
  border: 1px solid rgba(14,27,44,.10);
  box-shadow: inset 0 1px 2px rgba(255,255,255,.8), 0 3px 8px rgba(14,27,44,.06);
}
.chip.active {
  color: #fff; border: 0;
  background: linear-gradient(180deg, #38BDF8, #0EA5E9 55%, #0369A1);
  box-shadow: inset 0 2px 3px rgba(255,255,255,.5), inset 0 -3px 6px rgba(1,40,80,.25),
              0 6px 14px rgba(14,165,233,.35);
}
/* active chip also gets the gloss dome ::before from the bubble recipe */
```
Chips row: horizontal snap scroll (`scroll-snap-type: x mandatory`), padding-inline 16px, gap 8px. Sticky under the header on scroll (condenses: reduce search height 50→44px).

### 4.5 Typography
- Family: **Vazirmatn** throughout (already the app's Persian font).
- Shop title: 800, 20px, `#0E1B2C`, letter-spacing 0 (Persian needs no tracking).
- Card name 14px/700 · price 16px/800 tabular-nums · meta 11px/400 `#5B6B7F`.
- Section labels ("دسته‌بندی", "پیشنهادها"): 13px/800 with 4px aqua underline tick (a small `::after` bar, 24×4px, radius 999px, gradient aqua) — the one chic detail.
- CTA text 13.5px/800 white with `text-shadow: 0 1px 2px rgba(1,40,80,.35)` for legibility on gloss.

### 4.6 Micro-interactions worth copying
1. **Press-point glow** on all bubble buttons (§3) — the single most "water/bubble" feeling interaction, cheap (one radial-gradient layer).
2. **Slow shine sweep** on the primary CTA every ~3s (§1c) — premium shimmer, pause on touch.
3. **Photo crossfade**: card photo `transition: opacity .35s ease, transform .35s ease`; on press, `transform: scale(.97)`.
4. **Bottom sheet** for offers: spring-up `cubic-bezier(.2,.9,.25,1.05)` 320ms; backdrop `rgba(14,27,44,.35)` + `backdrop-filter: blur(6px)`.
5. Keep existing underwater bubbles — retint them for light bg: `border: rgba(14,165,233,.28)`, smaller opacity (.5), they read as rising air bubbles on aqua mist.
6. `prefers-reduced-motion`: disable wobble/shine/bubble-rise.

### 4.7 What NOT to do (stay chic, not childish)
- No wobble animation on buttons (jelly wobble = candy; we keep squish only).
- Max **two** gradients on screen family: aqua (CTAs) + gold (best-price). Everything else flat.
- No emoji in UI chrome; badges are text pills.
- One accent per card (per the app's standing design bar): either best-price badge OR discount text, not both shouting.

---

## 5. Product photos that feel instant (answer to "how to show images fast")

The shop currently has no product photos (text-only cards). When photos are added, this stack keeps it feeling instant on Iranian mobile networks. All implementable in the Capacitor WebView (plain `<img>` + CSS + a tiny JS helper):

1. **Right-size everything.** Card thumbnails at **400px wide** (2× for 200px CSS), quality ~70. A 400px WebP product shot is typically **25–45KB** vs 300KB+ full-res. Never ship the merchant's original into a card.
2. **Modern formats.** Serve **WebP** (25–35% smaller than JPEG); AVIF (40–60% smaller) where the WebView supports it, with JPEG fallback via `<picture>`.
3. **`loading="lazy"` + `decoding="async"`** on every below-fold card image; first-screen images `fetchpriority="high"`, no lazy. This alone cuts initial image weight ~60–70%.
4. **Blur-up (LQIP).** Inline a ~20px-wide base64 thumbnail (<1KB) as the `<img>`'s initial `src` with `filter: blur(20px); transform: scale(1.05)`; swap to the real URL on load with a 300–500ms opacity crossfade. User sees *something* in the first paint — perceived load drops ~40% in published case studies.
5. **Reserve space — no layout jump.** `aspect-ratio: 1/1` on `.product-photo` + the `#EAF2F8` well color, so cards never shift when photos arrive (kills CLS).
6. **Skeleton shimmer while loading** (matches the light theme):
```css
.img-loading { position: relative; overflow: hidden; background: #EAF2F8; }
.img-loading::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.75) 50%, transparent 70%);
  animation: skimmer 1.4s infinite;
}
@keyframes skimmer { from { transform: translateX(100%);} to { transform: translateX(-100%);} }
/* RTL: flip direction */
```
7. **CDN with URL resizing** (Cloudinary / ImageKit / imgix style: `w_400,f_webp,q_auto`) — one master upload, every size/format derived at the edge; `Cache-Control: public, max-age=31536000, immutable` for repeat visits.
8. **Don't hotlink merchant images.** Torob/Divar/IG URLs break and are slow. Pipeline: download once at research time → compress → host on our own (repo `public/shop/` for the bundled set, or the image CDN). This also fixes the "images not loading in Iran" risk.
9. **Preconnect** to the image host: `<link rel="preconnect" href="https://img-host">` saves ~100–300ms TLS on first image.

Order of implementation (biggest win first): right-size + WebP (1,2,7) → lazy (3) → blur-up + reserved space (4,5) → skeleton (6).

---

## 6. Sources
- Awwwards e-commerce winners list: http://www.awwwards.com:8080/websites/e-commerce/ (Odd Ritual SOTD Apr 11 2026; SŌM SOTD Apr 4 2026; Outfit E-commerce Honors Apr 2026; Brunello Cucinelli AI E-com HM Apr 13 2026)
- Odd Ritual live/Webflow: https://webflow.com/made-in-webflow/website/Odd-Ritual (by Geoff Dawes; Webflow + Shopify + GSAP)
- thesource.com 2026 award-winners roundup: https://thesource.com/2026/04/03/best-website-designs-2026/
- Apple-style Liquid Glass cheatsheets: https://github.com/tsdsj/apple-style/blob/HEAD/skills/Apple-Style/cheatsheets/materials-and-liquid-glass.md and https://github.com/tsdsj/apple-style/blob/HEAD/skills/Apple-Style-Liquid-Glass/SKILL.md
- Jelly UI bubble-button recipe: https://github.com/mmrahmanbappi/100-css-designs/blob/HEAD/01-soft-tactile-ui/009-jelly-ui/README.md (demo: https://mmrahmanbappi.github.io/100-css-designs/01-soft-tactile-ui/009-jelly-ui/demo.html)
- Liquid Glass pure-CSS technique: https://dev.to/kevinbism/recreating-apples-liquid-glass-effect-with-pure-css-3gpl
- Glass button shine sweep: https://dev.to/sourav_pan_f2abeb51def1e4/add-shiny-button-using-pure-css-and-html-5665
- LQIP/blur-up practice: https://medium.com/@dkmistry0203/lqip-explained-how-low-quality-image-placeholders-improve-website-performance-and-seo-4314ce422656
- Product-image LCP playbook: https://dev.to/ouch_cartsajal_6950caea8f/product-images-are-killing-your-lcp-heres-how-to-serve-them-properly-pi1
- Next.js image optimization guide 2026 (CDN/cache headers): https://sharedtutor.com/2026/09/24/improve-image-performance-nextjs-optimization-guide-web/
