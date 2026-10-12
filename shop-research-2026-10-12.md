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

## دور جدید — 2026-10-12 ~19:30 (عصر، یک یافتهٔ جدید تأییدشده)

### ✅ RECOMMENDED — تنیس ۲۴ (Tennis24Shop) — tennis24shop.com
- **URL:** https://tennis24shop.com
- **Padel category:** https://tennis24shop.com/product-category/padel-%d9%be%d8%af%d9%84/ (نمایش ۱–۱۲ از ۴۳ نتیجه)
- **City:** تهران (تلفن 02191693524 در فوتر صفحهٔ اصلی؛ شعبهٔ تهران)
- **Padel inventory:** YES — فروشگاه تخصصی لوازم تنیس/پدل اورجینال: راکت‌های
  دکتلون/کویکما، آدیداس (Metalbone Team، RX Green، Drive Light 3.2، Match 3.2)،
  هد (Vibe 2026، Bolt 2025، Coello Team/Motion/Pro، Radical Team/Motion/Pro)،
  کفش پدل اسیکس (GEL-Dedicate 9، Game FF)، ساک و کیف پدل.
- **Price visibility:** PUBLIC — همهٔ محصولات با قیمت تومان + افزودن به سبد خرید.
  نمونهٔ تأییدشده (2026-10-12، از متن صفحه):
  - Kuikma PR Comfort Soft — 12,249,000 تومان
  - Kuikma Power Carbon — 32,449,000 تومان
  - Adidas Match 3.2 — 21,399,000 تومان
  - Adidas Metalbone Team — 65,399,000 تومان
  - Head Coello Motion 2026 — 66,880,000 تومان (تخفیف از 70,400,000)
  - Head Vibe 2026 — 28,215,000 تومان (تخفیف از 29,700,000)
  - Asics GEL-Dedicate 9 Padel (زنانه) — 35,099,000 تومان
- **Scrapability:** PARTIAL — curl از این محیط مسدود است (چالش JS/WAF، پاسخ
  HTTP 418 روی همهٔ هدرها و UAها؛ wp-json هم به چالش می‌خورد). اما fetch متنی
  صفحه (از طریق browser.open) دادهٔ کامل قیمت‌ها را برمی‌گرداند — یعنی با
  پایپ‌لاین fetch متنی/مرورگر قابل خواندن است، با curl ساده خیر.
- **تفاوت با دورهای قبل:** tennis24shop.com دامین متفاوتی از tennis24.ir است
  (قبلاً dead بود) — هم‌پوشانی ندارد.
- **Integration cost:** MEDIUM — قیمت‌ها عمومی‌اند اما پارسر باید از fetch
  متنی استفاده کند، نه curl خام.

### ❌ ردشده‌های این دور
- **astsportshop.com (AST Sport Shop)** — فروشگاه کتونی تهران (09214746430)؛
  فقط ۱ اشاره به پدل (یک محصول کتونی پدل/تنیس)، و کفش‌هایش سطح «مستر»
  (رپلیکا) است — فروشگاه لوازم پدل واقعی نیست.
- **sportland.ir** — فروشگاه پوشاک زنانه؛ فقط یک دستهٔ جست‌وجوی «تنیس و پدل»
  برای لباس، بدون راکت یا لوازم پدل — رد شد.
- **~۲۴ دامین مرده:** padelworld.ir، padelplus.ir، irantenisshop.ir،
  sportkadeh.ir، tennisarena.ir، racketcity.ir، raketcity.ir، iransportland.com،
  padelhouse.ir، sportline.ir، raketshop.ir، sportbazar.ir، varzeshshop.ir،
  padelcenter.ir، clubpadel.ir، parstennis.ir، padeltehran.ir، sportpadel.ir،
  racketland.ir، varzeshland.ir، padelmarketshop.ir، iranracket.ir، zitazi.ir،
  peymansport.ir، racketrun.ir، tenisfardis.ir — همگی غیرقابل دسترسی (000).
- **تنوع کوئری:** جست‌وجوهای فارسی/انگلیسی جدید (فروشگاه اینترنتی راکت پدل،
  site:.ir، قیمت خرید کتونی پدل) جز تنیس‌شاپ‌های قبلاً پوشش‌داده‌شده نتیجهٔ
  جدیدی نداشتند.

## دور جدید — 2026-10-12 ~23:30 (شب، یک یافتهٔ جدید تأییدشده)

### ✅ RECOMMENDED — سین دال (Seendaal Shop) — seendaalshop.ir
- **URL:** https://seendaalshop.ir
- **Padel sections:** «راکت ها» (راکت‌های پدل و تنیس)، توپ، ساک/کیف
- **City:** روی سایت درج نشده — ارسال به سراسر کشور («ارسال فوری، ارسال به سراسر کشور»، پرداخت امن درگاه شاپرک)
- **Padel inventory:** YES — راکت‌های پدل هد (Coello Vibe / Motion / Team / Pro 2026، Bolt، Evo Extreme، Radical)، ناکس (AT10 Genius 12K Xtrem 2026)، بول‌پدل (Hack 04 2026)، سیوکس (Fenix Pro، Electra Pro)، توپ پدل (Head Padel Pro+، Head Padel Team، Quicksand)، ساک پدل (Nox ML10 Competition / Team)، اورگریپ و گارد راکت
- **Price visibility:** PUBLIC — صفحات دسته‌بندی ایندکس‌شدهٔ گوگل قیمت تومان را عمومی نشان می‌دهند. نمونهٔ تأییدشده (2026-10-12):
  - Head Coello Vibe 2026 — 32,000,000 تومان
  - Head Coello Motion 2026 — 64,000,000 تومان
  - HEAD Coello Pro Padel 2026 — 66,000,000 تومان
  - Nox AT10 Genius 12K Xtrem 2026 — 85,000,000 تومان
  - Head Evo Extreme 2025 — 25,000,000 تومان
  - Siux Fenix Pro / Electra Pro — 75,000,000 تومان
  - Head Padel Pro+ (توپ) — 1,500,000 تومان
  - Head Padel Team (توپ) — 1,400,000 تومان
- **Scrapability:** PARTIAL — curl از این محیط HTTP 503 می‌گیرد (WAF) و fetch متنی فقط پوستهٔ JS برمی‌گرداند (سایت روی پلتفرم Sotoon، احتمالاً client-rendered). دادهٔ کامل قیمت‌ها از اسنپ‌شات‌های کراول گوگل تأیید شد — هم‌ردهٔ tennis24shop.com: با پایپ‌لاین fetch متنی/مرورگر قابل خواندن است، با curl خام خیر.
- **نکته:** دورهای قبل @seendaal_shop را به‌عنوان فروشگاه اینستاگرامیِ «قیمت در دایرکت» رد کرده بودند — آن ارزیابی مربوط به اکانت اینستاگرام بود؛ وب‌سایت مستقل seendaalshop.ir با قیمت‌های عمومی قبلاً در فایل ثبت نشده و یافتهٔ جدیدِ واقعی این دور است. سایت بلاگ راهنمای خرید راکت پدل هم دارد (بخش پدل فعال و نگهداری‌شده).

### ❌ ردشده‌های این دور
- **sellr.ir** — فروشندهٔ «سلر» ترب سایت مستقل دارد (www.sellr.ir، SPA روی پلتفرم Sotoon)؛ از این محیط fetch متنی ناموفق (upstream 500) و هیچ مدرکی از موجودی پدل روی سایت خودش نیست — ناکافی، رد شد
- **tehrantennis.ir** — از این محیط غیرقابل دسترسی (curl 503، fetch timeout)
- **sportkala.ir، varzeshkala.ir، padeltennis.ir، sportshop.ir، padelshoponline.ir** — همگی غیرقابل دسترسی (000)
- **astsportshop.com** — قبلاً رد شده (کتونی مستر/رپلیکا)؛ در نتایج این دور هم تنها اشارهٔ پدل-کفش بود
- **foreign shops** (runkd.com، temu، beymen ترکیه، shopee/tokopedia اندونزی، sportsnextdoor هند) — غیرایرانی، رد شدند
- فروشگاه‌های پوشش‌داده‌شدهٔ قبلی (tennisshop.ir، tennisfa.com، iranjsport.com، hivapadel.com، tennis24shop.com، emalls.ir) در نتایج ظاهر شدند اما تکراری‌اند
- **محدودیت محیط:** torob.com همچنان کاملاً مسدود (exit 52) — امکان مرور فروشنده‌های جدید ترب در این دور نبود
