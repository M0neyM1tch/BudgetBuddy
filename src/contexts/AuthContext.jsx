import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { trackConversion } from '../utils/analytics';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Get admin emails from environment variable
  // Supports multiple emails separated by commas
  const getAdminEmails = () => {
    const envAdmins = import.meta.env.VITE_ADMIN_EMAIL;
    if (envAdmins) {
      return envAdmins.split(',').map(email => email.trim());
    }
    // Fallback for backward compatibility (should set VITE_ADMIN_EMAIL in .env)
    return [];
  };

  useEffect(() => {
    console.log('🚀 Auth initialization started');
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('✅ Session loaded:', session?.user?.email || 'No user');
      setUser(session?.user ?? null);
      
      // Check admin status from DATABASE (not just email)
      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          
          if (!error && profile?.is_admin === true) {
            setIsAdmin(true);
            console.log('✅ User is admin (verified from database)');
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.warn('Failed to check admin status:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });


    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔔 Auth state changed:', _event);
      setUser(session?.user ?? null);
      
      // Check admin from database
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          
          setIsAdmin(profile?.is_admin === true);
        } catch (err) {
          setIsAdmin(false);
        }
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
    
    // Tracking happens in Auth.jsx after successful signup
    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    // Track successful login conversion
    if (data?.user) {
      trackConversion('login', '/login', {
        login_method: 'password',
        user_id: data.user.id
      }, data.user.id);
      console.log('📊 Login conversion tracked');
    }
    
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsAdmin(false);
    
    // Note: Logout event tracking happens in BudgetBuddy.jsx handleLogout
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
