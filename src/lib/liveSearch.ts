import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { getSupabase } from './supabase';

export interface LivePriceOffer {
  store: string;
  title: string;
  priceToman: number;
  url: string;
  sellers?: number;
  verified: boolean;
}

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const FA_DIGITS: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
  '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
};
function faToInt(s: string): number | null {
  const norm = s
    .split('')
    .map((c) => FA_DIGITS[c] ?? c)
    .join('')
    .replace(/[٫,٬\s]/g, '');
  return /^\d+$/.test(norm) ? parseInt(norm, 10) : null;
}

/** Normalize Persian text: ي→ی, ك→ک, remove tatweel/diacritics. */
function normalizeFa(s: string): string {
  return s
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ً-ٖـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Latin ↔ Persian equivalents for common padel brands/models. */
const TERM_EQUIVS: Record<string, string[]> = {
  'viper': ['وایپر'], 'وایپر': ['viper'],
  'bullpadel': ['بولپدل', 'بول پدل'], 'بولپدل': ['bullpadel'],
  'vertex': ['ورتکس'], 'ورتکس': ['vertex'],
  'head': ['هد'], 'هد': ['head'],
  'adidas': ['آدیداس'], 'آدیداس': ['adidas'],
  'metalbone': ['متالبون'], 'متالبون': ['metalbone'],
  'babolat': ['بابولات'], 'بابولات': ['babolat'],
  'nox': ['ناکس'], 'ناکس': ['nox'],
  'siux': ['سیوکس'], 'سیوکس': ['siux'],
  'dunlop': ['دانلوپ'], 'دانلوپ': ['dunlop'],
  'boost': ['بوست'], 'بوست': ['boost'],
  'wilson': ['ویلسون'], 'ویلسون': ['wilson'],
  'yonex': ['یونکس'], 'یونکس': ['yonex'],
  'kuikma': ['کوئیکما', 'کویکما'],
  'artengo': ['آرتنگو'], 'آرتنگو': ['artengo'],
  'drop shot': ['دراپ شات'], 'hack': ['هک'],
  'flow': ['فلو'], 'indiga': ['ایندیگا'],
};

function termInTitle(title: string, term: string): boolean {
  if (title.includes(term)) return true;
  const equivs = TERM_EQUIVS[term] ?? [];
  return equivs.some((e) => title.includes(e));
}

/**
 * Relevance filter: a live-search hit must actually be padel gear.
 * Requires (1) a padel indicator in the title and (2) at least one
 * distinctive query term (brand/model) in the title — so "viper" no
 * longer matches a Razer mouse or a wiper blade.
 */
export function isPadelRelevant(titleRaw: string, queryRaw: string): boolean {
  const title = normalizeFa(titleRaw);
  const query = normalizeFa(queryRaw);

  // 1. Must be padel-related
  if (!title.includes('پدل') && !title.includes('padel')) return false;

  // 2. Must match at least one distinctive (non-generic) query term
  const GENERIC = new Set([
    'پدل', 'padel', 'راکت', 'racket', 'راکت‌ها', 'توپ', 'ball', 'balls',
    'کفش', 'shoe', 'shoes', 'قیمت', 'خرید', 'جدید', 'اصل', 'اورجینال',
    'مردانه', 'زنانه', 'بچگانه', 'کودکان',
  ]);
  const terms = query.split(/\s+/).filter((t) => t.length > 1 && !GENERIC.has(t));
  if (terms.length === 0) return true;

  return terms.some((t) => termInTitle(title, t));
}

/** Native HTTP GET (bypasses CORS on Android/iOS). Returns body text or null. */
async function nativeGet(url: string): Promise<string | null> {
  try {
    const res = await CapacitorHttp.get({
      url,
      headers: { 'User-Agent': UA },
      connectTimeout: 15000,
      readTimeout: 20000,
    });
    if (res.status >= 200 && res.status < 300 && typeof res.data === 'string') {
      return res.data;
    }
    return null;
  } catch {
    return null;
  }
}

async function searchTorobNative(query: string): Promise<LivePriceOffer[]> {
  const html = await nativeGet(`https://torob.com/search/?query=${encodeURIComponent(query)}`);
  if (!html) return [];

  const cardStarts: number[] = [];
  const re = /<div data-testid="product-card">/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && cardStarts.length < 12) cardStarts.push(m.index);

  const offers: LivePriceOffer[] = [];
  for (const start of cardStarts) {
    const back = html.slice(Math.max(0, start - 2000), start);
    const hrefs = [...back.matchAll(/href="(\/p\/[a-f0-9-]{36}\/[^"]*)"/g)];
    if (!hrefs.length) continue;
    const url = 'https://torob.com' + hrefs[hrefs.length - 1][1];

    const card = html.slice(start, start + 4000);
    const titleM = card.match(/<h2[^>]*>(.*?)<\/h2>/s);
    const title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : null;
    const priceM = card.match(/(?:از\s+)?([۰-۹٫,\d]+)\s*تومان/);
    const price = priceM ? faToInt(priceM[1]) : null;
    const sellerM = card.match(/در\s+([۰-۹\d]+)\s*فروشگاه/);
    const sellers = sellerM ? faToInt(sellerM[1]) ?? 1 : 1;
    if (title && price && price > 0 && isPadelRelevant(title, query)) {
      offers.push({ store: 'ترب', title, priceToman: price, url, sellers, verified: false });
    }
  }

  // Verify availability for the 5 cheapest (skip ناموجود sellers)
  const top = offers.sort((a, b) => a.priceToman - b.priceToman).slice(0, 5);
  await Promise.all(
    top.map(async (o) => {
      const ph = await nativeGet(o.url);
      if (!ph) return;
      const sellerRe = /"price":(\d+),"price_text":"([^"]+)","price_text_striked":"[^"]*","price_text_mode":"([^"]+)"/g;
      let sm: RegExpExecArray | null;
      let best: number | null = null;
      while ((sm = sellerRe.exec(ph))) {
        const p = parseInt(sm[1], 10);
        if (p > 0 && sm[3] === 'active' && (best === null || p < best)) best = p;
      }
      if (best !== null) {
        o.priceToman = best;
        o.verified = true;
      }
    }),
  );

  return top.filter((o) => o.verified).sort((a, b) => a.priceToman - b.priceToman);
}

async function searchTennisfaNative(query: string): Promise<LivePriceOffer[]> {
  return searchWoodmartShop(query, 'https://tennisfa.com', 'تنیسفا', 10);
}

/**
 * Generic Woodmart/WooCommerce shop search.
 * @param baseUrl shop base URL
 * @param storeName Persian display name
 * @param priceDivisor divide raw price by this to get Toman (tennisfa stores Rial → 10; tennisshop.ir is already Toman → 1)
 */
async function searchWoodmartShop(
  query: string,
  baseUrl: string,
  storeName: string,
  priceDivisor: number,
): Promise<LivePriceOffer[]> {
  const html = await nativeGet(
    `${baseUrl}/shop/?s=${encodeURIComponent(query)}&post_type=product`,
  );
  if (!html) {
    // tennisshop.ir uses ?s= at root instead of /shop/
    const alt = await nativeGet(`${baseUrl}/?s=${encodeURIComponent(query)}&post_type=product`);
    if (!alt) return [];
    return parseWoodmartHtml(alt, baseUrl, storeName, priceDivisor, query);
  }
  return parseWoodmartHtml(html, baseUrl, storeName, priceDivisor, query);
}

function parseWoodmartHtml(
  html: string,
  baseUrl: string,
  storeName: string,
  priceDivisor: number,
  query: string,
): LivePriceOffer[] {
  const offers: LivePriceOffer[] = [];
  const host = baseUrl.replace('https://', '').replace('http://', '');
  const linkRe = new RegExp(
    `<a[^>]*href="(https:\\/\\/${host.replace(/\./g, '\\.')}\\/[^"]*?)"[^>]*class="product-image-link"[^>]*>`,
    'g',
  );
  const seen = new Set<string>();
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(html)) && offers.length < 10) {
    const url = lm[1];
    if (seen.has(url)) continue;
    seen.add(url);
    const chunk = html.slice(lm.index, lm.index + 8000);
    const titleM = chunk.match(/<h3 class="wd-entities-title"><a[^>]*>([\s\S]*?)<\/a>/);
    const title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : null;
    const priceM = chunk.match(/woocommerce-Price-amount[^>]*>([\s\S]*?)<\/span>/);
    const raw = priceM ? priceM[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : null;
    const numM = raw ? raw.match(/([\d,]+)/) : null;
    const toman = numM ? Math.round(parseInt(numM[1].replace(/,/g, ''), 10) / priceDivisor) : 0;
    if (title && toman > 0 && isPadelRelevant(title, query)) {
      offers.push({ store: storeName, title, priceToman: toman, url, verified: true });
    }
  }
  return offers.sort((a, b) => a.priceToman - b.priceToman).slice(0, 5);
}

async function searchTennisshopNative(query: string): Promise<LivePriceOffer[]> {
  return searchWoodmartShop(query, 'https://tennisshop.ir', 'تنیس‌شاپ', 1);
}

/** Alovarzesh: WooCommerce; search page lists products but prices need product-page fetch. */
async function searchAlovarzeshNative(query: string): Promise<LivePriceOffer[]> {
  const html = await nativeGet(
    `https://shop.alo-varzesh.com/?s=${encodeURIComponent(query)}&post_type=product`,
  );
  if (!html) return [];

  const linkRe = /<a[^>]*href="(https:\/\/shop\.alo-varzesh\.com\/product\/[^"]+)"[^>]*>/g;
  const seen = new Set<string>();
  const urls: string[] = [];
  let lm: RegExpExecArray | null;
  while ((lm = linkRe.exec(html)) && urls.length < 6) {
    if (!seen.has(lm[1])) {
      seen.add(lm[1]);
      urls.push(lm[1]);
    }
  }

  const offers: LivePriceOffer[] = [];
  await Promise.all(
    urls.map(async (url) => {
      const ph = await nativeGet(url);
      if (!ph) return;
      const titleM =
        ph.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/) ||
        ph.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      const title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : null;
      // First in-stock price on the page (variable products list a price range)
      const priceM = ph.match(/woocommerce-Price-amount[^>]*><bdi>([\d,]+)/);
      const toman = priceM ? parseInt(priceM[1].replace(/,/g, ''), 10) : 0;
      const outOfStock = /ناموجود/.test(ph.slice(0, 30000));
      if (title && toman > 0 && !outOfStock && isPadelRelevant(title, query)) {
        offers.push({ store: 'الو ورزش', title, priceToman: toman, url, verified: true });
      }
    }),
  );
  return offers.sort((a, b) => a.priceToman - b.priceToman).slice(0, 5);
}

/** Edge Function fallback (for web build / when native HTTP unavailable). */
async function searchViaEdgeFunction(query: string): Promise<LivePriceOffer[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.functions.invoke('smooth-action', {
      body: { query },
    });
    if (error) return null;
    const offers = (data as { offers?: LivePriceOffer[] })?.offers;
    return Array.isArray(offers) ? offers : [];
  } catch {
    return null;
  }
}

/**
 * Live cheapest-price search.
 * On the native app: fetches Torob + tennisfa directly (no CORS in native layer),
 * verifies availability, cheapest-first. No Supabase deploy needed.
 * On web: falls back to the `smooth-action` Edge Function if deployed.
 * Returns null when unavailable.
 */
export async function livePriceSearch(query: string): Promise<LivePriceOffer[] | null> {
  const q = query.trim();
  if (q.length < 2) return [];

  if (Capacitor.isNativePlatform()) {
    try {
      const [torob, tennisfa, tennisshop, alovarzesh] = await Promise.all([
        searchTorobNative(q),
        searchTennisfaNative(q),
        searchTennisshopNative(q),
        searchAlovarzeshNative(q),
      ]);
      const offers = [...torob, ...tennisfa, ...tennisshop, ...alovarzesh]
        .sort((a, b) => a.priceToman - b.priceToman)
        .slice(0, 10);
      if (offers.length > 0) return offers;
      // Native returned nothing — try edge function as backup
    } catch {
      /* fall through to edge function */
    }
  }

  return searchViaEdgeFunction(q);
}
