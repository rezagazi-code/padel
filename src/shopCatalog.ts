import { ShopProduct } from './types';

/** Last time the AI price research refreshed this catalog (Jalali display). */
export const SHOP_LAST_UPDATED = '۲۱ مهر ۱۴۰۵';

/**
 * Curated padel gear with real Iranian market prices.
 * Prices are researched by the AI across Torob, Divar, Emalls and Instagram
 * sellers and refreshed periodically. `offers` must stay sorted by price asc
 * (null prices last) so bestOffer() picks the cheapest.
 */
export const SHOP_CATALOG: ShopProduct[] = [
  {
    id: 'shop-dunlop-dunlop-boost-2-0-1',
    image: '/shop/shop-dunlop-dunlop-boost-2-0-1.jpg',
    name: 'راکت پدل Dunlop Boost 2.0',
    brand: 'Dunlop',
    category: 'racket',
    offers: [
      { store: 'ترب (۲ فروشگاه)', priceToman: 12800000, url: 'https://torob.com/browse/4367/%D9%88%D8%B1%D8%B2%D8%B4-%D9%87%D8%A7%DB%8C-%D8%B1%D8%A7%DA%A9%D8%AA%DB%8C/', condition: 'نو', note: 'ارزون‌ترین راکت پدل نو در بازار' },
      { store: 'ترب', priceToman: 16800000, url: 'https://torob.com/search/?query=dunlop%20boost%20padel', condition: 'نو' },
      { store: 'دیوار تهران', priceToman: 20000000, url: 'https://divar.ir/s/tehran?q=%D8%B1%D8%A7%DA%A9%D8%AA%20%D9%BE%D8%AF%D9%84', condition: 'نو', note: 'آکبند، مقطوع' },
    ],
  },
  {
    id: 'shop-nox-nox-x-one-casual-2025-2',
    image: '/shop/shop-nox-nox-x-one-casual-2025-2.jpg',
    name: 'راکت پدل Nox X-One Casual 2025',
    brand: 'Nox',
    category: 'racket',
    offers: [
      { store: 'ورزشی علیرضا شاپ (ترب)', priceToman: 21000000, url: 'https://torob.com/p/76807d75-f804-47a4-baa5-6a05e7acb350/silhoutte-casual-2023/', condition: 'نو', note: 'سری اقتصادی Nox' },
    ],
  },
  {
    id: 'shop-head-head-evo-speed-2025-3',
    image: '/shop/shop-head-head-evo-speed-2025-3.jpg',
    name: 'راکت پدل Head EVO Speed 2025',
    brand: 'Head',
    category: 'racket',
    offers: [
      { store: 'تنیسفا (tennisfa.com)', priceToman: 24200000, url: 'https://tennisfa.com/shop/product-category/padel/%D8%B1%D8%A7%DA%A9%D8%AA-%D9%BE%D8%AF%D9%84/', condition: 'نو', note: 'مناسب مبتدی تا نیمه‌حرفه‌ای' },
    ],
  },
  {
    id: 'shop-head-head-vibe-2026-4',
    image: '/shop/shop-head-head-vibe-2026-4.jpg',
    name: 'راکت پدل Head Vibe 2026',
    brand: 'Head',
    category: 'racket',
    offers: [
      { store: 'تنیسفا (tennisfa.com)', priceToman: 29700000, url: 'https://tennisfa.com/shop/product-category/padel/%D8%B1%D8%A7%DA%A9%D8%AA-%D9%BE%D8%AF%D9%84/', condition: 'نو', note: 'فریم قطره‌اشکی، خطاپوشی بالا' },
    ],
  },
  {
    id: 'shop-item-5',
    image: '/shop/shop-item-5.jpg',
    name: 'راکت پدل کارکرده (دیوار زعفرانیه)',
    brand: 'متفرقه',
    category: 'racket',
    offers: [
      { store: 'دیوار تهران (زعفرانیه)', priceToman: 30000000, url: 'https://divar.ir/s/tehran/ball-sports/velenjak', condition: 'کارکرده', note: 'آگهی کارکرده؛ قبل از خرید حضوری چک شود' },
    ],
  },
  {
    id: 'shop-oxdog-oxdog-ultimate-court-202-6',
    image: '/shop/shop-oxdog-oxdog-ultimate-court-202-6.jpg',
    name: 'راکت پدل Oxdog Ultimate Court 2026',
    brand: 'Oxdog',
    category: 'racket',
    offers: [
      { store: 'تنیسفا (tennisfa.com)', priceToman: 32000000, url: 'https://tennisfa.com/shop/product-category/padel/%D8%B1%D8%A7%DA%A9%D8%AA-%D9%BE%D8%AF%D9%84/', condition: 'نو', note: 'فریم دایمند، همه‌کاره' },
    ],
  },
  {
    id: 'shop-head-head-extreme-one-2025-7',
    image: '/shop/shop-head-head-extreme-one-2025-7.jpg',
    name: 'راکت پدل Head Extreme One 2025',
    brand: 'Head',
    category: 'racket',
    offers: [
      { store: 'ویلسون (ترب)', priceToman: 42000000, url: 'https://torob.com/browse/4367/%D9%88%D8%B1%D8%B2%D8%B4-%D9%87%D8%A7%DB%8C-%D8%B1%D8%A7%DA%A9%D8%AA%DB%8C/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nox-nox-at10-pro-cup-hard-2026-8',
    image: '/shop/shop-nox-nox-at10-pro-cup-hard-2026-8.jpg',
    name: 'راکت پدل Nox AT10 Pro Cup Hard 2026',
    brand: 'Nox',
    category: 'racket',
    offers: [
      { store: 'ایران جوما (ترب)', priceToman: 47000000, url: 'https://torob.com/browse/4367/%D9%88%D8%B1%D8%B2%D8%B4-%D9%87%D8%A7%DB%8C-%D8%B1%D8%A7%DA%A9%D8%AA%DB%8C/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nox-nox-at10-genius-18k-2024-9',
    image: '/shop/shop-nox-nox-at10-genius-18k-2024-9.jpg',
    name: 'راکت پدل Nox AT10 Genius 18K 2024',
    brand: 'Nox',
    category: 'racket',
    offers: [
      { store: 'ترب (۲ فروشگاه)', priceToman: 51000000, url: 'https://torob.com/browse/4367/%D9%88%D8%B1%D8%B2%D8%B4-%D9%87%D8%A7%DB%8C-%D8%B1%D8%A7%DA%A9%D8%AA%DB%8C/', condition: 'نو', note: 'مدل امضای آگوستین تاپیا' },
    ],
  },
  {
    id: 'shop-head-head-extreme-one-x-2025-10',
    image: '/shop/shop-head-head-extreme-one-x-2025-10.jpg',
    name: 'راکت پدل Head Extreme One X 2025',
    brand: 'Head',
    category: 'racket',
    offers: [
      { store: 'سین دال (ترب)', priceToman: 56000000, url: 'https://torob.com/browse/4367/%D9%88%D8%B1%D8%B2%D8%B4-%D9%87%D8%A7%DB%8C-%D8%B1%D8%A7%DA%A9%D8%AA%DB%8C/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-bullpadel-bullpadel-vertex-05--11',
    image: '/shop/shop-bullpadel-bullpadel-vertex-05--11.jpg',
    name: 'راکت پدل Bullpadel Vertex 05 W 2026',
    brand: 'Bullpadel',
    category: 'racket',
    offers: [
      { store: 'تنیس شاپ (tennisshop.ir)', priceToman: 59950000, url: 'http://tennisshop.ir/shop/%D8%AE%D8%B1%DB%8C%D8%AF-%D9%84%D9%88%D8%A7%D8%B2%D9%85-%D9%BE%D8%AF%D9%84/padel-racket-shop/%D8%B1%D8%A7%DA%A9%D8%AA-%D9%BE%D8%AF%D9%84-bullpadel-%D9%85%D8%AF%D9%84-vertex-05-w-2026/', condition: 'نو', note: 'ناموجود در انبار (آخرین قیمت ثبت‌شده)' },
    ],
  },
  {
    id: 'shop-nox-nox-at10-luxury-genius-18k-12',
    image: '/shop/shop-nox-nox-at10-luxury-genius-18k-12.jpg',
    name: 'راکت پدل Nox AT10 Luxury Genius 18K',
    brand: 'Nox',
    category: 'racket',
    offers: [
      { store: 'دیوار تهران (ولنجک)', priceToman: 83000000, url: 'https://divar.ir/s/tehran/ball-sports/velenjak', condition: 'نو', note: 'آگهی نو دیوار' },
    ],
  },
  {
    id: 'shop-head-head-padel-team-13',
    image: '/shop/shop-head-head-padel-team-13.jpg',
    name: 'توپ پدل Head Padel Team (بسته ۳ عددی)',
    brand: 'Head',
    category: 'balls',
    offers: [
      { store: 'ترب (۳ فروشگاه)', priceToman: 1350000, url: 'https://torob.com/price-list/2554/%D8%AA%D9%88%D9%BE-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF-%D9%84%DB%8C%D8%B3%D8%AA-%D9%82%DB%8C%D9%85%D8%AA/', condition: 'نو', note: 'ارزون‌ترین توپ پدل' },
    ],
  },
  {
    id: 'shop-qicksand-qicksand-14',
    image: '/shop/shop-qicksand-qicksand-14.jpg',
    name: 'توپ پدل qicksand (بسته ۳ عددی)',
    brand: 'qicksand',
    category: 'balls',
    offers: [
      { store: 'ویلسون (ترب)', priceToman: 1400000, url: 'https://torob.com/price-list/2554/%D8%AA%D9%88%D9%BE-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF-%D9%84%DB%8C%D8%B3%D8%AA-%D9%82%DB%8C%D9%85%D8%AA/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nox-nox-nerbo-speed-15',
    image: '/shop/shop-nox-nox-nerbo-speed-15.jpg',
    name: 'توپ پدل Nox Nerbo Speed',
    brand: 'Nox',
    category: 'balls',
    offers: [
      { store: 'تنیسفا (tennisfa.com)', priceToman: 1925000, url: 'https://tennisfa.com/shop/product-category/padel/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-dunlop-dunlop-pro-padel-16',
    image: '/shop/shop-dunlop-dunlop-pro-padel-16.jpg',
    name: 'توپ پدل Dunlop Pro Padel (بسته ۳ عددی)',
    brand: 'Dunlop',
    category: 'balls',
    offers: [
      { store: 'سلر (ترب)', priceToman: 2100000, url: 'https://torob.com/price-list/2554/%D8%AA%D9%88%D9%BE-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF-%D9%84%DB%8C%D8%B3%D8%AA-%D9%82%DB%8C%D9%85%D8%AA/', condition: 'نو', note: 'مدل ۲۰۲۶ اورجینال' },
    ],
  },
  {
    id: 'shop-asics-asics-solution-speed-ff2-17',
    image: '/shop/shop-asics-asics-solution-speed-ff2-17.jpg',
    name: 'کفش تنیس/پدل Asics Solution Speed FF2',
    brand: 'Asics',
    category: 'shoes',
    offers: [
      { store: 'ترب', priceToman: 9500000, url: 'https://torob.com/browse/3243/%DA%A9%D9%81%D8%B4-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF/', condition: 'نو', note: 'ارزون‌ترین اسیکس مناسب پدل' },
    ],
  },
  {
    id: 'shop-joma-joma-18',
    image: '/shop/shop-joma-joma-18.jpg',
    name: 'کفش تنیس/پدل Joma',
    brand: 'Joma',
    category: 'shoes',
    offers: [
      { store: 'ترب', priceToman: 10500000, url: 'https://torob.com/browse/3243/%DA%A9%D9%81%D8%B4-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF/', condition: 'نو', note: 'مدل مخصوص تنیس/پدل جوما' },
    ],
  },
  {
    id: 'shop-adidas-adidas-gamecourt-2-19',
    image: '/shop/shop-adidas-adidas-gamecourt-2-19.jpg',
    name: 'کفش تنیس Adidas Gamecourt 2',
    brand: 'Adidas',
    category: 'shoes',
    offers: [
      { store: 'ترب (۳ فروشگاه)', priceToman: 14294000, url: 'https://torob.com/browse/3243/%DA%A9%D9%81%D8%B4-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nike-nikecourt-air-zoom-lite-3-20',
    image: '/shop/shop-nike-nikecourt-air-zoom-lite-3-20.jpg',
    name: 'کفش تنیس NikeCourt Air Zoom Lite 3',
    brand: 'Nike',
    category: 'shoes',
    offers: [
      { store: 'ترب', priceToman: 16999000, url: 'https://torob.com/browse/3243/%DA%A9%D9%81%D8%B4-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-asics-asics-gel-resolution-9-21',
    image: '/shop/shop-asics-asics-gel-resolution-9-21.jpg',
    name: 'کفش تنیس Asics Gel-Resolution 9',
    brand: 'Asics',
    category: 'shoes',
    offers: [
      { store: 'ترب (۳ فروشگاه)', priceToman: 17149000, url: 'https://torob.com/browse/3243/%DA%A9%D9%81%D8%B4-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-head-head-revolt-court-22',
    image: '/shop/shop-head-head-revolt-court-22.jpg',
    name: 'کفش تنیس Head Revolt Court',
    brand: 'Head',
    category: 'shoes',
    offers: [
      { store: 'ترب (۴ فروشگاه)', priceToman: 18500000, url: 'https://torob.com/browse/3243/%DA%A9%D9%81%D8%B4-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-adidas-adidas-crazyquick-boost-23',
    image: '/shop/shop-adidas-adidas-crazyquick-boost-23.jpg',
    name: 'کفش پدل Adidas Crazyquick Boost (زنانه)',
    brand: 'Adidas',
    category: 'shoes',
    offers: [
      { store: 'ترب', priceToman: 28197000, url: 'https://torob.com/browse/3243/%DA%A9%D9%81%D8%B4-%D8%AA%D9%86%DB%8C%D8%B3-%D9%88-%D9%BE%DB%8C%D9%86%DA%AF-%D9%BE%D9%86%DA%AF/', condition: 'نو', note: 'مدل مخصوص پدل، زنانه' },
    ],
  },
  {
    id: 'shop-nike-nikecourt-dri-fit-rafa-24',
    image: '/shop/shop-nike-nikecourt-dri-fit-rafa-24.jpg',
    name: 'تیشرت تنیس NikeCourt Dri-FIT Rafa (صورتی)',
    brand: 'Nike',
    category: 'apparel',
    offers: [
      { store: 'ترب', priceToman: 6799000, url: 'https://torob.com/p/12ed3a58-9891-450c-b042-497941c7ddf7/%D8%AA%DB%8C-%D8%B4%D8%B1%D8%AA-%D8%AA%D9%86%DB%8C%D8%B3-%D9%85%D8%B1%D8%AF%D8%A7%D9%86%D9%87-%D9%86%D8%A7%DB%8C%DA%A9-rafa-challenger-nike-dri-fit-%D8%B3%D8%B1%D9%85%D9%87-%D8%A7%DB%8C/', condition: 'نو', note: 'ارزون‌ترین تیشرت تنیس نایک' },
    ],
  },
  {
    id: 'shop-nike-nikecourt-dri-fit-25',
    image: '/shop/shop-nike-nikecourt-dri-fit-25.jpg',
    name: 'تیشرت تنیس NikeCourt Dri-FIT (قرمز)',
    brand: 'Nike',
    category: 'apparel',
    offers: [
      { store: 'ترب', priceToman: 8599000, url: 'https://torob.com/p/12ed3a58-9891-450c-b042-497941c7ddf7/%D8%AA%DB%8C-%D8%B4%D8%B1%D8%AA-%D8%AA%D9%86%DB%8C%D8%B3-%D9%85%D8%B1%D8%AF%D8%A7%D9%86%D9%87-%D9%86%D8%A7%DB%8C%DA%A9-rafa-challenger-nike-dri-fit-%D8%B3%D8%B1%D9%85%D9%87-%D8%A7%DB%8C/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nike-nike-court-victory-dri-fi-26',
    image: '/shop/shop-nike-nike-court-victory-dri-fi-26.jpg',
    name: 'تیشرت تنیس Nike Court Victory Dri-FIT (طوسی)',
    brand: 'Nike',
    category: 'apparel',
    offers: [
      { store: 'ترب', priceToman: 10299000, url: 'https://torob.com/p/12ed3a58-9891-450c-b042-497941c7ddf7/%D8%AA%DB%8C-%D8%B4%D8%B1%D8%AA-%D8%AA%D9%86%DB%8C%D8%B3-%D9%85%D8%B1%D8%AF%D8%A7%D9%86%D9%87-%D9%86%D8%A7%DB%8C%DA%A9-rafa-challenger-nike-dri-fit-%D8%B3%D8%B1%D9%85%D9%87-%D8%A7%DB%8C/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nike-nike-dri-fit-rafa-challen-27',
    image: '/shop/shop-nike-nike-dri-fit-rafa-challen-27.jpg',
    name: 'تیشرت تنیس Nike Dri-FIT Rafa Challenger (نارنجی)',
    brand: 'Nike',
    category: 'apparel',
    offers: [
      { store: 'تنیس ۲۴ (ترب)', priceToman: 12099000, url: 'https://torob.com/p/12ed3a58-9891-450c-b042-497941c7ddf7/%D8%AA%DB%8C-%D8%B4%D8%B1%D8%AA-%D8%AA%D9%86%DB%8C%D8%B3-%D9%85%D8%B1%D8%AF%D8%A7%D9%86%D9%87-%D9%86%D8%A7%DB%8C%DA%A9-rafa-challenger-nike-dri-fit-%D8%B3%D8%B1%D9%85%D9%87-%D8%A7%DB%8C/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nike-nikecourt-advantage-dri-f-28',
    image: '/shop/shop-nike-nikecourt-advantage-dri-f-28.jpg',
    name: 'شلوارک تنیس NikeCourt Advantage Dri-FIT',
    brand: 'Nike',
    category: 'apparel',
    offers: [
      { store: 'ترب', priceToman: 18699000, url: 'https://torob.com/p/12ed3a58-9891-450c-b042-497941c7ddf7/%D8%AA%DB%8C-%D8%B4%D8%B1%D8%AA-%D8%AA%D9%86%DB%8C%D8%B3-%D9%85%D8%B1%D8%AF%D8%A7%D9%86%D9%87-%D9%86%D8%A7%DB%8C%DA%A9-rafa-challenger-nike-dri-fit-%D8%B3%D8%B1%D9%85%D9%87-%D8%A7%DB%8C/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-item-29',
    image: '/shop/shop-item-29.jpg',
    name: 'کیف تنیس و پدل (سفید/مشکی)',
    brand: 'متفرقه',
    category: 'bags',
    offers: [
      { store: 'اپکس تنیس (ترب)', priceToman: 6300000, url: 'https://torob.com/browse/4375/%DA%A9%DB%8C%D9%81-%D9%88-%D8%B3%D8%A7%DA%A9-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو', note: 'ارزون‌ترین کیف پدل' },
    ],
  },
  {
    id: 'shop-head-head-pro-x-court-bag-40l-30',
    image: '/shop/shop-head-head-pro-x-court-bag-40l-30.jpg',
    name: 'ساک تنیس Head Pro X Court Bag 40L',
    brand: 'Head',
    category: 'bags',
    offers: [
      { store: 'اسپرت سعید (ترب)', priceToman: 8500000, url: 'https://torob.com/browse/4375/%DA%A9%DB%8C%D9%81-%D9%88-%D8%B3%D8%A7%DA%A9-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو', note: '۴۰ لیتری' },
    ],
  },
  {
    id: 'shop-wilson-wilson-roland-garros-to-31',
    image: '/shop/shop-wilson-wilson-roland-garros-to-31.jpg',
    name: 'کوله تنیس Wilson Roland Garros Tour',
    brand: 'Wilson',
    category: 'bags',
    offers: [
      { store: 'ترب (۳ فروشگاه)', priceToman: 15000000, url: 'https://torob.com/browse/4375/%DA%A9%DB%8C%D9%81-%D9%88-%D8%B3%D8%A7%DA%A9-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-head-head-coello-tour-padel-ba-32',
    image: '/shop/shop-head-head-coello-tour-padel-ba-32.jpg',
    name: 'ساک پدل Head Coello Tour Padel Bag L',
    brand: 'Head',
    category: 'bags',
    offers: [
      { store: 'تنیسفا (tennisfa.com)', priceToman: 29200000, url: 'https://tennisfa.com/shop/product-category/padel/', condition: 'نو', note: 'کالکشن آرتورو کوئلو، ظرفیت ۷ راکت' },
    ],
  },
  {
    id: 'shop-vs-vs-33',
    image: '/shop/shop-vs-vs-33.jpg',
    name: 'اورگریپ VS (تکی)',
    brand: 'VS',
    category: 'accessories',
    offers: [
      { store: 'ترب (۴ فروشگاه)', priceToman: 150000, url: 'https://torob.com/browse/4371/%DA%AF%D8%B1%DB%8C%D9%BE-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو', note: 'ارزون‌ترین اورگریپ' },
    ],
  },
  {
    id: 'shop-wilson-wilson-comfort-34',
    image: '/shop/shop-wilson-wilson-comfort-34.jpg',
    name: 'اورگریپ Wilson Comfort (تکی)',
    brand: 'Wilson',
    category: 'accessories',
    offers: [
      { store: 'ترب (۷ فروشگاه)', priceToman: 250000, url: 'https://torob.com/browse/4371/%DA%AF%D8%B1%DB%8C%D9%BE-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-head-head-xtreme-soft-35',
    image: '/shop/shop-head-head-xtreme-soft-35.jpg',
    name: 'اورگریپ Head Xtreme Soft (تکی، قرمز)',
    brand: 'Head',
    category: 'accessories',
    offers: [
      { store: 'ترب (۶ فروشگاه)', priceToman: 400000, url: 'https://torob.com/browse/4371/%DA%AF%D8%B1%DB%8C%D9%BE-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-nox-nox-pro-colors-36',
    image: '/shop/shop-nox-nox-pro-colors-36.jpg',
    name: 'اورگریپ Nox Pro Colors',
    brand: 'Nox',
    category: 'accessories',
    offers: [
      { store: 'سین دال (ترب)', priceToman: 700000, url: 'https://torob.com/browse/4371/%DA%AF%D8%B1%DB%8C%D9%BE-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو' },
    ],
  },
  {
    id: 'shop-head-head-xtreme-track-37',
    image: '/shop/shop-head-head-xtreme-track-37.jpg',
    name: 'اورگریپ Head Xtreme Track (۳ عددی)',
    brand: 'Head',
    category: 'accessories',
    offers: [
      { store: 'تنیسفا (ترب)', priceToman: 1245000, url: 'https://torob.com/browse/4371/%DA%AF%D8%B1%DB%8C%D9%BE-%D8%B1%D8%A7%DA%A9%D8%AA/', condition: 'نو', note: 'پک ۳ عددی' },
    ],
  },
  {
    id: 'shop-seed-kuikma-1',
    image: '/shop/shop-seed-kuikma-1.jpg',
    name: 'راکت Kuikma PR Open',
    brand: 'Kuikma',
    category: 'racket',
    description: 'انتخاب اقتصادی برای شروع؛ سبک و خوش‌دست.',
    offers: [
      { store: 'ترب', priceToman: 13500000, url: 'https://torob.com/search/?query=kuikma%20pr%20open', condition: 'نو', note: 'ارزون‌ترین راکت نو' },
    ],
  },
  {
    id: 'shop-seed-tuyo-1',
    image: '/shop/shop-seed-tuyo-1.jpg',
    name: 'راکت Tuyo Tyro',
    brand: 'Tuyo',
    category: 'racket',
    offers: [
      { store: 'ترب', priceToman: 14400000, url: 'https://torob.com/search/?query=tuyo%20tyro', condition: 'نو' },
    ],
  },
  {
    id: 'shop-seed-nordic-1',
    image: '/shop/shop-seed-nordic-1.jpg',
    name: 'راکت NORDICDOTS Fiesta',
    brand: 'NORDICDOTS',
    category: 'racket',
    offers: [
      { store: 'ترب', priceToman: 15500000, url: 'https://torob.com/search/?query=nordicdots%20fiesta', condition: 'نو' },
    ],
  },
  {
    id: 'shop-seed-set-1',
    image: '/shop/shop-seed-set-1.jpg',
    name: 'ست ۲ راکت کربن + کیف + توپ',
    brand: 'Carbon',
    category: 'racket',
    description: 'ست کامل شروع؛ دو راکت کربن نو با کیف و توپ.',
    offers: [
      { store: 'دیوار تهران', priceToman: 16800000, url: 'https://divar.ir/s/tehran?q=%D8%B1%D8%A7%DA%A9%D8%AA%20%D9%BE%D8%AF%D9%84', condition: 'نو' },
    ],
  },
  {
    id: 'shop-seed-nox-1',
    image: '/shop/shop-seed-nox-1.jpg',
    name: 'راکت Nox Genius Ultralight',
    brand: 'Nox',
    category: 'racket',
    description: 'فوق‌سبک، مناسب بازیکن‌های تکنیکی.',
    offers: [
      { store: 'اینستاگرام @tennisfa_shop', priceToman: 25000000, url: 'https://www.instagram.com/tennisfa_shop', condition: 'نو', note: 'قیمت تقریبی از روی پست' },
    ],
  },
];
