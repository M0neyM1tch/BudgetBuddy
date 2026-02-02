import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ADDED useNavigate
import './BudgetBuddy.css';
import '../../index.css';
import SaveMore from './SaveMore/SaveMore';
import { useAuth } from '../../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';


// Import components
import Dashboard from './Dashboard/Dashboard';
import Transactions from './Transactions/Transactions';
import Analytics from './Analytics/Analytics';
import Calculator from './Calculator/Calculator';
import Goals from './Goals/Goals';
import InsuranceCalculator from './InsuranceCalculator/InsuranceCalculator';
import InvestmentInsights from './InvestmentInsights/InvestmentInsights';

// Import utilities
import { FREE_LIMIT, API_BASE, DEFAULT_CATEGORIES, BANK_CONFIGS } from '../../utils/constants';
import { calculateSummaries, generateDashboardInsights } from '../../utils/helpers';


// Import Supabase helpers
import {
  fetchTransactions,
  fetchRecurringRules,
  fetchGoals,
  addTransaction as addTransactionDB,
  deleteTransaction as deleteTransactionDB,
  updateTransaction as updateTransactionDB,
  addGoal as addGoalDB,
  updateGoal as updateGoalDB,
  deleteGoal as deleteGoalDB,
  processDueRecurringTransactions
} from '../../utils/supabaseHelpers';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


function BudgetBuddy() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Core state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      // If no user, stop loading so public features can be accessed
      setDataLoading(false);
    }
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      setDataLoading(true);
      
      console.log('📊 Loading user data from Supabase for:', user.email);
      
      // Load transactions and goals in parallel
      const [txData, goalsData, rulesData] = await Promise.all([
        fetchTransactions(user.id),
        fetchGoals(user.id),
        fetchRecurringRules(user.id)
      ]);

      console.log('✅ Loaded transactions:', txData?.length || 0);
      console.log('✅ Loaded goals:', goalsData?.length || 0);

      setTransactions(txData || []);
      setGoals(goalsData || []);
      setRecurringRules(rulesData || []);

    } catch (error) {
      console.error('❌ Error loading user data:', error);
      alert('Failed to load your data. Please refresh the page.');
    } finally {
      setDataLoading(false);
    }
  };

  // ========================================
  // 🔥 PROCESS DUE RECURRING TRANSACTIONS
  // ========================================
  useEffect(() => {
    const processDueTransactions = async () => {
      if (!user) return;

      try {
        console.log('🔄 Checking for due recurring transactions...');
        const createdTransactions = await processDueRecurringTransactions(user.id);

        // If any transactions were created, reload the full transaction list
        if (createdTransactions && createdTransactions.length > 0) {
          console.log(`✅ Created ${createdTransactions.length} due recurring transaction(s)`);
          
          // Reload transactions to show the new ones
          const allTransactions = await fetchTransactions(user.id);
          setTransactions(allTransactions);
        } else {
          console.log('✓ No due recurring transactions found');
        }
      } catch (error) {
        console.error('⚠️ Failed to process recurring transactions:', error);
        // Silent failure - don't annoy users with alerts
      }
    };

    // Run on mount and whenever user changes
    processDueTransactions();
  }, [user?.id]);




  // Recalculate goal progress from transactions whenever transactions or goals change
  useEffect(() => {
    if (goals.length === 0 || transactions.length === 0) return;

    console.log('🔄 Recalculating goal progress from transactions');

    // Calculate contributions for each goal from transactions
    const updatedGoals = goals.map((goal) => {
      // Find all transactions categorized for this goal
      const goalTransactions = transactions.filter(
        (tx) => tx.category === `Goal: ${goal.name}`
      );

      // Sum up the amounts
      const totalContributions = goalTransactions.reduce(
        (sum, tx) => sum + Math.abs(Number(tx.amount)),
        0
      );

      console.log('🎯 Goal:', goal.name, 'Total Contributions:', totalContributions);

      return {
        ...goal,
        current_amount: totalContributions
      };
    });

    // Only update if there are actual changes
    const hasChanges = updatedGoals.some(
      (goal, idx) => (goal.current_amount || 0) !== (goals[idx]?.current_amount || 0)
    );

    if (hasChanges) {
      console.log('✅ Updating goals with recalculated progress');
      // Update goals in Supabase
      updatedGoals.forEach(async (goal) => {
        const oldGoal = goals.find(g => g.id === goal.id);
        if ((goal.current_amount || 0) !== (oldGoal?.current_amount || 0)) {
          try {
            await updateGoalDB(goal.id, { 
              current_amount: Number(goal.current_amount) || 0 
            }, user?.id);
          } catch (error) {
            console.error('Error updating goal:', error);
          }
        }
      });
      setGoals(updatedGoals);
    }

  }, [transactions, goals.length]);

  // Calculate summaries
  const { summaryIncome, summaryExpenses, summarySavings } = calculateSummaries(transactions);

  // Transaction handlers
  const handleAddTransaction = async (formData) => {
    // Check free tier limit
    if (!user?.isPremium && transactions.length >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      let amount = Number(formData.amount);

      // Ensure proper signs based on category
      if (formData.category === 'Expenses' && amount > 0) {
        amount = -amount;
      } else if (formData.category === 'Income' && amount < 0) {
        amount = Math.abs(amount);
      } else if (formData.category === 'Savings' && amount < 0) {
        amount = Math.abs(amount);
      }

      const newTransactionData = {
        date: formData.date,
        amount: amount,
        description: formData.description,
        category: formData.category,
        is_recurring: formData.isRecurring || false,
      };

      console.log('💾 Saving transaction to Supabase:', newTransactionData);

      const savedTransaction = await addTransactionDB(user.id, newTransactionData);
      
      setTransactions([savedTransaction, ...transactions]);
      
      console.log('✅ Transaction saved successfully');
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      alert('Failed to add transaction: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await deleteTransactionDB(id, user.id);
        setTransactions(transactions.filter((tx) => tx.id !== id));
        console.log('✅ Transaction deleted');
      } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        alert('Failed to delete transaction: ' + error.message);
      }
    }
  };

  const handleUpdateCategory = async (transactionId, newCategory) => {
    console.log('🔄 Updating category for transaction:', transactionId, 'to:', newCategory);

    try {
      await updateTransactionDB(transactionId, { category: newCategory }, user.id);

      const updatedTransactions = transactions.map((tx) => {
        if (tx.id === transactionId) {
          // If new category is a goal, recalculate goal progress
          if (newCategory.startsWith('Goal: ')) {
            const goalName = newCategory.replace('Goal: ', '');
            const transactionAmount = Math.abs(Number(tx.amount));
            console.log('🎯 Contributing to goal:', goalName, 'Amount:', transactionAmount);
          }
          return { ...tx, category: newCategory };
        }
        return tx;
      });

      setTransactions(updatedTransactions);
      console.log('✅ Category updated successfully');
    } catch (error) {
      console.error('❌ Error updating category:', error);
      alert('Failed to update category: ' + error.message);
    }
  };

  const handleCSVParsed = (parsedTransactions) => {
    console.log('📥 BudgetBuddy received parsed transactions:', parsedTransactions.length);

    if (!user?.isPremium && transactions.length >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    // Save each transaction to Supabase
    parsedTransactions.forEach(async (tx) => {
      try {
        const savedTx = await addTransactionDB(user.id, {
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          category: tx.category,
          is_recurring: false
        });
        setTransactions(prev => [savedTx, ...prev]);
      } catch (error) {
        console.error('Error saving CSV transaction:', error);
      }
    });

    console.log('✅ CSV Transactions being saved to Supabase');
  };

  // Helper function to check if tab is public
  const isPublicTab = (tab) => {
    return ['calculator', 'investments'].includes(tab);
  };

  // Render locked feature message for non-authenticated users
  const featureScreenshots = {
  dashboard: '/screenshots/dashboard.jpg',
  transactions: '/screenshots/transactions.jpg',
  goals: '/screenshots/goals.jpg',
  analytics: '/screenshots/analytics.jpg'
};

// Replace your existing renderLockedFeature function with this:
const renderLockedFeature = () => {
  const featureMessages = {
    dashboard: 'View your financial dashboard with real-time insights and spending summaries',
    transactions: 'Track and manage all your income, expenses, and recurring payments',
    goals: 'Set and monitor your financial goals with visual progress tracking',
    analytics: 'Analyze your spending patterns with interactive charts and detailed reports'
  };

  return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      maxWidth: '700px',
      margin: '0 auto',
      background: 'rgba(20, 20, 30, 0.95)', // Dark theme
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(5, 150, 105, 0.2)'
    }}>
      {/* Screenshot Preview */}
      {featureScreenshots[activeTab] && (
        <div style={{
          marginBottom: '30px',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <img 
            src={featureScreenshots[activeTab]} 
            alt={`${activeTab} preview`}
            style={{
              width: '100%',
              height: 'auto',
              filter: 'blur(4px) brightness(0.6)',
              opacity: '0.7'
            }}
          />
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '64px'
          }}>
            🔒
          </div>
        </div>
      )}

      <h2 style={{ 
        color: '#10b981', // Green accent
        marginBottom: '16px', 
        fontSize: '28px',
        fontWeight: '700'
      }}>
        Sign In to Access This Feature
      </h2>
      <p style={{ 
        color: '#d1d5db', // Light gray text
        marginBottom: '30px', 
        fontSize: '16px', 
        lineHeight: '1.6' 
      }}>
        {featureMessages[activeTab] || 'Sign in to access premium features'}
      </p>
      <button
        onClick={() => navigate('/login')}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', // Green gradient
          color: 'white',
          border: 'none',
          padding: '16px 40px',
          fontSize: '18px',
          fontWeight: '600',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.4)'
        }}
        onMouseOver={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 20px rgba(5, 150, 105, 0.6)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.4)';
        }}
      >
        Sign In / Sign Up Free
      </button>
      <p style={{ 
        marginTop: '20px', 
        color: '#6b7280', // Medium gray
        fontSize: '14px' 
      }}>
        No credit card required
      </p>
    </div>
  );
};

  // Show loading screen only for authenticated users
  if (dataLoading && user) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading BudgetBuddy...
      </div>
    );
  }

  return (
    <div className="budget-buddy">
      {/* Navigation */}
      <nav className="main-nav">
        <div className="nav-brand">
          <img 
            src="/BBLogo.jpg" 
            alt="BudgetBuddy Logo" 
            className="nav-logo" 
          />
          <h1>BudgetBuddy</h1>
          <span className="beta-badge-nav">🚧 BETA</span>
        </div>

        <div className="nav-tabs">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            💰 Transactions
          </button>
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={activeTab === 'goals' ? 'active' : ''}
            onClick={() => setActiveTab('goals')}
          >
            🎯 Goals
          </button>
          <button
            className={activeTab === 'calculator' ? 'active' : ''}
            onClick={() => setActiveTab('calculator')}
          >
            🧮 Calculator
          </button>
          <button
            className="disabled"
            disabled
            title="Coming Soon - Financial offers and savings programs"
          >
            💰 Save More
          </button>
          <button
            className={activeTab === 'investments' ? 'active' : ''}
            onClick={() => setActiveTab('investments')}
          >
            📊 Investments
          </button>
        </div>
        <div className="nav-user">
          {user ? (
            <>
              <span>👤 {user?.user_metadata?.name || user?.email}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="login-btn">
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* PUBLIC FEATURES - No authentication required */}
        {activeTab === 'calculator' && <Calculator />}
        
        {activeTab === 'investments' && <InvestmentInsights />}

        {/* PROTECTED FEATURES - Authentication required */}
        {activeTab === 'dashboard' && (
          user ? (
            <Dashboard
              transactions={transactions}
              goals={goals}
              summaryIncome={summaryIncome}
              summaryExpenses={summaryExpenses}
              summarySavings={summarySavings}
              insights={generateDashboardInsights(transactions, goals)}
              recurringRules={recurringRules}

            />
          ) : renderLockedFeature()
        )}

        {activeTab === 'transactions' && (
          user ? (
            <Transactions
              transactions={transactions}
              setTransactions={setTransactions}
              categories={DEFAULT_CATEGORIES}
              goals={goals}
              summaryIncome={summaryIncome}
              summaryExpenses={summaryExpenses}
              summarySavings={summarySavings}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onUpdateCategory={handleUpdateCategory}
              onCSVParsed={handleCSVParsed}
            />
          ) : renderLockedFeature()
        )}

        {activeTab === 'analytics' && (
          user ? (
            <Analytics
              transactions={transactions}
              recurringRules={recurringRules}
              summaryIncome={summaryIncome}
              summaryExpenses={summaryExpenses}
              summarySavings={summarySavings}
            />
          ) : renderLockedFeature()
        )}

        {activeTab === 'goals' && (
          user ? (
            <Goals
              goals={goals}
              setGoals={setGoals}
              transactions={transactions}
            />
          ) : renderLockedFeature()
        )}

        {activeTab === 'savemore' && <SaveMore />}
      </main>

    {/* Upgrade Modal */}
          {showUpgradeModal && (
            <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>🚀 Upgrade to Premium</h2>
                <p>You've reached the free tier limit of {FREE_LIMIT} transactions.</p>
                <p>
                  Unlock more accounts, unlimited transactions, AI analytics, and advanced reports!
                </p>
                <div className="modal-actions">
                  <button className="btn-primary">Upgrade Now</button>
                  <button className="btn-secondary" onClick={() => setShowUpgradeModal(false)}>
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer with Legal Links - ADD THIS NEW SECTION */}
          <footer className="app-footer">
            <div className="footer-content">
              <div className="footer-links">
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                <span className="separator">•</span>
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                <span className="separator">•</span>
                <span>© 2026 BudgetBuddy</span>
              </div>
            </div>
          </footer>
        </div>
      );
    }

    export default BudgetBuddy;
