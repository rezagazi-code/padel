import React from 'react';
import {
  Download,
  Smartphone,
  Apple,
  Globe,
  Share2,
  ExternalLink,
  ShieldCheck,
  Cloud,
  CheckCircle2,
  X,
  Sparkles,
  QrCode,
  Terminal,
  Zap
} from 'lucide-react';

interface CloudExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudExportModal: React.FC<CloudExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-[0_20px_70px_rgba(0,0,0,0.8)] my-8 space-y-6 text-right text-xs">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#a3e635]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-lime-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">راهنمای خروجی کلود رایگان و نسخه‌های Android & iOS</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  آماده تحویل به باشگاه‌ها
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                راهنمای جامع استقرار سرور بر روی هاستینگ‌های رایگان، ساخت اپلیکیشن بومی و دسترسی آفلاین/آنلاین
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Free Cloud Deployment Guide */}
        <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-white text-sm">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>۱. هاستینگ و استقرار رایگان کلود (Free Cloud Hosting)</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-md">
              ۱۰۰٪ رایگان
            </span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            این اپلیکیشن معماری فول‌استک مدرن مبتنی بر React + Vite + Tailwind دارد و بدون هزینه روی پلتفرم‌های زیر قابل انتشار است:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-cyan-500/40 transition">
              <span className="font-bold text-white block text-xs">Vercel (پیشنهادی)</span>
              <p className="text-[11px] text-slate-400 leading-tight">
                اتصال مستقیم به گیت‌هاب، دپلوی اتوماتیک با CDN جهانی و دامنه رایگان HTTPS.
              </p>
              <span className="inline-block text-[10px] font-mono text-cyan-400">vercel.com</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-[#a3e635]/40 transition">
              <span className="font-bold text-white block text-xs">Netlify</span>
              <p className="text-[11px] text-slate-400 leading-tight">
                پشتیبانی از فرم‌ها، عملکرد بدون سرور (Serverless) و آپ‌تایم ۹۹.۹۹٪ رایگان.
              </p>
              <span className="inline-block text-[10px] font-mono text-[#a3e635]">netlify.com</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 hover:border-amber-500/40 transition">
              <span className="font-bold text-white block text-xs">Supabase (دیتابیس ابری)</span>
              <p className="text-[11px] text-slate-400 leading-tight">
                پایگاه داده PostgreSQL بلادرنگ و احراز هویت رایگان با ۵۰۰ مگابایت حافظه دائمی.
              </p>
              <span className="inline-block text-[10px] font-mono text-amber-400">supabase.com</span>
            </div>
          </div>
        </div>

        {/* 2. Mobile App Delivery (Android & iOS) */}
        <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-white text-sm">
              <Smartphone className="w-4 h-4 text-[#a3e635]" />
              <span>۲. تحویل اپلیکیشن برای اندروید (APK) و iOS (PWA / IPA)</span>
            </div>
            <span className="text-[10px] text-[#a3e635] font-bold bg-lime-950/60 border border-lime-800 px-2 py-0.5 rounded-md">
              نصب فوری
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Android */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Smartphone className="w-4 h-4" />
                <span>نسخه اندروید (Android APK / PWA)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                باشگاه‌ها و بازیکنان اندرویدی می‌توانند اپ را مستقیماً از طریق مرورگر کروم بدون نیاز به کافه بازار یا گوگل پلی نصب کنند (Add to Home Screen)، یا با دستورات زیر فایل APK خروجی بگیرند:
              </p>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 ltr text-left">
                npx @capacitor/cli init<br/>
                npx cap add android<br/>
                npx cap open android
              </div>
            </div>

            {/* iOS */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Apple className="w-4 h-4" />
                <span>نسخه آیفون (iOS WebApp / IPA)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                در گوشی‌های اپل بدون نیاز به اپ‌استور و تحریم‌ها، از طریق دکمه <strong className="text-white">Share</strong> در مرورگر Safari و لمس گزینه <strong className="text-white">Add to Home Screen</strong>، آیکون پدل‌پرو مثل اپلیکیشن بومی فول‌اسکرین اجرا می‌شود.
              </p>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-300 ltr text-left">
                npx cap add ios<br/>
                npx cap open ios
              </div>
            </div>
          </div>
        </div>

        {/* 3. Demo to Clubs Feature */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-lime-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
              <Sparkles className="w-4 h-4" />
              <span>نحوه ارائه و دمو به مدیران باشگاه‌های پدل</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              شما می‌توانید با فعال‌کردن حالت «پیش‌نمایش موبایل» در بالای صفحه، عملکرد اپ را روی شبیه‌ساز واقعی آیفون همراه با جدول‌های خط‌کشی‌شده تورنومنت و رزرو کورت‌ها به مدیران باشگاه نشان دهید.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#a3e635] to-emerald-400 text-slate-950 font-black text-xs shadow-md hover:opacity-95 transition cursor-pointer whitespace-nowrap"
          >
            متوجه شدم، بازگشت به برنامه
          </button>
        </div>

      </div>
    </div>
  );
};
