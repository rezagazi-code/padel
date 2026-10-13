# Padel Shop Research — 2026-10-13 (21 مهر ۱۴۰۵)

Goal: 1-2 NEW Iranian online shops with PUBLIC real padel prices (not DM-only).
Already covered: Torob, Divar, tennisfa.com, tennisshop.ir, shop.alo-varzesh.com,
Emalls, Digikala, padeliran.ir, sportstations.ir, iranjsport.com, hivapadel.com,
tennis24shop.com, seendaalshop.ir, @tennisfa_shop, @echs.store, @matinsport,
sportstation.ir — see shop-research-2026-10-12.md.

## ✅ RECOMMENDED (add to live cheapest-price search)

### 1. تگ‌موند (Tagmond) — tagmond.com
- **URL:** https://tagmond.com
- **Padel categories:**
  - https://tagmond.com/p/men-specialized_sport_equipments-padel-padel_rackets/nox
  - https://tagmond.com/p/women-specialized_sport_equipments-padel-padel_rackets
- **City:** تهران (تحویل در تهران: عادی/فوری؛ ارسال به شهرستان ۱۲–۱۴ روز کاری — مدل
  تامین‌کننده‌ای، تامین‌کننده: برندیس)
- **Company:** شرکت گسترش و نوآوری تگین (دارای گواهی شرکت خلاق تا ۱۴۰۵/۱۰/۳۰)،
  دامنه از ~۲۰۱۵، هاست ایران — فروشگاه اینترنتی ایرانی بزرگ (پوشاک/کفش/لوازم ورزشی
  از ۳۲۰ برند بین‌المللی)، نه فروشگاه اختصاصی پدل
- **Padel inventory:** محدود ولی واقعی — فقط راکت پدل نوکس (Nox) در حال حاضر:
  ۴ مدل لیست‌شده (صفحهٔ مردانه/زنانه هر دو «۴ محصول» نشان می‌دهند؛ کرال گوگل
  قبلاً تا ۱۰ محصول ایندکس کرده بود)
- **Price visibility:** PUBLIC — قیمت‌ها با واحد T (تومان) روی کارت محصولات، بدون
  لاگین. نمونه‌های تأییدشده (2026-10-13):
  - Nox VK10 Ventus Control 12K 2026 — 78,000,000 تومان
    (صفحهٔ جزئیات: og:price 78,000,000 — واحد نمایش T=تومان، سازگار با قیمت‌های
    سایر فروشگاه‌های ایرانی برای همین ردهٔ راکت)
  - Nox NextGen Pro Hybrid 3K 2025 — 64,000,000 تومان
  - دو مدل دیگر نوکس: 78,000,000 / 64,000,000 تومان
- **Scrapability:** PARTIAL — curl مستقیم از این محیط throttled می‌شود (دانلود کامل
  body تایم‌اوت می‌خورد؛ HEAD سریع 200 برمی‌گرداند)؛ ولی fetch متنی (browser.open)
  صفحهٔ دسته‌بندی و جزئیات محصول را کامل با قیمت برمی‌گرداند — هم‌ردهٔ
  tennis24shop.com و seendaalshop.ir: با پایپ‌لاین fetch متنی قابل خواندن است، با
  curl خام خیر. صفحهٔ اصلی (/) از این محیط سنگین/غیرقابل fetch است ولی لازم نیست.
- **Inventory caveat:** نام محصولات در کارت‌های لیستینگ ژنریک است («راکت پدل نوکس»)؛
  نام کامل مدل فقط در صفحهٔ جزئیات محصول (og:title / عنوان صفحه) هست.
- **Integration cost:** MEDIUM — قیمت‌ها عمومی‌اند اما پارسر باید از fetch متنی
  استفاده کند و نام مدل را از صفحهٔ جزئیات بگیرد؛ موجودی فعلی فقط Nox است.

## ❌ Checked but REJECTED this cycle
- **«پدل باز» (Torob seller)** — در لیست قیمت توپ ترب دیده شد (توپ پدل هد/بابولات)؛
  هیچ وب‌سایت مستقلی ندارد — فقط فروشندهٔ ترب، و ترب قبلاً پوشش داده شده.
- **سلر (sellr)** — قبلاً رد شده؛ در لیست توپ ترب هم دیده شد (توپ دانلوپ) ولی سایت
  مستقلش مدرک موجودی پدل ندارد.
- **Foreign shops** (beymen.com ترکیه، totalpadel.com فرانسه، tokopedia/shopee
  اندونزی، haraj.com.sa عربستان) — غیرایرانی.
- **koodakoo.com** — فروشگاه سیسمونی/اسباب‌بازی؛ فقط یک ست اسباب‌بازی «۴ کاره»
  با اشارهٔ پدل — فروشگاه لوازم پدل نیست.
- **~۵ دامین مرده:** isam.ir، padelbaz.ir، padelmarket.ir، sportemrooz.ir،
  varzesh3shop.ir — همگی غیرقابل دسترسی (000).
- **جست‌وجوهای نمایندگی برندها** (بول‌پدل/هد/ویلسون) فقط فروشگاه‌های قبلاً
  پوشش‌داده‌شده (tennisfa.com، tennisshop.ir، seendaalshop.ir) را برگرداند.

## Notes
- این دور ~۸ کوئری فارسی/انگلیسی + ~۲۵ probe دامین/URL انجام شد.
- torob.com همچنان از این محیط مسدود است (مثل دورهای قبل) — مرور فروشنده‌های
  جدید ترب ممکن نبود؛ ولی کرال گوگل از لیست قیمت ترب یک نام فروشندهٔ جدید
  («پدل باز») را لو داد که وب‌سایت مستقل ندارد.
- الگوی تکراری دورهای اخیر: بیشتر «فروشگاه‌های پدل» جدید یا ترب-اونلی‌اند یا
  اینستاگرام DM-اونلی؛ tagmond.com از معدود منابع جدید با قیمت عمومی است —
  هرچند موجودی پدلش محدود (فعلاً فقط Nox) است.


---

# Update — 07:10 Tehran run (second store-research pass today)

Note: the tagmond.com recommendation above came from the earlier 03:09 run. This pass
used fresh queries to hunt for ADDITIONAL new shops. Queries (~5 Persian/English) mostly
re-surfaced already-covered shops (seendaalshop.ir, tagmond.com, matinsportshop.com —
already rejected earlier for being unreachable/inquiry-priced).

## ✅ NEW RECOMMENDED (add to live cheapest-price search)

### 1. باپاتیم (BapaTeam) — bapateam.ir
- **URL:** https://bapateam.ir
- **Padel categories:**
  - https://bapateam.ir/product-category/padel-rackets/
  - https://bapateam.ir/product-category/padel-shoes/
- **City:** not published on site (contact page returns 403; no address in footer).
- **Identity:** Iranian `.ir` tennis/padel specialty shop (meta: «جدیدترین تجهیزات
  تنیس را با بهترین قیمت از باپاتیم بخرید»); Instagram @bapateam
- **Padel inventory:** YES — dedicated padel sections: rackets (Head, Wilson,
  Adidas, Bullpadel, Nox, Hirostar, Siux subcategories) + padel shoes (Asics etc.).
  Page 1 of padel-rackets shows 25 products with pagination.
- **Price visibility:** PUBLIC — every product card shows Toman price, no login.
  Verified samples (2026-10-13):
  - راکت پدل هد Radical Pro 2024 — 54.000.000 تومان
  - راکت پدل هد Speed Pro 2025 — 67.000.000 تومان
  - راکت پدل هد Extreme Pro 2023 — 60.000.000 تومان
  - راکت پدل هد Speed Motion 2025 — 65.000.000 تومان
  - Bullpadel Elite 02 Pretor / Vertex 05 Pretoria LTD and Nox AT10 Genius
    Ultralight / Equation Hard Advanced also listed on homepage
- **Scrapability:** FULL — verified via curl (HTTP 200, ~220KB, no JS needed).
  Server-rendered WooCommerce HTML: product title
  `class="woocommerce-loop-product__title"`, price
  `span.woocommerce-Price-amount > bdi` in Toman directly (no ÷10 needed),
  currency symbol `woocommerce-Price-currencySymbol` = تومان. Pagination present.
  Discounts use `<del>/<ins>` pattern (parse `<ins>` as current price).
- **Integration cost:** LOW — same WooCommerce pattern family as iranjsport.com
  (already integrated), prices already in Toman.

## ❌ Checked but REJECTED this pass
- **matinsportshop.com** (متین اسپرت web shop) — rejected again this pass: curl 000
  from this environment, browser text-fetch also failed; matches the 10-12 verdict
  (maintenance mode / inquiry-only prices). Keep out until it becomes reachable
  with public prices.
- **Everything else in the query results** (seendaalshop.ir, tagmond.com) — already
  covered in prior cycles.

## Notes
- This pass: 5 fresh queries + ~10 curl probes. Torob still blocked from this
  environment (same as prior cycles).
- Newest unique, verifiable shop this pass: bapateam.ir (full scrapability,
  public Toman prices, dedicated padel categories). tagmond.com (earlier run today)
  remains the second new candidate of the day.

---

# Update — 11:15 Tehran run (third store-research pass today)

Fresh Persian/English queries (~5) + ~20 curl domain probes. All queries re-surfaced
already-covered shops (tennisshop.ir, padeliran.ir, shop.alo-varzesh.com, Torob
sellers) or foreign stores (Turkey/Indonesia/India/UAE).

## ✅ NEW RECOMMENDED (add to live cheapest-price search)

### 1. راکت استور (Racket Store) — racketstore.ir
- **URL:** https://racketstore.ir — search: https://racketstore.ir/search/?q=پدل
- **City:** جزیره کیش (Kish Island) — «دهکده المپیک ورزشی». Phones:
  09123106538, 09122232995 (also listed 021-style? no — both 0912 mobiles).
- **Identity:** Iranian `.ir` Next.js shop (RTL Persian); claims Middle East
  representation for beach-tennis/padel brands SOL, SHARK, ZAND, KONA.
- **Padel inventory:** YES — real padel section in search results: پدل سول
  (Sol brand padel racket, codes 001/002/003/005/006) + padel balls (۳تایی
  3-packs, ۲۴ عددی boxes).
- **Price visibility:** PUBLIC — prices embedded in server-rendered HTML as
  `"price":N` JSON (no login). Verified samples (2026-10-13):
  - پدل سول rackets: 35,690,000 / 42,320,000 / 42,649,000 / 55,770,000 /
    62,332,000 / 72,173,000 تومان
  - padel balls: ~2,054,000 تومان (3-pack range)
- **Scrapability:** FULL — curl HTTPS 200 (~280KB), prices in raw HTML,
  no JS required. Product names appear generically («پدل سول», «پدل کد ۰۰۱»)
  — detail page may carry full model info.
- **Integration cost:** LOW–MEDIUM — WooCommerce-family-like pattern;
  verify detail page title carries the exact model before integrating.

### 2. زیتازی (zitazi) — zitazi.com
- **URL:** https://zitazi.com — padel search via `?s=پدل` (WooCommerce search)
- **City:** تهران (Tehran) — phones 02191005599, 02166408648, 09120706870.
- **Identity:** Iranian general sporting-goods web store (Woodmart WooCommerce
  theme), `.com` but Iranian phone numbers and Toman pricing.
- **Padel inventory:** YES — real padel rackets + balls:
  - Babolat: Counter Veron 2.6 (365g), Counter Viper 2.6 (365g),
    Technical Veron 3.0, Technical Viper 3.0, Veron Juan Lebron 3.0,
    Alioth Pro Junior (kids)
  - Joma Tournament 3-ball pack, Wilson Premier Speed (WR8908501001) balls,
    Kuikma PL Team 20L bag, Kuikma Protect Tape 3-pack
- **Price visibility:** PUBLIC — no login; price in JSON-LD
  `Product.offers.priceSpecification[0].price` (IRR ÷ 10 = Toman).
  Verified sample (2026-10-13): Babolat Counter Veron 2.6 — 909,000,000 IRR =
  90,900,000 تومان, InStock.
- **Scrapability:** FULL via curl — HTTPS 200, JSON-LD embedded in raw HTML
  (product pages). Listing pages are AJAX-driven (prices not in search HTML),
  so crawl product URLs + parse JSON-LD per product.
- **Integration cost:** LOW — JSON-LD parse; unit conversion IRR→Toman (÷10).

## ❌ Checked but REJECTED this pass
- **اپکس تنیس (apextennis.ir)** — live Iranian shop (Torob seller too), but its
  padel items are accessories only: bags («کیف تنیس و پدل»), keychains,
  overgrips, pickleball — no real padel rackets or balls. Reject per criteria.
- **sportland.ir** — «فروشگاه پوشاک ورزشی اسپورت لند»: apparel only, ~2
  incidental padel mentions. Reject — no padel gear.
- **raketstore.com** — Turkish WordPress site (noindex), not Iranian. Reject.
- **zitazi.ir** — dead (000). (zitazi.com above is the live one.)
- **persiantennis.ir / sarzamintennis.ir / apextennis.ir-probes done /
  peymansport.ir / vansport.ir / tehrantennis.ir (empty homepage) /
  noxiran.ir / babolatiran.ir / headiran.ir / padelstore.ir / padeltehran.ir /
  tennisland.ir / sportshop.ir / tehransport.ir / varzeshshop.ir / toopsport.ir /
  racketiran.ir / raketstore.ir / racketran.ir** — all dead (000) or empty this
  pass.
- **Query re-surfaces:** tennisshop.ir, padeliran.ir, shop.alo-varzesh.com,
  pedal.ir (car magazine — unrelated), aradbranding.com (marketing blog, no
  prices) — already covered or non-qualifying.

## Notes
- ~5 fresh queries (fa/en) + ~25 curl probes this pass.
- torob.com still blocked from this environment; used Torob's Google crawl
  listings instead to harvest NEW seller names («راکت استور», «اپکس تنیس»,
  «زیتازی») and then probed their independent websites.
- Both new recommendations (racketstore.ir, zitazi.com) have full curl
  scrapability with public prices and real padel stock — ready for the
  cheapest-price search pipeline.
