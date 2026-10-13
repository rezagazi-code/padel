import React, { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, X, AlertCircle, CheckCircle2, Loader2, Mail, Download, RefreshCw } from 'lucide-react';
import { checkForAppUpdate, openApkDownload, AppUpdateInfo, CURRENT_VERSION_NAME, isUpdateEndpointReachable } from '../lib/appUpdate';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When true, hides the close (X) button — used for the mandatory native-app login gate. */
  hideClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, hideClose = false }) => {
  const { signIn, signUp, user, profile, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [updateRequired, setUpdateRequired] = useState<AppUpdateInfo | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(true);
  // True when the native update check failed (network/timeout) — distinct from
  // "no update available". Never shown on web: checkForAppUpdate short-circuits
  // to null there, which is not a failure.
  const [checkFailed, setCheckFailed] = useState(false);

  // Mandatory update check before login: guest users must update first
  const runUpdateCheck = useCallback(() => {
    setCheckingUpdate(true);
    setCheckFailed(false);
    checkForAppUpdate()
      .then(async (info) => {
        setUpdateRequired(info);
        // A failed native check resolves null just like "up to date", so probe
        // the endpoint to tell them apart. On web this never runs (see above).
        if (info === null && Capacitor.isNativePlatform()) {
          const reachable = await isUpdateEndpointReachable();
          if (!reachable) setCheckFailed(true);
        }
        setCheckingUpdate(false);
      })
      .catch(() => {
        if (Capacitor.isNativePlatform()) setCheckFailed(true);
        setCheckingUpdate(false);
      });
  }, []);

  useEffect(() => {
    runUpdateCheck();
  }, [runUpdateCheck]);

  if (!isOpen) return null;

  // Blocking update screen — user must update before logging in
  if (!checkingUpdate && updateRequired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060a13]/95 backdrop-blur-md p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#0a0f1c] border border-[#ff2d55]/30 p-6 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bubble-btn-fire flex items-center justify-center mx-auto">
            <Download className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-100">آپدیت جدید اومده! 🎉</h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              نسخه {updateRequired.versionName} منتشر شده (شما روی {CURRENT_VERSION_NAME} هستید).
              <br />
              برای ورود به حساب، اول باید اپ رو آپدیت کنید.
            </p>
            {updateRequired.changelog && (
              <p className="text-xs text-slate-500 mt-3 leading-relaxed bg-white/[0.04] rounded-xl p-3 border border-white/10">
                {updateRequired.changelog}
              </p>
            )}
          </div>
          <button
            onClick={() => openApkDownload(updateRequired.apkUrl)}
            className="bubble-btn rounded-full w-full py-4 text-base font-black text-white flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            دانلود و نصب نسخه جدید
          </button>
          <button
            onClick={runUpdateCheck}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            دوباره بررسی کن
          </button>
          <p className="text-[11px] text-slate-600">
            بعد از نصب، اپ رو باز کنید و دوباره وارد شوید.
          </p>
        </div>
      </div>
    );
  }

  // Check failed on native (no internet / CDN unreachable): offer explicit
  // retry or continue to login without the version check. The mandatory
  // blocking screen above (real newer version) is untouched.
  if (!checkingUpdate && checkFailed && !updateRequired) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl glass-strong p-6 shadow-2xl space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-amber-400" />
          </div>
          <p className="text-sm text-slate-300 font-bold leading-relaxed">
            بررسی نسخه ناموفق بود. اتصال اینترنت را بررسی کنید.
          </p>
          <div className="space-y-2">
            <button
              onClick={runUpdateCheck}
              className="bubble-btn rounded-full w-full py-3 text-sm font-black text-white flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              تلاش مجدد
            </button>
            <button
              onClick={() => {
                setCheckFailed(false);
                setUpdateRequired(null);
                setCheckingUpdate(false);
              }}
              className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-black rounded-xl transition text-xs"
            >
              ورود بدون بررسی نسخه
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
        else onClose();
      } else {
        if (!name.trim()) {
          setError('لطفاً نام خود را وارد کنید.');
          setBusy(false);
          return;
        }
        const { error: err, needsConfirmation } = await signUp(email, password, name);
        if (err) setError(err);
        else if (needsConfirmation) {
          setNotice('حساب ساخته شد! لینک تأیید به ایمیل شما ارسال شد؛ بعد از تأیید وارد شوید.');
        } else onClose();
      }
    } finally {
      setBusy(false);
    }
  };

  // While checking for update, show loading (avoid login form flash)
  if (checkingUpdate) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-3xl glass-strong p-8 shadow-2xl flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#ff2d55] animate-spin" />
          <p className="text-sm text-slate-400">در حال بررسی نسخه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto menu-fade">
      <div className="w-full max-w-md rounded-3xl glass-strong p-6 shadow-2xl space-y-5 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#ff2d55]/20 border border-[#ff2d55]/40 text-[#ff2d55] flex items-center justify-center">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">
                {user ? 'حساب کاربری' : mode === 'signin' ? 'ورود به پدل‌پرو' : 'ساخت حساب کاربری'}
              </h3>
              <p className="text-[11px] text-slate-500">ورود با ایمیل — امن و یکپارچه با سرور</p>
            </div>
          </div>
          {!hideClose && (
            <button onClick={onClose} className="text-slate-500 hover:text-slate-100 p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
              <div>
                <div className="font-black text-slate-100">{profile?.name || user.email}</div>
                <div className="text-[11px] text-slate-400" dir="ltr">{user.email}</div>
                {profile && (
                  <div className="text-[11px] text-emerald-300 mt-1">
                    نقش: {profile.role === 'super_admin' ? 'مدیر ارشد' : profile.role === 'club_admin' ? 'مدیر باشگاه' : 'بازیکن'}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={async () => { await signOut(); onClose(); }}
              className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-black rounded-xl transition"
            >
              خروج از حساب
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
              {(['signin', 'signup'] as const).map((m, idx) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setNotice(null); }}
                  className={`py-2.5 rounded-xl font-black transition menu-pop-item menu-pop-${(idx % 8) + 1} ${mode === m ? 'bg-[#ff2d55] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {m === 'signin' ? 'ورود' : 'ثبت‌نام'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-slate-400 font-bold mb-1">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً رضا گازی"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 focus:border-[#ff2d55]/60 focus:outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-400 font-bold mb-1">ایمیل</label>
                <input
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-[12px] focus:border-[#ff2d55]/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1">رمز عبور</label>
                <input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر"
                  minLength={6}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-slate-100 font-mono text-[12px] focus:border-[#ff2d55]/60 focus:outline-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span dir="ltr" className="text-left">{error}</span>
                </div>
              )}
              {notice && (
                <div className="p-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>{notice}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bubble-btn disabled:opacity-60 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{mode === 'signin' ? 'ورود' : 'ساخت حساب'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
