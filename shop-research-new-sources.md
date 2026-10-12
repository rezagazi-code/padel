# New Iranian Padel Shop Sources — Research (2026-10-12)

Goal: more Iranian online shops with PUBLIC, REAL padel prices for the live cheapest-price search.
Already covered: Torob (aggregator) + tennisfa.com (WooCommerce).

## ✅ RECOMMENDED (add to live search)

### 1. تنیس شاپ — tennisshop.ir (Tehran)
- **URL:** https://tennisshop.ir
- **Search pattern:** `https://tennisshop.ir/?s=<query>&post_type=product` (works with Persian + Latin)
- **Platform:** WooCommerce + Woodmart theme (same structure as tennisfa.com)
- **Scrapable:** YES — verified via curl, server-rendered HTML
- **HTML structure:**
  - Title: `<h3 class="wd-entities-title"><a href="<product-url>">TITLE</a></h3>`
  - Price: `<span class="woocommerce-Price-amount amount"><bdi>71,500,000<span class="woocommerce-Price-currencySymbol">تومان</span></bdi></span>`
  - Product links: `https://tennisshop.ir/shop/...`
- **Prices:** PUBLIC, in **Toman directly** (no ÷10 needed — unlike tennisfa)
- **Sample padel rackets (verified 2026-10-12):**
  - Head Coello Team 2026 — 71,500,000 T
  - Adidas Metalbone Team 2026 — 55,000,000 T
  - Adidas Cross It Carbon 2026 — 83,000,000 T
  - Bullpadel Flow 2027 — 89,000,000 T
- **Stock status:** check product page for «ناموجود» (some items out of stock per Google cache)
- **Parser:** identical to tennisfa parser (same Woodmart selectors), price used as-is (no conversion)

### 2. الو ورزش — shop.alo-varzesh.com (Tehran)
- **URL:** https://shop.alo-varzesh.com
- **Search pattern:** `https://shop.alo-varzesh.com/?s=<query>&post_type=product`
- **Platform:** WooCommerce (custom theme)
- **Scrapable:** PARTIAL — search page gives product URLs; prices need product-page fetch
- **Caveat:** search results show «0 تومان» for variable products; real prices are on product pages:
  - Price: `<span class="woocommerce-Price-amount amount">...<bdi>58,500,000<span>تومان</span></bdi>`
  - Example: Head Speed Motion 2025 — 58,500,000 / 73,400,000 T (variants)
- **Sample padel rackets:** Bullpadel Indiga Control 2022, Head Speed Motion 2025, Toyo beginner, Head Speed Junior
- **Also sells:** padel shoes (Asics), bags, balls
- **Integration cost:** MEDIUM — requires 1 search + N product-page fetches (top 3)
- **Recommendation:** add as tier-2 source (fetch product pages for top 3 hits)

## ❌ NOT SUITABLE (with reasons)

### Digikala (digikala.com)
- **Has padel rackets:** yes (sells Kuikma etc.)
- **Problem:** bot-blocked. `api.digikala.com/v1/search/` returns HTTP 307 redirect loop to itself (DigiCDN bot check). Website is Next.js PWA shell (~15KB, no server-rendered products).
- **Verdict:** NOT scrapable via simple HTTP. Would need headless browser or official API partnership.

### Emalls (emalls.ir)
- **What:** price comparison aggregator (like Torob)
- **Problem:** legacy ASP.NET WebForms site; no discoverable GET search URL pattern (tried /search, /Search, /list, /Search.aspx — all 404). Search likely works via POST postback.
- **Verdict:** NOT practically scrapable. Marginal value anyway (Torob covers same shops).

### padeliran.ir (پدل ایران)
- **What:** dedicated padel shop + court booking (Tehran)
- **Problem:** JS PWA shell (~23KB), no server-rendered products or prices in HTML.
- **Verdict:** NOT scrapable via simple HTTP.

### sportstations.ir (اسپرت استیشن، اصفهان)
- **Problem:** no padel category found (404 on /product-category/padel/); padel search returned 0 prices.
- **Verdict:** no padel inventory found online.

### matinsport (Instagram @matinsport)
- **Problem:** prices NOT public — site says «قیمت‌ها به‌روز نیست» and directs to WhatsApp 09120345613.
- **Verdict:** inquiry-only, not suitable for live search (already in catalog as استعلام).

### Instagram shops (@tennisfa_shop, @echs.store)
- **Problem:** prices via DM only, no public website with prices.
- **Verdict:** NOT suitable for automated live search. Keep in curated catalog with «قیمت در دایرکت».

## Notes
- Iranian padel e-commerce is heavily Tehran-centric; Torob already provides the geographic breadth («هر جای ایران») via its seller network.
- Price units vary by shop: tennisfa.com stores Rial (÷10 → Toman); tennisshop.ir and alo-varzesh display Toman directly. Always verify with a known product before adding a source.
- tennisshop.ir uses the exact same Woodmart theme as tennisfa.com — the existing parser can be reused with only the domain and price-conversion changed.
