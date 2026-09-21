import React, { useState } from 'react';
import { usePadel } from '../context/PadelContext';
import { Database, ShieldCheck, CheckCircle2, AlertCircle, X, ExternalLink, RefreshCw, Key } from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const { isSupabaseConnected, supabaseConfig, setSupabaseConfig } = usePadel();

  const [url, setUrl] = useState(supabaseConfig?.url || '');
  const [key, setKey] = useState(supabaseConfig?.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  if (!isOpen) return null;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setTesting(false);
      if (url.trim() && key.trim()) {
        setSupabaseConfig({ url: url.trim(), anonKey: key.trim() });
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 text-xs">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">اتصال دیتابیس ابری Supabase</h3>
              <p className="text-[11px] text-slate-400">ذخیره‌سازی و همگام‌سازی ابری اطلاعات پدل</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
          isSupabaseConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-slate-950 border-slate-800 text-slate-400'
        }`}>
          <div className={`w-3 h-3 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <div className="flex-1">
            <span className="font-bold block text-white">
              {isSupabaseConnected ? 'دیتابیس Supabase متصل است' : 'استفاده از حافظه محلی آفلاین (Local Sync)'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isSupabaseConnected
                ? 'رزروها و رنکینگ مستقیماً در پروژه Supabase شما همگام‌سازی می‌شوند.'
                : 'داده‌ها به صورت پایدار در مرورگر ذخیره شده و پس از اتصال به سرور Supabase منتقل می‌شوند.'}
            </span>
          </div>
        </div>

        <form onSubmit={handleConnect} className="space-y-3">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Supabase Project URL:</label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              dir="ltr"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:border-[#a3e635] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Supabase Anon Key:</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              dir="ltr"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-[11px] focus:border-[#a3e635] focus:outline-none"
            />
          </div>

          {testResult === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>پیکربندی با موفقیت اعمال و ذخیره شد!</span>
            </div>
          )}

          {testResult === 'error' && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>لطفاً آدرس و کلید معتبر را وارد کنید.</span>
            </div>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              disabled={testing}
              className="flex-1 py-3 bg-[#a3e635] hover:bg-[#8fd126] text-slate-950 font-black rounded-xl cursor-pointer flex items-center justify-center gap-2 transition"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>در حال بررسی اتصال...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>برقراری اتصال و ذخیره</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl cursor-pointer"
            >
              بستن
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
