import React, { useState } from 'react';
import './InvestmentInsights.css';

function InvestmentInsights() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Wealthsimple referral link (replace with your actual referral code)
  const wealthsimpleReferralLink = 'https://my.wealthsimple.com/app/public/signup?is_retargeting=true&source_caller=ui&shortlink=3i2t30pp&c=referral-promocode-share-link-2023&pid=referral&af_xp=custom&af_reengagement_window=30d&referralcode=7SNUHS';

  return (
    <div className="investment-insights">
      {/* Hero Section */}
      <div className="strategy-header">
        <h2>🚀 Start Your Investment Journey</h2>
        <p>Build wealth for your future with smart, simple investing</p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="insights-nav">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'start' ? 'active' : ''}
          onClick={() => setActiveTab('start')}
        >
          Ready to Start
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="content-section">
          {/* Benefits */}
          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">📈</span>
              <h4>Grow Your Wealth</h4>
              <p>Historical average stock market returns are ~7-10% annually, outpacing inflation and savings accounts.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🎯</span>
              <h4>Reach Financial Goals</h4>
              <p>Whether it's retirement, a home, or financial independence, investing helps you get there faster.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🛡️</span>
              <h4>Tax Advantages</h4>
              <p>TFSAs and RRSPs provide tax-free or tax-deferred growth, keeping more money in your pocket.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">⏱️</span>
              <h4>Time is Your Friend</h4>
              <p>The earlier you start, the more time your money has to compound and grow exponentially.</p>
            </div>
          </div>

          {/* Account Types Section */}
          <div className="section-divider">
            <h2>📋 Choose Your Investment Account</h2>
            <p className="section-desc">Understanding Canadian account types is crucial for tax-efficient investing</p>
          </div>

          <div className="account-types">
            <div className="account-card tfsa">
              <div className="account-header">
                <h4>TFSA (Tax-Free Savings Account)</h4>
                <span className="badge">Best for Beginners</span>
              </div>
              <div className="account-details">
                <p className="account-desc">Tax-free growth and withdrawals. Perfect for most goals.</p>
                
                <div className="account-pros">
                  <h5>✓ Best For:</h5>
                  <ul>
                    <li>First-time investors</li>
                    <li>Short to medium-term goals</li>
                    <li>Maximum flexibility</li>
                    <li>Tax-free withdrawals anytime</li>
                  </ul>
                </div>

                <div className="account-limits">
                  <p><strong>2025 Contribution Limit:</strong> $7,000</p>
                  <p><strong>Lifetime Limit:</strong> $95,000 (if never contributed)</p>
                </div>

                <div className="account-note">
                  <p>💡 All growth and withdrawals are 100% tax-free!</p>
                </div>
              </div>
            </div>

            <div className="account-card fhsa">
              <div className="account-header">
                <h4>FHSA (First Home Savings Account)</h4>
                <span className="badge">First-Time Home Buyers</span>
              </div>
              <div className="account-details">
                <p className="account-desc">Save for your first home with tax-free withdrawals and tax deductions.</p>
                
                <div className="account-pros">
                  <h5>✓ Best For:</h5>
                  <ul>
                    <li>First-time home buyers</li>
                    <li>Saving for a down payment</li>
                    <li>Tax deductions + tax-free withdrawals</li>
                    <li>Ages 18+ who haven't owned a home in 4 years</li>
                  </ul>
                </div>

                <div className="account-limits">
                  <p><strong>Annual Contribution Limit:</strong> $8,000</p>
                  <p><strong>Lifetime Limit:</strong> $40,000</p>
                  <p><strong>Must use within 15 years</strong></p>
                </div>

                <div className="account-note">
                  <p>💡 Best of both worlds: Tax deduction like RRSP + tax-free withdrawal like TFSA!</p>
                </div>
              </div>
            </div>

            <div className="account-card rrsp">
              <div className="account-header">
                <h4>RRSP (Retirement Savings Plan)</h4>
                <span className="badge">Retirement</span>
              </div>
              <div className="account-details">
                <p className="account-desc">Tax-deferred growth for retirement. Get tax deductions now.</p>
                
                <div className="account-pros">
                  <h5>✓ Best For:</h5>
                  <ul>
                    <li>Retirement savings</li>
                    <li>High income earners</li>
                    <li>Long-term investing (20+ years)</li>
                    <li>Immediate tax deductions</li>
                  </ul>
                </div>

                <div className="account-limits">
                  <p><strong>2025 Contribution Limit:</strong> 18% of income (max $31,560)</p>
                </div>

                <div className="account-note">
                  <p>💡 Pay tax on withdrawals in retirement when income is lower.</p>
                </div>
              </div>
            </div>

            <div className="account-card non-reg">
              <div className="account-header">
                <h4>Non-Registered Account</h4>
                <span className="badge">No Limits</span>
              </div>
              <div className="account-details">
                <p className="account-desc">Taxable account with no contribution limits.</p>
                
                <div className="account-pros">
                  <h5>✓ Best For:</h5>
                  <ul>
                    <li>After maxing TFSA & RRSP</li>
                    <li>No contribution limits</li>
                    <li>Dividend income (preferential tax)</li>
                  </ul>
                </div>

                <div className="account-note">
                  <p>💡 Use this after maxing out registered accounts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="section-divider">
            <h2>📚 Investment 101: Key Concepts</h2>
          </div>

          <div className="education-grid">
            <div className="edu-card">
              <h4>💡 What is an ETF?</h4>
              <p><strong>Exchange-Traded Fund (ETF)</strong> is a basket of stocks or bonds you can buy in one transaction.</p>
              <ul>
                <li><strong>Instant diversification:</strong> Own hundreds of companies</li>
                <li><strong>Low fees:</strong> Typically 0.05-0.25% per year</li>
                <li><strong>Easy to buy:</strong> Trade like stocks</li>
              </ul>
              <p className="example">Example: XEQT holds 9,000+ global stocks in one ETF!</p>
            </div>

            <div className="edu-card">
              <h4>📈 Risk & Return</h4>
              <p>Higher potential returns come with higher risk (volatility).</p>
              <div className="risk-spectrum">
                <div className="risk-level">
                  <span>Low Risk</span>
                  <p>Bonds, GICs</p>
                  <p>~2-4% return</p>
                </div>
                <div className="risk-level">
                  <span>Medium Risk</span>
                  <p>Balanced funds</p>
                  <p>~5-7% return</p>
                </div>
                <div className="risk-level">
                  <span>High Risk</span>
                  <p>Stocks, Equity ETFs</p>
                  <p>~7-10% return</p>
                </div>
              </div>
            </div>

            <div className="edu-card">
              <h4>⏰ Dollar-Cost Averaging</h4>
              <p>Invest a fixed amount regularly, regardless of market conditions.</p>
              <ul>
                <li>Buy more shares when prices are low</li>
                <li>Buy fewer shares when prices are high</li>
                <li>Averages out your purchase price over time</li>
                <li>Removes emotional decision-making</li>
              </ul>
            </div>

            <div className="edu-card">
              <h4>🚫 Common Mistakes</h4>
              <ul>
                <li><strong>Timing the market:</strong> Don't wait for the "perfect" time</li>
                <li><strong>Panic selling:</strong> Stay invested through downturns</li>
                <li><strong>High fees:</strong> Avoid mutual funds with 2%+ fees</li>
                <li><strong>Not diversifying:</strong> Don't put all eggs in one basket</li>
                <li><strong>Checking too often:</strong> Set it and forget it</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Ready to Start Tab */}
      {activeTab === 'start' && (
        <div className="content-section">


          {/* Single CTA Card */}
          <div className="start-cta-wrapper">
            <div className="start-cta-card">
              <div className="cta-header">
                <h3>Open a Wealthsimple Account</h3>
              </div>
              
              <p className="cta-description">Wealthsimple offers commission-free trading and is perfect for beginners.</p>
              
              <div className="wealthsimple-cta-box">
                <a 
                  href={wealthsimpleReferralLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="referral-btn-large"
                >
                  📱 Open Wealthsimple TFSA (Get $25 Bonus)
                </a>
                <p className="referral-note">Use our referral link and we both get $25 to invest! 🎉</p>
              </div>

              <div className="features-list">
                <div className="feature-item">
                  <span className="check-icon">✓</span>
                  <p>$0 commission on Canadian stocks & ETFs</p>
                </div>
                <div className="feature-item">
                  <span className="check-icon">✓</span>
                  <p>No minimum deposit</p>
                </div>
                <div className="feature-item">
                  <span className="check-icon">✓</span>
                  <p>Easy mobile app</p>
                </div>
                <div className="feature-item">
                  <span className="check-icon">✓</span>
                  <p>TFSA, FHSA, RRSP, and Personal accounts available</p>
                </div>
              </div>

              <p className="disclaimer">Not financial advice. Do your own research or consult a financial advisor.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentInsights;
