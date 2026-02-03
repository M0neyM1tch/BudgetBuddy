import { supabase } from '../supabaseClient';

// ==========================================
// SESSION MANAGEMENT
// ==========================================
let currentSessionId = null;
let sessionStartTime = null;
let lastActivityTime = null;
let activityTimer = null;

// Generate unique session ID
export const generateSessionId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Initialize session tracking
export const initializeSession = async (userId = null) => {
  currentSessionId = generateSessionId();
  sessionStartTime = new Date().toISOString();
  lastActivityTime = sessionStartTime;

  // Get device info
  const deviceInfo = getDeviceInfo();

  // Create session in database
  if (userId) {
    try {
      await supabase.from('user_sessions').insert({
        user_id: userId,
        session_id: currentSessionId,
        session_start: sessionStartTime,
        last_activity: lastActivityTime,
        entry_page: window.location.pathname,
        ...deviceInfo
      });
    } catch (error) {
      console.error('Session init error:', error);
    }
  }

  // Setup activity tracking
  setupActivityTracking(userId);

  return currentSessionId;
};

// Update session activity
const updateSessionActivity = async (userId) => {
  lastActivityTime = new Date().toISOString();
  
  if (userId && currentSessionId) {
    try {
      await supabase
        .from('user_sessions')
        .update({ 
          last_activity: lastActivityTime
        })
        .eq('session_id', currentSessionId);
    } catch (error) {
      console.error('Session update error:', error);
    }
  }
};

// Track user activity (mousemove, click, scroll, keypress)
const setupActivityTracking = (userId) => {
  const events = ['mousemove', 'click', 'scroll', 'keypress', 'touchstart'];
  
  const handleActivity = () => {
    if (activityTimer) clearTimeout(activityTimer);
    
    activityTimer = setTimeout(() => {
      updateSessionActivity(userId);
    }, 5000); // Debounce 5 seconds
  };

  events.forEach(event => {
    window.addEventListener(event, handleActivity, { passive: true });
  });
};

// End session
export const endSession = async (userId) => {
  if (userId && currentSessionId) {
    try {
      await supabase
        .from('user_sessions')
        .update({
          session_end: new Date().toISOString(),
          exit_page: window.location.pathname
        })
        .eq('session_id', currentSessionId);
    } catch (error) {
      console.error('Session end error:', error);
    }
  }
};

// ==========================================
// DEVICE & BROWSER DETECTION
// ==========================================
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  
  // Device type
  let deviceType = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = 'mobile';
  }

  // Browser
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  // OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';

  return {
    device_type: deviceType,
    browser,
    os,
    screen_resolution: `${window.screen.width}x${window.screen.height}`
  };
};

// ==========================================
// EVENT TRACKING FUNCTIONS
// ==========================================

// Track generic event
export const trackEvent = async (userId, eventType, eventData = {}) => {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }

  try {
    const deviceInfo = getDeviceInfo();
    
    await supabase.from('user_events').insert({
      user_id: userId || null,
      session_id: currentSessionId,
      event_type: eventType,
      event_category: eventData.category || null,
      event_action: eventData.action || null,
      event_label: eventData.label || null,
      event_value: eventData.value || null,
      page_path: window.location.pathname,
      referrer: document.referrer,
      metadata: eventData.metadata || {},
      ...deviceInfo
    });
  } catch (error) {
    console.error('Event tracking error:', error);
  }
};

// Track page view
export const trackPageView = (userId, page) => {
  trackEvent(userId, 'page_view', {
    category: 'navigation',
    action: 'view',
    label: page
  });
};

// Track feature usage
export const trackFeature = async (userId, featureName, actionType, metadata = {}) => {
  // Track in user_events
  await trackEvent(userId, 'feature_use', {
    category: featureName,
    action: actionType,
    metadata
  });

  // Track in feature_usage table
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }

  try {
    await supabase.from('feature_usage').insert({
      user_id: userId || null,
      session_id: currentSessionId,
      feature_name: featureName,
      action_type: actionType,
      metadata
    });
  } catch (error) {
    console.error('Feature tracking error:', error);
  }
};

// Track conversion event
export const trackConversion = async (eventType, sourcePage, metadata = {}, userId = null) => {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }

  try {
    await supabase.from('conversion_events').insert({
      session_id: currentSessionId,
      user_id: userId,
      event_type: eventType,
      source_page: sourcePage,
      metadata
    });
  } catch (error) {
    console.error('Conversion tracking error:', error);
  }
};

// Track performance metric
export const trackPerformance = async (pagePath, metricType, metricValue, metadata = {}) => {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }

  try {
    const deviceInfo = getDeviceInfo();
    
    await supabase.from('performance_metrics').insert({
      session_id: currentSessionId,
      page_path: pagePath,
      metric_type: metricType,
      metric_value: metricValue,
      metadata,
      ...deviceInfo
    });
  } catch (error) {
    console.error('Performance tracking error:', error);
  }
};

// Track error
export const trackError = async (errorType, errorMessage, stackTrace, userId = null, metadata = {}) => {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }

  try {
    const deviceInfo = getDeviceInfo();
    
    await supabase.from('error_logs').insert({
      user_id: userId,
      session_id: currentSessionId,
      error_type: errorType,
      error_message: errorMessage,
      stack_trace: stackTrace,
      page_path: window.location.pathname,
      metadata,
      ...deviceInfo
    });
  } catch (error) {
    console.error('Error logging failed:', error);
  }
};

// ==========================================
// PAGE LOAD PERFORMANCE
// ==========================================
export const trackPageLoadPerformance = () => {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    const ttfb = timing.responseStart - timing.navigationStart; // Time to first byte

    if (loadTime > 0) {
      trackPerformance(window.location.pathname, 'page_load', loadTime, {
        dom_content_loaded: domContentLoaded,
        time_to_first_byte: ttfb
      });
    }
  }
};

// Setup global error tracking
export const setupGlobalErrorTracking = (userId = null) => {
  window.addEventListener('error', (event) => {
    trackError(
      'js_error',
      event.message,
      event.error?.stack || '',
      userId,
      {
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackError(
      'promise_rejection',
      event.reason?.message || 'Unhandled Promise Rejection',
      event.reason?.stack || '',
      userId
    );
  });
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Helper for privacy-safe amount tracking
export const getAmountRange = (amount) => {
  if (amount < 10) return '0-10';
  if (amount < 50) return '10-50';
  if (amount < 100) return '50-100';
  if (amount < 500) return '100-500';
  if (amount < 1000) return '500-1000';
  return '1000+';
};

// Get current session ID (for debugging)
export const getCurrentSessionId = () => currentSessionId;

// ==========================================
// LEGACY SUPPORT (for backward compatibility)
// ==========================================

// Keep old demo analytics functions for backward compatibility
export const trackDemoEvent = async (feature, actionType) => {
  try {
    const sessionId = currentSessionId || generateSessionId();
    await supabase.from('public_demo_analytics').insert({
      session_id: sessionId,
      feature_used: feature,
      action_type: actionType,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Demo analytics tracking error:', error);
  }
};

// Check if user exceeded rate limit (client-side check)
export const checkRateLimit = () => {
  const rateLimitKey = 'demo_usage_count';
  const rateLimitWindow = 'demo_window_start';
  const MAX_REQUESTS = 20;
  const WINDOW_MS = 60 * 60 * 1000;

  const count = parseInt(localStorage.getItem(rateLimitKey) || '0');
  const windowStart = parseInt(localStorage.getItem(rateLimitWindow) || '0');
  const now = Date.now();

  if (now - windowStart > WINDOW_MS) {
    localStorage.setItem(rateLimitKey, '1');
    localStorage.setItem(rateLimitWindow, now.toString());
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (count >= MAX_REQUESTS) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: new Date(windowStart + WINDOW_MS) 
    };
  }

  localStorage.setItem(rateLimitKey, (count + 1).toString());
  return { allowed: true, remaining: MAX_REQUESTS - count - 1 };
};
