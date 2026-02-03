import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  initializeSession,
  trackPageView,
  trackFeature,
  trackEvent,
  trackConversion,
  getCurrentSessionId
} from '../utils/analytics';

/**
 * Custom hook for component-level analytics tracking
 * 
 * @param {string} pageName - Name of the page/component for tracking
 * @param {object} options - Optional configuration
 * @returns {object} - Tracking functions
 */
export const useAnalytics = (pageName, options = {}) => {
  const { user } = useAuth();
  const { autoTrackPageView = true } = options;
  const hasTrackedView = useRef(false);

  // Auto-track page view on mount
  useEffect(() => {
    if (autoTrackPageView && !hasTrackedView.current) {
      trackPageView(user?.id, pageName);
      hasTrackedView.current = true;
    }
  }, [pageName, autoTrackPageView, user?.id]);

  // Simplified tracking methods that auto-include user ID
  const analytics = {
    // Track feature usage
    trackFeature: (featureName, actionType, metadata = {}) => {
      return trackFeature(user?.id, featureName, actionType, metadata);
    },

    // Track generic event
    trackEvent: (eventType, eventData = {}) => {
      return trackEvent(user?.id, eventType, eventData);
    },

    // Track conversion
    trackConversion: (eventType, sourcePage, metadata = {}) => {
      return trackConversion(eventType, sourcePage, metadata, user?.id);
    },

    // Track button click
    trackClick: (buttonName, metadata = {}) => {
      return trackEvent(user?.id, 'click', {
        category: 'ui',
        action: 'click',
        label: buttonName,
        metadata
      });
    },

    // Track form submission
    trackFormSubmit: (formName, success = true, metadata = {}) => {
      return trackEvent(user?.id, 'form_submit', {
        category: 'form',
        action: success ? 'submit_success' : 'submit_error',
        label: formName,
        metadata
      });
    },

    // Get current session ID
    getSessionId: () => getCurrentSessionId(),

    // Get user ID
    getUserId: () => user?.id || null,
  };

  return analytics;
};

export default useAnalytics;
