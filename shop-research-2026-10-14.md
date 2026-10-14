# Padel Shop Research — 2026-10-14 (22 مهر ۱۴۰۵)

## PASS 2 — second store-researcher run (07:15–08:00 +0330)

### ✅ NEW QUALIFIED SHOPS (recommended for live cheapest-price search)

#### 1. اسپرت سعید (Sport Saeed) — sportsaeed.com
- **URL:** https://sportsaeed.com — NOTE: the dead domains rejected earlier were
  **sportsaeed.ir** / **saeedsport.ir** (000); this **.com** is live and
  indexed (Google crawl ~77 days ago, homepage 200 / ~516KB today).
- **Padel categories (curl-verified, Woodmart WooCommerce):**
  - راکت پدل: https://sportsaeed.com/product-category/فروشگاه/پدل-paddle/راکت-پدل-paddle-racket/
  - توپ پدل: …/توپ-پدل-paddle-ball/ · کفش پدل: …/کفش-پدل-paddle-shoes/
  - ساک و کوله پدل: …/ساک-و-کوله-پدل-paddle-bag-backpack/
  - پوشاک پدل: …/پوشاک-پدل-paddle-clothing/ · لوازم جانبی: …/لوازم-جانبی-پدل-اکسسوری-پدل-paddle-accessories/
  (slug guesses 404 — use the exact URLs above; category base is
  /product-category/فروشگاه/پدل-paddle/.)
- **City:** تهران — بالاتر از میدان منیریه (branch 1) + سعادت‌آباد، بلوار
  فرحزادی (branch 2). Phone: 09125283258.
- **Identity:** Iranian racket-sports specialty retailer (تنیس/بدمینتون/
  اسکواش/پدل/پیکل‌بال/پینگ‌پونگ). Padel is a first-class category block with
  its own buyer's guide article (راهنمای خرید راکت پدل).
- **Padel inventory:** YES — 12 named padel rackets, real models with
  per-model prices (page 1 of category, server-rendered):
  - راکت پدل هد Vibe 2026 — 34,000,000 تومان
  - راکت پدل هد Extreme Motion 2025 — 71,000,000 تومان
  - راکت پدل هد Evo Speed 2025 — 32,000,000 تومان
  - راکت پدل هد Bolt 2026 — 34,000,000 تومان
  - راکت پدل هد Radical Pro 2026 — 77,892,519 تومان (specific non-round → real)
  - راکت پدل هد Coello Vibe 2025 — 47,000,000 تومان
  - راکت پدل نوکس ML10 Bahia 12K 2024 — 73,000,000 تومان
  - راکت پدل نوکس Pala ML10 Bahia 12K Luxury Series — 73,000,000 تومان
  - راکت پدل تویو Yellow Tyro — 18,600,000 تومان
  - راکت پدل بول‌پدل Vertex 04 Master Final 2023 — 73,000,000 تومان
  - راکت پدل بول‌پدل Hack 04 2025 — 73,000,000 تومان
  - راکت پدل هد Speed Junior 2025 — 36,500,000 تومان
- **Price visibility:** PUBLIC — Toman prices on every card (og
  product:price:amount=340000000 IRR → ۳۴,۰۰۰,۰۰۰ تومان; i.e. prices are
  Toman, not Rial÷10). A few «۰ تومان» entries = call-for-price/away.
- **Scrapability:** FULL via curl — HTTPS 200, server-rendered Woodmart
  WooCommerce, no JS needed. Title: `a[href^=/product/]` in product loop;
  price: `span.woocommerce-Price-amount` (Persian digits).
- **Integration cost:** LOW — same WooCommerce pattern as other shops.
- **Caveat:** 4 rackets sit at exactly 73,000,000 (Hack 04, Vertex 04, 2× Nox
  ML10 Bahia) — mildly uniform, but the rest vary 18.6M–77.9M with one
  hyper-specific 77,892,519 → genuine per-model pricing overall.
- **Confidence:** HIGH.

#### 2. وان اسپرت (One Sport) — onesport.ir
- **URL:** https://onesport.ir — surfaced via Emalls padel-racket list
  (Bullpadel Hack 04 2025 seller).
- **Padel category (curl-verified):**
  https://onesport.ir/product-category/paddle/ — title «قیمت و خرید راکت پدل
  اورجینال (هد، نوکس، بول پدل) | وان اسپرت».
- **City:** تهران، منیریه (heart of Tehran sports shops). Email:
  info@onesport.ir, phone: 021-66952044. Online sports shop since 1397
  (mopon listing: اسکیت، کفش ورزشی، انواع راکت…).
- **Padel inventory:** YES — 16 padel rackets (Bullpadel, HEAD, Tuyo):
  Hack 04 2025, Vertex 04 Master Final 2023, XPLO TF 2024, Vertex 04 TF 2024,
  Tuyo Yellow Tyro, Tuyo Cosmic Blue, HEAD Coello Vibe 2025/2026, Evo Extreme
  2025, One Ultralight 2025, Radical Motion/Pro/Team 2026, Speed One X,
  Speed Junior 2025.
- **Price visibility:** PUBLIC — per-model Toman prices (sample card prices:
  73,000,000 · 73,000,000 · 75,000,000 · 21,800,000 · 47,200,000 ·
  49,500,000 تومان).
- **Scrapability:** FULL via curl — HTTPS 200 (~569KB category page),
  server-rendered WooCommerce, no JS needed.
- **Caveat:** inventory overlaps heavily with sportsaeed.com (same models) —
  likely a shared wholesaler; still an independent storefront with its own
  prices.
- **Integration cost:** LOW — WooCommerce pattern.
- **Confidence:** HIGH.

### ⚠️ WATCH LIST (unchanged)
- **mizanpadel.ir** — rechecked this pass: rackets category still shows the
  same uniform 66,000,000/62,000,000 pricing (verified via loop-grid price
  extraction, 27 price amounts). Placeholder pattern persists → stays out.
  آبادان, 09364052006.

### ❌ Checked but REJECTED this pass
- **padelshop.ir** (live 200!) — NOT a new shop: it renders tennisshop.ir's
  «خرید لوازم پدل» category/feed (title context = خوراک فروشگاه تنیس شاپ).
  Already covered via tennisshop.ir.
- **astsportshop.com** — sneaker shop (تهران), Google-indexed single «کتونی
  پدل و تنیس» listing; on-site search for «پدل» returns 0 products. Not a
  padel-gear shop.
- **«ورزشی علیرضا شاپ»** — Torob-only seller (Nox X-One listings); no
  standalone website found → marketplace-only, rejected per rule.
- **«ایران جوما»** = iranjsport.com — already covered.
- **padelstore.ir, tehranpadel.ir, padelmarket.ir, padelhouse.ir,
  padelcenter.ir, noxiran.ir, padeliran.com, padelclubshop.ir** — dead (000).
- **iliyar.com** — 418 from this environment (WAF); Torob shop page showed
  non-padel inventory anyway.
- New-seller names from Emalls crawls with no independent priced sites:
  تپسی شاپ, ایران پاساژ, ایران ماه بانو (marketplace sellers only).

### Notes
- This pass: ~8 web queries (fa) + ~20 curl probes + 2 full category scrapes
  (python extraction) + og-price verification on a product page.
- Two NEW fully-qualified shops: sportsaeed.com, onesport.ir. Both Tehran,
  both WooCommerce, both with public per-model Toman padel-racket prices.
- Pool assessment: mostly harvested — Emalls/Torob crawls now mostly surface
  marketplace-only sellers or aliases of known shops. Next passes should try
  fresh angles (Instagram shops with websites, provincial shops, padel-club
  pro-shops with price lists).

---

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

---

## PASS 3 — third store-researcher run (11:09–11:45 +0330)

Goal: 1–2 NEW Iranian online shops with PUBLIC real padel prices (not DM-only).
Already covered (see passes above + 10-12/10-13): Torob, Divar, tennisfa.com,
tennisshop.ir, shop.alo-varzesh.com, Emalls, Digikala, padeliran.ir,
sportstations.ir, iranjsport.com, hivapadel.com, tennis24shop.com,
seendaalshop.ir, tagmond.com, bapateam.ir, racketstore.ir, zitazi.com,
tennisban.ir, hivajet.com, padelone.ir, paymansport.com, sportsaeed.com,
onesport.ir, sunsportiran.com. Watch list: mizanpadel.ir (uniform pricing).

### ✅ RECOMMENDED: NONE this pass

No new shop met the bar (real padel-gear inventory + public per-model prices +
scrapable). The reachable pool is now essentially harvested — this pass
checked ~50 domain probes + ~8 web queries + Torob/Emalls seller-name crawls
and every new lead failed verification (see rejections below).

### ⚠️ WATCH LIST / BORDERLINE (not recommended)

#### ایران اورجینال (IranOriginal) — iranoriginal.com
- **URL:** https://iranoriginal.com — live, Iranian apparel/footwear retailer
  (New Balance importer; Tehran-based online shop).
- **Padel inventory:** THIN — exactly ONE padel product: own-brand «تیشرت پدل
  برند ایران اورجینال» in 11 size/color variants (product IDs 7570668–7570673,
  7585589–7585606). NO rackets, shoes, balls, bags, or accessories. The
  «راکت پدل bullpadel» string seen in an early title scrape was a tag/category
  label, not a product.
- **Price visibility:** PUBLIC — 5,200,000 تومان per shirt, confirmed on a
  product page (curl 200, price in server-rendered HTML, no login).
- **Scrapability:** FULL via curl — HTTPS 200, server-rendered HTML.
- **Verdict:** NOT a padel-gear shop — a general apparel shop with one
  padel-themed T-shirt design. Do not add to the padel-gear price search.
  Revisit only if it lists real rackets/shoes/balls. City: تهران (online
  shop; no padel-specific branch info).

### ❌ Checked but REJECTED this pass
- **noxpadel.ir** (live 200!) — WordPress brochure site for «Noxepadel» (Nox
  rackets/bags showcase + 2023 catalogue PDF). NO WooCommerce routes
  (/shop, /products, wp-json store API all 404), no product pages, no prices.
  Brand showcase, not a shop.
- **padel.ir** — «پلتفرم جامع پدل ایران» (court booking + shop + coaching +
  ranking). Shop page (shop.php) is EMPTY: «محصولی یافت نشد», 0 products,
  placeholder phone 021-XXXXXXXX, 0 clubs/coaches. Launching/empty platform,
  no real inventory. Revisit if the shop ever lists products.
- **sportland.ir** — general sportswear/apparel shop (تهران). Site search for
  «پدل» returns the homepage; 2 incidental «پدل» mentions (tennis bags).
  No padel gear.
- **varzeshland.ir** — JS-redirect (Selva shop builder) landing, 0 padel
  mentions. Unverifiable padel inventory.
- **tennisproshop.ir** («تنیس پرو شاپ», Torob seller of tennis strings/balls)
  — 406 from this environment; no web presence confirming any padel
  inventory. Torob-only evidence (tennis strings/balls) → unverified, rejected.
- **bahmansport.ir** («ورزشی بهمن») — gym-equipment shop (0 padel mentions).
- **darnial.ir** («مجموعه دارنیال») — ping-pong specialist shop (0 padel).
- **6sports.ir** («شش اسپورتس») — general sports shop (0 padel mentions).
- **padelmarket.com** — Spanish shop (EUR prices, Trustpilot) — foreign.
- **padelstore.com** — Dutch shop (EUR, «shipped today») — foreign.
- **padelhouse.com / chiashop.com** — domain-for-sale pages, not shops.
- **iranpasaj.com, iranmahbanoo.com/.ir, mahbanoo.ir, tapsishop.ir/.com** —
  dead (000). «ایران ماه بانو» / «تپسی شاپ» / «ایران پاساژ» remain
  marketplace-only sellers (Emalls/Basalam) with no independent priced sites.
- **Dead domains (000):** padelbaz.com, padeliran.net/.shop/.store,
  bullpadel.ir, siux.ir, oxdog.ir, kuikma.ir, padelshopiran.ir/.com,
  irpadel.ir, padeltehran.ir, tehranpadel.com, padelisfahan.ir,
  padelmashhad.ir, padelshiraz.ir, padelkish.com/.ir, kishpadel.ir,
  padelkaraj.ir, padelpro.ir, padelclub.ir, padelracket.ir,
  padelracketshop.ir, racketpadel.ir, tennisland.ir, padelkala.ir/.com,
  padelbazar.ir, padelgear.ir, padelsport.ir, padel24.ir, padelshop24.ir/.com,
  padelworld.ir, padelstar.ir, padelacademy.ir, padeltop.ir, topspadel.ir,
  padelbazaar.ir, padelstore.ir, padelgalaxy.ir, padelsports.ir,
  sportpadel.ir, padeliran24.ir, tennissproshop.ir, saminsport.ir,
  rensoshop.ir, persiantennis.ir.
- **Emalls/Torob re-crawl:** no new sellers with independent priced sites.
  New names («پدل باز», «ویلسون», «رنسو شاپ», «تنیس پرو شاپ») are Torob-only.
- **koodakoo.com** — toy shop; single toy «پدل» mention (already rejected).
- **raseel.gift** — Saudi gift shop (SAR) — foreign.

### Notes
- This pass: ~8 web queries (fa) + ~50 curl domain probes + 4 full page
  scrapes (noxpadel, padel.ir/shop.php, iranoriginal search + product page)
  + Torob ball-list + Emalls seller-name crawls.
- Pool assessment: EXHAUSTED for the current method (domain guesses + Emalls/
  Torob seller crawls + generic fa queries). Next passes need a genuinely
  different angle: Instagram bio link-outs from padel clubs (pro-shop pages),
  Bazaar/CafeBazaar app-store listings of padel shops, or asking رضا for
  shops he knows. Re-check watch-list items (padel.ir, iranoriginal.com,
  mizanpadel.ir) rather than re-probing dead domains.
- torob.com remains blocked from this environment (curl); seller names keep
  coming from Torob's Google crawl instead.

---

## PASS 4 — fourth store-researcher run (15:10–15:45 +0330)

Goal: 1–2 NEW Iranian online shops with PUBLIC real padel prices (not DM-only).
Already covered (passes 1–3 above + 10-12/10-13): Torob, Divar, tennisfa.com,
tennisshop.ir, shop.alo-varzesh.com, Emalls, Digikala, padeliran.ir,
sportstations.ir, iranjsport.com, hivapadel.com, tennis24shop.com,
seendaalshop.ir, tagmond.com, bapateam.ir, racketstore.ir, zitazi.com,
tennisban.ir, hivajet.com, padelone.ir, paymansport.com, sportsaeed.com,
onesport.ir, sunsportiran.com. Watch list: mizanpadel.ir (uniform pricing),
padel.ir (empty shop), iranoriginal.com (one padel T-shirt only).

### ✅ RECOMMENDED (add to live cheapest-price search)

#### 1. دکتلون اسپرت (Decathlon Sport) — decathlonsport.ir
- **URL:** https://decathlonsport.ir
- **Padel category (curl-verified):**
  http://decathlonsport.ir/product-category/padel/ — title «خرید پدل |
  لوازم ورزشی اروپایی».
- **City:** خوی، آذربایجان غربی (address: آذربایجان غربی - خوی).
  Phone: 02182803356, WhatsApp: 09370416439,
  email: decathlonsport.ir@gmail.com, Telegram: DecachlonSport.
- **Identity:** Iranian importer/retailer of Decathlon (Kuikma) European
  sports gear; «تضمین محصولات اورجینال». Padel is a dedicated category
  (2 subcategories: راکت پدل، لوازم جانبی پدل).
- **Padel inventory:** YES — Kuikma-only range, 8+ products on page 1
  (category filter shows KUIKMA 6 + QUIKMA 1; search index said 15 padel
  results incl. bags/net):
  - راکت پدل Kuikma PR Open — 16,328,250 تومان
  - راکت پدل Kuikma PR Comfort Soft — 21,425,850 تومان
  - راکت پدل QUIKMA PR React Soft — 23,815,350 تومان
  - راکت پدل Kuikma Hybrid Metal — 47,710,350 تومان
  - راکت پدل Kuikma PR Hybrid Carbon Coki Nieto — 60,454,350 تومان
  - اورگریپ پدل QUIKMA Adherence (مشکی) — 2,469,150 تومان
- **Price visibility:** PUBLIC — per-model Toman prices on every card, no
  login. Prices are hyper-specific (non-round, e.g. 16,328,250) → real
  per-model pricing, consistent with EUR→Toman conversion by an importer.
- **Scrapability:** FULL via curl — HTTP 200 (~477KB), prices in
  server-rendered HTML, no JS needed. Product title + price extractable
  from category page text.
- **Caveats:** (1) Kuikma-only inventory — no Head/Nox/Bullpadel rackets,
  no padel balls seen on the padel category page; (2) accessories
  subcategory URL guessed in this pass 404'd — use the main /padel/
  category URL; (3) brand spelled «QUIKMA» on some listings (site's own
  typo for Kuikma).
- **Integration cost:** LOW — plain HTML price extraction.
- **Confidence:** HIGH.

#### 2. علیرضا شاپ (Alireza Shop) — alirezashop.org
- **URL:** https://alirezashop.org
- **Padel category (curl-verified):**
  https://alirezashop.org/product-category/padel/ — subcategories:
  راکت پدل (brands: NOX, Adidas, Babolat, Bullpadel, Head, Wilson, Oxdog,
  Volt), توپ پدل, کفش پدل, اورگریپ پدل, اکسسوری پدل / محافظ راکت.
- **City:** اصفهان — physical store: اصفهان، خیابان خمینی، خیابان زرین،
  باشگاه پدلیکس. Phone: 09004005003, landline: 03131314304,
  email: alireza.fup@gmail.com, Instagram: ALIREZASHOP.IR.
  Support hours: daily 8–24.
- **Identity:** «فروشگاه تخصصی تجهیزات پدل و تنیس» — padel + tennis
  specialty shop with court booking («رزرو زمین») and a racket-finder
  tool («راکت‌یاب هوشمند»). Also sells body-analysis devices and
  sportswear, but padel is a core category block.
- **Padel inventory:** YES — real named models, multi-brand:
  - راکت پدل Nox X-One Casual Series 2023 — 32,000,000 تومان (was 33,000,000, 3% sale)
  - راکت پدل Nox NextGen Pro Hybrid 3K 2025 — 53,000,000 تومان (was 60,000,000, 12% sale)
  - Also listed (titles verified, prices not individually extracted):
    Bullpadel Hack 05 Hybrid, Nox AT10 Genius 18K Alum 2026,
    Nox X-One Silhouette 2026, Head Evo Extreme 2025, Oxdog Ultimate Pro
    Smash, Bullpadel XPLO limited, Adidas Cross It Light 2026, Volt 500 V5.
- **Price visibility:** PUBLIC — per-model Toman prices on product pages
  (server-rendered HTML via curl), no login.
- **Scrapability:** FULL via curl — HTTPS 200 (~584KB product page),
  prices in server-rendered HTML. NOTE: one guessed category URL
  (/product-category/padel/padel-racket/) 301'd to empty — use the
  exact /product-category/padel/ URL and per-brand subcategory URLs
  from the site nav.
- **Caveat:** site banner asks buyers to confirm stock + current price
  with support before ordering («برای اطمینان از موجودی و قیمت بروز حتما
  با پشتیبانی تماس حاصل فرمایید») — prices are still publicly displayed,
  but treat them as confirm-before-order.
- **Correction vs Pass 2:** Pass 2 rejected «ورزشی علیرضا شاپ» as a
  Torob-only seller with no standalone site. The standalone
  alirezashop.org has now been found and verified (same name, same
  Nox X-One focus) — almost certainly the same seller, now with its own
  priced storefront. The Torob-only rejection is superseded.
- **Integration cost:** LOW — WooCommerce-style category/product pages.
- **Confidence:** HIGH.

### ❌ Checked but REJECTED this pass
- **winnersport.ir** («وینر اسپرت», padel-specialty shop at Enghelab
  complex, Tehran, per avval.ir directory) — site SUSPENDED: HTTPS 302 →
  /cgi-sys/suspendedpage.cgi (hosting suspension). No prices verifiable.
  Revisit only if the site comes back.
- **«فروشگاه پدل» (Enghelab complex, Tehran)** — directory listings only
  (avval.ir); no independent website found. Physical-shop-only → rejected.
- **Foreign re-surfaces:** beymen.com (TR), shopee/tokopedia (ID),
  sportsnextdoor.com (IN) — foreign, not eligible.
- **tennisfa/tennisshop/iranjsport/seendaalshop/bapateam/tennisban** —
  query re-surfaces, all already covered.

### Notes
- This pass: ~6 web queries (fa) + ~10 curl probes + 4 full page scrapes
  (decathlonsport padel category, alirezashop home/product/contact).
- TWO fully-qualified new shops: decathlonsport.ir (Khoy, Kuikma-only)
  and alirezashop.org (Isfahan, multi-brand padel specialty). The second
  is the more valuable find — a real padel-specialty shop outside Tehran
  with multi-brand rackets and public prices.
- Watch-list items (mizanpadel.ir, padel.ir, iranoriginal.com) were NOT
  re-verified this pass (a backgrounded recheck probe never returned);
  they stay on the watch list unchanged.
- Pool assessment: still thinning, but the avval.ir business-directory
  angle (physical padel shops → check for websites) produced one live
  lead (winnersport, suspended) and may yield more next passes.

### Addendum (Pass 4, late-arriving probe)
- The backgrounded watch-list probe belatedly returned: padel.ir/shop.php
  HTTP 200 (27KB, content not inspected — NOT evidence of products;
  shop stays on watch list as empty/unverified), mizanpadel.ir guessed
  rackets URL 404 (guessed URL, inconclusive — uniform-pricing watch
  status unchanged), iranoriginal.com search timed out (000, inconclusive).
  No watch-list status changes from this probe.
