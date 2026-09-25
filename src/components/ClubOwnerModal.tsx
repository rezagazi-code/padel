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
import confetti from 'canvas-confetti';

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

export const ClubOwnerModal: React.FC<ClubOwnerModalProps> = ({ isOpen, onClose }) => {
  const { addClub } = usePadel();

  const [clubName, setClubName] = useState('');
  const [province, setProvince] = useState('تهران');
  const [city, setCity] = useState('تهران');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('۰۲۱-');
  const [openingHour, setOpeningHour] = useState('۰۷:۰۰');
  const [closingHour, setClosingHour] = useState('۲۴:۰۰');
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1000&q=80'
  );

  // Dynamic Courts List
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubName) return;

    addClub({
      name: clubName,
      province,
      city,
      address,
      phone,
      openingHour,
      closingHour,
      coverImage,
      galleryImages: [coverImage],
      ownerName: 'مدیر مجموعه پدل',
      ownerPhone: phone,
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
    try {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
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
                  className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 space-y-3 relative"
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-white/10 flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3.5 bg-[#ff2d55] hover:bg-[#8fd126] text-white font-black text-sm rounded-xl transition active:scale-95 cursor-pointer shadow-lg"
            >
              ثبت نهایی باشگاه و قرارگیری در لیست رزرو
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
