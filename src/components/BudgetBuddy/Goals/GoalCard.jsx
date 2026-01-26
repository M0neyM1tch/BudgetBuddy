import React, { useState } from 'react';

function GoalCard({ goal, onAddToGoal, onDeleteGoal }) {
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const progress = goal.target_amount > 0 
    ? Math.min(100, ((goal.current_amount || 0) / goal.target_amount) * 100)
    : 0;

  const isComplete = progress >= 100;
  const remaining = Math.max(0, goal.target_amount - (goal.current_amount || 0));

  // ✅ Use the goal's color property (fallback to green)
  const goalColor = goal.color || '#10b981';

  // Calculate pace/status
  function getPaceStatus() {
    if (isComplete) return { text: '🎉 Complete!', color: goalColor };
    if (progress >= 75) return { text: '🔥 Ahead of pace!', color: goalColor };
    if (progress >= 50) return { text: '✅ On track', color: goalColor };
    if (progress >= 25) return { text: '⚡ Keep going!', color: '#f59e0b' };
    return { text: '📈 Just started', color: '#6b7280' };
  }

  const pace = getPaceStatus();

  function handleQuickAdd(amount) {
    onAddToGoal(goal.id, amount);
  }

  function handleCustomAdd() {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0) {
      onAddToGoal(goal.id, amount);
      setCustomAmount('');
      setShowCustomInput(false);
    }
  }

  return (
    <div 
      className={`goal-card ${isComplete ? 'goal-complete' : ''}`}
      style={{
        borderColor: `${goalColor}60`,
        boxShadow: `0 4px 20px ${goalColor}15`,
        background: isComplete 
          ? `linear-gradient(135deg, ${goalColor}10, rgba(55, 65, 81, 0.6))`
          : 'rgba(55, 65, 81, 0.6)'
      }}
    >
      {/* ✨ Colored Top Accent Bar */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, ${goalColor}, ${goalColor}80)`,
          borderRadius: '12px 12px 0 0'
        }}
      />

      {/* Header */}
      <div className="goal-header">
        <div className="goal-title">
          <span className="goal-icon">{goal.category || '🎯'}</span>
          <h3>{goal.name}</h3>
        </div>
        <button 
          className="btn-delete" 
          onClick={() => onDeleteGoal(goal.id)}
          title="Delete goal"
        >
          ×
        </button>
      </div>

      {/* Progress Section */}
      <div className="goal-progress-section">
        <div className="goal-amounts">
          <span className="goal-current" style={{ color: goalColor }}>
            ${(goal.current_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="goal-separator">/</span>
          <span className="goal-target">
            ${goal.target_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Progress Bar with Dynamic Color */}
        <div className="goal-progress-bar">
          <div 
            className="goal-progress-fill" 
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${goalColor}, ${goalColor}dd)`
            }}
          >
            <span className="goal-progress-label">{progress.toFixed(0)}%</span>
          </div>
        </div>

        {/* Goal Info */}
        <div className="goal-info">
          {!isComplete && (
            <span className="goal-remaining">
              ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining
            </span>
          )}
          {isComplete && (
            <span className="goal-completed-label" style={{ color: goalColor }}>
              {pace.text}
            </span>
          )}
          {!isComplete && (
            <span 
              className="goal-pace" 
              style={{ 
                background: `${pace.color}20`,
                color: pace.color,
                border: `1px solid ${pace.color}40`
              }}
            >
              {pace.text}
            </span>
          )}
        </div>

        {/* Deadline */}
        {goal.deadline && (
          <div className="goal-deadline" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            📅 Target: {new Date(goal.deadline).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Quick Add Buttons */}
      {!isComplete && (
        <div className="goal-quick-add">
          <button 
            className="quick-add-btn" 
            onClick={() => handleQuickAdd(25)}
            style={{ 
              background: `${goalColor}15`,
              color: goalColor,
              border: `1px solid ${goalColor}30`
            }}
            onMouseEnter={(e) => e.target.style.background = `${goalColor}25`}
            onMouseLeave={(e) => e.target.style.background = `${goalColor}15`}
          >
            +$25
          </button>
          <button 
            className="quick-add-btn" 
            onClick={() => handleQuickAdd(50)}
            style={{ 
              background: `${goalColor}15`,
              color: goalColor,
              border: `1px solid ${goalColor}30`
            }}
            onMouseEnter={(e) => e.target.style.background = `${goalColor}25`}
            onMouseLeave={(e) => e.target.style.background = `${goalColor}15`}
          >
            +$50
          </button>
          <button 
            className="quick-add-btn" 
            onClick={() => handleQuickAdd(100)}
            style={{ 
              background: `${goalColor}15`,
              color: goalColor,
              border: `1px solid ${goalColor}30`
            }}
            onMouseEnter={(e) => e.target.style.background = `${goalColor}25`}
            onMouseLeave={(e) => e.target.style.background = `${goalColor}15`}
          >
            +$100
          </button>
          <button 
            className="quick-add-btn" 
            onClick={() => setShowCustomInput(!showCustomInput)}
            style={{ 
              background: `${goalColor}15`,
              color: goalColor,
              border: `1px solid ${goalColor}30`
            }}
            onMouseEnter={(e) => e.target.style.background = `${goalColor}25`}
            onMouseLeave={(e) => e.target.style.background = `${goalColor}15`}
          >
            Custom
          </button>
        </div>
      )}

      {/* Custom Amount Input */}
      {showCustomInput && !isComplete && (
        <div className="custom-amount-section" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
          <input
            type="number"
            step="0.01"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCustomAdd()}
            style={{
              flex: 1,
              background: 'rgba(31, 41, 55, 0.8)',
              border: `1px solid ${goalColor}40`,
              color: 'var(--text-primary)',
              padding: '0.6rem',
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          />
          <button
            onClick={handleCustomAdd}
            style={{
              background: goalColor,
              color: 'white',
              border: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default GoalCard;
