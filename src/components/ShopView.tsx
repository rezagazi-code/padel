import React, { useMemo, useState } from 'react';
import {
  Search,
  ShoppingBag,
  Sparkles,
  X,
  ExternalLink,
  Store,
  Tag,
  Zap,
  BadgeCheck,
  Loader2,
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
import { livePriceSearch, LivePriceOffer } from '../lib/liveSearch';
import { Capacitor } from '@capacitor/core';

/** Normalize Persian text for search: ي→ی, ك→ک, remove tatweel/diacritics. */
function normalizeFa(s: string): string {
  return s
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[ً-ٖـ]/g, '')
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

/** Product photo with skeleton shimmer until loaded. */
const ProductPhoto: React.FC<{ p: ShopProduct; eager?: boolean }> = ({ p, eager }) => {
  const [loaded, setLoaded] = useState(false);
  if (!p.image) return null;
  return (
    <div className={`relative ${loaded ? '' : 'img-loading'} rounded-[18px]`}>
      <img
        src={p.image}
        alt={p.name}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        className="product-photo"
        style={loaded ? undefined : { visibility: 'hidden' }}
      />
    </div>
  );
};

const ProductCard: React.FC<{ p: ShopProduct; onOpen: () => void; eager?: boolean }> = ({
  p,
  onOpen,
  eager,
}) => {
  const best = bestOffer(p);
  return (
    <WaterRipple className="rounded-[26px] h-full">
      <button
        onClick={onOpen}
        className="product-card w-full h-full text-right cursor-pointer flex flex-col"
      >
        <div className="relative">
          <ProductPhoto p={p} eager={eager} />
          {p.offers.length > 1 && best?.priceToman != null && (
            <span className="best-price">بهترین قیمت</span>
          )}
        </div>
        <div className="p-3.5 pt-2.5 flex flex-col gap-1 flex-1">
          <p className="text-[10px] font-bold text-[#5B6B7F]">
            {p.brand} • {SHOP_CATEGORY_LABELS[p.category]}
          </p>
          <h3 className="text-[13px] font-bold text-[#0E1B2C] leading-6 line-clamp-2 min-h-[3rem]">
            {p.name}
          </h3>
          {best?.priceToman != null ? (
            <p className="text-[15px] font-extrabold text-[#0E1B2C] tabular-nums">
              {formatPrice(best.priceToman)}
            </p>
          ) : (
            <p className="text-xs font-bold text-[#5B6B7F]">قیمت: دایرکت</p>
          )}
          <p className="text-[10px] text-[#5B6B7F] flex items-center gap-1">
            <Store className="w-3 h-3" />
            {p.offers.length.toLocaleString('fa-IR')} پیشنهاد
          </p>
          <span className="bubble-btn btn-shine mt-2 w-full h-11 flex items-center justify-center text-[13px]">
            دیدن پیشنهادها
          </span>
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
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0E1B2C]/35 backdrop-blur-[6px] menu-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
    >
      <div
        className="offer-sheet sheet-slide-up w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#0E1B2C]/15" />
        </div>
        <div className="flex items-start gap-3 px-5 pb-4 border-b border-[#0E1B2C]/10">
          {p.image && (
            <img
              src={p.image}
              alt={p.name}
              className="w-16 h-16 rounded-2xl object-cover bg-[#EAF2F8] shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#5B6B7F]">
              {p.brand} • {SHOP_CATEGORY_LABELS[p.category]}
            </p>
            <h3 className="text-base font-extrabold text-[#0E1B2C]">{p.name}</h3>
            {p.description && <p className="text-[11px] text-[#5B6B7F] mt-1">{p.description}</p>}
          </div>
          <button
            onClick={onClose}
            className="bubble-ghost w-9 h-9 flex items-center justify-center shrink-0"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="px-5 pt-3 pb-1 text-[11px] font-bold text-[#5B6B7F] flex items-center gap-1">
          <Tag className="w-3.5 h-3.5 text-[#0EA5E9]" />
          پیشنهادها (ارزون‌ترین اول)
        </p>
        <div className="px-4 pb-6 max-h-[50vh] overflow-y-auto space-y-2">
          {sorted.map((o, i) => (
            <div
              key={i}
              className={`offer-row flex items-center gap-3 p-3 ${
                i === 0 && o.priceToman != null ? 'border-[#0EA5E9]/40 bg-[#F0F9FF]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-[#0E1B2C] flex items-center gap-1.5">
                  {o.store}
                  {i === 0 && o.priceToman != null && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-gradient-to-b from-[#FFD54F] to-[#F5A623] text-[#5C3D00]">
                      بهترین قیمت
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-[#5B6B7F] mt-0.5">
                  {o.condition}
                  {o.note ? ` • ${o.note}` : ''}
                </p>
              </div>
              {o.priceToman != null ? (
                <p className="text-sm font-extrabold text-[#0E1B2C] tabular-nums shrink-0">
                  {formatPrice(o.priceToman)}
                </p>
              ) : (
                <p className="text-[11px] font-bold text-[#5B6B7F] shrink-0">دایرکت</p>
              )}
              <a
                href={o.url}
                target="_blank"
                rel="noreferrer"
                className="bubble-btn shrink-0 h-9 px-4 flex items-center gap-1.5 text-[12px]"
                aria-label={`مشاهده در ${o.store}`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                خرید
              </a>
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
  // Live price search (native APK only: Torob + tennisfa + tennisshop + alo-varzesh)
  const [liveOffers, setLiveOffers] = useState<LivePriceOffer[] | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const runLiveSearch = async () => {
    const q = query.trim();
    if (q.length < 2 || liveLoading) return;
    setLiveLoading(true);
    setLiveError(null);
    setLiveOffers(null);
    const offers = await livePriceSearch(q);
    setLiveLoading(false);
    if (offers === null) {
      setLiveError('جستجوی زنده فعلاً فعال نیست');
    } else {
      setLiveOffers(offers);
    }
  };

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
    <div className="shop-bg relative -mx-4 sm:-mx-6 -mt-6 px-4 sm:px-6 pt-6 pb-6 min-h-full">
      {/* Underwater ambiance, retinted for the light background */}
      <Bubbles count={12} className="z-0 bubbles-light" />
      <div className="relative z-10 space-y-5">
        {/* Light shop header */}
        <div className="flex items-center gap-4 pt-1">
          <div className="bubble-btn w-14 h-14 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#0E1B2C] underwater-shimmer rounded-lg">
              فروشگاه پدل
            </h1>
            <p className="text-xs text-[#5B6B7F] mt-1">
              بهترین قیمت راکت، توپ، کفش و لباس از فروشگاه‌های ایران
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <span className="bubble-ghost flex items-center gap-1 px-3 py-1.5 font-bold text-[#0E1B2C]">
            <Sparkles className="w-3 h-3 text-[#0EA5E9]" />
            رصد هوشمند قیمت با هوش مصنوعی
          </span>
          <span className="text-[#5B6B7F]">آخرین به‌روزرسانی: {SHOP_LAST_UPDATED}</span>
        </div>

        {/* Search pill */}
        <div className="sticky top-16 sm:top-20 z-20">
          <div className="search-pill">
            <Search className="w-5 h-5 text-[#0EA5E9] shrink-0" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLiveOffers(null);
                setLiveError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && Capacitor.isNativePlatform()) runLiveSearch();
              }}
              placeholder="جستجو: راکت بولپدل، توپ، کفش..."
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setLiveOffers(null);
                  setLiveError(null);
                }}
                className="p-1.5 rounded-full text-[#8CA0B3] hover:text-[#0E1B2C] cursor-pointer shrink-0"
                aria-label="پاک کردن جستجو"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Live cheapest-price search */}
          {Capacitor.isNativePlatform() && query.trim().length >= 2 && (
            <div className="mt-2">
              <button
                onClick={runLiveSearch}
                disabled={liveLoading}
                className="bubble-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs disabled:opacity-70 cursor-pointer"
              >
                {liveLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {liveLoading ? 'در حال جستجوی زنده...' : '⚡ جستجوی زنده ارزون‌ترین قیمت'}
              </button>
              <p className="text-center text-[10px] text-[#8CA0B3] mt-1">
                قیمت لحظه‌ای از ترب، تنیسفا، تنیس‌شاپ و الو ورزش — فقط کالاهای موجود
              </p>
            </div>
          )}
        </div>

        {/* Live results */}
        {liveLoading && (
          <div className="space-y-2 mt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-white/60 animate-pulse border border-[#E3EDF5]" />
            ))}
          </div>
        )}
        {liveError && (
          <p className="text-center text-xs text-[#8CA0B3] mt-2">{liveError}</p>
        )}
        {liveOffers && !liveLoading && (
          <div className="mt-2">
            <p className="shop-section-label">
              ⚡ نتایج زنده ({liveOffers.length.toLocaleString('fa-IR')})
            </p>
            {liveOffers.length === 0 ? (
              <p className="text-center text-xs text-[#5B6B7F] py-6">
                قیمت زنده‌ای پیدا نشد — عبارت دیگه‌ای رو امتحان کن
              </p>
            ) : (
              <div className="space-y-2">
                {liveOffers.map((o, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-[#E3EDF5] p-3 flex items-center gap-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0E1B2C] truncate">{o.title}</p>
                      <p className="text-[10px] text-[#8CA0B3] mt-0.5 flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        {o.store}
                        {o.sellers ? ` (${o.sellers.toLocaleString('fa-IR')} فروشگاه)` : ''}
                        {o.verified && (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                            <BadgeCheck className="w-3 h-3" />
                            موجود
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-left shrink-0">
                      <p className="text-sm font-black text-[#0E1B2C]">
                        {(o.priceToman / 1000000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} میلیون تومان
                      </p>
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bubble-btn inline-flex items-center gap-1 px-3 py-1.5 text-[11px] mt-1"
                      >
                        خرید
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`chip snap-start ${category === c ? 'active' : ''}`}
            >
              {c === 'all' ? 'همه' : SHOP_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-4xl">🔍</p>
            <p className="text-sm font-bold text-[#0E1B2C]">چیزی پیدا نشد</p>
            <p className="text-xs text-[#5B6B7F]">عبارت دیگه‌ای رو امتحان کن؛ مثلاً «راکت» یا اسم برند</p>
          </div>
        ) : (
          <>
            <p className="shop-section-label">نتایج ({results.length.toLocaleString('fa-IR')} کالا)</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((p, i) => (
                <ProductCard key={p.id} p={p} eager={i < 4} onOpen={() => setOpenProduct(p)} />
              ))}
            </div>
          </>
        )}

        {/* Disclaimer */}
        <p className="text-center text-[10px] text-[#8CA0B3] leading-5 pt-2">
          قیمت‌ها از فروشگاه‌های اینترنتی و پیج‌های اینستاگرامی رصد می‌شن و تقریبی‌اند؛
          <br />
          قبل از خرید، قیمت نهایی رو با فروشنده چک کن.
        </p>

        {openProduct && <ProductSheet p={openProduct} onClose={() => setOpenProduct(null)} />}
      </div>
    </div>
  );
};
