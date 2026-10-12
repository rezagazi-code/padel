import { getSupabase } from './supabase';

export interface LivePriceOffer {
  store: string;
  title: string;
  priceToman: number;
  url: string;
  sellers?: number;
  verified: boolean;
}

/**
 * Live cheapest-price search via the `live-price-search` Edge Function.
 * Searches Torob + tennisfa.com in real time, verifies availability,
 * returns cheapest-first. Requires the function to be deployed
 * (Supabase Dashboard → Edge Functions).
 * Returns null when the function is not deployed / unreachable.
 */
export async function livePriceSearch(query: string): Promise<LivePriceOffer[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb.functions.invoke('live-price-search', {
      body: { query },
    });
    if (error) return null;
    const offers = (data as { offers?: LivePriceOffer[] })?.offers;
    return Array.isArray(offers) ? offers : [];
  } catch {
    return null;
  }
}
