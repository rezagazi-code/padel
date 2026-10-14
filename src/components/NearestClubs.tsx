import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Navigation,
  MapPin,
  Radar,
  LocateFixed,
  Star,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import { usePadel } from '../context/PadelContext';
import { openExternal } from '../lib/externalLink';
import {
  CLUB_COORDS,
  haversineKm,
  bearingDeg,
  formatDistance,
  faNum,
} from '../lib/clubCoordinates';
import type { Club } from '../types';

interface NearestClubsProps {
  onClose: () => void;
  onReserve: (clubId: string) => void;
}

interface ClubWithMeta extends Club {
  distanceKm: number;
  bearing: number;
  rank: number;
}

type Status = 'locating' | 'ready' | 'error';

/**
 * Padel Radar — creative nearest-club finder.
 * Circular sonar view: user at center, clubs as blips positioned by
 * bearing & (log-scaled) distance. Tap a blip for details + red route.
 */
export function NearestClubs({ onClose, onReserve }: NearestClubsProps) {
  const { clubs } = usePadel();
  const [status, setStatus] = useState<Status>('locating');
  const [errorMsg, setErrorMsg] = useState('');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRoute, setShowRoute] = useState(false);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setErrorMsg('مرورگر شما از موقعیت مکانی (GPS) پشتیبانی نمی‌کند.');
      setStatus('error');
      return;
    }
    setStatus('locating');
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setStatus('ready');
      },
      (err) => {
        setErrorMsg(
          err.code === 1
            ? 'دسترسی به موقعیت مکانی رد شد. لطفاً از تنظیمات گوشی اجازه بدهید.'
            : 'نتوانستیم موقعیت شما را پیدا کنیم. دوباره تلاش کنید.'
        );
        setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape key always dismisses the radar overlay
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const ranked: ClubWithMeta[] = useMemo(() => {
    if (!userPos) return [];
    return clubs
      .filter((c) => CLUB_COORDS[c.id])
      .map((c) => {
        const coords = CLUB_COORDS[c.id];
        return {
          ...c,
          distanceKm: haversineKm(userPos.lat, userPos.lng, coords.lat, coords.lng),
          bearing: bearingDeg(userPos.lat, userPos.lng, coords.lat, coords.lng),
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .map((c, i) => ({ ...c, rank: i + 1 }));
  }, [clubs, userPos]);

  const selected = ranked.find((c) => c.id === selectedId) || null;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[70] bg-[#0a0f1c]/95 backdrop-blur-xl overflow-y-auto"
      onClick={(e) => {
        // Clicking the dimmed backdrop (not content) dismisses the overlay
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Fixed dismiss button — always on top of every overlay layer (z-[90]) so it can never be obscured */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-[90] w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/[0.12] cursor-pointer"
        aria-label="بستن"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="min-h-full flex flex-col max-w-2xl mx-auto px-4 py-5">
        {/* Header — title + subtitle (dismiss moved to a fixed top-corner button) */}
        <div className="sticky top-0 z-10 -mx-4 px-4 py-3 mb-3 bg-[#0a0f1c]/90 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bubble-btn flex items-center justify-center">
              <Radar className="w-5 h-5 text-white" />
            </span>
            <div>
              <h2 className="text-lg font-black text-white">رادار پدل</h2>
              <p className="text-[11px] text-slate-400">
                نزدیک‌ترین باشگاه‌ها به موقعیت شما
              </p>
            </div>
          </div>
        </div>

        {status === 'locating' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <span className="w-14 h-14 rounded-full bubble-btn flex items-center justify-center animate-pulse">
              <LocateFixed className="w-6 h-6 text-white" />
            </span>
            <p className="text-sm text-slate-300 font-bold">
              در حال پیدا کردن موقعیت شما...
            </p>
            <p className="text-[11px] text-slate-500">
              لطفاً دسترسی به GPS را تأیید کنید
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 px-6 text-center">
            <span className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-red-400" />
            </span>
            <p className="text-sm text-slate-200 font-bold leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={requestLocation}
              className="bubble-btn rounded-full px-6 py-3 text-sm font-black text-white flex items-center gap-2 cursor-pointer"
            >
              <LocateFixed className="w-4 h-4" />
              تلاش مجدد
            </button>
          </div>
        )}

        {status === 'ready' && !showRoute && (
          <>
            <RadarView
              clubs={ranked}
              selectedId={selectedId}
              onSelect={(id) =>
                setSelectedId((prev) => (prev === id ? null : id))
              }
            />

            {/* Horizontal cards — sorted by distance */}
            <div className="mt-5">
              <p className="text-xs font-black text-slate-300 mb-2 px-1">
                مرتب‌شده بر اساس فاصله
              </p>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {ranked.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`shrink-0 w-44 text-right rounded-2xl border p-3 transition cursor-pointer ${
                      selectedId === c.id
                        ? 'border-[#ff2d55]/60 bg-[#ff2d55]/[0.08]'
                        : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center shrink-0 ${
                          c.rank === 1
                            ? 'bubble-btn-fire text-white'
                            : 'bg-white/[0.08] text-slate-300'
                        }`}
                      >
                        {faNum(c.rank)}
                      </span>
                      <span className="text-xs font-black text-white truncate">
                        {c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#ff6b81] font-bold">
                      <Navigation className="w-3 h-3" />
                      {formatDistance(c.distanceKm)}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-1">
                      {c.address}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {status === 'ready' && showRoute && selected && userPos && (
          <RouteView
            club={selected}
            userPos={userPos}
            onBack={() => setShowRoute(false)}
            onReserve={() => onReserve(selected.id)}
          />
        )}

        {/* Detail sheet */}
        {status === 'ready' && !showRoute && selected && (
          <div className="fixed bottom-0 left-0 right-0 z-[71] px-4 pb-6 pt-2 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/95 to-transparent">
            <div className="max-w-2xl mx-auto rounded-3xl border border-white/15 bg-[#141a28]/95 backdrop-blur-xl p-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-2xl bubble-btn-fire text-white text-sm font-black flex items-center justify-center shrink-0">
                    {faNum(selected.rank)}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {selected.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[220px]">
                        {selected.address}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 cursor-pointer shrink-0"
                  aria-label="بستن جزئیات"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-300 mb-3 px-1">
                <span className="flex items-center gap-1 font-bold text-[#ff6b81]">
                  <Navigation className="w-3.5 h-3.5" />
                  {formatDistance(selected.distanceKm)} فاصله
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {faNum(selected.rating?.toFixed(1) || '۵.۰')}
                </span>
                <span>
                  {faNum(selected.courts?.length || selected.courtsCount || 0)}{' '}
                  زمین
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onReserve(selected.id)}
                  className="flex-1 bubble-btn rounded-2xl py-3 text-sm font-black text-white cursor-pointer"
                >
                  رزرو زمین
                </button>
                <button
                  onClick={() => setShowRoute(true)}
                  className="flex-1 bubble-btn-fire rounded-2xl py-3 text-sm font-black text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  مسیریابی
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Radar (sonar) view ---------------- */

function RadarView({
  clubs,
  selectedId,
  onSelect,
}: {
  clubs: ClubWithMeta[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const SIZE = 400;
  const C = SIZE / 2;
  const R_MAX = 168;

  const dMax = Math.max(...clubs.map((c) => c.distanceKm), 1);
  const radiusFor = (d: number) =>
    (R_MAX * Math.log1p(d)) / Math.log1p(dMax);

  // Ring labels at 1/3, 2/3 and full radius (invert the log scale)
  const ringFractions = [1 / 3, 2 / 3, 1];
  const distAt = (f: number) => Math.expm1(f * Math.log1p(dMax));

  const posFor = (bearing: number, r: number) => ({
    x: C + r * Math.sin((bearing * Math.PI) / 180),
    y: C - r * Math.cos((bearing * Math.PI) / 180),
  });

  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto">
        <defs>
          <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff2d55" stopOpacity="0.10" />
            <stop offset="60%" stopColor="#ff2d55" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#ff2d55" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff2d55" stopOpacity="0" />
            <stop offset="100%" stopColor="#ff2d55" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Background + rings */}
        <circle cx={C} cy={C} r={R_MAX} fill="url(#radarBg)" />
        {ringFractions.map((f) => (
          <g key={f}>
            <circle
              cx={C}
              cy={C}
              r={R_MAX * f}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="1"
              strokeDasharray={f === 1 ? 'none' : '4 5'}
            />
            <text
              x={C + 4}
              y={C - R_MAX * f + 12}
              fill="rgba(255,255,255,0.45)"
              fontSize="10"
              fontWeight="700"
            >
              {formatDistance(distAt(f))}
            </text>
          </g>
        ))}
        {/* Crosshair */}
        <line x1={C - R_MAX} y1={C} x2={C + R_MAX} y2={C} stroke="rgba(255,255,255,0.07)" />
        <line x1={C} y1={C - R_MAX} x2={C} y2={C + R_MAX} stroke="rgba(255,255,255,0.07)" />
        {/* North marker */}
        <text x={C} y={C - R_MAX - 6} fill="rgba(255,255,255,0.5)" fontSize="11" fontWeight="800" textAnchor="middle">
          شمال
        </text>

        {/* Sweep */}
        <g className="radar-sweep">
          <path
            d={`M ${C} ${C} L ${C} ${C - R_MAX} A ${R_MAX} ${R_MAX} 0 0 1 ${
              C + R_MAX * Math.sin(0.7)
            } ${C - R_MAX * Math.cos(0.7)} Z`}
            fill="url(#sweepGrad)"
          />
          <line
            x1={C}
            y1={C}
            x2={C}
            y2={C - R_MAX}
            stroke="#ff2d55"
            strokeWidth="2"
            strokeOpacity="0.8"
          />
        </g>

        {/* User at center */}
        <circle cx={C} cy={C} r="26" fill="#2f7bff" opacity="0.18">
          <animate attributeName="r" values="18;30;18" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx={C} cy={C} r="11" fill="#2f7bff" stroke="#fff" strokeWidth="2.5" />
        <text x={C} y={C + 30} fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">
          شما
        </text>

        {/* Club blips */}
        {clubs.map((c) => {
          const r = Math.max(radiusFor(c.distanceKm), 26);
          const { x, y } = posFor(c.bearing, r);
          const isSel = selectedId === c.id;
          const isNearest = c.rank === 1;
          const blipR = isSel ? 15 : isNearest ? 13 : 10;
          return (
            <g
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={{ cursor: 'pointer' }}
            >
              {isNearest && (
                <circle cx={x} cy={y} r={blipR + 7} fill="none" stroke="#ff2d55" strokeWidth="1.5" opacity="0.6">
                  <animate attributeName="r" values={`${blipR + 4};${blipR + 10};${blipR + 4}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0.15;0.7" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={x}
                cy={y}
                r={blipR}
                fill={isSel ? '#ff2d55' : isNearest ? '#ff4d6d' : '#8b93a7'}
                stroke="#fff"
                strokeWidth={isSel ? 2.5 : 1.5}
                opacity={isSel || isNearest ? 1 : 0.85}
              />
              <text
                x={x}
                y={y + 4.5}
                fill="#fff"
                fontSize={blipR > 11 ? 11 : 9}
                fontWeight="900"
                textAnchor="middle"
              >
                {faNum(c.rank)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-1 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2f7bff] inline-block" />
          شما
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff4d6d] inline-block" />
          نزدیک‌ترین باشگاه
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8b93a7] inline-block" />
          سایر باشگاه‌ها
        </span>
      </div>
    </div>
  );
}

/* ---------------- Red route view ---------------- */

function RouteView({
  club,
  userPos,
  onBack,
  onReserve,
}: {
  club: ClubWithMeta;
  userPos: { lat: number; lng: number };
  onBack: () => void;
  onReserve: () => void;
}) {
  const coords = CLUB_COORDS[club.id];
  const W = 400;
  const H = 300;
  const ux = 70;
  const uy = H / 2;
  const cx = W - 70;
  const cy = H / 2;
  // Gentle curve for the red route
  const midX = (ux + cx) / 2;
  const path = `M ${ux} ${uy} Q ${midX} ${uy - 90} ${cx} ${cy}`;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    void openExternal(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 rotate-180" />
        بازگشت به رادار
      </button>

      <div className="rounded-3xl border border-white/12 bg-[#0d1322] overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <defs>
            <pattern id="routeGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#routeGrid)" />

          {/* RED route — the signature look */}
          <path
            d={path}
            fill="none"
            stroke="#ff2d55"
            strokeWidth="9"
            strokeLinecap="round"
            opacity="0.25"
          />
          <path
            d={path}
            fill="none"
            stroke="#ff2d55"
            strokeWidth="4.5"
            strokeLinecap="round"
            className="route-dash"
          />

          {/* User marker (blue) */}
          <circle cx={ux} cy={uy} r="16" fill="#2f7bff" opacity="0.2">
            <animate attributeName="r" values="12;20;12" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={ux} cy={uy} r="10" fill="#2f7bff" stroke="#fff" strokeWidth="2.5" />
          <text x={ux} y={uy + 32} fill="#fff" fontSize="12" fontWeight="800" textAnchor="middle">
            شما
          </text>

          {/* Club marker (red) */}
          <circle cx={cx} cy={cy} r="16" fill="#ff2d55" opacity="0.2">
            <animate attributeName="r" values="12;20;12" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r="10" fill="#ff2d55" stroke="#fff" strokeWidth="2.5" />
          <text x={cx} y={cy + 32} fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">
            {club.name.length > 14 ? club.name.slice(0, 14) + '…' : club.name}
          </text>

          {/* Distance pill on the route */}
          <g>
            <rect x={midX - 62} y={uy - 118} width="124" height="30" rx="15" fill="#0a0f1c" stroke="#ff2d55" strokeWidth="1.5" />
            <text x={midX} y={uy - 98} fill="#ff6b81" fontSize="13" fontWeight="900" textAnchor="middle">
              {formatDistance(club.distanceKm)}
            </text>
          </g>
        </svg>

        <div className="p-4 border-t border-white/10">
          <h3 className="text-sm font-black text-white mb-1">{club.name}</h3>
          <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {club.address}
          </p>
          <div className="flex gap-2">
            <button
              onClick={openGoogleMaps}
              className="flex-1 bubble-btn rounded-2xl py-3 text-sm font-black text-white flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              باز کردن در گوگل مپ
            </button>
            <button
              onClick={onReserve}
              className="flex-1 bubble-btn-fire rounded-2xl py-3 text-sm font-black text-white cursor-pointer"
            >
              رزرو زمین
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            مسیریابی قدم‌به‌قدم در گوگل مپ باز می‌شود
          </p>
        </div>
      </div>
    </div>
  );
}
