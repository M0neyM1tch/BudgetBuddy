import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Missing Supabase credentials! Please check your .env file:\n' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.'
  );
}

// ✅ Create Supabase client with timeout and retry configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Auto-refresh tokens before they expire
    autoRefreshToken: true,
    
    // Persist auth state in localStorage
    persistSession: true,
    
    // Detect OAuth redirects
    detectSessionInUrl: true,
    
    // Storage key (optional - for multiple apps on same domain)
    storageKey: 'budgetbuddy-auth',
  },
  
  // ✅ TIMEOUT CONFIGURATION
  global: {
    headers: {
      'x-client-info': 'budgetbuddy-web',
    },
    
    // ⏱️ REQUEST TIMEOUT: 10 seconds
    fetch: (url, options = {}) => {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      return fetch(url, {
        ...options,
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          return response;
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          
          // Better error messages
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection and try again.');
          }
          throw error;
        });
    },
  },
  
  // ✅ DATABASE OPTIONS
  db: {
    schema: 'public',
  },
  
  // ✅ REALTIME OPTIONS (if you use subscriptions)
  realtime: {
    params: {
      eventsPerSecond: 10, // Throttle realtime events
    },
    timeout: 10000, // 10 second timeout for realtime connections
  },
});

// ✅ HELPER: Add timeout to any Supabase query
export const withTimeout = (promise, timeoutMs = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
};
