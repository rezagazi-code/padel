# Padel Shop Research — 2026-10-14 (22 مهر ۱۴۰۵)

Goal: 1–2 NEW Iranian online shops with PUBLIC real padel prices (not DM-only).
Already covered (see shop-research-2026-10-12.md / -10-13.md): Torob, Divar,
tennisfa.com, tennisshop.ir, shop.alo-varzesh.com, Emalls, Digikala, padeliran.ir,
sportstations.ir, iranjsport.com, hivapadel.com, tennis24shop.com, seendaalshop.ir,
tagmond.com, bapateam.ir, racketstore.ir, zitazi.com, tennisban.ir, hivajet.com,
padelone.ir, paymansport.com. Watch list: mizanpadel.ir (uniform pricing).

## ✅ RECOMMENDED (add to live cheapest-price search)

### 1. سان اسپرت ایران (Sun Sport Iran) — sunsportiran.com
- **URL:** https://sunsportiran.com
- **Padel categories (all curl-verified, server-rendered):**
  - https://sunsportiran.com/category/sports-equipment/racket-padel/ (26 products)
  - https://sunsportiran.com/category/sports-equipment/padel-shoes/ (17 products — «کفش پدل NOX»)
  - https://sunsportiran.com/category/sports-equipment/padel-bag/ (کیف پدل)
  - https://sunsportiran.com/category/sports-equipment/padel-accessories/ (اکسسوری پدل)
- **City:** تهران — برند سنتر/باشگاه انقلاب/پدل هیلز (physical branches; Tehran
  addresses). Email: sales@sunsportiran.com, phone: +989018018733.
- **Identity:** Iranian padel-specialty retailer (Instagram @sunsportiran,
  26.7K followers, bio: «فروشگاه تخصصی لوازم پدل 🎾»). Also covers pickleball,
  water sports, snow sports — but padel is a core, dedicated category block.
- **Padel inventory:** YES — real, named models with prices:
  - راکت پدل نوکس AT10 GENIUS JR 2026 — 79,000,000 تومان
  - راکت پدل آکس داگ ULTIMATE WOMAN AIR 2027 — 69,000,000 تومان
  - راکت پدل نوکس X-ONE SILHOUETTE 2026 — 28,000,000 تومان
  - راکت پدل نوکس AT10 GENIUS ULTRALIGHT 2026 — 64,000,000 تومان
  - راکت پدل نوکس NEXTGEN PRO ATTACK 12K 2026 — 64,000,000 تومان
  - راکت پدل نوکس EQUATION HARD 2026 — 50,000,000 تومان
  - راکت پدل نوکس AT10 PRO CUP SOFT 2026 — 78,000,000 تومان
  - راکت پدل آکس داگ ULTIMATE COURT 2026 — 89,000,000 تومان
  - کفش پدل نوکس AT10 PRO WHITE/GREY — 45,000,000 تومان
  - کفش پدل نوکس ML10 HEXA WHITE/GUM — 40,000,000 تومان
  - کفش پدل نوکس ML10 HEXA BLACK/WHITE — 45,000,000 تومان
  (11 verified samples; category pages show ~26 rackets + ~17 shoes total.)
- **Price visibility:** PUBLIC — every card shows Toman price, no login.
  Currency symbol verified: `woocommerce-Price-currencySymbol` = تومان
  (prices in Toman directly, no ÷10). Prices vary per model (no placeholder
  pattern like mizanpadel.ir).
- **Scrapability:** FULL via curl — HTTPS 200 (~350KB), server-rendered
  WooCommerce HTML, no JS needed. Product title: `h3.product-name > a[title]`;
  price: `span.price > span.woocommerce-Price-amount > bdi`. No pagination
  seen on these category pages (single-page lists).
- **Integration cost:** LOW — same WooCommerce pattern family as bapateam.ir /
  iranjsport.com / paymansport.com (already integrated); prices already Toman.
- **Confidence:** HIGH — live curl-verified categories, per-model prices,
  established Iranian retailer with Tehran branches + 26K-follower Instagram.
- **Note:** WooCommerce site-search `?s=پدل` timed out from this environment;
  use the direct category URLs above instead.

## ⚠️ WATCH LIST (recheck next cycle, not recommended yet)

### میزان پدل (Mizan Padel) — mizanpadel.ir
- Rechecked 2026-10-14: rackets category still shows the SAME uniform pricing
  — every racket 66,000,000 تومان (with 62,000,000 «قیمت فعلی» discount tag)
  regardless of model (Siux Fenix Pro 5 2026, Babolat Counter Viper 2.5,
  Adidas Metalbone Carbon 2026, Nox AT10 shoes etc.). Still smells like
  template/placeholder pricing. NOT recommended until per-model realistic
  prices appear. City آبادان, phone 09364052006.

## ❌ Checked but REJECTED this cycle
- **matinsportshop.com** (@matinsport — official Bullpadel/Adidas Padel/Joma
  importer) — re-probed 10-14: still 000 from this environment. Fourth
  consecutive rejection; stays out until reachable with public prices.
- **tennissport.ir** (Torob seller «تنیس اسپورت») — live (200, ~530KB) but
  ZERO «پدل» mentions on homepage; categories are tennis-only
  (راکت تنیس، ساک تنیس…). Torob listings «در تنیس اسپورت» are tennis strings.
- **racketrun.ir → racketrun.com** (Torob seller «راکت ران») — 301 to
  racketrun.com, which times out (000) from this environment repeatedly.
- **allinz.ir** — live but a general import-forwarder shop
  (Amazon/eBay/امارات); zero padel mentions.
- **kz23sport.ir** («کی زد 23 اسپرت») — live (200, ~680KB), zero padel mentions.
- **secondserve.shop** — HTTP 200 but 114-byte placeholder page.
- **daani.shop / www.daani.shop** — dead (000). Instagram @daani.shop bio is
  «سفارش از طریق دایرکت و واتساپ» (Karaj, 688 followers) → DM-only, rejected.
- **@nikravesh_tennis_hub** — tennis academy (Kerman), no website, phone-only.
- **@sunsportiran → accepted** (see above; its website is the recommendation).
- **racketshop.ir, teampadel.shop, sunsportiran.ir, daani.shop** — dead (000).
- **allforpadel.ir / jomasportiran.com / jomasportiran.ir / jolasport.ir /
  signumsport.ir / tritonsport.ir / bullpadeliran.ir / adidaspadel.ir** —
  all dead (000). Official-brand-rep shops still have no live independent
  priced sites.
- **sportsaeed.ir, saeedsport.ir, persiantennis.ir, lozishop.ir,
  tennispardis.ir, racket-sports.ir, padeltennis.ir, babolatshop.ir,
  persiantennisshop.ir, varzesherakety.ir** — all dead (000).
- **Query re-surfaces:** tennis24shop.com, paymansport.com, iranjsport.com,
  sportstations.ir (all covered); Torob ball/bag list crawls surfaced no new
  sellers with independent priced sites («پدل باز» = Torob-only, «ویلسون»
  seller = dead wilson.ir, «رنسو شاپ» = under construction).

## Notes
- This pass: ~10 web queries (fa/en) + ~45 curl domain probes + 1 social.search
  + Instagram CLI profile checks (@nikravesh_tennis_hub, @sunsportiran,
  @daani.shop, @matinsport).
- Only ONE fully-qualified new shop this cycle: sunsportiran.com. The
  new-shop pool continues to thin out as expected — six passes on 10-13
  already harvested most reachable WooCommerce tennis/padel shops.
- torob.com remains blocked from this environment (curl exit 52 / timeout);
  seller names continue to be harvested from Torob's Google crawl instead.
- @matinsport's IG bio revealed the official-rep chain
  (@allforpadel.iran = Adidas Padel ایران, @jomasportiran = Joma) — both
  have no live priced independent sites (domains dead).
