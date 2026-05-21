import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
  }, []);

  const fetchCompany = useCallback(async (companyId) => {
    const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
    return data;
  }, []);

  const loadUserData = useCallback(async (sess) => {
    if (!sess?.user) {
      setProfile(null);
      setCompany(null);
      setLoading(false);
      return;
    }
    const profileData = await fetchProfile(sess.user.id);
    setProfile(profileData);
    if (profileData?.company_id) {
      const companyData = await fetchCompany(profileData.company_id);
      setCompany(companyData);
    } else {
      setCompany(null);
    }
    setLoading(false);
  }, [fetchProfile, fetchCompany]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      loadUserData(sess);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadUserData(sess);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setCompany(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  const resetPassword = (email) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

  const updateProfile = async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', session.user.id)
      .select()
      .single();
    if (!error) setProfile(data);
    return { data, error };
  };

  const updateCompany = async (updates) => {
    const { data, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', company.id)
      .select()
      .single();
    if (!error) setCompany(data);
    return { data, error };
  };

  const refreshProfile = async () => {
    if (session?.user) {
      const profileData = await fetchProfile(session.user.id);
      setProfile(profileData);
      if (profileData?.company_id) {
        const companyData = await fetchCompany(profileData.company_id);
        setCompany(companyData);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      session, profile, company, loading,
      signIn, signUp, signOut, resetPassword,
      updateProfile, updateCompany, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
