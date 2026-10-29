import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import type { UserRole } from '../types';

export interface AuthProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: UserRole;
  level: number;
  adminClubId: string | null;
  adminProvince: string | null;
}

interface AuthContextValue {
  ready: boolean;
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  role: UserRole;
  adminClubId: string | null;
  adminProvince: string | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Supabase returns auth errors in English; the login modal is fully Persian,
// so map the common messages instead of showing raw English to users.
function toPersianAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'ایمیل یا رمز عبور اشتباه است.';
  if (m.includes('user already registered') || m.includes('user already exists')) return 'این ایمیل قبلاً ثبت شده است؛ لطفاً وارد شوید.';
  if (m.includes('password should be at least 6 characters')) return 'رمز عبور باید حداقل ۶ کاراکتر باشد.';
  if (m.includes('email rate limit exceeded') || m.includes('too many requests')) return 'تعداد تلاش‌ها زیاد است؛ لطفاً چند دقیقه دیگر دوباره تلاش کنید.';
  if (m.includes('unable to validate email address') || m.includes('invalid email')) return 'ایمیل واردشده معتبر نیست.';
  if (m.includes('email link is invalid or has expired')) return 'لینک تأیید منقضی شده است؛ دوباره تلاش کنید.';
  if (m.includes('user not found')) return 'حسابی با این ایمیل پیدا نشد.';
  return 'خطایی رخ داد؛ لطفاً دوباره تلاش کنید.';
}

async function loadProfile(userId: string): Promise<AuthProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  let adminClubId: string | null = null;
  if (data.role === 'club_admin') {
    adminClubId = (data as any).managed_club_id ?? null;
  }
  // admin_province only exists after migration 0011 is run — default to
  // null when it is absent so province_admin logins still work.
  let adminProvince: string | null = null;
  if (data.role === 'province_admin') {
    adminProvince = (data as any).admin_province ?? null;
  }
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar_url: data.avatar_url,
    role: data.role as UserRole,
    level: Number(data.level),
    adminClubId,
    adminProvince,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  // Generation counter for profile loads — hoisted to a ref so signOut can
  // invalidate in-flight loads too (see the race note below).
  const loadSeqRef = useRef(0);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    let cancelled = false;
    // Generation counter for profile loads: several async loads can be in
    // flight at once (mount getSession + INITIAL_SESSION event, or a fast
    // logout→login as a different account while the old profile SELECT is
    // still pending). Only the newest load may commit — a stale one would
    // otherwise clobber the current session's profile (wrong role briefly,
    // or a signed-out user's profile reappearing).
    const syncProfile = async (userId: string | null) => {
      const seq = ++loadSeqRef.current;
      if (!userId) {
        setProfile(null);
        return;
      }
      const p = await loadProfile(userId);
      if (!cancelled && seq === loadSeqRef.current) setProfile(p);
    };
    sb.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      await syncProfile(data.session?.user?.id ?? null);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange(async (_event, newSession) => {
      if (cancelled) return;
      setSession(newSession);
      await syncProfile(newSession?.user?.id ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const sb = getSupabase();
    if (!sb) return { error: 'اتصال به سرور برقرار نیست.', needsConfirmation: false };
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { error: toPersianAuthError(error.message), needsConfirmation: false };
    // If email confirmation is enabled, there is no session yet.
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) return { error: 'اتصال به سرور برقرار نیست.' };
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: toPersianAuthError(error.message) };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    // Invalidate in-flight profile loads: the old user's SELECT may resolve
    // after this but before the SIGNED_OUT auth event reaches syncProfile —
    // without this bump the stale profile would briefly reappear.
    loadSeqRef.current++;
    setSession(null);
    setProfile(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const sb = getSupabase();
    if (!sb) return { error: 'اتصال به سرور برقرار نیست.' };
    const email = session?.user?.email;
    if (!email) return { error: 'نشست معتبر نیست. دوباره وارد شوید.' };
    // Verify the current password first by re-authenticating
    const { error: signInError } = await sb.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) return { error: 'رمز فعلی اشتباه است.' };
    const { error: updateError } = await sb.auth.updateUser({ password: newPassword });
    if (updateError) return { error: toPersianAuthError(updateError.message) };
    return { error: null };
  }, [session]);

  const user = session?.user ?? null;
  const value: AuthContextValue = {
    ready,
    user,
    session,
    profile,
    role: profile?.role ?? 'player',
    adminClubId: profile?.adminClubId ?? null,
    adminProvince: profile?.adminProvince ?? null,
    signUp,
    signIn,
    signOut,
    changePassword,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Safe to call when the provider may not be mounted (e.g. inside PadelContext).
export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext);
}
