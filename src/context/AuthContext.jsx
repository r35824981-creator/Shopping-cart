import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, signIn as signInRequest, signOut as signOutRequest, signUp as signUpRequest } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Holds the signed-in user and profile for the whole app.
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getSession()
      .then((session) => {
        if (!active || !session) return;
        setUser(session.user);
        setProfile(session.profile);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const session = await signInRequest(credentials);
    setUser(session.user);
    setProfile(session.profile);
    return session;
  }, []);

  const signUp = useCallback(async (details) => {
    const session = await signUpRequest(details);
    setUser(session.user);
    setProfile(session.profile);
    return session;
  }, []);

  const signOut = useCallback(async () => {
    await signOutRequest();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isAdmin: profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
    }),
    [user, profile, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access the current auth state.
 * @returns {object}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
