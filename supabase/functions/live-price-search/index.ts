// Supabase Edge Function: live-price-search
// Live cheapest-price search across Torob + tennisfa.com + tennisshop.ir + alo-varzesh.
// Auto-deployed via Supabase ↔ GitHub integration.
// Invoke: supabase.functions.invoke('live-price-search', { body: { query: 'راکت پدل' } })

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

interface LiveOffer {
  store: string;
  title: string;
  priceToman: number;
  url: string;
  sellers?: number;
  verified: boolean; // true = availability confirmed on product page
}

function normalizeFa(s: string): string {
  return s
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ً-ٖـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

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
};

function termInTitle(title: string, term: string): boolean {
  if (title.includes(term)) return true;
  return (TERM_EQUIVS[term] ?? []).some((e) => title.includes(e));
}

/** Relevance filter: hit must be padel gear with a distinctive query term. */
function isPadelRelevant(titleRaw: string, queryRaw: string): boolean {
  const title = normalizeFa(titleRaw);
  const query = normalizeFa(queryRaw);
  if (!title.includes('پدل') && !title.includes('padel')) return false;
  const GENERIC = new Set([
    'پدل', 'padel', 'راکت', 'racket', 'توپ', 'ball', 'balls',
    'کفش', 'shoe', 'shoes', 'قیمت', 'خرید', 'جدید', 'اصل', 'اورجینال',
    'مردانه', 'زنانه', 'بچگانه', 'کودکان',
  ]);
  const terms = query.split(/\s+/).filter((t) => t.length > 1 && !GENERIC.has(t));
  if (terms.length === 0) return true;
  return terms.some((t) => termInTitle(title, t));
}

/** Parse Torob search page → top product cards */
async function searchTorob(query: string): Promise<LiveOffer[]> {
  try {
    const res = await fetch(
      `https://torob.com/search/?query=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': UA } },
    );
    if (!res.ok) return [];
    const html = await res.text();

    const cardStarts: number[] = [];
    const re = /<div data-testid="product-card">/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) && cardStarts.length < 12) cardStarts.push(m.index);

    const offers: LiveOffer[] = [];
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

    // Verify availability for the 5 cheapest: fetch product page, take cheapest ACTIVE seller
    const top = offers.sort((a, b) => a.priceToman - b.priceToman).slice(0, 5);
    await Promise.all(
      top.map(async (o) => {
        try {
          const r = await fetch(o.url, { headers: { 'User-Agent': UA } });
          if (!r.ok) return;
          const ph = await r.text();
          const sellerRe = /"price":(\d+),"price_text":"([^"]+)","price_text_striked":"[^"]*","price_text_mode":"([^"]+)"/g;
          let sm: RegExpExecArray | null;
          let best: number | null = null;
          while ((sm = sellerRe.exec(ph))) {
            const p = parseInt(sm[1], 10);
            const mode = sm[3];
            if (p > 0 && mode === 'active' && (best === null || p < best)) best = p;
          }
          if (best !== null) {
            o.priceToman = best;
            o.verified = true;
          }
        } catch {
          /* keep search-page price, unverified */
        }
      }),
    );

    // Drop offers that failed verification AND drop the rest unverified beyond top-5
    return top
      .filter((o) => o.verified)
      .sort((a, b) => a.priceToman - b.priceToman);
  } catch {
    return [];
  }
}

/** Parse tennisfa.com WooCommerce search → products (prices stored as Rial ÷10 = Toman) */
async function searchTennisfa(query: string): Promise<LiveOffer[]> {
  try {
    const res = await fetch(
      `https://tennisfa.com/shop/?s=${encodeURIComponent(query)}&post_type=product`,
      { headers: { 'User-Agent': UA } },
    );
    if (!res.ok) return [];
    const html = await res.text();

    const offers: LiveOffer[] = [];
    // Product blocks: Woodmart theme — <a class="product-image-link"> then <h3 class="wd-entities-title">
    const linkRe = /<a[^>]*href="(https:\/\/tennisfa\.com\/shop\/product\/[^"]+)"[^>]*class="product-image-link"[^>]*>/g;
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
      const rawPrice = priceM ? priceM[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : null;
      const rialM = rawPrice ? rawPrice.match(/([\d,]+)/) : null;
      const rial = rialM ? parseInt(rialM[1].replace(/,/g, ''), 10) : 0;
      const toman = Math.round(rial / 10);
      if (title && toman > 0 && isPadelRelevant(title, query)) {
        offers.push({ store: 'تنیسفا', title, priceToman: toman, url, verified: true });
      }
    }
    return offers.sort((a, b) => a.priceToman - b.priceToman).slice(0, 5);
  } catch {
    return [];
  }
}

/** Generic Woodmart shop (tennisshop.ir: Toman-direct, divisor=1) */
async function searchWoodmart(
  query: string, baseUrl: string, storeName: string, priceDivisor: number,
): Promise<LivePriceOffer[]> {
  try {
    let html: string | null = null;
    for (const u of [
      `${baseUrl}/shop/?s=${encodeURIComponent(query)}&post_type=product`,
      `${baseUrl}/?s=${encodeURIComponent(query)}&post_type=product`,
    ]) {
      const r = await fetch(u, { headers: { 'User-Agent': UA } });
      if (r.ok) {
        const t = await r.text();
        if (t.includes('product-image-link')) {
          html = t;
          break;
        }
      }
    }
    if (!html) return [];
    const host = baseUrl.replace('https://', '');
    const linkRe = new RegExp(
      `<a[^>]*href="(https:\\/\\/${host.replace(/\./g, '\\.')}\\/[^"]*?)"[^>]*class="product-image-link"[^>]*>`,
      'g',
    );
    const offers: LivePriceOffer[] = [];
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
  } catch {
    return [];
  }
}

async function searchAlovarzesh(query: string): Promise<LivePriceOffer[]> {
  try {
    const res = await fetch(
      `https://shop.alo-varzesh.com/?s=${encodeURIComponent(query)}&post_type=product`,
      { headers: { 'User-Agent': UA } },
    );
    if (!res.ok) return [];
    const html = await res.text();
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
        try {
          const r = await fetch(url, { headers: { 'User-Agent': UA } });
          if (!r.ok) return;
          const ph = await r.text();
          const titleM =
            ph.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/) ||
            ph.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
          const title = titleM ? titleM[1].replace(/<[^>]+>/g, '').trim() : null;
          const priceM = ph.match(/woocommerce-Price-amount[^>]*><bdi>([\d,]+)/);
          const toman = priceM ? parseInt(priceM[1].replace(/,/g, ''), 10) : 0;
          const outOfStock = /ناموجود/.test(ph.slice(0, 30000));
          if (title && toman > 0 && !outOfStock && isPadelRelevant(title, query)) {
            offers.push({ store: 'الو ورزش', title, priceToman: toman, url, verified: true });
          }
        } catch {
          /* skip */
        }
      }),
    );
    return offers.sort((a, b) => a.priceToman - b.priceToman).slice(0, 5);
  } catch {
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const { query } = await req.json();
    const q = (query ?? '').toString().trim();
    if (q.length < 2) {
      return Response.json({ offers: [] }, { headers: corsHeaders });
    }

    const [torob, tennisfa, tennisshop, alovarzesh] = await Promise.all([
      searchTorob(q),
      searchTennisfa(q),
      searchWoodmart(q, 'https://tennisshop.ir', 'تنیس‌شاپ', 1),
      searchAlovarzesh(q),
    ]);
    const offers = [...torob, ...tennisfa, ...tennisshop, ...alovarzesh]
      .sort((a, b) => a.priceToman - b.priceToman)
      .slice(0, 10);

    return Response.json({ offers }, { headers: corsHeaders });
  } catch (e) {
    return Response.json(
      { offers: [], error: String(e) },
      { status: 500, headers: corsHeaders },
    );
  }
});
