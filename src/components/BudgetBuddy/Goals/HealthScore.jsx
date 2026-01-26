import React from 'react';

function HealthScore({ healthScore }) {
  const scoreColor = 
    healthScore.total >= 85 ? '#10b981' :
    healthScore.total >= 70 ? '#fbbf24' :
    healthScore.total >= 50 ? '#fb923c' : '#ef4444';

  return (
    <section className="health-score-card">
      <h2>Financial Health Score</h2>
      
      <div className="health-score-circle">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="15"
          />
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={scoreColor}
            strokeWidth="15"
            strokeDasharray={`${(healthScore.total / 100) * 565} 565`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            className="health-score-progress"
          />
        </svg>
        <div className="health-score-number">
          <span className="health-score-value">{healthScore.total}</span>
          <span className="health-score-max">/100</span>
        </div>
      </div>
      
      <div className="health-subscores">
        <div className="subscore">
          <span className="subscore-label">💵 Spending</span>
          <div className="subscore-bar">
            <div 
              className="subscore-fill" 
              style={{ width: `${healthScore.spending}%`, background: '#3b82f6' }}
            />
          </div>
          <span className="subscore-value">{healthScore.spending}/100</span>
        </div>
        
        <div className="subscore">
          <span className="subscore-label">💰 Savings</span>
          <div className="subscore-bar">
            <div 
              className="subscore-fill" 
              style={{ width: `${healthScore.savings}%`, background: '#10b981' }}
            />
          </div>
          <span className="subscore-value">{healthScore.savings}/100</span>
        </div>
        
        <div className="subscore">
          <span className="subscore-label">🎯 Goals</span>
          <div className="subscore-bar">
            <div 
              className="subscore-fill" 
              style={{ width: `${healthScore.goals}%`, background: '#fbbf24' }}
            />
          </div>
          <span className="subscore-value">{healthScore.goals}/100</span>
        </div>
        
        <div className="subscore">
          <span className="subscore-label">📊 Planning</span>
          <div className="subscore-bar">
            <div 
              className="subscore-fill" 
              style={{ width: `${healthScore.planning}%`, background: '#a855f7' }}
            />
          </div>
          <span className="subscore-value">{healthScore.planning}/100</span>
        </div>
      </div>
    </section>
  );
}

export default HealthScore;
