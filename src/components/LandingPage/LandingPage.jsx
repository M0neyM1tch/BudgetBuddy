import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Embedded Freedom Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [monthlySavings, setMonthlySavings] = useState(1000);
  const [currentSavings, setCurrentSavings] = useState(10000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(3500);

  // Calculate Freedom Number
  const yearlyExpenses = monthlyExpenses * 12;
  const freedomNumber = yearlyExpenses * 25; // 4% rule
  const yearsToFreedom = currentSavings >= freedomNumber 
    ? 0 
    : (freedomNumber - currentSavings) / (monthlySavings * 12);

  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-content">
          <div className="nav-brand">
            <img src="/BBLogo.jpg" alt="BudgetBuddy" className="nav-logo" />
            <h1>BudgetBuddy</h1>
            <span className="beta-badge">BETA</span>
          </div>
          <button className="cta-btn-nav" onClick={() => navigate('/login')}>
            Log In / Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section with Embedded Calculator */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">
              Calculate Your Path to
              <span className="gradient-text"> Financial Freedom</span>
            </h1>
            <p className="hero-subtitle">
              See exactly when you can quit your job and live off your investments.
              Try our Freedom Calculator below — no signup required.
            </p>
          </div>

          {/* Embedded Freedom Calculator */}
          <div className="hero-right">
            <div className="calculator-embed">
              <div className="calculator-header">
                <h3>🧮 Freedom Calculator</h3>
                <p>Adjust the sliders to see your financial independence timeline</p>
              </div>

              <div className="calculator-inputs">
                {/* Monthly Income */}
                <div className="input-group">
                  <label>
                    <span className="label-icon">💰</span>
                    Monthly Income: <strong>${monthlyIncome.toLocaleString()}</strong>
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="500"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                {/* Monthly Expenses */}
                <div className="input-group">
                  <label>
                    <span className="label-icon">💸</span>
                    Monthly Expenses: <strong>${monthlyExpenses.toLocaleString()}</strong>
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="250"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                {/* Monthly Savings */}
                <div className="input-group">
                  <label>
                    <span className="label-icon">💾</span>
                    Monthly Savings: <strong>${monthlySavings.toLocaleString()}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(Number(e.target.value))}
                    className="slider"
                  />
                </div>

                {/* Current Savings */}
                <div className="input-group">
                  <label>
                    <span className="label-icon">🏦</span>
                    Current Savings: <strong>${currentSavings.toLocaleString()}</strong>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="5000"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="calculator-results">
                <div className="result-card primary-result">
                  <div className="result-icon">🎉</div>
                  <div className="result-content">
                    <span className="result-label">Years to Freedom</span>
                    <span className="result-value">
                      {yearsToFreedom <= 0 
                        ? 'You\'re Free!' 
                        : `${yearsToFreedom.toFixed(1)} years`
                      }
                    </span>
                  </div>
                </div>

                <div className="result-grid">
                  <div className="result-card">
                    <span className="result-label">Freedom Number</span>
                    <span className="result-value">${freedomNumber.toLocaleString()}</span>
                  </div>
                  <div className="result-card">
                    <span className="result-label">Savings Rate</span>
                    <span className="result-value">{savingsRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="calculator-cta">
                <button className="calc-cta-btn" onClick={() => navigate('/login')}>
                  Start Tracking Free
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Everything You Need to Build Wealth</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-large">📊</div>
              <h3>Financial Health Dashboard</h3>
              <p>Get a complete snapshot of your finances with real-time health scores, cash flow analysis, and 12-month projections based on your recurring transactions</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">🔁</div>
              <h3>Smart Recurring Transactions</h3>
              <p>Never manually enter your paycheck or rent again. Set up biweekly or monthly recurring income and expenses that automatically update your budget</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">🎯</div>
              <h3>Visual Goal Tracking</h3>
              <p>Set savings goals for vacations, emergency funds, or down payments. Watch your progress in real-time with visual indicators and automated contribution tracking</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">📈</div>
              <h3>Interactive Analytics</h3>
              <p>Beautiful charts break down your spending by category, track your net worth over time, and identify trends to help you make smarter financial decisions</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">💰</div>
              <h3>Multiple Calculators</h3>
              <p>Beyond the Freedom Calculator, access mortgage calculators, retirement planners, and investment analyzers to make informed financial decisions</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">💸</div>
              <h3>Transaction Management</h3>
              <p>Track every dollar with detailed transaction history, category editing, search functionality, and the ability to import data via CSV upload</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">📊</div>
              <h3>Investment Insights</h3>
              <p>Research stocks, analyze options strategies, and track your portfolio performance all in one place without switching between multiple apps</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">⏱️</div>
              <h3>Timeline Projections</h3>
              <p>See month-by-month forecasts of your financial future based on current income, spending patterns, and savings rate to stay on track to your goals</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">🛡️</div>
              <h3>Private & Secure</h3>
              <p>Bank-level encryption keeps your data safe. Your financial information is private, never shared, and you maintain complete ownership of your data</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Take Control of Your Finances?</h2>
          <p>Join thousands of users building their path to financial freedom</p>
          <button className="cta-btn-large" onClick={() => navigate('/login')}>
            Start Free Today
          </button>
          <p className="cta-subtext">No credit card required • Free forever</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-links">
            <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            <span>•</span>
            <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            <span>•</span>
            <span>© 2026 BudgetBuddy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
