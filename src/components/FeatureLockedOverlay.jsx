import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FeatureLockedOverlay.css';

function FeatureLockedOverlay({ featureName, description, screenshot }) {
  const navigate = useNavigate();

  return (
    <div className="feature-locked-overlay">
      <div className="overlay-backdrop" />
      <div className="overlay-content">
        <div className="lock-icon">🔒</div>
        <h2>Unlock {featureName}</h2>
        <p>{description}</p>
        
        {screenshot && (
          <div className="feature-screenshot">
            <img src={screenshot} alt={featureName} />
          </div>
        )}

        <button 
          className="unlock-btn"
          onClick={() => {
            trackDemoEvent(featureName.toLowerCase(), 'signup_click');
            navigate('/signup');
          }}
        >
          Sign Up Free - No Credit Card Required
        </button>

        <div className="benefits-list">
          <p>✅ Track unlimited transactions</p>
          <p>✅ Set and monitor financial goals</p>
          <p>✅ View detailed analytics & charts</p>
          <p>✅ Secure data with bank-level encryption</p>
        </div>
      </div>
    </div>
  );
}

export default FeatureLockedOverlay;
