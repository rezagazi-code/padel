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
