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
 * Live cheapest-price search via the `smooth-action` Edge Function.
 * (Deployed name in Supabase dashboard; code lives at
 * supabase/functions/live-price-search/index.ts in the repo.)
 * Searches Torob + tennisfa.com in real time, verifies availability,
 * returns cheapest-first.
 * Returns null when the function is not deployed / unreachable.
 */
export async function livePriceSearch(query: string): Promise<LivePriceOffer[] | null> {
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
