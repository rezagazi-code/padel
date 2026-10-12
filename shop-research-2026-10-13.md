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
