import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // Show banner after 1 second delay
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
    // Optionally: disable non-essential cookies/analytics
  };

  if (!showBanner) return null;

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-icon">🍪</div>
        <div className="cookie-content">
          <h3>We Use Cookies</h3>
          <p>
            BudgetBuddy uses essential cookies to keep you logged in and functional cookies to improve your experience. 
            We do NOT use third-party tracking or advertising cookies.
          </p>
          <p className="cookie-details">
            <strong>What we store:</strong> Authentication tokens, session IDs, rate limiting data. 
            <a href="/privacy" target="_blank"> Learn more in our Privacy Policy</a>
          </p>
        </div>
        <div className="cookie-actions">
          <button onClick={handleAccept} className="btn-accept">
            Accept All
          </button>
          <button onClick={handleDecline} className="btn-decline">
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsent;
