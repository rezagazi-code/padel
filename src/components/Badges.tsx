import React, { useMemo } from 'react';
import { Calendar, Flame, Lock, MapPin, Trophy, Zap } from 'lucide-react';
import { usePadel } from '../context/PadelContext';
import {
  getChallengeStatus,
  type ChallengeStatus,
} from '../lib/challenges';
import { toJalaliDisplay } from '../utils/dates';

const ICONS = {
  calendar: Calendar,
  flame: Flame,
  'map-pin': MapPin,
  trophy: Trophy,
  zap: Zap,
} as const;

const faNum = (n: number) => n.toLocaleString('fa-IR');

function BadgeCard({ status, index }: { status: ChallengeStatus; index: number }) {
  const Icon = ICONS[status.icon] ?? Zap;
  const pct = Math.min(100, Math.round((status.progress / status.target) * 100));
  const locked = !status.completed;

  return (
    <div
      className={`court-card p-5 flex flex-col items-center text-center gap-3 transition ${
        locked ? 'opacity-75' : ''
      } pp-rise pp-rise-${Math.min(index + 1, 6)}`}
    >
      {/* Engraved medallion */}
      <div className="relative">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition ${
            locked ? 'grayscale' : ''
          }`}
          style={
            locked
              ? {
                  // Unpolished steel: dark metal medallion, not yet engraved
                  background:
                    'radial-gradient(circle at 32% 30%, #3a3d46 0%, #23252c 55%, #141519 100%)',
                  borderColor: 'rgba(255,255,255,0.14)',
                  boxShadow:
                    'inset 0 2px 6px rgba(255,255,255,0.08), inset 0 -3px 8px rgba(0,0,0,0.6)',
                }
              : {
                  // Engraved volt medallion: red -> blue metal with hot rim glow
                  background:
                    'radial-gradient(circle at 32% 30%, #ff5f7d 0%, #c2264b 30%, #2f7bff 78%, #1a3fa0 100%)',
                  borderColor: 'rgba(255,255,255,0.45)',
                  boxShadow:
                    '0 0 26px rgba(255,45,85,0.5), 0 0 12px rgba(47,123,255,0.45), inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -3px 8px rgba(0,0,0,0.45)',
                }
          }
        >
          <div
            className="w-[68px] h-[68px] rounded-full flex items-center justify-center border"
            style={{
              borderColor: locked ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.30)',
              background: locked ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.18)',
            }}
          >
            {locked ? (
              <Lock className="w-7 h-7 text-slate-500" />
            ) : (
              <Icon className="w-8 h-8 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
            )}
          </div>
        </div>
        {!locked && (
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #ff2d55, #2f7bff)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(255,45,85,0.5)',
            }}
          >
            کسب شد
          </span>
        )}
      </div>

      {/* Title + description */}
      <div className="space-y-1">
        <h4
          className={`text-sm font-black leading-snug ${
            locked ? 'text-slate-400' : 'text-slate-100'
          }`}
        >
          {status.title}
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          {status.description}
        </p>
      </div>

      {/* Progress */}
      <div className="w-full space-y-1.5 mt-auto">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden" dir="ltr">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: locked
                ? 'linear-gradient(90deg, #52555e, #6b6e78)'
                : 'linear-gradient(90deg, #ff2d55, #a03bff, #2f7bff)',
              boxShadow: locked ? 'none' : '0 0 10px rgba(255,45,85,0.6)',
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className={locked ? 'text-slate-500' : 'text-slate-200'}>
            {faNum(Math.min(status.progress, status.target))} از {faNum(status.target)}
          </span>
          <span className="text-slate-600">
            {status.period === 'monthly' ? 'ماهانه' : 'هفتگی'}
          </span>
        </div>
        {status.earnedAt && (
          <p className="text-[10px] text-slate-600">
            {toJalaliDisplay(status.earnedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

export const Badges: React.FC = () => {
  const { playerProfile, bookings, openMatches, tournaments, friendlyTournaments } =
    usePadel();

  const statuses = useMemo(
    () =>
      getChallengeStatus({
        bookings,
        openMatches,
        tournaments,
        friendlyTournaments,
        playerId: playerProfile.id,
        playerName: playerProfile.name,
      }),
    [bookings, openMatches, tournaments, friendlyTournaments, playerProfile.id, playerProfile.name],
  );

  const earnedCount = statuses.filter((s) => s.completed).length;

  return (
    <section className="space-y-5">
      <div className="court-title">
        <h2 className="text-base font-black text-slate-100 whitespace-nowrap flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ff6b81]" />
          نشان‌های من
          <span className="text-xs font-bold text-slate-400">
            ({faNum(earnedCount)} از {faNum(statuses.length)})
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statuses.map((s, i) => (
          <BadgeCard key={s.id} status={s} index={i} />
        ))}
      </div>

      <p className="text-[11px] text-slate-600 text-center leading-relaxed">
        نشان‌ها از روی رزروها و نتایج واقعی بازی‌هایت محاسبه می‌شن — هر ماه از نو شروع می‌شن.
      </p>
    </section>
  );
};
