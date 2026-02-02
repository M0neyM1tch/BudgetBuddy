import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { toDailySeries, cumulative, getMonthsList, calculateAnnualProjections } from '../../../utils/helpers';
import './Analytics.css';
import { calculateSummaries } from '../../../utils/helpers';

function Analytics({ transactions, recurringRules = [] }) {
  const [timeFilter, setTimeFilter] = useState('all');
  const [animatedValues, setAnimatedValues] = useState({});

  // Get unique months from transactions
  const months = getMonthsList(transactions);

  // Filter months based on time filter
  const getFilteredMonths = () => {
    if (timeFilter === 'all') return months;
    const count = timeFilter === '6m' ? 6 : 3;
    return months.slice(0, count);
  };

  const filteredMonths = getFilteredMonths();

  // Monthly data aggregation
  const monthlyData = filteredMonths.map((month) => {
    const monthTransactions = transactions.filter((tx) => tx.date.startsWith(month));
    const income = monthTransactions
      .filter((tx) => tx.category === 'Income')
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const expenses = monthTransactions
      .filter((tx) => tx.category === 'Expenses')
      .reduce((acc, tx) => acc + Math.abs(Number(tx.amount)), 0);

    const savingsFromCategory = monthTransactions
      .filter((tx) => tx.category === 'Savings')
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    const goalContributions = monthTransactions
      .filter((tx) => tx.category && tx.category.startsWith('Goal: '))
      .reduce((acc, tx) => acc + Math.abs(Number(tx.amount)), 0);

    const savings = savingsFromCategory + goalContributions;

    return { month, income, expenses, savings };
  });

  // Calculate summary stats
  const totalIncome = monthlyData.reduce((acc, d) => acc + d.income, 0);
  const totalExpenses = monthlyData.reduce((acc, d) => acc + d.expenses, 0);
  const totalSavings = monthlyData.reduce((acc, d) => acc + d.savings, 0);
  const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100) : 0;

  // ✨ Calculate month-over-month trends
  const calculateTrend = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return { percent: 0, direction: 'neutral' };
    const percent = ((currentValue - previousValue) / previousValue) * 100;
    const direction = percent > 0 ? 'positive' : percent < 0 ? 'negative' : 'neutral';
    return { percent: Math.abs(percent), direction };
  };

  const trends = monthlyData.length >= 2 ? {
    income: calculateTrend(monthlyData[0].income, monthlyData[1].income),
    expenses: calculateTrend(monthlyData[0].expenses, monthlyData[1].expenses),
    savings: calculateTrend(monthlyData[0].savings, monthlyData[1].savings),
    rate: calculateTrend(
      monthlyData[0].income > 0 ? (monthlyData[0].savings / monthlyData[0].income) * 100 : 0,
      monthlyData[1].income > 0 ? (monthlyData[1].savings / monthlyData[1].income) * 100 : 0
    ),
  } : null;

  // ✨ Animated number counting effect
  useEffect(() => {
    const targets = {
      income: avgMonthlyIncome,
      savings: totalSavings,
      rate: savingsRate,
      expenses: totalExpenses,
    };

    const duration = 1000; // 1 second
    const steps = 60;
    const increment = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues({
        income: targets.income * progress,
        savings: targets.savings * progress,
        rate: targets.rate * progress,
        expenses: targets.expenses * progress,
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targets);
      }
    }, increment);

    return () => clearInterval(timer);
  }, [avgMonthlyIncome, totalSavings, savingsRate, totalExpenses, timeFilter]);

  // Calculate insights
  const generateInsights = () => {
    const insights = [];

    if (savingsRate > 20) {
      insights.push({
        text: `Great job! Your savings rate is ${savingsRate.toFixed(1)}% 🎉`,
        type: 'positive'
      });
    } else if (savingsRate > 10) {
      insights.push({
        text: `You're saving ${savingsRate.toFixed(1)}% of your income. Consider increasing to 20%+`,
        type: 'neutral'
      });
    } else if (savingsRate > 0) {
      insights.push({
        text: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to increase your savings!`,
        type: 'warning'
      });
    }

    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[0];
      const previousMonth = monthlyData[1];
      const savingsChange = lastMonth.savings - previousMonth.savings;

      if (savingsChange > 0) {
        insights.push({
          text: `Savings increased by $${savingsChange.toFixed(2)} from last month! 📈`,
          type: 'positive'
        });
      } else if (savingsChange < 0) {
        insights.push({
          text: `Savings decreased by $${Math.abs(savingsChange).toFixed(2)} from last month`,
          type: 'warning'
        });
      }
    }

    if (monthlyData.length > 0) {
      const avgExpenses = monthlyData.reduce((acc, d) => acc + d.expenses, 0) / monthlyData.length;
      const lastMonthExpenses = monthlyData[0].expenses;

      if (lastMonthExpenses > avgExpenses * 1.2) {
        insights.push({
          text: `Last month's expenses were ${((lastMonthExpenses/avgExpenses - 1) * 100).toFixed(0)}% higher than average`,
          type: 'warning'
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  // ✨ Enhanced Chart data with gradients
  const incomeExpensesData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map((d) => d.income),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.8)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
          return gradient;
        },
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: monthlyData.map((d) => d.expenses),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
          return gradient;
        },
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Savings',
        data: monthlyData.map((d) => d.savings),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
          gradient.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
          return gradient;
        },
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // ✨ Cumulative savings with gradient fill
  const cumulativeSavingsData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: 'Cumulative Savings',
        data: cumulative(monthlyData.map((d) => d.savings)),
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)');
          return gradient;
        },
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 3,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
      },
    ],
  };

  // ✨ Enhanced chart options with better tooltips
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        labels: {
          color: '#f9fafb',
          font: {
            size: 13,
            weight: '600',
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(31, 41, 55, 0.98)',
        titleColor: '#f9fafb',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 2,
        padding: 16,
        displayColors: true,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += '$' + context.parsed.y.toFixed(2);
            
            // Add percentage of total
            if (context.datasetIndex < 3) {
              const total = context.chart.data.datasets
                .slice(0, 3)
                .reduce((sum, ds) => sum + ds.data[context.dataIndex], 0);
              const percent = ((context.parsed.y / total) * 100).toFixed(1);
              label += ` (${percent}%)`;
            }
            
            return label;
          },
          afterLabel: function(context) {
            // Show trend if available
            if (context.dataIndex > 0 && context.dataIndex < context.dataset.data.length) {
              const current = context.dataset.data[context.dataIndex];
              const previous = context.dataset.data[context.dataIndex - 1];
              const change = current - previous;
              const changePercent = ((change / previous) * 100).toFixed(1);
              
              if (change !== 0) {
                const arrow = change > 0 ? '↑' : '↓';
                return `${arrow} ${changePercent}% vs previous`;
              }
            }
            return '';
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#d1d5db',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: '#d1d5db',
          font: {
            size: 12,
          },
          callback: function (value) {
            return '$' + value.toLocaleString();
          },
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
          drawBorder: false,
        },
      },
    },
  };

  // ✨ Sparkline data generator
  const getSparklineData = (data, color) => {
    return {
      labels: data.map((_, i) => i),
      datasets: [{
        data: data,
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      }]
    };
  };

  const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      line: {
        borderWidth: 2,
      }
    }
  };

  // ✅ FIX: Use imported helper instead of defining locally
  const projections = calculateAnnualProjections(recurringRules);

  if (transactions.length === 0) {
    return (
      <div className="analytics-container">
        <div className="no-data">
          <h2>📊 No transaction data yet</h2>
          <p>Start adding transactions to see your financial analytics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Summary Cards with Sparklines and Trends */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-card-top">
            <span className="summary-icon">💰</span>
            <div className="summary-content">
              <h3>AVG MONTHLY INCOME</h3>
              <div className="summary-value-row">
                <p className="summary-value income">
                  ${(animatedValues.income || 0).toFixed(2)}
                </p>
                {trends && (
                  <span className={`trend-indicator ${trends.income.direction}`}>
                    <span className="trend-arrow">
                      {trends.income.direction === 'positive' ? '↑' : trends.income.direction === 'negative' ? '↓' : '→'}
                    </span>
                    {trends.income.percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="sparkline-container">
            <Line 
              data={getSparklineData(monthlyData.map(d => d.income).reverse(), '#10b981')} 
              options={sparklineOptions}
            />
          </div>
        </div>

        <div className="summary-card savings">
          <div className="summary-card-top">
            <span className="summary-icon">💎</span>
            <div className="summary-content">
              <h3>TOTAL SAVINGS</h3>
              <div className="summary-value-row">
                <p className="summary-value savings">
                  ${(animatedValues.savings || 0).toFixed(2)}
                </p>
                {trends && (
                  <span className={`trend-indicator ${trends.savings.direction}`}>
                    <span className="trend-arrow">
                      {trends.savings.direction === 'positive' ? '↑' : trends.savings.direction === 'negative' ? '↓' : '→'}
                    </span>
                    {trends.savings.percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="sparkline-container">
            <Line 
              data={getSparklineData(monthlyData.map(d => d.savings).reverse(), '#fbbf24')} 
              options={sparklineOptions}
            />
          </div>
        </div>

        <div className="summary-card rate">
          <div className="summary-card-top">
            <span className="summary-icon">📊</span>
            <div className="summary-content">
              <h3>SAVINGS RATE</h3>
              <div className="summary-value-row">
                <p className="summary-value rate">
                  {(animatedValues.rate || 0).toFixed(1)}%
                </p>
                {trends && (
                  <span className={`trend-indicator ${trends.rate.direction}`}>
                    <span className="trend-arrow">
                      {trends.rate.direction === 'positive' ? '↑' : trends.rate.direction === 'negative' ? '↓' : '→'}
                    </span>
                    {trends.rate.percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="sparkline-container">
            <Line 
              data={getSparklineData(
                monthlyData.map(d => d.income > 0 ? (d.savings / d.income) * 100 : 0).reverse(), 
                '#3b82f6'
              )} 
              options={sparklineOptions}
            />
          </div>
        </div>

        <div className="summary-card expenses">
          <div className="summary-card-top">
            <span className="summary-icon">💸</span>
            <div className="summary-content">
              <h3>TOTAL EXPENSES</h3>
              <div className="summary-value-row">
                <p className="summary-value expenses">
                  ${(animatedValues.expenses || 0).toFixed(2)}
                </p>
                {trends && (
                  <span className={`trend-indicator ${trends.expenses.direction === 'negative' ? 'positive' : 'negative'}`}>
                    <span className="trend-arrow">
                      {trends.expenses.direction === 'positive' ? '↑' : trends.expenses.direction === 'negative' ? '↓' : '→'}
                    </span>
                    {trends.expenses.percent.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="sparkline-container">
            <Line 
              data={getSparklineData(monthlyData.map(d => d.expenses).reverse(), '#ef4444')} 
              options={sparklineOptions}
            />
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h2>💡 Key Insights</h2>
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <p>{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Filter */}
      <div className="time-filter">
        <button
          className={timeFilter === '3m' ? 'active' : ''}
          onClick={() => setTimeFilter('3m')}
        >
          Last 3 Months
        </button>
        <button
          className={timeFilter === '6m' ? 'active' : ''}
          onClick={() => setTimeFilter('6m')}
        >
          Last 6 Months
        </button>
        <button
          className={timeFilter === 'all' ? 'active' : ''}
          onClick={() => setTimeFilter('all')}
        >
          All Time
        </button>
      </div>

      {/* Monthly Income vs Expenses Chart */}
      <div className="analytics-card">
        <h2>📈 Monthly Income vs Expenses</h2>
        <div className="chart-wrapper">
          <Bar data={incomeExpensesData} options={chartOptions} />
        </div>
      </div>

      {/* Cumulative Savings Chart */}
      <div className="analytics-card">
        <h2>📈 Cumulative Savings Over Time</h2>
        <div className="chart-wrapper">
          <Line data={cumulativeSavingsData} options={chartOptions} />
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="analytics-card">
        <h2>📅 Monthly Breakdown</h2>
        <div className="monthly-breakdown">
          {monthlyData.slice(0, 6).map((data) => {
            const rate = data.income > 0 ? ((data.savings / data.income) * 100) : 0;
            return (
              <div key={data.month} className="month-card">
                <h3>{data.month}</h3>
                <div className="month-stats">
                  <div className="stat">
                    <span className="stat-label">INCOME</span>
                    <span className="stat-value income">${data.income.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">EXPENSES</span>
                    <span className="stat-value expenses">${data.expenses.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">SAVINGS</span>
                    <span className="stat-value savings">${data.savings.toFixed(2)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">SAVINGS RATE</span>
                    <span className="stat-value rate">{rate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recurring Projections */}
      {recurringRules.length > 0 && (
        <div className="recurring-projections-section">
          <h2>🔄 Fixed Income & Expenses Projection</h2>
          
          <div className="projection-grid">
            <div className="projection-card income-card">
              <div className="projection-icon">💰</div>
              <h3>📈 Annual Recurring Income</h3>
              <div className="projection-amount">${projections.annualIncome.toFixed(2)}</div>
              <div className="projection-monthly">Monthly Avg: ${projections.monthlyIncome.toFixed(2)}</div>
            </div>

            <div className="projection-card expense-card">
              <div className="projection-icon">💸</div>
              <h3>📉 Annual Recurring Expenses</h3>
              <div className="projection-amount">${projections.annualExpenses.toFixed(2)}</div>
              <div className="projection-monthly">Monthly Avg: ${projections.monthlyExpenses.toFixed(2)}</div>
            </div>

            <div className={`projection-card net-card ${projections.netAnnual >= 0 ? 'positive' : 'negative'}`}>
              <div className="projection-icon">📊</div>
              <h3>💼 Net Annual Projection</h3>
              <div className="projection-amount">${projections.netAnnual.toFixed(2)}</div>
              <div className="projection-monthly">Monthly Net: ${(projections.netAnnual / 12).toFixed(2)}</div>
            </div>
          </div>

          <div className="projection-breakdown">
            <h3>Recurring Transactions Breakdown</h3>
            <div className="recurring-table-wrapper">
              <table className="recurring-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Frequency</th>
                    <th>Amount per Period</th>
                    <th>Annual Projection</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringRules.map((rule, index) => {
                    const amount = Math.abs(Number(rule.amount));
                    let multiplier = 0;
                    
                    switch(rule.frequency.toLowerCase()) {
                      case 'daily': multiplier = 365; break;
                      case 'weekly': multiplier = 52; break;
                      case 'biweekly': multiplier = 26; break;
                      case 'monthly': multiplier = 12; break;
                      case 'quarterly': multiplier = 4; break;
                      case 'yearly': multiplier = 1; break;
                      default: multiplier = 0;
                    }

                    return (
                      <tr key={index} className={rule.category === 'Income' ? 'income-row' : 'expense-row'}>
                        <td>🔄 {rule.description}</td>
                        <td>{rule.category}</td>
                        <td>{rule.frequency}</td>
                        <td>${amount.toFixed(2)}</td>
                        <td>${(amount * multiplier).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;