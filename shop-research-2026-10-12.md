# Padel Shop Research — 2026-10-12 (20 مهر ۱۴۰۵)

Goal: 1-2 NEW Iranian online shops with PUBLIC real padel prices (not DM-only).
Already covered: Torob, Divar, tennisfa.com, tennisshop.ir, shop.alo-varzesh.com,
Emalls, Digikala, padeliran.ir, sportstations.ir, @tennisfa_shop, @echs.store,
@matinsport, sportstation.ir — all checked in shop-research-new-sources.md.

## ✅ RECOMMENDED (add to live cheapest-price search)

### 1. ایران جوما (Iran Joma / ایران جی اسپرت) — iranjsport.com
- **URL:** https://iranjsport.com
- **Padel category:** https://iranjsport.com/product-category/padel-rackets/ (4 pages)
- **City:** not published on site — ships nationwide («ارسال سریع به سراسر ایران»)
- **Contact:** WhatsApp 09121716383, Instagram @iran.joma.sport, Telegram iran_joma
- **Padel inventory:** YES — dedicated padel section: rackets (Adidas, Head, Nox,
  Bullpadel, Babolat, Wilson, Siux, Joma, Dunlop), padel shoes (Joma), padel bags,
  padel balls. Also official Joma padel shoe importer in Iran.
- **Price visibility:** PUBLIC — every product card shows price in Toman (تومان)
  with add-to-cart. Verified sample prices (2026-10-12):
  - Nox AT10 Luxury Genius 12k Alum — 97,300,000 تومان
  - (page 1 also shows 105,500,000 / 73,700,000 / 34,800,000 / 48,000,000 /
    57,400,000 / 56,000,000 تومان items; Google crawl: Adidas RX Series 2026 —
    28,700,000 T, Nox AT10 Pro Cup Hard 2026 — 44,700,000 T, Head Bolt Red 2026 —
    29,700,000 T, Head Vibe BI VI — 29,700,000 T)
- **Scrapability:** YES — verified via curl. Server-rendered WooCommerce HTML
  (DinaShop theme). Product cards:
  `div.product-title > a.dina-product-link` (title) +
  `div.dina-product-price > span.woocommerce-Price-amount` (price, Toman directly —
  no ÷10 needed). Currency symbol: `woocommerce-Price-currencySymbol` = تومان.
  No JS required. Pagination: /product-category/padel-rackets/page/{2,3,4}/.
- **Caveat:** one product page shows «رایگان!» (dina-free-price) — a data-entry
  quirk; skip price==0/free items in parser.
- **Integration cost:** LOW — same WooCommerce pattern family as tennisshop.ir,
  prices already in Toman.

### 2. هیوا پدل (Hiva Padel) — hivapadel.com
- **URL:** https://hivapadel.com
- **Padel rackets category:** https://hivapadel.com/product-category/%d9%be%d8%af%d9%84/%d8%b1%d8%a7%da%a9%d8%aa-%d9%be%d8%af%d9%84/
  (also: توپ پدل، کفش پدل، کیف پدل categories)
- **City:** تهران (phones: 021-88734879، 021-51984، 09120455368)
- **Padel inventory:** YES — padel-only-ish shop: 11 racket models on site
  (Bullpadel Indiga series, Adidas Metalbone HRD+ 2026 / Arrow Hit 2026 / junior,
  Wilson Bela V3 2025, Head Speed Pro X 2025, Siux Subzero 3…), plus padel balls,
  shoes, bags, grips. Claims original goods (اورجینال).
- **Price visibility:** PUBLIC — listing page shows prices in Toman with
  add-to-cart. Verified sample prices (2026-10-12, from raw HTML):
  - Bullpadel Indiga CTR — 40,388,100 تومان
  - Bullpadel Indiga W 2026 — 49,453,000 تومان
  - Bullpadel Game PWR 2026 — 43,080,600 تومان
  - Adidas Metalbone HRD+ 2026 (Ale Galan) — listed (price on same page)
  - Wilson Bela V3 2025 — 46,670,700 تومان
  - Head Speed Pro X 2025 — 76,288,600 تومان
  - Bullpadel Indiga Girl 2026 (junior) — 31,413,000 تومان
  - Adidas Arrow Hit junior — 44,426,900 تومان
- **Scrapability:** YES — verified via curl. Server-rendered WooCommerce HTML;
  prices appear as `28,720,400&nbsp;تومان` inline in raw HTML (16 price tags on
  the category page), no JS needed. Category shows «Showing all 11 results» —
  single page, no pagination.
- **Integration cost:** LOW — one curl of the racket category page yields all
  title+price pairs.

## ❌ Checked but REJECTED this cycle
- **پدلا (Torob seller)** — sells padel gear on Torob but has no standalone
  website found; Torob already covers it.
- **Foreign shops** (justpadel.com, tiendapadelpoint.com, runkd.com,
  noon.com, fitneeds.sa, decathlon.com.tr…) — not Iranian, not eligible.
- **«سرزمین تنیس» / «پرشین تنیس» / «اپکس تنیس» / «چنیس»** — Torob-only sellers,
  no standalone padel site with prices found.

## Notes
- Both new shops price directly in Toman (no ÷10 conversion like tennisfa.com).
- Both are Tehran-based or ship nationwide — same market as tennisshop.ir /
  tennisfa.com, but adds Bullpadel Indiga + Adidas Arrow Hit / RX Series coverage
  the others don't list at the same prices.
- hivapadel.com is padel-specialized (worth higher rank for padel queries);
  iranjsport.com is a multi-brand sports shop strong on Joma shoes + wide racket
  range.

## دور جدید — 2026-10-12 ~15:45 (بعدازظهر، بدون یافتهٔ جدید)
- جست‌وجوهای وب (۹ کوئری فارسی/انگلیسی)، social.search در اینستاگرام/تردز/فیسبوک،
  و probe مستقیم ~۱۶ دامین انجام شد؛ فروشگاه جدید تأییدشده‌ای با قیمت عمومی
  پیدا نشد.
- ❌ نامزدهای ردشدهٔ این دور:
  - `extrapadel.ir` (@extrapadel.ir در اینستاگرام) — دامین از این محیط قابل دسترسی نیست
  - `racketshop.ir` (@racketshop.ir) — دامین قابل دسترسی نیست
  - `padelshop.ir` — فقط ریدایرکت به tennisshop.ir (قبلاً پوشش داده شده)
  - `padelstore.ir`, `padelmarket.ir`, `teampadel.shop`, `tennis24.ir`, `protennis.ir`,
    `tennismart.ir`, `raketland.ir`, `iranpadel.ir`, `padeliran.com`, `varzeshkadeh.ir` —
    همگی غیرقابل دسترسی/ناموجود
  - `matinsportshop.com` — از این محیط unreachable؛ طبق اسنیپت گوگل در حالت تعمیر است
    و صبح تأیید شده بود که قیمت‌هایش عمومی نیست (استعلامی/واتس‌اپ)
  - مغازه‌های اینستاگرامی (@ace_sport1، @seendaal_shop، @hitclub_store، @teampadel.shop،
    @padelhouse_shop، @tennis.baaz و…) — همگی قیمت در دایرکت، بدون وب‌سایت قیمتی
- ⚠️ محدودیت محیط: torob.com از این محیط کاملاً مسدود است (curl exit 52،
  browser.open خطای 500) و emalls.ir صفحهٔ خطا برمی‌گرداند — تیم صبح از Torob
  استفاده کرده بود، اما این دور امکان مرور فروشنده‌های جدید ترب نبود.
- شیپور (sheypoor.com) بررسی شد — فقط آگهی‌های دست‌دوم/شخصی، فروشگاه نیست.
- نتیجه: هیچ فروشگاه جدید و تأییدشده‌ای برای اضافه شدن به جست‌وجوی زندهٔ
  قیمت در این دور پیدا نشد.
