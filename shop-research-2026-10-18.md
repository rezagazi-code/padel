# Padel Shop Research — 2026-10-18 (26 مهر ۱۴۰۵)

Goal: 2–3 NEW Iranian online shops with PUBLIC real padel prices (not DM-only).
Already covered (through 10-17, nine passes): Torob, Divar, tennisfa.com,
tennisshop.ir, shop.alo-varzesh.com, Emalls, Digikala, padeliran.ir,
sportstations.ir, iranjsport.com, hivapadel.com, tennis24shop.com,
seendaalshop.ir, tagmond.com, bapateam.ir, racketstore.ir, zitazi.com,
tennisban.ir, hivajet.com, padelone.ir, paymansport.com, sportsaeed.com,
onesport.ir, sunsportiran.com, decathlonsport.ir, alirezashop.org, tenador.com,
matinsportshop.com, shopino.app, padelshop.ir (→ tennisshop.ir redirect),
racketrun.com (recommended 10-17).
Watch list: mizanpadel.ir (uniform pricing), padel.ir (empty shop),
iranoriginal.com (one own-brand T-shirt only), winnersport.ir (suspended).
Dead domains: padelmarket.ir, padelstore.ir, padelclub.ir, padelcenter.ir.

### ✅ RECOMMENDED this pass: NONE

The pool remains exhausted. All fresh queries (10 fa web searches across
brand-specific, city-specific, and category-specific angles) re-surfaced
only already-covered shops (tennisshop.ir, tennisfa.com, racketrun.com,
albasport.ir) or irrelevant/foreign content. Curl-verified new live sites
below were all rejected. No shop met the bar of: REAL padel inventory +
public per-model Toman prices + standalone storefront.

### ⚠️ WATCH LIST recheck (all curl-verified this pass, status UNCHANGED)

- **winnersport.ir** — STILL suspended: HTTPS 200 → /cgi-sys/suspendedpage.cgi.
- **padel.ir/shop.php** — HTTP 200 (27KB), still «محصولی یافت نشد» (empty).
- **mizanpadel.ir/product-category/rackets/** — HTTP 200 (255KB), STILL
  uniform 66.000.000 (20 identical del/ins template hits). No per-model pricing.
- **iranoriginal.com** — live (HTTP 200). Padel search still returns only
  their own-brand «تیشرت پدل برند ایران اورجینال» (6 color variants of the
  same item). No gear. Stays on watch.
- **iliyar.com** — still HTTP 418 bot-block from this environment.
- **matinsportshop.com** — still HTTP 000 (unreachable, both http/https).

### ❌ Checked but REJECTED this pass

- **teymourisport.com** (تیموری اسپرت, کرج) — NEWLY LIVE today (was 000 on
  10-17; now HTTPS 200, 312KB). Iranian general sports shop («لوازم و
  پوشاک ورزشی», 20y physical + 4y online, WooCommerce). Padel search
  `?s=پدل&post_type=product` returns «محصولی یافت نشد»
  (woocommerce-no-products-found). Zero padel inventory → rejected.
- **aradel.ir** (آرادل) — newly reachable (HTTPS 200, 547KB), but is a
  kitchen/home-goods shop («مرکز پخش عمده و تک ملزومات خانه و آشپزخانه —
  آرکوپال، چینی و بلور»). Not a sports shop → rejected.
- **lozi.shop** (فروشگاه لوازم ورزشی لوزی🔶, Tehran) — live (HTTPS 200,
  946KB), surfaced via Google crawl. Ping-pong-focused sports shop; homepage
  has 0 «پدل» hits and its `?s=` search URL renders the homepage without
  processing the query. No padel inventory → rejected.
- **basalam.com** (باسلام marketplace) — padel search redirects to /s?q=…,
  HTTP 200 but 14KB JS shell, 0 padel hits in HTML. Not curl-scrapable;
  guilds are marketplace sellers (same tier as Torob, already covered) →
  rejected as new-shop source.
- **Foreign/noise from fresh queries** — padelshop.com (NL), esprit-padel-shop
  (FR), tokopedia (ID), padelproshop, raqueta.tajer.es, n11.com (TR), SUP/paddle-
  board content (irancamping.com), bicycle pedals (dochakhooneh, rayabike —
  «پدال» not «پدل»), tennis-tea affiliate pages. None are Iranian padel-gear
  shops.

### Notes
- This pass: 10 fa web queries + ~12 curl probes (incl. 6 watch-list
  rechecks) + 4 full page scrapes (teymourisport home/search, aradel home,
  lozi home/search).
- Zero new qualifying shops. The viable pool of Iranian padel-gear shops with
  public prices + own storefront appears fully mapped: the only new
  recommendation in the last three passes was a previously-down site coming
  back online (racketrun.com on 10-17).
- Next passes: keep re-checking watch-list/watch-rejected sites for status
  flips rather than expecting new domains: winnersport revival, padel.ir
  product fill, mizanpadel per-model pricing, matinsportshop.com reachability,
  teymourisport.com padel stock (they're a real sports shop — if they add
  padel, they qualify immediately), and the Torob-seller-name angle that
  produced racketrun.com.
