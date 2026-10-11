import React, { useMemo, useState } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  X,
  ExternalLink,
  BadgeCheck,
  Store,
  Tag,
} from 'lucide-react';
import {
  ShopProduct,
  ShopCategory,
  SHOP_CATEGORY_LABELS,
  bestOffer,
} from '../types';
import { SHOP_CATALOG, SHOP_LAST_UPDATED } from '../shopCatalog';
import { WaterRipple } from './WaterRipple';
import { Bubbles } from './Bubbles';

const CATEGORY_ICONS: Record<ShopCategory, string> = {
  racket: '🎾',
  balls: '🟡',
  shoes: '👟',
  apparel: '👕',
  bags: '🎒',
  accessories: '🧤',
};

/** Normalize Persian text for search: ي→ی, ك→ک, remove tatweel/diacritics. */
function normalizeFa(s: string): string {
  return s
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function formatPrice(t: number): string {
  if (t >= 1_000_000) {
    const m = t / 1_000_000;
    const str = Number.isInteger(m) ? m.toString() : m.toFixed(1);
    return `${Number(str).toLocaleString('fa-IR')} میلیون تومان`;
  }
  return `${t.toLocaleString('fa-IR')} تومان`;
}

const ProductCard: React.FC<{ p: ShopProduct; onOpen: () => void }> = ({ p, onOpen }) => {
  const best = bestOffer(p);
  return (
    <WaterRipple className="rounded-3xl">
    <button
      onClick={onOpen}
      className="group w-full text-right rounded-3xl overflow-hidden bg-gradient-to-b from-[#1c1611] to-[#14100c] border border-amber-100/10 hover:border-amber-400/40 transition cursor-pointer shadow-lg active:scale-[0.98]"
    >
      {/* Image placeholder — distinct warm gradient per category */}
      <div className="h-28 flex items-center justify-center bg-gradient-to-br from-amber-500/15 via-[#1c1611] to-[#14100c] relative">
        <span className="text-5xl filter drop-shadow-lg group-hover:scale-110 transition-transform">
          {CATEGORY_ICONS[p.category]}
        </span>
        {p.offers.length > 1 && (
          <span className="absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black flex items-center gap-1">
            <BadgeCheck className="w-3 h-3" />
            بهترین قیمت
          </span>
        )}
      </div>
      <div className="p-3.5 space-y-1.5">
        <p className="text-[10px] font-bold text-amber-400/80">
          {p.brand} • {SHOP_CATEGORY_LABELS[p.category]}
        </p>
        <h3 className="text-[13px] font-black text-stone-100 leading-6 line-clamp-2 min-h-[3rem]">
          {p.name}
        </h3>
        {best?.priceToman != null ? (
          <p className="text-sm font-black text-amber-300">{formatPrice(best.priceToman)}</p>
        ) : (
          <p className="text-xs font-bold text-stone-400">قیمت: دایرکت</p>
        )}
        <p className="text-[10px] text-stone-500 flex items-center gap-1">
          <Store className="w-3 h-3" />
          {p.offers.length.toLocaleString('fa-IR')} پیشنهاد • {best?.store ?? '—'}
        </p>
      </div>
    </button>
    </WaterRipple>
  );
};

const ProductSheet: React.FC<{ p: ShopProduct; onClose: () => void }> = ({ p, onClose }) => {
  const sorted = useMemo(
    () =>
      [...p.offers].sort((a, b) => {
        if (a.priceToman == null) return 1;
        if (b.priceToman == null) return -1;
        return a.priceToman - b.priceToman;
      }),
    [p]
  );
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-[2px] menu-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
    >
      <div
        className="sheet-slide-up w-full max-w-lg rounded-t-3xl bg-[#171310] border border-amber-100/10 border-b-0 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>
        <div className="flex items-start gap-3 px-5 pb-4 border-b border-white/10">
          <span className="text-4xl">{CATEGORY_ICONS[p.category]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-amber-400/80">
              {p.brand} • {SHOP_CATEGORY_LABELS[p.category]}
            </p>
            <h3 className="text-base font-black text-stone-100">{p.name}</h3>
            {p.description && <p className="text-[11px] text-stone-400 mt-1">{p.description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.06] text-stone-400 hover:text-stone-100 transition cursor-pointer shrink-0"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="px-5 pt-3 pb-1 text-[11px] font-bold text-stone-400 flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-amber-400" />
          پیشنهادها (ارزون‌ترین اول)
        </p>
        <div className="px-4 pb-6 max-h-[50vh] overflow-y-auto space-y-2">
          {sorted.map((o, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-2xl border ${
                i === 0 && o.priceToman != null
                  ? 'bg-amber-400/10 border-amber-400/40'
                  : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-stone-100 flex items-center gap-1.5">
                  {o.store}
                  {i === 0 && o.priceToman != null && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-black">
                      بهترین قیمت
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {o.condition}
                  {o.note ? ` • ${o.note}` : ''}
                </p>
              </div>
              {o.priceToman != null ? (
                <p className="text-sm font-black text-amber-300 shrink-0">{formatPrice(o.priceToman)}</p>
              ) : (
                <p className="text-[11px] font-bold text-stone-400 shrink-0">دایرکت</p>
              )}
              <WaterRipple className="shrink-0 rounded-xl">
              <a
                href={o.url}
                target="_blank"
                rel="noreferrer"
                className="block p-2.5 rounded-xl bg-amber-400 text-black hover:bg-amber-300 transition active:scale-90"
                aria-label={`مشاهده در ${o.store}`}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              </WaterRipple>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ShopView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | ShopCategory>('all');
  const [openProduct, setOpenProduct] = useState<ShopProduct | null>(null);

  const results = useMemo(() => {
    const q = normalizeFa(query);
    return SHOP_CATALOG.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      const hay = normalizeFa(
        `${p.name} ${p.brand} ${SHOP_CATEGORY_LABELS[p.category]} ${p.description ?? ''}`
      );
      return q.split(' ').every((w) => hay.includes(w));
    });
  }, [query, category]);

  const categories: ('all' | ShopCategory)[] = [
    'all',
    'racket',
    'balls',
    'shoes',
    'apparel',
    'bags',
    'accessories',
  ];

  return (
    <div className="space-y-5 relative">
      {/* Underwater ambiance: rising + bursting bubbles behind the content */}
      <Bubbles count={14} className="z-0" />
      <div className="relative z-10 space-y-5">
      {/* Distinct shop header — warm bazaar feel */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-500/20 via-[#1c1410] to-[#14100c] border border-amber-400/25 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h1 className="text-xl font-black text-stone-100 underwater-shimmer rounded-lg">فروشگاه پدل</h1>
            <p className="text-xs text-stone-400 mt-1">
              بهترین قیمت راکت، توپ، کفش و لباس از فروشگاه‌های ایران
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 font-bold">
            <Sparkles className="w-3 h-3" />
            رصد هوشمند قیمت با هوش مصنوعی
          </span>
          <span className="text-stone-500">آخرین به‌روزرسانی: {SHOP_LAST_UPDATED}</span>
        </div>
      </div>

      {/* Search box */}
      <div className="sticky top-16 sm:top-20 z-20">
        <div className="relative">
          <Search className="w-5 h-5 text-amber-400/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو: راکت بولپدل، توپ، کفش..."
            className="w-full bg-[#1c1611]/95 backdrop-blur border border-amber-100/15 rounded-2xl py-3.5 pr-12 pl-10 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-400/60 outline-none shadow-lg"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-500 hover:text-stone-200 cursor-pointer"
              aria-label="پاک کردن جستجو"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => {
          const active = category === c;
          return (
            <WaterRipple key={c} className="shrink-0 rounded-xl">
            <button
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer border active:scale-95 ${
                active
                  ? 'bg-amber-400 text-black border-amber-400'
                  : 'bg-white/[0.05] text-stone-400 border-white/10 hover:border-amber-400/40'
              }`}
            >
              {c === 'all' ? 'همه' : `${CATEGORY_ICONS[c]} ${SHOP_CATEGORY_LABELS[c]}`}
            </button>
            </WaterRipple>
          );
        })}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-4xl">🔍</p>
          <p className="text-sm font-bold text-stone-300">چیزی پیدا نشد</p>
          <p className="text-xs text-stone-500">
            عبارت دیگه‌ای رو امتحان کن؛ مثلاً «راکت» یا اسم برند
          </p>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-stone-500">
            {results.length.toLocaleString('fa-IR')} کالا
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((p) => (
              <ProductCard key={p.id} p={p} onOpen={() => setOpenProduct(p)} />
            ))}
          </div>
        </>
      )}

      {/* Disclaimer */}
      <p className="text-center text-[10px] text-stone-600 leading-5 pt-2">
        قیمت‌ها از فروشگاه‌های اینترنتی و پیج‌های اینستاگرامی رصد می‌شن و تقریبی‌اند؛
        <br />
        قبل از خرید، قیمت نهایی رو با فروشنده چک کن.
      </p>

      {openProduct && (
        <ProductSheet p={openProduct} onClose={() => setOpenProduct(null)} />
      )}
      </div>
    </div>
  );
};
