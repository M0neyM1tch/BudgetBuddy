import { supabase } from '../supabaseClient';

// Generate unique session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('demo_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('demo_session_id', sessionId);
  }
  return sessionId;
};

// Track demo usage (anonymous)
export const trackDemoEvent = async (feature, actionType) => {
  try {
    const sessionId = getSessionId();
    await supabase.from('public_demo_analytics').insert({
      session_id: sessionId,
      feature_used: feature,
      action_type: actionType,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't block user experience if analytics fails
  }
};

// Check if user exceeded rate limit (client-side check)
export const checkRateLimit = () => {
  const rateLimitKey = 'demo_usage_count';
  const rateLimitWindow = 'demo_window_start';
  const MAX_REQUESTS = 20; // Max 20 actions per hour
  const WINDOW_MS = 60 * 60 * 1000; // 1 hour

  const count = parseInt(localStorage.getItem(rateLimitKey) || '0');
  const windowStart = parseInt(localStorage.getItem(rateLimitWindow) || '0');
  const now = Date.now();

  // Reset if window expired
  if (now - windowStart > WINDOW_MS) {
    localStorage.setItem(rateLimitKey, '1');
    localStorage.setItem(rateLimitWindow, now.toString());
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  // Check limit
  if (count >= MAX_REQUESTS) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: new Date(windowStart + WINDOW_MS) 
    };
  }

  // Increment count
  localStorage.setItem(rateLimitKey, (count + 1).toString());
  return { allowed: true, remaining: MAX_REQUESTS - count - 1 };
};
