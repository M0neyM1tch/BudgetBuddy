import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Cache to prevent duplicate admin checks
  const adminCheckInProgress = useRef(false);
  const adminCache = useRef({ userId: null, isAdmin: false, timestamp: 0 });

  // Helper function to check admin status with caching
  const checkAdminStatus = async (userId) => {
    try {
      // Check cache (valid for 30 seconds)
      const now = Date.now();
      if (
        adminCache.current.userId === userId &&
        now - adminCache.current.timestamp < 30000
      ) {
        console.log('ℹ️ Using cached admin status:', adminCache.current.isAdmin);
        return adminCache.current.isAdmin;
      }
      
      // Prevent duplicate simultaneous checks
      if (adminCheckInProgress.current) {
        console.log('⏳ Admin check already in progress, waiting...');
        // Wait for existing check to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        return adminCache.current.isAdmin;
      }
      
      adminCheckInProgress.current = true;
      console.log('🔍 Checking admin status for user:', userId);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Admin check timeout after 5 seconds')), 5000);
      });
      
      // Race between query and timeout
      const queryPromise = supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();
      
      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.warn('⚠️ Error checking admin status:', error.message);
        return adminCache.current.isAdmin || false;
      }
      
      if (!profile) {
        console.warn('⚠️ No profile found for user');
        return false;
      }
      
      const isUserAdmin = profile.is_admin === true;
      
      // Update cache
      adminCache.current = {
        userId,
        isAdmin: isUserAdmin,
        timestamp: now
      };
      
      if (isUserAdmin) {
        console.log('✅ User is admin (verified from database)');
      } else {
        console.log('ℹ️ User is not admin');
      }
      return isUserAdmin;
    } catch (err) {
      console.error('❌ Failed to check admin status:', err.message);
      // Return cached value on timeout
      return adminCache.current.isAdmin || false;
    } finally {
      adminCheckInProgress.current = false;
    }
  };

  useEffect(() => {
    console.log('🚀 Auth initialization started');
    
    // Initialize auth state
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          throw error;
        }
        
        console.log('✅ Session loaded:', session?.user?.email || 'No user');
        setUser(session?.user ?? null);
        
        // Check admin status only if user is logged in
        if (session?.user) {
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('❌ Error initializing auth:', err);
        setUser(null);
        setIsAdmin(false);
      } finally {
        // CRITICAL: Always set loading to false, no matter what
        console.log('✅ Auth initialization complete, setting loading=false');
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔔 Auth state changed:', _event);
      
      setUser(session?.user ?? null);
      
      // Check admin status (will use cache if recent)
      if (session?.user) {
        try {
          const adminStatus = await checkAdminStatus(session.user.id);
          setIsAdmin(adminStatus);
        } catch (err) {
          console.error('❌ Error in auth state change:', err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        // Clear cache on logout
        adminCache.current = { userId: null, isAdmin: false, timestamp: 0 };
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
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
    
    // Track successful login
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
    // Clear cache
    adminCache.current = { userId: null, isAdmin: false, timestamp: 0 };
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
