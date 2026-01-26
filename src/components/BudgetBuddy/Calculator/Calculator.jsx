import React, { useState } from 'react';
import FreedomCalculator from './FreedomCalculator';
import WealthProjection from './WealthProjection';
import './Calculator.css';

function Calculator() {
  const [activeMode, setActiveMode] = useState('freedom');

  return (
    <div className="calculator-wrapper">
      {/* Mode Switcher - styled like Investment Insights */}
      <div className="calculator-mode-switcher">
        <button 
          className={activeMode === 'freedom' ? 'active' : ''}
          onClick={() => setActiveMode('freedom')}
        >
          🔥 Freedom Calculator
        </button>
        <button 
          className={activeMode === 'projection' ? 'active' : ''}
          onClick={() => setActiveMode('projection')}
        >
          📊 Wealth Projection
        </button>
      </div>

      {/* Render appropriate calculator */}
      {activeMode === 'freedom' ? <FreedomCalculator /> : <WealthProjection />}
    </div>
  );
}

export default Calculator;
