// src/utils/helpers.js

// Date and data transformation helpers
export function toDailySeries(dates, seriesByDate) {
  return dates.map((d) => seriesByDate[d] || 0);
}

export function cumulative(arr) {
  let run = 0;
  return arr.map((v) => {
    run += v;
    return run;
  });
}

export function getMonthsList(transactions) {
  const months = transactions.map((tx) => tx.date.slice(0, 7)).filter(Boolean);
  return Array.from(new Set(months)).sort().reverse();
}

// Calculator helper
export function calcBudget(monthlyIncome, savingsPercent) {
  const savings = monthlyIncome * (savingsPercent / 100);
  const spendable = monthlyIncome - savings;
  return { savings, spendable };
}

// Transaction calculations
export function calculateSummaries(transactions) {
  const summaryIncome = transactions
    .filter((tx) => tx.category === 'Income')
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  const summaryExpenses = transactions
    .filter((tx) => tx.category === 'Expenses')
    .reduce((acc, tx) => acc + Math.abs(Number(tx.amount)), 0);

  // Calculate savings from "Savings" category
  const savingsFromCategory = transactions
    .filter((tx) => tx.category === 'Savings')
    .reduce((acc, tx) => acc + Number(tx.amount), 0);

  // Calculate goal contributions (transactions with category starting with "Goal: ")
  const goalContributions = transactions
    .filter((tx) => tx.category && tx.category.startsWith('Goal: '))
    .reduce((acc, tx) => acc + Math.abs(Number(tx.amount)), 0);

  // Total savings = Savings category + Goal contributions
  const summarySavings = savingsFromCategory + goalContributions;

  return { summaryIncome, summaryExpenses, summarySavings };
}

// Format date for display
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format currency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

// ✅ FIXED: Calculate annual projections from RECURRING RULES
export const calculateAnnualProjections = (recurringRules) => {
  // Ensure we are working with an array
  const rules = Array.isArray(recurringRules) ? recurringRules : [];
  
  let annualIncome = 0;
  let annualExpenses = 0;
  
  rules.forEach(rule => {
    // Only count active rules
    if (rule.is_active === false) return;

    const amount = Math.abs(Number(rule.amount));
    const isIncome = rule.category === 'Income';
    
    // Normalize frequency
    const frequency = rule.frequency || 'monthly';
    
    // Determine annual multiplier
    let annualMultiplier = 12; // Default to monthly
    switch (frequency.toLowerCase()) {
      case 'biweekly':
        annualMultiplier = 26;
        break;
      case 'weekly':
        annualMultiplier = 52;
        break;
      case 'monthly':
      default:
        annualMultiplier = 12;
        break;
    }
    
    const annualAmount = amount * annualMultiplier;
    
    console.log(`📊 ${rule.description}: ${frequency} × $${amount.toFixed(2)} = $${annualAmount.toFixed(2)} annually`);
    
    if (isIncome) {
      annualIncome += annualAmount;
    } else {
      annualExpenses += annualAmount;
    }
  });
  
  console.log(`💰 Total Annual Income: $${annualIncome.toFixed(2)}, Total Annual Expenses: $${annualExpenses.toFixed(2)}`);
  
  const monthlyIncome = annualIncome / 12;
  const monthlyExpenses = annualExpenses / 12;
  
  return {
    annualIncome,
    annualExpenses,
    netAnnual: annualIncome - annualExpenses,
    monthlyIncome,
    monthlyExpenses,
  };
};

// ✅ UPDATED: Combine actual transactions + recurring projections for health score
export function generateDashboardInsights(transactions, goals, recurringRules = []) {
  // Get actual transaction summaries
  const { summaryIncome, summaryExpenses, summarySavings } = calculateSummaries(transactions);
  
  // Get projected recurring values
  const projections = calculateAnnualProjections(recurringRules);
  
  // ✅ COMBINE actual transactions + recurring projections for health score
  const totalMonthlyIncome = summaryIncome + projections.monthlyIncome;
  const totalMonthlyExpenses = summaryExpenses + projections.monthlyExpenses;
  const netCashFlow = totalMonthlyIncome - totalMonthlyExpenses;
  const savingsRate = totalMonthlyIncome > 0 ? (summarySavings / totalMonthlyIncome) * 100 : 0;
  const monthlyRunway = totalMonthlyExpenses > 0 ? summarySavings / totalMonthlyExpenses : 0;
  
  // Calculate goal progress
  const activeGoals = goals.filter(g => (g.current_amount || 0) < g.target_amount);
  const avgGoalProgress = activeGoals.length > 0
    ? activeGoals.reduce((sum, g) => sum + ((g.current_amount || 0) / g.target_amount * 100), 0) / activeGoals.length
    : 100;
  
  // ✅ Health score now includes recurring rules in calculation
  const healthScore = Math.round((
    Math.min(savingsRate * 5, 100) + // 20% savings = 100 points
    (netCashFlow > 0 ? 100 : 0) +
    avgGoalProgress +
    Math.min(monthlyRunway * 16.67, 100) // 6 months = 100 points
  ) / 4);
  
  // Identify shortcomings (now using combined totals)
  const shortcomings = [];
  
  if (netCashFlow < 0) {
    shortcomings.push({
      severity: 'critical',
      icon: '🚨',
      message: `Spending ${formatCurrency(Math.abs(netCashFlow))} more than you earn`,
      action: 'Reduce expenses or increase income'
    });
  }
  
  if (savingsRate < 10 && totalMonthlyIncome > 0) {
    shortcomings.push({
      severity: 'warning',
      icon: '⚠️',
      message: `Low savings rate: ${savingsRate.toFixed(1)}% (target: 20%+)`,
      action: `Save ${formatCurrency((totalMonthlyIncome * 0.20) - summarySavings)} more per month`
    });
  }
  
  if (monthlyRunway < 3 && monthlyRunway > 0) {
    shortcomings.push({
      severity: 'warning',
      icon: '💰',
      message: `Only ${monthlyRunway.toFixed(1)} months emergency fund`,
      action: `Build to ${formatCurrency(totalMonthlyExpenses * 3)}`
    });
  }
  
  // Generate recommendations
  const recommendations = [];
  
  if (netCashFlow > 0) {
    const lowestGoal = activeGoals.sort((a, b) => 
      ((a.current_amount || 0) / a.target_amount) - ((b.current_amount || 0) / b.target_amount)
    )[0];
    
    if (lowestGoal) {
      recommendations.push({
        icon: '💡',
        message: `Allocate ${formatCurrency(netCashFlow)} surplus to "${lowestGoal.name}"`
      });
    }
  }
  
  if (projections.netAnnual > 0) {
    recommendations.push({
      icon: '📈',
      message: `Annual surplus projected: ${formatCurrency(projections.netAnnual)}`
    });
  }
  
  if (savingsRate >= 20 && monthlyRunway >= 6) {
    recommendations.push({
      icon: '✅',
      message: 'Excellent financial health! Consider investing excess savings'
    });
  }
  
  return {
    healthScore,
    keyMetrics: {
      monthlyIncome: totalMonthlyIncome, // ✅ Now includes recurring
      monthlyExpenses: totalMonthlyExpenses, // ✅ Now includes recurring
      monthlySavings: summarySavings,
      netCashFlow,
      savingsRate: savingsRate.toFixed(1),
      monthlyRunway: monthlyRunway.toFixed(1),
      activeGoalsCount: activeGoals.length
    },
    shortcomings,
    recommendations,
    projections
  };
}
