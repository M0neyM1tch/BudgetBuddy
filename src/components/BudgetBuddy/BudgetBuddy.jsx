import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// Import analytics
import { 
  initializeSession, 
  endSession, 
  trackPageView, 
  trackFeature,
  trackError,
  setupGlobalErrorTracking,
  getAmountRange 
} from '../../utils/analytics';

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
  const hasInitializedSession = useRef(false);
  const hasSetupErrorTracking = useRef(false);

  // Core state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Initialize analytics session when user logs in
  useEffect(() => {
    if (user && !hasInitializedSession.current) {
      initializeSession(user.id);
      trackPageView(user.id, 'dashboard');
      hasInitializedSession.current = true;
      console.log('📊 Analytics session initialized for user:', user.email);
    }
  }, [user]);

  // Setup global error tracking
  useEffect(() => {
    if (!hasSetupErrorTracking.current) {
      setupGlobalErrorTracking(user?.id);
      hasSetupErrorTracking.current = true;
    }
  }, [user?.id]);

  // Track tab switches
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    
    if (user) {
      trackPageView(user.id, newTab);
      trackFeature(user.id, 'navigation', 'tab_switch', {
        from_tab: activeTab,
        to_tab: newTab
      });
    }
  };

  // Enhanced logout with session end
  const handleLogout = async () => {
    if (user) {
      await endSession(user.id);
      trackFeature(user.id, 'auth', 'logout');
    }
    logout();
  };

  // Load data from Supabase on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setDataLoading(false);
    }
  }, [user?.id]);

  const loadUserData = async () => {
    try {
      setDataLoading(true);
      
      console.log('📊 Loading user data from Supabase for:', user.email);
      
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

      // Track data load success
      if (user) {
        trackFeature(user.id, 'data', 'load_success', {
          transaction_count: txData?.length || 0,
          goal_count: goalsData?.length || 0
        });
      }

    } catch (error) {
      console.error('❌ Error loading user data:', error);
      
      // Track error
      if (user) {
        trackError('data_load_error', error.message, error.stack, user.id, {
          context: 'loadUserData'
        });
      }
      
      alert('Failed to load your data. Please refresh the page.');
    } finally {
      setDataLoading(false);
    }
  };

  // Process due recurring transactions
  useEffect(() => {
    const processDueTransactions = async () => {
      if (!user) return;

      try {
        console.log('🔄 Checking for due recurring transactions...');
        const createdTransactions = await processDueRecurringTransactions(user.id);

        if (createdTransactions && createdTransactions.length > 0) {
          console.log(`✅ Created ${createdTransactions.length} due recurring transaction(s)`);
          
          // Track recurring transaction processing
          trackFeature(user.id, 'recurring', 'auto_create', {
            count: createdTransactions.length
          });
          
          const allTransactions = await fetchTransactions(user.id);
          setTransactions(allTransactions);
        } else {
          console.log('✓ No due recurring transactions found');
        }
      } catch (error) {
        console.error('⚠️ Failed to process recurring transactions:', error);
        
        trackError('recurring_process_error', error.message, error.stack, user.id);
      }
    };

    processDueTransactions();
  }, [user?.id]);

  // Recalculate goal progress from transactions
  useEffect(() => {
    if (goals.length === 0 || transactions.length === 0) return;

    console.log('🔄 Recalculating goal progress from transactions');

    const updatedGoals = goals.map((goal) => {
      const goalTransactions = transactions.filter(
        (tx) => tx.category === `Goal: ${goal.name}`
      );

      const totalContributions = goalTransactions.reduce(
        (sum, tx) => sum + Math.abs(Number(tx.amount)),
        0
      );

      return {
        ...goal,
        current_amount: totalContributions
      };
    });

    const hasChanges = updatedGoals.some(
      (goal, idx) => (goal.current_amount || 0) !== (goals[idx]?.current_amount || 0)
    );

    if (hasChanges) {
      console.log('✅ Updating goals with recalculated progress');
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

  const { summaryIncome, summaryExpenses, summarySavings } = calculateSummaries(transactions);

  // Enhanced transaction handler with tracking
  const handleAddTransaction = async (formData) => {
    if (!user?.isPremium && transactions.length >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      
      // Track upgrade modal shown
      trackFeature(user.id, 'upgrade', 'modal_shown', {
        reason: 'transaction_limit',
        current_count: transactions.length
      });
      
      return;
    }

    try {
      let amount = Number(formData.amount);

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
      
      // Track transaction added
      trackFeature(user.id, 'transactions', 'add', {
        category: formData.category,
        amount_range: getAmountRange(Math.abs(amount)),
        is_recurring: formData.isRecurring || false
      });
      
      console.log('✅ Transaction saved successfully');
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      
      trackError('transaction_add_error', error.message, error.stack, user.id, {
        category: formData.category
      });
      
      alert('Failed to add transaction: ' + error.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await deleteTransactionDB(id, user.id);
        setTransactions(transactions.filter((tx) => tx.id !== id));
        
        // Track deletion
        trackFeature(user.id, 'transactions', 'delete');
        
        console.log('✅ Transaction deleted');
      } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        
        trackError('transaction_delete_error', error.message, error.stack, user.id);
        
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
      
      // Track category update
      trackFeature(user.id, 'transactions', 'update_category', {
        new_category: newCategory
      });
      
      console.log('✅ Category updated successfully');
    } catch (error) {
      console.error('❌ Error updating category:', error);
      
      trackError('category_update_error', error.message, error.stack, user.id);
      
      alert('Failed to update category: ' + error.message);
    }
  };

  const handleCSVParsed = (parsedTransactions) => {
    console.log('📥 BudgetBuddy received parsed transactions:', parsedTransactions.length);

    if (!user?.isPremium && transactions.length >= FREE_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    // Track CSV import
    trackFeature(user.id, 'transactions', 'csv_import', {
      count: parsedTransactions.length
    });

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
        
        trackError('csv_import_error', error.message, error.stack, user.id);
      }
    });

    console.log('✅ CSV Transactions being saved to Supabase');
  };

  const isPublicTab = (tab) => {
    return ['calculator', 'investments'].includes(tab);
  };

  const featureScreenshots = {
    dashboard: '/screenshots/dashboard.jpg',
    transactions: '/screenshots/transactions.jpg',
    goals: '/screenshots/goals.jpg',
    analytics: '/screenshots/analytics.jpg'
  };

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
        background: 'rgba(20, 20, 30, 0.95)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(5, 150, 105, 0.2)'
      }}>
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
          color: '#10b981',
          marginBottom: '16px', 
          fontSize: '28px',
          fontWeight: '700'
        }}>
          Sign In to Access This Feature
        </h2>
        <p style={{ 
          color: '#d1d5db',
          marginBottom: '30px', 
          fontSize: '16px', 
          lineHeight: '1.6' 
        }}>
          {featureMessages[activeTab] || 'Sign in to access premium features'}
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
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
          color: '#6b7280',
          fontSize: '14px' 
        }}>
          No credit card required
        </p>
      </div>
    );
  };

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
            onClick={() => handleTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => handleTabChange('transactions')}
          >
            💰 Transactions
          </button>
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => handleTabChange('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={activeTab === 'goals' ? 'active' : ''}
            onClick={() => handleTabChange('goals')}
          >
            🎯 Goals
          </button>
          <button
            className={activeTab === 'calculator' ? 'active' : ''}
            onClick={() => handleTabChange('calculator')}
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
            onClick={() => handleTabChange('investments')}
          >
            📊 Investments
          </button>
        </div>
        <div className="nav-user">
          {user ? (
            <>
              <span>👤 {user?.user_metadata?.name || user?.email}</span>
              <button onClick={handleLogout} className="logout-btn">
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
        {activeTab === 'calculator' && <Calculator />}
        
        {activeTab === 'investments' && <InvestmentInsights />}

        {activeTab === 'dashboard' && (
          user ? (
            <Dashboard
              transactions={transactions}
              goals={goals}
              summaryIncome={summaryIncome}
              summaryExpenses={summaryExpenses}
              summarySavings={summarySavings}
              recurringRules={recurringRules}
            />
          ) : renderLockedFeature()
        )}

        {activeTab === 'transactions' && (
          user ? (
            <Transactions
              transactions={transactions}
              goals={goals}
              recurringRules={recurringRules}
              summaryIncome={summaryIncome}
              summaryExpenses={summaryExpenses}
              summarySavings={summarySavings}
              onTransactionChange={loadUserData}
              setTransactions={setTransactions}
              categories={DEFAULT_CATEGORIES}
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
