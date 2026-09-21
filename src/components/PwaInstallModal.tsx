import React from 'react';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X, Sparkles, ExternalLink } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, triggerInstall, isIos } = usePwaInstall();

  if (!isOpen) return null;

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      await triggerInstall();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 text-xs text-right animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#a3e635]/20 border border-[#a3e635] text-[#a3e635] flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">نصب وب‌اپلیکیشن پدل‌پرو (PWA)</h3>
              <p className="text-[11px] text-slate-400">نصب بدون استور با لود فوق‌العاده سریع و نوتیفیکیشن</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick One-Click Install Button if supported by browser */}
        {isInstallable && !isIos && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#a3e635]/15 to-emerald-500/10 border border-[#a3e635]/40 text-center space-y-2">
            <p className="font-bold text-white text-xs">مرورگر شما آماده نصب مستقیم با یک کلیک است!</p>
            <button
              onClick={handleTriggerInstall}
              className="w-full py-3 glow-btn-lime text-slate-950 font-black rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>نصب فوری اپلیکیشن روی گوشی / سیستم</span>
            </button>
          </div>
        )}

        {/* Instructions for Android Chrome */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2.5">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Download className="w-4 h-4 text-[#a3e635]" />
            روش نصب در گوشی‌های اندروید (Chrome / Samsung):
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            <li>روی منوی <strong className="text-white">سه‌نقطه</strong> در گوشه بالای مرورگر کروم بزنید.</li>
            <li>گزینه <strong className="text-[#a3e635]">نصب برنامه (Install App)</strong> یا افزودن به صفحه اصلی را بزنید.</li>
            <li>پیام تایید را لمس کنید تا آیکون پدل‌پرو به منوی گوشی شما اضافه شود.</li>
          </ol>
        </div>

        {/* Instructions for iPhone / iOS */}
        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2.5">
          <h4 className="font-bold text-white flex items-center gap-1.5 text-xs">
            <Share2 className="w-4 h-4 text-cyan-400" />
            روش نصب در آیفون (iOS Safari):
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
            <li>در مرورگر سافاری روی آیکون <strong className="text-cyan-400">Share (اشتراک‌گذاری در نوار پایین)</strong> کلیک کنید.</li>
            <li>گزینه <strong className="text-[#a3e635]">Add to Home Screen (افزودن به صفحه اصلی)</strong> را انتخاب کنید.</li>
            <li>در گوشه بالا دکمه <strong className="text-white">Add</strong> را بزنید. برنامه بدون نیاز به اپ‌استور نصب می‌شود.</li>
          </ol>
        </div>

        {/* App benefits */}
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 pt-1">
          <div className="flex items-center gap-1.5 bg-slate-850 p-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" />
            <span>اجرای تمام‌صفحه بدون نوار آدرس</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-850 p-2 rounded-xl border border-slate-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#a3e635]" />
            <span>کش آفلاین و باز شدن پرسرعت</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
        >
          متوجه شدم، بستن
        </button>

      </div>
    </div>
  );
};

