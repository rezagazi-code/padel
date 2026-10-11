import React, { useEffect } from 'react';
import { X, MapPin, Star, ChevronLeft, Check } from 'lucide-react';
import { Club } from '../types';

interface ClubCourtsSheetProps {
  club: Club;
  selectedCourtId?: string;
  onSelectCourt: (courtId: string) => void;
  onClose: () => void;
}

const typeLabel = (t: string) =>
  t === 'panoramic' ? 'پانورامیک' : t === 'indoor' ? 'سرپوشیده' : 'روباز';

/**
 * Bottom sheet that slides up when a club is tapped (mobile).
 * Compact court rows so the user picks a court with minimal scrolling.
 */
export const ClubCourtsSheet: React.FC<ClubCourtsSheetProps> = ({
  club,
  selectedCourtId,
  onSelectCourt,
  onClose,
}) => {
  // Lock background scroll while the sheet is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 backdrop-blur-[2px] menu-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`زمین‌های ${club.name}`}
    >
      <div
        className="sheet-slide-up w-full max-w-lg rounded-t-3xl glass-strong border border-white/10 border-b-0 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Compact header */}
        <div className="flex items-center gap-3 px-4 pb-3 border-b border-white/10">
          <img
            src={club.coverImage}
            alt={club.name}
            className="w-12 h-12 rounded-2xl object-cover shrink-0 ring-1 ring-white/20"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-slate-100 truncate">{club.name}</h3>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {club.city} • {club.openingHour} الی {club.closingHour}
              </span>
            </p>
          </div>
          <span className="flex items-center gap-1 text-[#facc15] text-xs font-black shrink-0">
            <Star className="w-3.5 h-3.5 fill-current" />
            {club.rating}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.06] text-slate-400 hover:text-slate-100 transition cursor-pointer shrink-0"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Courts header */}
        <p className="px-4 pt-3 pb-1 text-[11px] font-bold text-slate-400">
          زمین‌ها ({club.courts.length.toLocaleString('fa-IR')}) — یکی رو انتخاب کن
        </p>

        {/* Compact court rows */}
        <div className="px-3 pb-4 max-h-[46vh] overflow-y-auto">
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
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: court.turfColor }}
                  />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-black text-slate-100 truncate">
                    {court.name}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    {typeLabel(court.type)} •{' '}
                    {(court.hourlyRate / 1000).toLocaleString('fa-IR')} هزار تومان/ساعت
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
            <p className="text-center text-xs text-slate-500 py-6">
              برای این باشگاه هنوز زمینی ثبت نشده
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
