import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Calculator.css';
import EngagingSlider from './EngagingSlider';
import Tooltip from './Tooltip';

// Animated Counter Component
function AnimatedCounter({ value, duration = 1500, decimals = 0, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    const targetValue = parseFloat(value) || 0;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(easeOut * targetValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatNumber = (num) => {
    if (num >= 1000) {
      return Math.floor(num).toLocaleString();
    }
    return num.toFixed(decimals);
  };

  return <span>{prefix}{formatNumber(count)}{suffix}</span>;
}

function FreedomCalculator() {
  const navigate = useNavigate();
  // Core inputs
  const [age, setAge] = useState(28);
  const [currentSavings, setCurrentSavings] = useState(15000);
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  
  // Simplified expenses (only 3 categories)
  const [expenses, setExpenses] = useState({
    housing: 1500,
    lifestyle: 900,
    transport: 450
  });

  const [results, setResults] = useState({
    freedomScore: 0,
    yearsBehind: 0,
    opportunityCost: 0,
    freedomAge: 65,
    idealFreedomAge: 45,
    percentile: 50,
    monthlySavings: 0,
    freedomNumber: 0,
    actualProgress: 0,
    scareFactors: {}
  });

  useEffect(() => {
    calculateFreedom();
  }, [age, currentSavings, monthlyIncome, expenses]);

  // === NEW: Calculate Ideal Balance by Age ===
  const calculateIdealBalance = (currentAge, income) => {
    const startAge = 22;
    const yearsInvesting = Math.max(0, currentAge - startAge);
    const annualIdealSavings = income * 12 * 0.20; // 20% savings rate
    
    if (yearsInvesting === 0) return 0;
    
    // Future value of annuity formula
    const RETURN_RATE = 0.07;
    const idealBalance = annualIdealSavings * 
      ((Math.pow(1 + RETURN_RATE, yearsInvesting) - 1) / RETURN_RATE);
    
    return idealBalance;
  };

  // === IMPROVED: More Granular Percentile ===
  const calculateImprovedPercentile = (age, savings, income) => {
    // Updated 2026 benchmarks (more realistic)
    const benchmarks = {
      25: { p10: 5000, p25: 15000, p50: 30000, p75: 60000, p90: 120000 },
      30: { p10: 15000, p25: 35000, p50: 70000, p75: 140000, p90: 280000 },
      35: { p10: 30000, p25: 70000, p50: 140000, p75: 280000, p90: 500000 },
      40: { p10: 50000, p25: 120000, p50: 250000, p75: 500000, p90: 900000 },
      45: { p10: 80000, p25: 180000, p50: 380000, p75: 760000, p90: 1400000 },
      50: { p10: 120000, p25: 280000, p50: 580000, p75: 1150000, p90: 2000000 }
    };
    
    const nearestAge = Math.round(age / 5) * 5;
    const bench = benchmarks[nearestAge] || benchmarks[50];
    
    // Linear interpolation for more granular percentile
    if (savings >= bench.p90) return Math.min(99, 90 + ((savings - bench.p90) / bench.p90 * 9));
    if (savings >= bench.p75) return 75 + ((savings - bench.p75) / (bench.p90 - bench.p75)) * 15;
    if (savings >= bench.p50) return 50 + ((savings - bench.p50) / (bench.p75 - bench.p50)) * 25;
    if (savings >= bench.p25) return 25 + ((savings - bench.p25) / (bench.p50 - bench.p25)) * 25;
    if (savings >= bench.p10) return 10 + ((savings - bench.p10) / (bench.p25 - bench.p10)) * 15;
    return Math.max(1, Math.min(10, (savings / bench.p10) * 10));
  };

  const calculateFreedom = () => {
    const totalMonthlyExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
    const monthlySavings = monthlyIncome - totalMonthlyExpenses;
    const annualSavings = monthlySavings * 12;
    const annualExpenses = totalMonthlyExpenses * 12;
    
    // OPTIMIZED: More conservative return rate
    const RETURN_RATE = 0.07; // 7% instead of 8%
    const IDEAL_START_AGE = 22;
    const FREEDOM_MULTIPLIER = 25; // 4% withdrawal rule
    const INFLATION_RATE = 0.03;

    const initialFreedomNumber = annualExpenses * FREEDOM_MULTIPLIER;

    // === IMPROVED: Freedom Age with Inflation-Adjusted Expenses ===
    let balance = currentSavings;
    let yearsToFreedom = 0;
    let futureAnnualExpenses = annualExpenses;
    
    if (monthlySavings <= 0) {
      yearsToFreedom = 99;
    } else {
      while (balance < futureAnnualExpenses * FREEDOM_MULTIPLIER && yearsToFreedom < 50) {
        balance = (balance * (1 + RETURN_RATE)) + annualSavings;
        futureAnnualExpenses *= (1 + INFLATION_RATE); // Expenses grow with inflation
        yearsToFreedom++;
      }
    }
    
    const freedomAge = age + yearsToFreedom;
    const finalFreedomNumber = futureAnnualExpenses * FREEDOM_MULTIPLIER;

    // === IMPROVED: Years Behind (Based on Actual Progress) ===
    const idealBalance = calculateIdealBalance(age, monthlyIncome);
    const actualProgress = currentSavings / initialFreedomNumber;
    
    // Years behind = how many years of current saving rate to catch up
    const yearsBehind = monthlySavings > 0 && idealBalance > currentSavings
      ? Math.max(0, (idealBalance - currentSavings) / annualSavings)
      : monthlySavings <= 0 ? 99 : 0;

    // === IMPROVED: Freedom Score (More Meaningful) ===
    const progressScore = Math.min(40, (currentSavings / initialFreedomNumber) * 100 * 0.4); // 40% weight
    const savingsRateScore = monthlySavings > 0 
      ? Math.min(30, ((monthlySavings / monthlyIncome) * 100) * 0.3) // 30% weight
      : 0;
    const timeScore = Math.min(30, Math.max(0, (65 - freedomAge) / 45 * 30)); // 30% weight: Earlier freedom = higher score
    const freedomScore = Math.min(100, Math.floor(progressScore + savingsRateScore + timeScore));

    // === IMPROVED: Percentile (More Granular) ===
    const percentile = calculateImprovedPercentile(age, currentSavings, monthlyIncome);

    // === IMPROVED: Opportunity Cost ===
    const yearsLost = Math.max(0, age - IDEAL_START_AGE);
    const monthlyIdealSavings = monthlyIncome * 0.20; // Assume 20% savings rate as ideal
    
    const opportunityCost = yearsLost > 0
      ? monthlyIdealSavings * 12 * 
        ((Math.pow(1 + RETURN_RATE, yearsLost) - 1) / RETURN_RATE) * 
        (1 + RETURN_RATE)
      : 0;

    // === Scare Factors ===
    const inflationAdjustedNetWorth = currentSavings / Math.pow(1 + INFLATION_RATE, Math.max(0, age - 22));
    
    const scareFactors = {
      rentAt40: Math.floor(expenses.housing * Math.pow(1 + INFLATION_RATE, Math.max(0, 40 - age))),
      stillWorkingAt70: freedomAge > 70,
      emergencyWipeout: currentSavings < (totalMonthlyExpenses * 6),
      inflationLoss: Math.floor(currentSavings - inflationAdjustedNetWorth),
      workingYearsLeft: Math.max(0, freedomAge - age),
      monthlyExpenseRatio: monthlyIncome > 0 ? ((totalMonthlyExpenses / monthlyIncome) * 100).toFixed(0) : 100
    };

    setResults({
      freedomScore,
      yearsBehind: yearsBehind.toFixed(1),
      opportunityCost: Math.floor(opportunityCost),
      freedomAge: Math.min(99, Math.floor(freedomAge)),
      percentile: Math.floor(percentile),
      monthlySavings,
      totalExpenses: totalMonthlyExpenses,
      freedomNumber: Math.floor(initialFreedomNumber),
      actualProgress: (actualProgress * 100).toFixed(1),
      scareFactors
    });
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return { color: '#10b981', label: 'Excellent', emoji: '🚀', status: 'excellent' };
    if (score >= 60) return { color: '#f59e0b', label: 'Good', emoji: '💪', status: 'good' };
    if (score >= 40) return { color: '#f97316', label: 'Needs Work', emoji: '⚠️', status: 'needs-work' };
    return { color: '#ef4444', label: 'Critical', emoji: '🚨', status: 'critical' };
  };

  const scoreStatus = getScoreStatus(results.freedomScore);

  return (
    <div className="calculator-container">
      <div className="calculator-header">
        <h1>🔥 Financial Freedom Calculator</h1>
        <p>Discover your path to financial independence</p>
      </div>

      {/* Core Inputs with Engaging Sliders */}
      <div className="projection-inputs">
        <div className="input-card">
          <h3>Your Financial Snapshot</h3>
          <div className="input-grid">
            <EngagingSlider
              label="Your Age"
              value={age}
              min={18}
              max={70}
              step={1}
              largeStep={5}
              onChange={setAge}
              icon="🎂"
              color="#10b981"
              showMarkers={true}
              showInput={true}
            />

            <EngagingSlider
              label="Current Savings"
              value={currentSavings}
              min={0}
              max={2500000}
              step={5000}
              largeStep={50000}
              onChange={setCurrentSavings}
              icon="💰"
              prefix="$"
              color="#f59e0b"
              showMarkers={true}
              showInput={true}
              logarithmic={true}
            />

            <EngagingSlider
              label="Monthly Income"
              value={monthlyIncome}
              min={0}
              max={50000}
              step={100}
              largeStep={500}
              onChange={setMonthlyIncome}
              icon="💵"
              prefix="$"
              color="#3b82f6"
              showMarkers={true}
              showInput={true}
            />
          </div>
        </div>
      </div>

      {/* ENHANCED FREEDOM SCORE CARD - SPACE OPTIMIZED */}
      <div 
        className="freedom-score-card-optimized" 
        data-score={scoreStatus.status}
        style={{ '--score-color': scoreStatus.color }}
      >
        {/* Particle Background */}
        <div className="particle-container">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Main Horizontal Layout */}
        <div className="score-card-horizontal">
          
          {/* Left: Animated Score Circle */}
          <div className="score-circle-section">
            <div className="score-circle-container">
              {/* Animated SVG Ring */}
              <svg className="score-ring" width="200" height="200" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="rgba(75, 85, 99, 0.3)"
                  strokeWidth="12"
                />
                {/* Progress circle */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke={scoreStatus.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${(results.freedomScore / 100) * 534} 534`}
                  className="progress-ring-circle"
                  style={{ 
                    filter: `drop-shadow(0 0 8px ${scoreStatus.color})`,
                    transform: 'rotate(-90deg)',
                    transformOrigin: 'center'
                  }}
                />
              </svg>

              
              <div className="score-circle-content">
                <div className="score-emoji-animated">{scoreStatus.emoji}</div>
                <div className="score-number" style={{ color: scoreStatus.color }}>
                  <AnimatedCounter value={results.freedomScore} duration={2000} />
                  <Tooltip content={
                    <>
                      <h4>How Your Freedom Score Works (Out of 100)</h4>
                      <p>Your Freedom Score is like a report card grade made from three parts:</p>
                      <ul>
                        <li><strong>Progress Score (40 points max):</strong> How much money you've saved compared to your "freedom number"</li>
                        <li><strong>Savings Rate Score (30 points max):</strong> What percentage of your income you're saving each month</li>
                        <li><strong>Time Score (30 points max):</strong> How early you can retire (retiring at 40 gets you more points than retiring at 70)</li>
                      </ul>
                      <p>The calculator adds these three scores together to give you your final Freedom Score.</p>
                    </>
                  } />
                </div>
                <div className="score-label">{scoreStatus.label}</div>
              </div>
            </div>
          </div>

          {/* Right: Stats Grid (2x3 layout) */}
          <div className="score-stats-grid">
            <div className="score-stat glass-morph">
              <div className="stat-icon">🎂</div>
              <div className="stat-content">
                <span className="stat-label">Freedom Age</span>
                <span className="stat-value">
                  <AnimatedCounter value={results.freedomAge} duration={1500} />
                  <Tooltip content={
                    <>
                      <h4>How Your "Freedom Age" is Calculated</h4>
                      <p>This is the age when you'll have enough money saved to stop working. The calculator:</p>
                      <ul>
                        <li>Starts with your current savings</li>
                        <li>Adds your yearly savings each year</li>
                        <li>Grows your money by 7% each year (investment returns)</li>
                        <li>Keeps track of how your living expenses grow by 3% yearly (inflation)</li>
                        <li>Stops when you have 25 times your yearly expenses saved</li>
                      </ul>
                      <div className="tooltip-example">
                        <strong>The magic number is 25x</strong> because if you have 25 times your yearly expenses, you can safely withdraw 4% per year forever.
                      </div>
                    </>
                  } />
                </span>
              </div>
            </div>

            <div className="score-stat glass-morph">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                <span className="stat-label">Years Behind</span>
                <span className="stat-value negative">
                  <AnimatedCounter value={results.yearsBehind} duration={1500} decimals={1} />
                  <Tooltip content={
                    <>
                      <h4>How "Years Behind" is Calculated</h4>
                      <p>The calculator figures out how much you should have saved by now if you'd been saving 20% of your income since age 22. Then it compares that to what you actually have.</p>
                      <p>If you're behind, it calculates how many years it would take to catch up at your current savings rate.</p>
                    </>
                  } />
                </span>
              </div>
            </div>

            <div className="score-stat glass-morph">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <span className="stat-label">Your Rank</span>
                <span className="stat-value">
                  Top <AnimatedCounter value={100 - results.percentile} duration={1500} />%
                  <Tooltip content={
                    <>
                      <h4>How Your Percentile is Determined</h4>
                      <p>The calculator compares your savings to other people your age using real benchmark data.</p>
                      <div className="tooltip-example">
                        <strong>Example:</strong> At age 30, it checks if you have more or less than the typical person (50th percentile = $70,000). If you have more, your percentile goes up; if you have less, it goes down.
                      </div>
                    </>
                  } />
                </span>
              </div>
            </div>

            <div className="score-stat glass-morph">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <span className="stat-label">Freedom Number</span>
                <span className="stat-value">
                  <AnimatedCounter 
                    value={results.freedomNumber} 
                    duration={1800} 
                    prefix="$"
                  />
                </span>
              </div>
            </div>

            <div className="score-stat glass-morph">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-label">Progress</span>
                <span className="stat-value">
                  <AnimatedCounter 
                    value={results.actualProgress} 
                    duration={1500} 
                    decimals={1}
                    suffix="%"
                  />
                </span>
              </div>
            </div>

            <div className="score-stat glass-morph">
              <div className="stat-icon">💸</div>
              <div className="stat-content">
                <span className="stat-label">Monthly Savings</span>
                <span className="stat-value positive">
                  <AnimatedCounter 
                    value={results.monthlySavings} 
                    duration={1500}
                    prefix="$"
                  />
                  <Tooltip content={
                    <>
                      <h4>How Your Monthly Savings is Calculated</h4>
                      <p>First, the calculator adds up all your monthly expenses (housing + lifestyle + transportation). Then it subtracts that total from your income. Whatever's left over is what you're saving each month.</p>
                      <div className="tooltip-example">
                        <strong>Example:</strong> If you make $5,000/month and spend $2,850 total, you're saving $2,150/month.
                      </div>
                    </>
                  } />
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SCARE TACTICS */}
      <div className="scare-tactics-section">
        <h2>⚠️ Reality Check: Your Financial Risks</h2>
        <div className="scare-grid">
          <div className={`scare-card ${results.scareFactors.stillWorkingAt70 ? 'danger' : ''}`}>
            <div className="scare-icon">👴</div>
            <h4>Still Working at 70?</h4>
            <p className="scare-value">
              {results.scareFactors.stillWorkingAt70 
                ? `YES - You'll retire at ${results.freedomAge}` 
                : `No - Free at ${results.freedomAge}`}
            </p>
          </div>

          <div className={`scare-card ${results.scareFactors.emergencyWipeout ? 'danger' : ''}`}>
            <div className="scare-icon">💸</div>
            <h4>Emergency Wipes You Out?</h4>
            <p className="scare-value">
              {results.scareFactors.emergencyWipeout 
                ? 'YES - Less than 6 months saved' 
                : 'NO - You\'re protected'}
            </p>
          </div>

          <div className="scare-card">
            <div className="scare-icon">🏠</div>
            <h4>Your Rent at Age 40</h4>
            <p className="scare-value">${results.scareFactors.rentAt40?.toLocaleString()}/mo</p>
            <span className="scare-note">Due to inflation</span>
          </div>

          <div className="scare-card">
            <div className="scare-icon">📉</div>
            <h4>Lost to Inflation</h4>
            <p className="scare-value negative">${results.scareFactors.inflationLoss?.toLocaleString()}</p>
            <span className="scare-note">Real purchasing power lost</span>
          </div>
        </div>
      </div>

      {/* EXPENSE SLIDERS */}
      <div className="projection-chart">
        <h2>💰 Adjust Your Expenses to See Impact</h2>
        <div className="expense-impact-grid">
          <div className="input-card">
            <EngagingSlider
              label="Housing"
              value={expenses.housing}
              min={0}
              max={4000}
              step={50}
              largeStep={100}
              onChange={(val) => setExpenses(prev => ({ ...prev, housing: val }))}
              icon="🏠"
              prefix="$"
              unit="/mo"
              color="#8b5cf6"
              showMarkers={true}
              showInput={true}
            />
            <p className="expense-note">Rent, mortgage, utilities</p>
          </div>

          <div className="input-card">
            <EngagingSlider
              label="Lifestyle"
              value={expenses.lifestyle}
              min={0}
              max={3000}
              step={50}
              largeStep={100}
              onChange={(val) => setExpenses(prev => ({ ...prev, lifestyle: val }))}
              icon="🍔"
              prefix="$"
              unit="/mo"
              color="#ec4899"
              showMarkers={true}
              showInput={true}
            />
            <p className="expense-note">Food, entertainment, subscriptions</p>
          </div>

          <div className="input-card">
            <EngagingSlider
              label="Transport"
              value={expenses.transport}
              min={0}
              max={2000}
              step={50}
              largeStep={100}
              onChange={(val) => setExpenses(prev => ({ ...prev, transport: val }))}
              icon="🚗"
              prefix="$"
              unit="/mo"
              color="#06b6d4"
              showMarkers={true}
              showInput={true}
            />
            <p className="expense-note">Car payment, gas, insurance</p>
          </div>
        </div>

        {/* Real-time Impact Display */}
        <div className="impact-summary">
          <div className="impact-item">
            <span className="impact-label">Monthly Expenses:</span>
            <span className="impact-value negative">${results.totalExpenses?.toLocaleString()}</span>
          </div>
          <div className="impact-item">
            <span className="impact-label">Monthly Savings:</span>
            <span className="impact-value positive">${results.monthlySavings?.toLocaleString()}</span>
          </div>
          <div className="impact-item">
            <span className="impact-label">Savings Rate:</span>
            <span className="impact-value">{results.scareFactors.monthlyExpenseRatio}% spent</span>
          </div>
        </div>
      </div>

      {/* FREEDOM PROGRESS PATH */}
      <div className="insights-box">
        <h3>🎯 Your Path to Freedom</h3>
        
        <div className="progress-section">
          <div className="progress-labels">
            <span>Now (Age {age})</span>
            <span>Freedom (Age {results.freedomAge})</span>
          </div>
          <div className="progress-bar-freedom">
            <div 
              className="progress-fill"
              style={{ 
                width: `${Math.min(100, results.actualProgress)}%` 
              }}
            ></div>
          </div>
          <div className="progress-percentage">
            {results.actualProgress}% to freedom
          </div>
        </div>

        <div className="freedom-milestones">
          <div className={`milestone-compact ${currentSavings >= 10000 ? 'complete' : ''}`}>
            <span className="milestone-check">{currentSavings >= 10000 ? '✅' : '⭕'}</span>
            <span>Emergency Fund ($10k)</span>
          </div>
          <div className={`milestone-compact ${currentSavings >= 50000 ? 'complete' : ''}`}>
            <span className="milestone-check">{currentSavings >= 50000 ? '✅' : '⭕'}</span>
            <span>Invested Capital ($50k)</span>
          </div>
          <div className={`milestone-compact ${currentSavings >= 100000 ? 'complete' : ''}`}>
            <span className="milestone-check">{currentSavings >= 100000 ? '✅' : '⭕'}</span>
            <span>Six Figures ($100k)</span>
          </div>
          <div className={`milestone-compact ${currentSavings >= results.freedomNumber ? 'complete' : ''}`}>
            <span className="milestone-check">{currentSavings >= results.freedomNumber ? '✅' : '⭕'}</span>
            <span>Financial Freedom (${results.freedomNumber?.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* WHY SIGN UP CTA - CENTERED SINGLE COLUMN */}
      <div className="signup-cta-section-centered">
        <h3>🚀 Ready to Take Control?</h3>
        <p className="cta-subtitle">
          Join BudgetBuddy and turn these calculations into reality
        </p>
        
        <div className="benefit-list">
          <div className="benefit-item">✓ Save your progress automatically</div>
          <div className="benefit-item">✓ Track goals and get insights</div>
          <div className="benefit-item">✓ Access from any device</div>
          <div className="benefit-item">✓ 100% free</div>
        </div>

        <button className="cta-signup-button-centered" onClick={() => navigate('/login')}>
          Create Free Account
        </button>

        
        <p className="cta-disclaimer">
          No credit card • 30 seconds • Instant access
        </p>
      </div>
    </div>
  );
}

export default FreedomCalculator;
