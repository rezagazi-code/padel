import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, X, AlertCircle, CheckCircle2, Loader2, Mail } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, user, profile, signOut } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
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
          <button onClick={onClose} className="text-slate-500 hover:text-slate-100 p-1">
            <X className="w-5 h-5" />
          </button>
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
              {(['signin', 'signup'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setNotice(null); }}
                  className={`py-2.5 rounded-xl font-black transition ${mode === m ? 'bg-[#ff2d55] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
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
                className="w-full py-3 bg-[#ff2d55] hover:bg-[#e0264b] disabled:opacity-60 text-white font-black rounded-xl flex items-center justify-center gap-2 transition"
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
