import React from 'react';

function BadgeDisplay({ badges }) {
  return (
    <section className="badges-card">
      <h2>Your Achievements ({badges.length} 🏆)</h2>
      <div className="badges-grid">
        {badges.length === 0 ? (
          <p className="no-badges">Start saving and completing goals to unlock badges!</p>
        ) : (
          badges.map(badge => (
            <div key={badge.id} className="badge-item">
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default BadgeDisplay;
