import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('🚀 Auth initialization started');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('✅ Session loaded:', session?.user?.email || 'No user');
      setUser(session?.user ?? null);
      
      // Simple hardcoded admin check (temporary)
      const adminEmails = ['zzmitchellzz@outlook.com']; // ADD YOUR EMAIL
      if (session?.user?.email && adminEmails.includes(session.user.email)) {
        setIsAdmin(true);
        console.log('✅ User is admin');
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
      console.log('✅ Auth complete, loading=false');
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔔 Auth state changed:', _event);
      setUser(session?.user ?? null);
      
      // Check admin status
      const adminEmails = ['zzmitchellzz@outlook.com'];
      if (session?.user?.email && adminEmails.includes(session.user.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) throw error;
    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
