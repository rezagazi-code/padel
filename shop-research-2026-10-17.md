# Padel Shop Research — 2026-10-17 (25 مهر ۱۴۰۵)

Goal: 2–3 NEW Iranian online shops with PUBLIC real padel prices (not DM-only).
Already covered (through 10-16, nine passes): Torob, Divar, tennisfa.com,
tennisshop.ir, shop.alo-varzesh.com, Emalls, Digikala, padeliran.ir,
sportstations.ir, iranjsport.com, hivapadel.com, tennis24shop.com,
seendaalshop.ir, tagmond.com, bapateam.ir, racketstore.ir, zitazi.com,
tennisban.ir, hivajet.com, padelone.ir, paymansport.com, sportsaeed.com,
onesport.ir, sunsportiran.com, decathlonsport.ir, alirezashop.org, tenador.com,
matinsportshop.com, shopino.app, padelshop.ir (→ tennisshop.ir redirect).
Watch list: mizanpadel.ir (uniform pricing), padel.ir (empty shop),
iranoriginal.com (one T-shirt only), winnersport.ir (suspended).
Dead domains: padelmarket.ir, padelstore.ir, padelclub.ir, padelcenter.ir.

### ✅ RECOMMENDED: 1 new shop — راکت‌ ران (Racket Run)

#### 1. راکت‌ ران (Racket Run) — racketrun.com
- **URL:** https://racketrun.com
- **Padel categories (curl-verified, server-rendered, all HTTP 200):**
  - https://racketrun.com/product-category/padel-rackets
  - https://racketrun.com/product-category/padel-balls
  - https://racketrun.com/product-category/padel-accessories (empty)
  - https://racketrun.com/product-category/padel-shoes-men / -women (both empty)
- **City:** تهران — خیابان جردن (نلسون ماندلا)، خیابان دستگردی به سمت
  ولی‌عصر، پلاک ۲۷۷، طبقه ۵، واحد ۹ (footer-verified).
- **Identity:** «فروشگاه اینترنتی راکت ران» — Iranian racket-sports shop
  (tennis/padel). CORRECTION: pass 2 (10-14) rejected «راکت ران» as a
  Torob-only seller with no reachable standalone site (racketrun.com
  timed out 000 then). The site is live NOW (HTTP 200, ~300KB homepage
  via curl) with its own priced padel storefront — same pattern as the
  alirezashop.org correction. Almost certainly the same seller, now
  with a working storefront.
- **Padel inventory:** YES — real named models:
  - 9 padel rackets (Wilson): Blade LS V3 Green, Bela Team V2 Red/Black,
    Fierce Team Black/Blue, Burn Team Black/Yellow (all in stock) +
    Pro Staff V2, Fierce Elite, Burn Elite, Bela Pro V2, Bela Elite V2
    («ناموجود» — out of stock, no price shown).
  - 2 padel ball tubes: Dunlop Team Padel 3-Ball Tube, Dunlop Pro Padel
    3-Ball Tube.
- **Price visibility:** PUBLIC — per-model Toman prices on cards, no login:
  - Wilson Blade LS V3 Green — ۴۸٬۵۰۰٬۰۰۰ تومان
  - Wilson Bela Team V2 Red/Black — ۴۸٬۵۰۰٬۰۰۰ تومان
  - Wilson Fierce Team Black/Blue — ۴۲٬۵۰۰٬۰۰۰ تومان
  - Wilson Burn Team Black/Yellow — ۴۲٬۵۰۰٬۰۰۰ تومان
  - Dunlop Team Padel 3-Ball Tube — ۲٬۲۰۰٬۰۰۰ تومان
  - Dunlop Pro Padel 3-Ball Tube — ۲٬۵۰۰٬۰۰۰ تومان
  Prices are series-grouped (Team tier 42.5M, upper tier 48.5M) — plausible
  series pricing, not the mizanpadel.ir all-identical template pattern.
- **Scrapability:** FULL via curl — HTTPS 200, Nuxt but server-rendered
  HTML: product names in `<h3 dir="auto">`, prices as Persian-digit
  «تومان» strings in card markup. No JS needed.
- **Integration cost:** LOW — simple h3 + price-string extraction.
- **Confidence:** HIGH.

### ⚠️ WATCH LIST recheck (curl-verified this pass)

- **winnersport.ir** — STILL suspended: HTTPS 200 but final URL is
  /cgi-sys/suspendedpage.cgi. No prices verifiable.
- **padel.ir/shop.php** — HTTP 200 (27KB), still «محصولی یافت نشد»
  (empty shop).
- **mizanpadel.ir/product-category/rackets/** — HTTP 200 (253KB),
  content-extracted: STILL uniform 66.000.000 (20 identical hits,
  «قیمت اصلی 66.000.000 تومان بود» del/ins template) for every racket.
  Stays OFF the recommended list. آبادان, 09364052006.
- **iranoriginal.com** — not re-probed (verified 10-14/10-16: one own-brand
  padel T-shirt only, no gear). Watch status unchanged.

### ❌ Checked but REJECTED this pass

- **albasport.ir** (آلبا اسپرت, Iranian price-list site) — surfaced via
  Google crawl with «راکت پدل ام اچ کی بی دی مدل Defend-x3» (28M → 14.665M).
  Live via curl (HTTP 200, tennis-rackets list «لیست قیمت راکت‌های تنیس،
  مهر 1405»). But: it is an AFFILIATE/price-list blog, not a shop — the
  padel card is a single generic model linking out to Digikala (already
  covered) via affilio redirect. One incidental padel card ≠ padel-gear
  storefront. Rejected.
- **teymourisport.com** (تیموری اسپرت) — surfaced via fresh fa query,
  Iranian general sports shop, but HTTP 000 (unreachable) from this
  environment. Unverifiable padel inventory → rejected.
- **aradel.ir** (آرادل) — surfaced via provincial fa query; HTTP 000 from
  this environment, and Google crawl shows no padel inventory. Rejected.
- **shopino.app** — re-surfaced; already probed earlier (generic shoes
  only, no padel section). Not a padel shop.
- **Fresh fa queries** («پدل شاپ» فروشگاه آنلاین; خرید راکت پدل سیوکس/Oxdog;
  فروشگاه لوازم پدل اهواز/کرمان/یزد/رشت; خرید اینترنتی راکت پدل ناکس
  X-ONE; «راکت پدل» torob.com فروشگاه; خرید توپ پدل دانلوپ/هد) —
  re-surfaced only: already-covered Iranian shops (tennisfa.com, tennisshop.ir,
  sportstations.ir, Emalls/Torob crawls with marketplace-only sellers),
  padel-BOARD (SUP) content (irancamping.com), and foreign shops
  (padelshop.com NL, esprit-padel-shop.com FR, tradeinn PT, tokopedia ID,
  newsmashsport ID, tennisnuts UK, noobpadel ID, padelsouq, racketcentral,
  meritspor TR, 123select).

### Notes
- This pass: 8 web queries (fa) + ~15 curl probes + 3 watch-list content
  re-inspections + 5 full page scrapes (racketrun home, padel-rackets,
  padel-balls, padel-accessories, padel-shoes men/women).
- ONE new fully-qualified shop: racketrun.com (Tehran, Wilson rackets +
  Dunlop balls, public per-model Toman prices, curl-scrapable). Found via
  the Torob-seller-name angle + direct reachability recheck (site was
  down 10-14, now live).
- Pool assessment: still essentially exhausted — the only new lead came
  from a previously-rejected site coming back online. Next passes should
  re-check rejected-but-once-live sites rather than re-probing dead
  domains: iliyar.com (418 earlier), matinsportshop.com (000 ×5), and the
  watch list (winnersport revival, padel.ir product fill, mizanpadel
  per-model pricing).
- torob.com remains blocked from this environment (curl); seller names
  continue to come from Google's Torob crawl.
