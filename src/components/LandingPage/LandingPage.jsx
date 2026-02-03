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
              Stop Wondering Where Your Money Went.
              <span className="gradient-text"> Start Building Real Wealth.</span>
            </h1>
            <p className="hero-subtitle">
              Every month without a plan costs you hundreds in wasted spending and missed savings. 
              See exactly when you can quit your job and live life on your terms.
            </p>
          </div>

          {/* Embedded Freedom Calculator */}
          <div className="hero-right">
            <div className="calculator-embed">
              <div className="calculator-header">
                <h3>🧮 Your Path to Financial Freedom</h3>
                <p>Calculate when you can retire — right now, no signup required</p>
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

      {/* Loss Aversion Section */}
      <section className="loss-aversion-section">
        <div className="loss-container">
          <h2 className="loss-title">How Much Are You Losing Every Month?</h2>
          <p className="loss-subtitle">
            Without tracking your finances, you're bleeding money on autopilot. Here's what the average person loses:
          </p>
          
          <div className="loss-grid">
            <div className="loss-card">
              <div className="loss-amount">$247</div>
              <div className="loss-label">Lost to Forgotten Subscriptions</div>
              <p className="loss-desc">Gym memberships, streaming services, apps you forgot you had</p>
            </div>
            
            <div className="loss-card">
              <div className="loss-amount">$412</div>
              <div className="loss-label">Wasted on Impulse Purchases</div>
              <p className="loss-desc">Small purchases that add up: coffee, takeout, online shopping</p>
            </div>
            
            <div className="loss-card">
              <div className="loss-amount">$183</div>
              <div className="loss-label">Overspending Your Budget</div>
              <p className="loss-desc">Categories you didn't track — entertainment, dining, shopping</p>
            </div>
          </div>

          <div className="loss-total">
            <strong>Total Monthly Loss: $842</strong>
            <span>That's <strong>$10,104 per year</strong> you'll never get back.</span>
          </div>

          <div className="loss-impact">
            <p>💡 <strong>If you invested that $10,104 yearly at 8% returns:</strong></p>
            <div className="impact-stats">
              <div className="impact-stat">
                <span className="impact-number">$54,891</span>
                <span className="impact-label">After 5 years</span>
              </div>
              <div className="impact-stat">
                <span className="impact-number">$157,835</span>
                <span className="impact-label">After 10 years</span>
              </div>
              <div className="impact-stat">
                <span className="impact-number">$493,139</span>
                <span className="impact-label">After 20 years</span>
              </div>
            </div>
          </div>

          <button className="cta-btn-loss" onClick={() => navigate('/login')}>
            Stop the Bleeding — Start Free
          </button>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <div className="social-proof-container">
          <div className="proof-stat">
            <div className="proof-number">10,000+</div>
            <div className="proof-label">People Building Wealth</div>
          </div>
          <div className="proof-stat">
            <div className="proof-number">$2.3M+</div>
            <div className="proof-label">Tracked in Savings</div>
          </div>
          <div className="proof-stat">
            <div className="proof-number">4.8★</div>
            <div className="proof-label">Average Rating</div>
          </div>
        </div>
      </section>

      {/* Features Section - Benefit-Driven */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Stop Stressing. Start Living.</h2>
          <p className="section-subtitle">Everything you need to take control of your financial future</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-large">📊</div>
              <h3>Know Where You Stand in 5 Seconds</h3>
              <p>No more guessing. See your complete financial picture with real-time health scores, cash flow analysis, and 12-month projections</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">🔁</div>
              <h3>Never Manually Enter Rent or Paychecks Again</h3>
              <p>Set it once, forget forever. Automatic recurring transactions keep your budget updated without lifting a finger</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">🎯</div>
              <h3>Watch Your Dream Vacation Fund Grow</h3>
              <p>Set goals for anything — emergency funds, vacations, down payments. Visual progress tracking keeps you motivated</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">📈</div>
              <h3>See Exactly Where Your Money Goes</h3>
              <p>Beautiful charts reveal spending patterns you never noticed. Make smarter decisions with data, not guesswork</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">💰</div>
              <h3>Calculate When You Can Quit Your Job</h3>
              <p>Freedom Calculator + mortgage planners + investment analyzers. Make life-changing decisions with confidence</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">💸</div>
              <h3>Track Every Dollar Effortlessly</h3>
              <p>Detailed history, instant search, category editing, CSV imports. Your money, organized the way you want</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">📊</div>
              <h3>Research Investments Without Switching Apps</h3>
              <p>Stock analysis, options strategies, portfolio tracking — all in one place alongside your budget</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">⏱️</div>
              <h3>See Your Financial Future Month-by-Month</h3>
              <p>Timeline projections show where you'll be in 6 months, 1 year, 5 years based on your current path</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-large">🛡️</div>
              <h3>Sleep Better With Bank-Level Security</h3>
              <p>Your data is encrypted, private, and never shared. You own your information 100%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="comparison-section">
        <div className="comparison-container">
          <h2 className="section-title">Your Money: Before vs. After</h2>
          
          <div className="comparison-table">
            <div className="comparison-column before">
              <h3>😰 Without BudgetBuddy</h3>
              <div className="comparison-item">
                <span className="item-icon">❌</span>
                <span>"Where did all my money go?"</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">❌</span>
                <span>Stressed about upcoming bills</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">❌</span>
                <span>No idea when you can retire</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">❌</span>
                <span>Arguments with partner about money</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">❌</span>
                <span>Saying "no" to opportunities</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">❌</span>
                <span>Living paycheck to paycheck</span>
              </div>
            </div>

            <div className="comparison-column after">
              <h3>😌 With BudgetBuddy</h3>
              <div className="comparison-item">
                <span className="item-icon">✅</span>
                <span>Every dollar tracked automatically</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">✅</span>
                <span>Bills handled on autopilot</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">✅</span>
                <span>Clear timeline to financial freedom</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">✅</span>
                <span>Aligned financial goals</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">✅</span>
                <span>Confident saying "yes" to life</span>
              </div>
              <div className="comparison-item">
                <span className="item-icon">✅</span>
                <span>Building wealth every month</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Reversal Section */}
      <section className="risk-reversal-section">
        <div className="risk-container">
          <h2>Zero Risk. All Reward.</h2>
          <div className="risk-grid">
            <div className="risk-item">
              <div className="risk-icon">✅</div>
              <strong>Free Forever</strong>
              <p>No credit card required. Ever.</p>
            </div>
            <div className="risk-item">
              <div className="risk-icon">✅</div>
              <strong>100% Private</strong>
              <p>We don't sell your data. Period.</p>
            </div>
            <div className="risk-item">
              <div className="risk-icon">✅</div>
              <strong>Cancel Anytime</strong>
              <p>No strings attached.</p>
            </div>
            <div className="risk-item">
              <div className="risk-icon">✅</div>
              <strong>Your Data, Your Control</strong>
              <p>Export everything anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Every Day You Wait Costs You Money</h2>
          <p>Start tracking today. See results this month. Build wealth for life.</p>
          <button className="cta-btn-large" onClick={() => navigate('/login')}>
            Take Control Now — Free Forever
          </button>
          <p className="cta-subtext">Join 10,000+ people building their financial freedom</p>
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
