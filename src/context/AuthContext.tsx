import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
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
}

interface AuthContextValue {
  ready: boolean;
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  role: UserRole;
  adminClubId: string | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(userId: string): Promise<AuthProfile | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('profiles').select('*').eq('id', userId).single();
  if (error || !data) return null;
  let adminClubId: string | null = null;
  if (data.role === 'club_admin') {
    const { data: club } = await sb.from('clubs').select('id').eq('admin_id', userId).limit(1).single();
    adminClubId = club?.id ?? null;
  }
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    avatar_url: data.avatar_url,
    role: data.role as UserRole,
    level: Number(data.level),
    adminClubId,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    let cancelled = false;
    sb.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session?.user) {
        setProfile(await loadProfile(data.session.user.id));
      }
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange(async (_event, newSession) => {
      if (cancelled) return;
      setSession(newSession);
      if (newSession?.user) {
        setProfile(await loadProfile(newSession.user.id));
      } else {
        setProfile(null);
      }
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
    if (error) return { error: error.message, needsConfirmation: false };
    // If email confirmation is enabled, there is no session yet.
    return { error: null, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) return { error: 'اتصال به سرور برقرار نیست.' };
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const user = session?.user ?? null;
  const value: AuthContextValue = {
    ready,
    user,
    session,
    profile,
    role: profile?.role ?? 'player',
    adminClubId: profile?.adminClubId ?? null,
    signUp,
    signIn,
    signOut,
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
