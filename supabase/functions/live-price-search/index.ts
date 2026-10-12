// Supabase Edge Function: live-price-search
// Live cheapest-price search across Torob + tennisfa.com.
// Deploy: Supabase Dashboard → Edge Functions → New function → paste this file → Deploy.
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
      if (title && price && price > 0) {
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
      if (title && toman > 0) {
        offers.push({ store: 'تنیسفا', title, priceToman: toman, url, verified: true });
      }
    }
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

    const [torob, tennisfa] = await Promise.all([searchTorob(q), searchTennisfa(q)]);
    const offers = [...torob, ...tennisfa]
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
