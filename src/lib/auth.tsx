import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as Profile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState((prev) => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id).then((profile) => {
          setState({ session, user: session.user, profile, loading: false });
        });
      } else {
        setState({ session: null, user: null, profile: null, loading: false });
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          setState({ session: null, user: null, profile: null, loading: false });
          return;
        }

        let profile = await fetchProfile(session.user.id);
        if (!profile && event === 'SIGNED_IN') {
          await new Promise((r) => setTimeout(r, 500));
          profile = await fetchProfile(session.user.id);
        }

        setState({ session, user: session.user, profile, loading: false });
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: username ? { full_name: username } : undefined,
      },
    });

    if (error) return { error: error.message };

    if (data.user) {
      await new Promise((r) => setTimeout(r, 800));
      const profile = await fetchProfile(data.user.id);
      if (profile) {
        setState((prev) => ({
          ...prev,
          session: data.session,
          user: data.user,
          profile,
          loading: false,
        }));
      }
    }

    return { error: null };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ session: null, user: null, profile: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
