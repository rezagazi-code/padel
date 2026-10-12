import React from 'react';
import {
  MapPin,
  Star,
  ChevronLeft,
  Check,
  Clock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
} from 'lucide-react';
import { Club } from '../types';
import { BottomSheet } from './BottomSheet';
import { StarRating } from './StarRating';

interface ClubDetailSheetProps {
  club: Club;
  selectedCourtId?: string;
  onSelectCourt: (courtId: string) => void;
  /** Called when the user taps "continue to booking" — sheet closes, parent scrolls */
  onContinue: () => void;
  /** When provided, the CTA opens the booking bottom-sheet for the selected court instead of scrolling */
  onBookCourt?: (courtId: string) => void;
  onClose: () => void;
  myRating: number;
  onRate: (n: number) => void;
}

const typeLabel = (t: string) =>
  t === 'panoramic' ? 'پانورامیک' : t === 'indoor' ? 'سرپوشیده' : 'روباز';

/**
 * Rich club detail bottom sheet (mobile): tapping any club slides this up
 * with the full club info — cover, rating, address, hours, amenities,
 * interactive stars, courts — instead of showing info at the page bottom.
 */
export const ClubDetailSheet: React.FC<ClubDetailSheetProps> = ({
  club,
  selectedCourtId,
  onSelectCourt,
  onContinue,
  onBookCourt,
  onClose,
  myRating,
  onRate,
}) => {
  return (
    <BottomSheet label={`اطلاعات ${club.name}`} onClose={onClose} maxContentHeight="72vh">
      {/* Cover */}
      <div className="relative -mx-4 -mt-3 h-36 overflow-hidden">
        <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-[#0a0f1c]/30 to-transparent" />
        <div className="absolute bottom-2.5 right-4 left-4 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-black text-white truncate">{club.name}</h3>
              <span className="bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                <ShieldCheck className="w-2.5 h-2.5" />
                تایید رسمی
              </span>
            </div>
            <p className="text-[11px] text-white/75 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-[#ff6b81] shrink-0" />
              <span className="truncate">{club.address}</span>
            </p>
          </div>
          <span className="flex items-center gap-1 text-[#facc15] text-sm font-black shrink-0 bg-black/40 px-2 py-1 rounded-xl">
            <Star className="w-4 h-4 fill-current" />
            {club.reviewCount > 0 ? Number(club.rating).toLocaleString('fa-IR') : '—'}
          </span>
        </div>
      </div>

      {/* Quick info rows */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          {club.openingHour} الی {club.closingHour}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#6ea8ff]" />
          {club.city} • {club.province}
        </span>
        {club.phone && (
          <span className="flex items-center gap-1" dir="ltr">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            {club.phone}
          </span>
        )}
      </div>

      {/* Amenities */}
      {club.amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {club.amenities.slice(0, 6).map((am, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white/[0.06] text-slate-400 border border-white/10 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-[#ff6b81]" />
              {am}
            </span>
          ))}
        </div>
      )}

      {/* Interactive rating */}
      <div className="flex items-center justify-between mt-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
        <div className="flex items-center gap-2">
          <StarRating value={club.reviewCount > 0 ? club.rating : 0} size={16} />
          <span className="text-[11px] font-bold text-slate-300">
            {club.reviewCount > 0
              ? `${Number(club.rating).toLocaleString('fa-IR')} از ۵ (${club.reviewCount.toLocaleString('fa-IR')} رأی)`
              : 'بدون امتیاز'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 font-bold">امتیاز شما:</span>
          <StarRating value={myRating} size={20} onRate={onRate} />
        </div>
      </div>

      {/* Courts */}
      <p className="mt-4 mb-1.5 text-[11px] font-bold text-slate-400">
        زمین‌ها ({club.courts.length.toLocaleString('fa-IR')}) — یکی رو انتخاب کن
      </p>
      <div className="space-y-1">
        {club.courts.map((court) => {
          const isSelected = court.id === selectedCourtId;
          return (
            <button
              key={court.id}
              onClick={() => onSelectCourt(court.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition cursor-pointer border text-right ${
                isSelected
                  ? 'bg-[#ff2d55]/15 border-[#ff2d55]/60'
                  : 'bg-transparent border-transparent hover:bg-white/[0.05] active:bg-white/[0.08]'
              }`}
            >
              <span
                className="w-8 h-8 rounded-xl shrink-0 border border-white/15 flex items-center justify-center"
                style={{ backgroundColor: court.turfColor + '33' }}
              >
                <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: court.turfColor }} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-black text-slate-100 truncate">{court.name}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {typeLabel(court.type)} • {(court.hourlyRate / 1000).toLocaleString('fa-IR')} هزار تومان/ساعت
                </span>
              </span>
              {isSelected ? (
                <Check className="w-4 h-4 text-[#ff6b81] shrink-0" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-slate-600 shrink-0" />
              )}
            </button>
          );
        })}
        {club.courts.length === 0 && (
          <p className="text-center text-xs text-slate-500 py-6">برای این باشگاه هنوز زمینی ثبت نشده</p>
        )}
      </div>

      {/* CTA — opens the booking bottom-sheet when onBookCourt is wired, else the legacy scroll */}
      <button
        onClick={() => {
          const cid = selectedCourtId || club.courts[0]?.id;
          if (onBookCourt && cid) onBookCourt(cid);
          else onContinue();
        }}
        className="bubble-btn-fire rounded-full w-full mt-4 py-3.5 text-sm flex items-center justify-center gap-2"
      >
        <CalendarDays className="w-4 h-4" />
        انتخاب سانس و ادامه رزرو
      </button>
    </BottomSheet>
  );
};
