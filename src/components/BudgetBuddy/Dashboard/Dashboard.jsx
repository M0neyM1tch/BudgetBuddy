import React, { useState } from 'react';
import './Dashboard.css';
import { generateDashboardInsights } from '../../../utils/helpers';


function Dashboard({ summaryIncome, summaryExpenses, summarySavings, transactions, goals, recurringRules = [] }) {
  // State for collapsible sections
  const [shortcomingsCollapsed, setShortcomingsCollapsed] = useState(false);
  const [recommendationsCollapsed, setRecommendationsCollapsed] = useState(false);
  
  // ✅ FIX: Always calculate insights, even with 0 transactions
  // This allows recurring rules to show projections
  const insights = generateDashboardInsights(transactions, goals || [], recurringRules);
  const { healthScore, keyMetrics, shortcomings, recommendations, projections } = insights;

  // ✅ FIX: Only show "no transactions" message if BOTH transactions AND recurring rules are empty
  if (transactions.length === 0 && recurringRules.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard-empty">
          <h2>📊 Welcome to Your Dashboard</h2>
          <p>No transactions yet. Add your first transaction or set up recurring transactions to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Financial Health Score */}
      <div className="dashboard-header">
        <div className="health-score-card">
          <div className="health-score-left">
            <div className="health-score-circle" style={{
              background: `conic-gradient(#10b981 ${healthScore * 3.6}deg, #e5e7eb ${healthScore * 3.6}deg)`
            }}>
              <div className="health-score-inner">
                <span className="health-score-value">{healthScore}</span>
                <span className="health-score-label">Health Score</span>
              </div>
            </div>
            <div className="health-score-info">
              <h2>Financial Health</h2>
              <p className={healthScore >= 70 ? 'status-good' : healthScore >= 40 ? 'status-warning' : 'status-critical'}>
                {healthScore >= 70 ? '✅ Strong' : healthScore >= 40 ? '⚠️ Needs Attention' : '🚨 Critical'}
              </p>
            </div>
          </div>
          
          <div className="health-score-right">
            {shortcomings.length > 0 ? (
              <>
                <h3 className="insight-header">⚠️ Top Priority</h3>
                <div className="insight-item">
                  <span className="insight-icon">{shortcomings[0].icon}</span>
                  <div className="insight-content">
                    <p className="insight-message">{shortcomings[0].message}</p>
                    <p className="insight-action">→ {shortcomings[0].action}</p>
                  </div>
                </div>
                {shortcomings.length > 1 && (
                  <p className="more-insights">+{shortcomings.length - 1} more area{shortcomings.length > 2 ? 's' : ''} needing attention</p>
                )}
              </>
            ) : recommendations.length > 0 ? (
              <>
                <h3 className="insight-header">💡 Smart Tip</h3>
                <div className="insight-item recommendation">
                  <span className="insight-icon">{recommendations[0].icon}</span>
                  <p className="insight-message">{recommendations[0].message}</p>
                </div>
                {recommendations.length > 1 && (
                  <p className="more-insights">+{recommendations.length - 1} more recommendation{recommendations.length > 2 ? 's' : ''}</p>
                )}
              </>
            ) : (
              <>
                <h3 className="insight-header">🎉 Excellent!</h3>
                <div className="insight-item">
                  <span className="insight-icon">✨</span>
                  <p className="insight-message">Your finances are in great shape. Keep up the good work!</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>


      {/* Key Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-icon">💰</span>
          <div className="metric-content">
            <span className="metric-label">Net Income</span>
            <span className="metric-value income">${keyMetrics.monthlyIncome.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="metric-card">
          <span className="metric-icon">💸</span>
          <div className="metric-content">
            <span className="metric-label">Net Expenses</span>
            <span className="metric-value expense">${keyMetrics.monthlyExpenses.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="metric-card">
          <span className="metric-icon">📈</span>
          <div className="metric-content">
            <span className="metric-label">Net Savings</span>
            <span className="metric-value savings">${keyMetrics.monthlySavings.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="metric-card">
          <span className="metric-icon">🎯</span>
          <div className="metric-content">
            <span className="metric-label">Net Cash Flow</span>
            <span className={`metric-value ${keyMetrics.netCashFlow >= 0 ? 'income' : 'expense'}`}>
              ${Math.abs(keyMetrics.netCashFlow).toLocaleString()}
            </span>
          </div>
        </div>


        <div className="metric-card">
          <span className="metric-icon">📊</span>
          <div className="metric-content">
            <span className="metric-label">Savings Rate</span>
            <span className="metric-value">{keyMetrics.savingsRate}%</span>
          </div>
        </div>


        <div className="metric-card">
          <span className="metric-icon">🛡️</span>
          <div className="metric-content">
            <span className="metric-label">Emergency Fund</span>
            <span className="metric-value">{keyMetrics.monthlyRunway} months</span>
          </div>
        </div>


        <div className="metric-card">
          <span className="metric-icon">🎯</span>
          <div className="metric-content">
            <span className="metric-label">Active Goals</span>
            <span className="metric-value">{keyMetrics.activeGoalsCount}</span>
          </div>
        </div>


        <div className="metric-card">
          <span className="metric-icon">📅</span>
          <div className="metric-content">
            <span className="metric-label">Annual Projection</span>
            <span className={`metric-value ${projections.netAnnual >= 0 ? 'income' : 'expense'}`}>
              ${Math.abs(projections.netAnnual).toLocaleString()}
            </span>
          </div>
        </div>
      </div>


      {/* Shortcomings Section - Collapsible */}
      {shortcomings.length > 1 && (
        <div className="dashboard-section">
          <div className="section-header-collapsible" onClick={() => setShortcomingsCollapsed(!shortcomingsCollapsed)}>
            <h3>⚠️ Additional Areas Needing Attention ({shortcomings.length - 1})</h3>
            <button className="collapse-btn">
              {shortcomingsCollapsed ? '▼' : '▲'}
            </button>
          </div>
          {!shortcomingsCollapsed && (
            <div className="shortcomings-list">
              {shortcomings.slice(1).map((item, idx) => (
                <div key={idx} className={`shortcoming-card severity-${item.severity}`}>
                  <span className="shortcoming-icon">{item.icon}</span>
                  <div className="shortcoming-content">
                    <p className="shortcoming-message">{item.message}</p>
                    <p className="shortcoming-action">→ {item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Recommendations Section - Collapsible */}
      {recommendations.length > 1 && (
        <div className="dashboard-section">
          <div className="section-header-collapsible" onClick={() => setRecommendationsCollapsed(!recommendationsCollapsed)}>
            <h3>💡 More Smart Recommendations ({recommendations.length - 1})</h3>
            <button className="collapse-btn">
              {recommendationsCollapsed ? '▼' : '▲'}
            </button>
          </div>
          {!recommendationsCollapsed && (
            <div className="recommendations-list">
              {recommendations.slice(1).map((rec, idx) => (
                <div key={idx} className="recommendation-card">
                  <span className="recommendation-icon">{rec.icon}</span>
                  <p className="recommendation-message">{rec.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Annual Forecast */}
      <div className="dashboard-section">
        <h3>📊 12-Month Forecast</h3>
        <div className="forecast-grid">
          <div className="forecast-card">
            <span className="forecast-label">Projected Annual<br/>Income</span>
            <span className="forecast-value income">${projections.annualIncome.toLocaleString()}</span>
            <span className="forecast-subtitle">Monthly Avg: ${(projections.annualIncome / 12).toLocaleString()}</span>
          </div>
          <div className="forecast-card">
            <span className="forecast-label">Projected Annual<br/>Expenses</span>
            <span className="forecast-value expense">${projections.annualExpenses.toLocaleString()}</span>
            <span className="forecast-subtitle">Monthly Avg: ${(projections.annualExpenses / 12).toLocaleString()}</span>
          </div>
          <div className="forecast-card">
            <span className="forecast-label">Net Annual<br/>Position</span>
            <span className={`forecast-value ${projections.netAnnual >= 0 ? 'income' : 'expense'}`}>
              ${Math.abs(projections.netAnnual).toLocaleString()}
            </span>
            <span className="forecast-subtitle">Monthly Net: ${Math.abs(projections.netAnnual / 12).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


export default Dashboard;