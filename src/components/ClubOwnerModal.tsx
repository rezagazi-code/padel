import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { Court, CourtType } from '../types';
import { PROVINCES_LIST } from '../mockData';
import {
  Building2,
  PlusCircle,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  X,
  Layers,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';

interface ClubOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CourtDraft {
  name: string;
  type: CourtType;
  turfColor: string;
  hourlyRate: number;
  peakHourlyRate: number;
  hasLighting: boolean;
  hasCameras: boolean;
}

/** Convert Persian/Arabic-Indic digits to Latin digits (e.g. '۰۷:۰۰' → '07:00'). */
const fa2en = (s: string): string =>
  s.replace(/[۰-۹٠-٩]/g, (d) => {
    const fa = '۰۱۲۳۴۵۶۷۸۹'.indexOf(d);
    return fa !== -1 ? fa.toString() : '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString();
  });

export const ClubOwnerModal: React.FC<ClubOwnerModalProps> = ({ isOpen, onClose }) => {
  const { addClub } = usePadel();

  const [clubName, setClubName] = useState('');
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('۰۲۱-');
  const [openingHour, setOpeningHour] = useState('07:00');
  const [closingHour, setClosingHour] = useState('24:00');
  const [coverImage, setCoverImage] = useState('/covers/club-2.jpg');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [courts, setCourts] = useState<CourtDraft[]>([
    {
      name: 'کورت پانورامیک ۱ (سنترال)',
      type: 'panoramic',
      turfColor: '#2563eb',
      hourlyRate: 850000,
      peakHourlyRate: 1100000,
      hasLighting: true,
      hasCameras: true,
    },
    {
      name: 'کورت شیشه‌ای ۲',
      type: 'panoramic',
      turfColor: '#1d4ed8',
      hourlyRate: 750000,
      peakHourlyRate: 950000,
      hasLighting: true,
      hasCameras: false,
    },
  ]);

  if (!isOpen) return null;

  const handleAddCourtRow = () => {
    setCourts([
      ...courts,
      {
        name: `کورت شماره ${courts.length + 1}`,
        type: 'panoramic',
        turfColor: '#2563eb',
        hourlyRate: 800000,
        peakHourlyRate: 1000000,
        hasLighting: true,
        hasCameras: true,
      },
    ]);
  };

  const handleRemoveCourtRow = (index: number) => {
    if (courts.length <= 1) return;
    setCourts(courts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!clubName.trim() || !city.trim() || !address.trim()) {
      setSubmitError('نام مجموعه، شهر و آدرس دقیق الزامی است.');
      return;
    }
    // Slot generators parse hours with Number() — Persian digits become NaN
    // and the club ends up with zero bookable slots. Normalize everything to
    // Latin digits before saving.
    const phoneEn = fa2en(phone);
    const openingHourEn = fa2en(openingHour.trim());
    const closingHourEn = fa2en(closingHour.trim());
    const hourOk = (h: string) =>
      /^([01]?\d|2[0-3]):[0-5]\d$/.test(h) || h === '24:00';
    if (!hourOk(openingHourEn) || !hourOk(closingHourEn)) {
      setSubmitError('ساعت بازگشایی و پایان باید به قالب ساعت باشد (مثلاً 07:00 تا 24:00).');
      return;
    }
    // Format-only validation used to accept inverted hours (e.g. 20:00–
    // 07:00), which then generated zero bookable slots — the club listed
    // normally but could never be booked, with no error anywhere.
    const toMin = (h: string) => h === '24:00' ? 1440 : Number(h.split(':')[0]) * 60 + Number(h.split(':')[1]);
    if (toMin(closingHourEn) <= toMin(openingHourEn)) {
      setSubmitError('ساعت پایان باید بعد از ساعت بازگشایی باشد.');
      return;
    }
    // Rates have no validation: clearing the peak input stores Number('') = 0
    // and the booking views price peak slots straight from peakHourlyRate, so
    // a peak slot could book for free. Reject bad rates here instead.
    const badRate = courts.find((c) => !(c.hourlyRate > 0) || !(c.peakHourlyRate >= c.hourlyRate));
    if (badRate) {
      setSubmitError('نرخ هر زمین باید بیشتر از صفر باشد و نرخ پیک آن حداقل برابر نرخ عادی همان زمین باشد.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await addClub({
        name: clubName.trim(),
        province,
        city: city.trim(),
        address: address.trim(),
        phone: phoneEn.trim(),
        openingHour: openingHourEn,
        closingHour: closingHourEn,
        coverImage,
        galleryImages: [coverImage],
        ownerName: 'مدیر مجموعه پدل',
        ownerPhone: phoneEn.trim(),
        courtsCount: courts.length,
        courts: courts.map((c, i) => ({
          ...c,
          id: `c-${Date.now()}-${i}`,
          clubId: '',
          courtNumber: i + 1,
          surface: 'Mondo Supercourt 4NX' as const,
          isAvailable: true,
        })),
        amenities: [
          'کافه تریا اختصاصی',
          'رختکن و دوش آب گرم',
          'سیستم فیلمبرداری اتوماتیک',
          'پارکینگ اختصاصی',
          'فروشگاه تجهیزات پدل',
        ],
      });

      onClose();
    } catch (err) {
      // Club inserts are super_admin-only on the server (clubs_insert_admin),
      // so a signed-in club owner hitting this form gets an RLS denial — not
      // a network problem. Say so instead of blaming their connection.
      const code = (err as { code?: unknown } | null)?.code;
      const message = (err as { message?: unknown } | null)?.message;
      const denied =
        code === '42501' ||
        (typeof message === 'string' && message.includes('row-level security'));
      setSubmitError(
        denied
          ? 'ثبت باشگاه جدید فقط توسط مدیر اصلی انجام می‌شود. اگر باشگاه‌دار هستید، مشخصات باشگاه را برای مدیر اصلی بفرستید تا آن را ثبت کند.'
          : 'ثبت باشگاه روی سرور ناموفق بود. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto menu-fade">
      <div className="w-full max-w-2xl rounded-3xl glass-strong p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-xs">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ff2d55]/20 border border-[#ff2d55]/60 text-[#ff6b81] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-100">ثبت باشگاه و تعریف زمین‌های پدل</h2>
              <p className="text-[11px] text-slate-500">ویژه مالکان و مدیران مجموعه‌های پدل سراسر کشور</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-100 p-1 rounded-lg hover:bg-white/[0.04] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* General Club Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#ff6b81] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              اطلاعات عمومی مجموعه:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">نام باشگاه / مجموعه ورزشی:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: باشگاه پدل آرنا زعفرانیه"
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">شماره تماس رزرو:</label>
                <input
                  type="text"
                  dir="ltr"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">استان:</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                >
                  {PROVINCES_LIST.filter((p) => p !== 'همه استان‌ها').map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">شهر:</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">آدرس دقیق مجموعه:</label>
              <input
                type="text"
                required
                placeholder="خیابان، پلاک، مجموعه ورزشی..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-bold mb-1">ساعت بازگشایی صبح:</label>
                <input
                  type="text"
                  value={openingHour}
                  onChange={(e) => setOpeningHour(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">ساعت پایان سانس شب:</label>
                <input
                  type="text"
                  value={closingHour}
                  onChange={(e) => setClosingHour(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Courts Section */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#ff6b81] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  تعریف زمین‌ها (تعداد کورت‌های پدل: {courts.length} زمین):
                </h4>
                <p className="text-[10px] text-slate-500">
                  برای هر زمین می‌توانید نوع سازه، رنگ چمن و نرخ سانس عادی و ساعات پیک را مشخص کنید.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCourtRow}
                className="flex items-center gap-1 text-xs font-bold bg-white/[0.04] hover:bg-white/10 text-[#ff6b81] px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>افزودن زمین دیگر</span>
              </button>
            </div>

            <div className="space-y-3">
              {courts.map((court, index) => (
                <div
                  key={index}
                  className={`p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3 relative menu-pop-item menu-pop-${(index % 8) + 1}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-xs">زمین شماره {index + 1}</span>
                    {courts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCourtRow(index)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block mb-0.5">نام زمین:</span>
                      <input
                        type="text"
                        value={court.name}
                        onChange={(e) => {
                          const updated = [...courts];
                          updated[index].name = e.target.value;
                          setCourts(updated);
                        }}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-100"
                      />
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block mb-0.5">نوع سازه:</span>
                      <select
                        value={court.type}
                        onChange={(e) => {
                          const updated = [...courts];
                          updated[index].type = e.target.value as CourtType;
                          setCourts(updated);
                        }}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-100"
                      >
                        <option value="panoramic">شیشه‌ای پانورامیک</option>
                        <option value="indoor">سالنی سرپوشیده</option>
                        <option value="outdoor">روباز استاندارد</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-slate-500 text-[10px] block mb-0.5">نرخ عادی (تومان / ساعت):</span>
                      <input
                        type="number"
                        step="50000"
                        value={court.hourlyRate}
                        onChange={(e) => {
                          const updated = [...courts];
                          updated[index].hourlyRate = Number(e.target.value);
                          setCourts(updated);
                        }}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-100"
                      />
                    </div>

                    <div>
                      {/* Peak rate was never editable here and stayed at the
                          hardcoded default, so raising the normal rate above
                          it silently made evening (peak) slots cheaper than
                          off-peak ones. */}
                      <span className="text-slate-500 text-[10px] block mb-0.5">نرخ پیک (تومان / ساعت):</span>
                      <input
                        type="number"
                        step="50000"
                        value={court.peakHourlyRate}
                        onChange={(e) => {
                          const updated = [...courts];
                          updated[index].peakHourlyRate = Number(e.target.value);
                          setCourts(updated);
                        }}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          {submitError && (
            <div className="p-3 rounded-xl bg-[#ff2d55]/10 border border-[#ff2d55]/40 text-[#ff6b81] text-xs font-bold leading-6">
              {submitError}
            </div>
          )}
          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 bubble-btn disabled:opacity-50 text-white font-black text-sm rounded-2xl transition active:scale-95 cursor-pointer"
            >
              {submitting ? 'در حال ثبت روی سرور…' : 'ثبت نهایی باشگاه و قرارگیری در لیست رزرو'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 bg-white/[0.04] hover:bg-white/10 text-slate-400 font-bold rounded-xl cursor-pointer"
            >
              انصراف
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
