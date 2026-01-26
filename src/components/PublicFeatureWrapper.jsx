import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { trackDemoEvent, checkRateLimit } from '../utils/analytics';
import SignupNudge from './SignupNudge';
import './PublicFeatureWrapper.css';

function PublicFeatureWrapper({ 
  children, 
  featureName,
  showNudge = true,
  nudgeDelay = 30 
}) {
  const { user } = useAuth();
  const [usageCount, setUsageCount] = useState(0);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  useEffect(() => {
    // Track feature view
    if (!user) {
      trackDemoEvent(featureName, 'view');
    }
  }, [user, featureName]);

  const handleInteraction = () => {
    if (user) return; // Authenticated users have no limits

    const { allowed, remaining, resetTime } = checkRateLimit();
    
    if (!allowed) {
      setRateLimitExceeded(true);
      alert(`You've reached the demo limit. Sign up for unlimited access! Resets at ${resetTime?.toLocaleTimeString()}`);
      return false;
    }

    setUsageCount(prev => prev + 1);
    trackDemoEvent(featureName, 'interact');
    return true;
  };

  return (
    <div className="public-feature-wrapper">
      {!user && (
        <div className="demo-banner">
          <span>👋 You're using demo mode</span>
          <span className="demo-usage-count">
            {usageCount > 0 && `${usageCount} actions`}
          </span>
        </div>
      )}

      <div className="feature-content" onClick={handleInteraction}>
        {children}
      </div>

      {!user && showNudge && !rateLimitExceeded && (
        <SignupNudge feature={featureName} delaySeconds={nudgeDelay} />
      )}
    </div>
  );
}

export default PublicFeatureWrapper;
