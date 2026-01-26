import React, { useState } from 'react';
import './InsuranceCalculator.css';




export default function InsuranceCalculator() {
  const [formData, setFormData] = useState({
    province: 'ON',
    hasAuto: false,
    hasHome: false,
    currentAutoMonthly: '',
    currentHomeMonthly: '',
    autoAge: '',
    homeAge: ''
  });

  const [results, setResults] = useState(null);
  const [showTips, setShowTips] = useState(false);

  const averageCosts = {
    auto: {
      ON: 160,
      AB: 145,
      BC: 121,
      QC: 113,
      MB: 113,
      SK: 103,
      NS: 96,
      NB: 93,
      NL: 106,
      PE: 90
    },
    home: {
      ON: 130,
      AB: 83,
      BC: 100,
      QC: 70,
      MB: 85,
      SK: 80,
      NS: 67,
      NB: 67,
      NL: 75,
      PE: 65
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const calculateSavings = () => {
    const autoAvg = averageCosts.auto[formData.province];
    const homeAvg = averageCosts.home[formData.province];
    
    let totalCurrent = 0;
    let totalAverage = 0;
    let potentialSavings = 0;
    let bundleSavings = 0;
    let ageSavings = 0;

    if (formData.hasAuto && formData.currentAutoMonthly) {
      totalCurrent += parseFloat(formData.currentAutoMonthly);
      totalAverage += autoAvg;
    }
    if (formData.hasHome && formData.currentHomeMonthly) {
      totalCurrent += parseFloat(formData.currentHomeMonthly);
      totalAverage += homeAvg;
    }

    const overpayment = Math.max(0, totalCurrent - totalAverage);

    if (formData.hasAuto && formData.hasHome) {
      bundleSavings = totalCurrent * 0.15;
    }

    if (formData.autoAge >= 25 && formData.hasAuto) {
      ageSavings += parseFloat(formData.currentAutoMonthly || autoAvg) * 0.08;
    }

    potentialSavings = overpayment + bundleSavings + ageSavings;

    setResults({
      currentMonthly: totalCurrent,
      averageMonthly: totalAverage,
      overpayment,
      bundleSavings,
      ageSavings,
      potentialSavings,
      potentialAnnual: potentialSavings * 12
    });
  };

  const insuranceTips = [
    {
      title: 'Bundle Home & Auto',
      savings: 'Save 10-18%',
      description: 'Bundle your home and auto insurance with the same provider to save an average of $484/year.',
      icon: '🏠🚗'
    },
    {
      title: 'Increase Your Deductible',
      savings: 'Save 10-25%',
      description: 'Raising your deductible from $500 to $1,000 can lower your premium by 10-25%.',
      icon: '💵'
    },
    {
      title: 'Shop Around Annually',
      savings: 'Save 20-40%',
      description: 'Compare quotes from multiple providers every year. Rates can vary by hundreds of dollars for the same coverage.',
      icon: '🔍'
    },
    {
      title: 'Improve Your Credit Score',
      savings: 'Save 15-20%',
      description: 'Many insurers use credit scores to determine rates. Improving your score can significantly lower premiums.',
      icon: '📊'
    },
    {
      title: 'Ask About Discounts',
      savings: 'Save 5-15%',
      description: 'Safe driver discounts, alumni discounts, good student discounts, and more can add up quickly.',
      icon: '🎓'
    },
    {
      title: 'Install Safety Features',
      savings: 'Save 5-20%',
      description: 'Anti-theft devices, winter tires, and home security systems can all reduce your premiums.',
      icon: '🔒'
    }
  ];

  return (
    <div className="insurance-calculator-container">
      <div className="insurance-header">
         <h2>💰 Spend less. <span className="highlight-green">Save more.</span></h2>
        <h3>Paying too much for insurance each month? <strong>Let's change that.</strong></h3>

      </div>

      <div className="insurance-form">
  {/* MOVE Province selector to AFTER the checkboxes */}
  
  <div className="insurance-types">
    <label className="checkbox-label">
      <input
        type="checkbox"
        name="hasAuto"
        checked={formData.hasAuto}
        onChange={handleInputChange}
      />
      <span>I have auto insurance</span>
    </label>

    {formData.hasAuto && (
      <div className="nested-inputs">
        <input
          type="number"
          name="currentAutoMonthly"
          placeholder="Current monthly auto premium"
          value={formData.currentAutoMonthly}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="autoAge"
          placeholder="Your age"
          value={formData.autoAge}
          onChange={handleInputChange}
        />
      </div>
    )}
  </div>

  <div className="insurance-types">
    <label className="checkbox-label">
      <input
        type="checkbox"
        name="hasHome"
        checked={formData.hasHome}
        onChange={handleInputChange}
      />
      <span>I have home/condo/tenant insurance</span>
    </label>

    {formData.hasHome && (
      <div className="nested-inputs">
        <input
          type="number"
          name="currentHomeMonthly"
          placeholder="Current monthly home premium"
          value={formData.currentHomeMonthly}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="homeAge"
          placeholder="Property age (years)"
          value={formData.homeAge}
          onChange={handleInputChange}
        />
      </div>
    )}
  </div>

  {/* Province selector MOVED HERE - After checkboxes, before button */}
  <div className="form-section province-section">
    <label>Province</label>
    <select name="province" value={formData.province} onChange={handleInputChange}>
      <option value="ON">Ontario</option>
      <option value="AB">Alberta</option>
      <option value="BC">British Columbia</option>
      <option value="QC">Quebec</option>
      <option value="MB">Manitoba</option>
      <option value="SK">Saskatchewan</option>
      <option value="NS">Nova Scotia</option>
      <option value="NB">New Brunswick</option>
      <option value="NL">Newfoundland & Labrador</option>
      <option value="PE">Prince Edward Island</option>
    </select>
  </div>

  <button onClick={calculateSavings} className="calculate-btn">
    Calculate My Savings
  </button>
</div>


      {results && (
        <div className="results-section">
          <h3>Your Potential Savings</h3>
          <div className="results-grid">
            <div className="result-card primary">
              <div className="result-value">${results.potentialSavings.toFixed(0)}/mo</div>
              <div className="result-label">Potential Monthly Savings</div>
              <div className="result-annual">${results.potentialAnnual.toFixed(0)}/year</div>
            </div>

            {results.overpayment > 0 && (
              <div className="result-card">
                <div className="result-value">${results.overpayment.toFixed(0)}</div>
                <div className="result-label">Above Provincial Average</div>
              </div>
            )}

            {results.bundleSavings > 0 && (
              <div className="result-card">
                <div className="result-value">${results.bundleSavings.toFixed(0)}</div>
                <div className="result-label">Bundle Discount (15%)</div>
              </div>
            )}

            {results.ageSavings > 0 && (
              <div className="result-card">
                <div className="result-value">${results.ageSavings.toFixed(0)}</div>
                <div className="result-label">Mature Driver Discount</div>
              </div>
            )}
          </div>

          <div className="comparison-bar">
            <div className="bar-label">
              <span>Your Cost: ${results.currentMonthly}/mo</span>
              <span>Average: ${results.averageMonthly.toFixed(0)}/mo</span>
            </div>
            <div className="bar-visual">
              <div 
                className="bar-fill current" 
                style={{width: `${(results.currentMonthly / (results.currentMonthly + 50)) * 100}%`}}
              ></div>
              <div 
                className="bar-fill average" 
                style={{width: `${(results.averageMonthly / (results.currentMonthly + 50)) * 100}%`}}
              ></div>
            </div>
          </div>

          <div className="cta-section">
            <p>Ready to save? Compare quotes from top Canadian insurers:</p>
            <a 
              href="https://rates.ca" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="quote-btn"
            >
              Get Free Quotes →
            </a>
          </div>
        </div>
      )}

      <div className="tips-section">
        <button className="tips-toggle" onClick={() => setShowTips(!showTips)}>
          {showTips ? '▼' : '►'} 6 Proven Ways to Reduce Insurance Costs
        </button>

        {showTips && (
          <div className="tips-grid">
            {insuranceTips.map((tip, index) => (
              <div key={index} className="tip-card">
                <div className="tip-icon">{tip.icon}</div>
                <div className="tip-content">
                  <h4>{tip.title}</h4>
                  <div className="tip-savings">{tip.savings}</div>
                  <p>{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
