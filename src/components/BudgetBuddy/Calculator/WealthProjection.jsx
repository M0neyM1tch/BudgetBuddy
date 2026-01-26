import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import './Calculator.css';

function Calculator() {
  const [currentSavings, setCurrentSavings] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [savingsRate, setSavingsRate] = useState(20);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [timeHorizon, setTimeHorizon] = useState(10); // years

  // Calculate monthly savings amount
  const monthlySavings = useMemo(() => {
    if (!monthlyIncome) return 0;
    return (Number(monthlyIncome) * savingsRate) / 100;
  }, [monthlyIncome, savingsRate]);

  // Calculate monthly return rate
  const monthlyReturn = annualReturn / 12 / 100;

  // Generate projection data
  const projectionData = useMemo(() => {
    const months = timeHorizon * 12;
    const data = [];
    let balance = Number(currentSavings) || 0;
    
    for (let i = 0; i <= months; i++) {
      // Calculate balance with returns
      if (i > 0) {
        balance = balance * (1 + monthlyReturn) + monthlySavings;
      }
      
      data.push({
        month: i,
        year: (i / 12).toFixed(1),
        balance: balance,
        contributions: monthlySavings * i + Number(currentSavings || 0),
      });
    }
    
    return data;
  }, [currentSavings, monthlySavings, timeHorizon, monthlyReturn]);

  // Final values
  const finalBalance = projectionData[projectionData.length - 1]?.balance || 0;
  const totalContributions = monthlySavings * timeHorizon * 12 + (Number(currentSavings) || 0);
  const totalReturns = finalBalance - totalContributions;

  // Chart Data
  const chartData = {
    labels: projectionData.filter((_, i) => i % 12 === 0 || i === projectionData.length - 1).map(d => `Year ${Math.floor(d.month / 12)}`),
    datasets: [
      {
        label: 'Projected Balance',
        data: projectionData.filter((_, i) => i % 12 === 0 || i === projectionData.length - 1).map(d => d.balance),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Total Contributions',
        data: projectionData.filter((_, i) => i % 12 === 0 || i === projectionData.length - 1).map(d => d.contributions),
        borderColor: 'rgba(251, 191, 36, 1)',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#f9fafb',
          font: { size: 12, weight: '500' },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': $' + context.parsed.y.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#d1d5db' },
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
      },
      y: {
        ticks: {
          color: '#d1d5db',
          callback: function(value) {
            return '$' + (value / 1000).toFixed(0) + 'k';
          },
        },
        grid: { color: 'rgba(75, 85, 99, 0.3)' },
      },
    },
  };

  return (
    <div className="calculator-container">
      {/* Header Section - matching Investment Insights */}
      <div className="calculator-header">
        <h1>📈 Wealth Forecasting</h1>
        <p>Plan your financial future with personalized projections</p>
      </div>

      {/* Input Section */}
      <div className="projection-inputs">
        <div className="input-card">
          <h3>Starting Point</h3>
          <div className="input-grid">
            <div className="input-group">
              <label>Current Savings ($)</label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                placeholder="10000"
              />
            </div>
            <div className="input-group">
              <label>Monthly Income ($)</label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="5000"
              />
            </div>
          </div>
        </div>

        <div className="input-card">
          <h3>Growth Parameters</h3>
          <div className="input-grid">
            <div className="input-group">
              <label>Savings Rate: {savingsRate}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={savingsRate}
                onChange={(e) => setSavingsRate(Number(e.target.value))}
              />
              <span className="input-helper">Monthly Savings: ${monthlySavings.toFixed(2)}</span>
            </div>
            <div className="input-group">
              <label>Expected Annual Return: {annualReturn}%</label>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Number(e.target.value))}
              />
              <span className="input-helper">Conservative: 5-7% | Moderate: 7-10% | Aggressive: 10%+</span>
            </div>
            <div className="input-group">
              <label>Time Horizon: {timeHorizon} years</label>
              <input
                type="range"
                min="1"
                max="40"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="projection-summary">
        <div className="summary-card-proj">
          <div className="summary-icon">💵</div>
          <div>
            <h4>Projected Balance</h4>
            <p className="value">${finalBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
            <span className="subtitle">in {timeHorizon} years</span>
          </div>
        </div>
        <div className="summary-card-proj">
          <div className="summary-icon">📈</div>
          <div>
            <h4>Investment Returns</h4>
            <p className="value positive">${totalReturns.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
            <span className="subtitle">from compound growth</span>
          </div>
        </div>
        <div className="summary-card-proj">
          <div className="summary-icon">💰</div>
          <div>
            <h4>Total Contributions</h4>
            <p className="value">${totalContributions.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
            <span className="subtitle">your money saved</span>
          </div>
        </div>
        <div className="summary-card-proj">
          <div className="summary-icon">🎯</div>
          <div>
            <h4>Growth Multiple</h4>
            <p className="value">{totalContributions > 0 ? (finalBalance / totalContributions).toFixed(2) : '0.00'}x</p>
            <span className="subtitle">wealth multiplication</span>
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="projection-chart">
        <h2>Wealth Growth Over Time</h2>
        <div className="chart-wrapper">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Key Insights */}
      <div className="insights-box">
        <h3>💡 Key Insights</h3>
        <div className="insight-grid">
          <div className="insight-item">
            <span className="insight-label">Monthly Investment:</span>
            <span className="insight-value">${monthlySavings.toFixed(2)}</span>
          </div>
          <div className="insight-item">
            <span className="insight-label">Total Invested:</span>
            <span className="insight-value">${totalContributions.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
          </div>
          <div className="insight-item">
            <span className="insight-label">Investment Gains:</span>
            <span className="insight-value positive">${totalReturns.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
          </div>
          <div className="insight-item">
            <span className="insight-label">Growth Rate:</span>
            <span className="insight-value">{totalContributions > 0 ? ((totalReturns / totalContributions) * 100).toFixed(1) : '0.0'}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calculator;
