import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackDemoEvent } from '../utils/analytics';
import './SignupNudge.css';

function SignupNudge({ feature, delaySeconds = 30 }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already dismissed this session
    const alreadyDismissed = sessionStorage.getItem('signup_nudge_dismissed');
    if (alreadyDismissed) return;

    const timer = setTimeout(() => {
      setVisible(true);
      trackDemoEvent(feature, 'nudge_shown');
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [feature, delaySeconds]);

  const handleSignup = () => {
    trackDemoEvent(feature, 'nudge_signup_click');
    navigate('/signup');
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    sessionStorage.setItem('signup_nudge_dismissed', 'true');
    trackDemoEvent(feature, 'nudge_dismissed');
  };

  if (!visible || dismissed) return null;

  return (
    <div className="signup-nudge">
      <button className="nudge-close" onClick={handleDismiss}>×</button>
      <div className="nudge-content">
        <div className="nudge-icon">🚀</div>
        <h3>Enjoying the {feature}?</h3>
        <p>Sign up for free to save your progress and unlock all features!</p>
        <button className="nudge-cta" onClick={handleSignup}>
          Create Free Account
        </button>
        <button className="nudge-dismiss" onClick={handleDismiss}>
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default SignupNudge;
