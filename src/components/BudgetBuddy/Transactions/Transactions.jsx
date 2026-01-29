import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Tooltip from './Tooltip';
import {
  addTransaction as addTransactionDB,
  deleteTransaction as deleteTransactionDB,
  updateTransaction as updateTransactionDB,
  addRecurringRule,
  deleteRecurringRule,
  fetchRecurringRules
} from '../../../utils/supabaseHelpers';
import './Transactions.css';

function Transactions({
  transactions,
  setTransactions,
  categories,
  goals = [],
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get default categories safely
  const DEFAULT_INCOME_CATEGORY = categories.find(c => c === 'Income') || categories[0] || 'Income';
  const DEFAULT_EXPENSE_CATEGORY = categories.find(c => c === 'Expenses') || categories[0] || 'Expenses';

  // Form data state for manual transactions
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: DEFAULT_INCOME_CATEGORY,
  });

  // Form data state for recurring transactions
  const [recurringForm, setRecurringForm] = useState({
    description: '',
    amount: '',
    category: DEFAULT_EXPENSE_CATEGORY,
    frequency: 'monthly',
    recurDay: '1',
    startDate: new Date().toISOString().split('T')[0],
  });

  // Load recurring rules on mount
  useEffect(() => {
    if (!user) return;

    const loadRecurringRules = async () => {
      try {
        const rules = await fetchRecurringRules(user.id);
        setRecurringTransactions(rules || []);
      } catch (error) {
        console.error('Error loading recurring rules:', error);
        alert('Failed to load recurring transactions. Please refresh the page.');
      }
    };

    loadRecurringRules();
  }, [user]);

  // Memoize combined categories list
  const allCategories = useMemo(() => [
    ...categories,
    ...goals.map(goal => `Goal: ${goal.name}`)
  ], [categories, goals]);

  // Filtered transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    
    const query = searchQuery.toLowerCase();
    return transactions.filter(tx => {
      const matchDesc = tx.description?.toLowerCase().includes(query);
      const matchCat = tx.category?.toLowerCase().includes(query);
      const matchAmount = tx.amount?.toString().includes(searchQuery);
      return matchDesc || matchCat || matchAmount;
    });
  }, [transactions, searchQuery]);

  // Add new transaction
  const handleAddTransaction = async () => {
    // Validation
    if (!formData.description?.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) === 0) {
      alert('Please enter a valid non-zero amount');
      return;
    }

    const newTx = {
      date: formData.date,
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      category: formData.category,
    };

    setIsSubmitting(true);

    try {
      const added = await addTransactionDB(user.id, newTx);
      setTransactions(prev => [added, ...prev]);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: DEFAULT_INCOME_CATEGORY,
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert(error.message || 'Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add recurring transaction
  const handleAddRecurring = async () => {
    // Prevent double submission
    if (isSubmitting) return;

    // Validation
    if (!recurringForm.description?.trim()) {
      alert('Please enter a description for the recurring transaction');
      return;
    }
    if (!recurringForm.amount || isNaN(parseFloat(recurringForm.amount)) || parseFloat(recurringForm.amount) === 0) {
      alert('Please enter a valid non-zero amount');
      return;
    }

    setIsSubmitting(true);
    let newRule = null;

    try {
      const today = new Date().toISOString().split('T')[0];
      const startDate = recurringForm.startDate || today;

      // Calculate first run date
      let nextRunDate;

      if (recurringForm.frequency === 'monthly') {
        const targetDay = parseInt(recurringForm.recurDay, 10);
        const next = new Date(startDate);
        
        // Get last day of the start month to handle overflow (e.g., Feb 31 -> Feb 28/29)
        const lastDayOfMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
        const clampedDay = Math.min(targetDay, lastDayOfMonth);
        
        next.setDate(clampedDay);
        
        // If we've already passed that day this month, move to next month
        const nextDateStr = next.toISOString().split('T')[0];
        if (nextDateStr < startDate) {
          next.setMonth(next.getMonth() + 1);
          // Handle overflow for next month too
          const nextMonthLastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
          next.setDate(Math.min(targetDay, nextMonthLastDay));
        }

        nextRunDate = next.toISOString().split('T')[0];
      } else if (recurringForm.frequency === 'biweekly') {
        // First biweekly run: exactly the chosen startDate
        nextRunDate = startDate;
      }

      // Validate calculated date
      if (!nextRunDate || nextRunDate === 'Invalid Date') {
        throw new Error('Failed to calculate next run date. Please check your date selection.');
      }

      // Create recurring rule in database
      newRule = await addRecurringRule(user.id, {
        description: recurringForm.description.trim(),
        amount: parseFloat(recurringForm.amount),
        category: recurringForm.category,
        frequency: recurringForm.frequency,
        recur_day: recurringForm.frequency === 'biweekly'
          ? new Date(startDate).getDay()  // Calculate weekday from startDate
          : parseInt(recurringForm.recurDay, 10),  // Use selected day for monthly
        next_run_date: nextRunDate,
      });

      // Create the first transaction
      const firstTransaction = await addTransactionDB(user.id, {
        date: nextRunDate,
        description: recurringForm.description.trim(),
        amount: parseFloat(recurringForm.amount),
        category: recurringForm.category,
        is_recurring: true,
        recurring_rule_id: newRule.id
      });

      // Only update UI state after BOTH succeed
      setRecurringTransactions(prev => [...prev, newRule]);
      setTransactions(prev => [firstTransaction, ...prev]);

      // Reset form
      setRecurringForm({
        description: '',
        amount: '',
        category: DEFAULT_EXPENSE_CATEGORY,
        frequency: 'monthly',
        recurDay: '1',
        startDate: new Date().toISOString().split('T')[0],
      });

    } catch (error) {
      console.error('Error adding recurring rule:', error);
      
      // ROLLBACK: If rule was created but transaction failed, clean up
      if (newRule?.id) {
        try {
          await deleteRecurringRule(newRule.id);
          console.log('Rolled back recurring rule due to transaction creation failure');
        } catch (rollbackError) {
          console.error('Failed to rollback recurring rule:', rollbackError);
        }
      }
      
      alert(error.message || 'Failed to add recurring transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransactionDB(id);
      setTransactions(transactions.filter((tx) => tx.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert(error.message || 'Failed to delete transaction. Please try again.');
    }
  };

  const handleUpdateCategory = async (id, newCategory) => {
    try {
      await updateTransactionDB(id, { category: newCategory });
      setTransactions(
        transactions.map((tx) =>
          tx.id === id ? { ...tx, category: newCategory } : tx
        )
      );
    } catch (error) {
      console.error('Error updating category:', error);
      alert(error.message || 'Failed to update category. Please try again.');
    }
  };

  const handleUpdateTransaction = async (id, updates) => {
    try {
      await updateTransactionDB(id, updates);
      setTransactions(
        transactions.map((tx) =>
          tx.id === id ? { ...tx, ...updates } : tx
        )
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert(error.message || 'Failed to update transaction. Please try again.');
    }
  };

  const handleDeleteRecurringRule = async (ruleId) => {
    if (!window.confirm('Delete this recurring transaction? This will not affect past transactions.')) return;
    
    try {
      await deleteRecurringRule(ruleId);
      setRecurringTransactions(prev => prev.filter(r => r.id !== ruleId));
    } catch (error) {
      console.error('Error deleting recurring rule:', error);
      alert(error.message || 'Failed to delete recurring transaction. Please try again.');
    }
  };

  return (
    <div className="transactions-container">
      {/* PRIMARY: Transaction Input - WITH TOOLTIP */}
      <div className="primary-section">
        <h2>
          💰 Variable Transactions
          <Tooltip content={
            <>
              <h4>📝 Variable (One-Time) Transactions</h4>
              <p>Record transactions that happen <strong>once</strong>, like buying groceries, getting paid for a freelance project, or making a one-time purchase.</p>
              <p>Each transaction is recorded as a single event in your history.</p>
            </>
          } />
        </h2>
        <TransactionForm
          formData={formData}
          setFormData={setFormData}
          categories={allCategories}
          onSubmit={handleAddTransaction}
        />
      </div>

      {/* PRIMARY: Recurring Transactions - WITH TOOLTIP */}
      <div className="primary-section">
        <h2>
          🔄 Recurring Transactions
          <Tooltip content={
            <>
              <h4>🔄 Recurring Transactions</h4>
              <p>Set up transactions that <strong>repeat automatically</strong>, like monthly rent, biweekly paychecks, or yearly subscriptions.</p>
              <p>Configure it once, and BudgetBuddy will create future transactions automatically based on your schedule.</p>
            </>
          } />
        </h2>
        <div className="recurring-form">
          <input
            type="text"
            placeholder="Description"
            aria-label="Recurring transaction description"
            value={recurringForm.description}
            onChange={e => setRecurringForm({ ...recurringForm, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            aria-label="Recurring transaction amount"
            step="0.01"
            value={recurringForm.amount}
            onChange={e => setRecurringForm({ ...recurringForm, amount: e.target.value })}
          />
          <select
            aria-label="Recurring transaction category"
            value={recurringForm.category}
            onChange={e => setRecurringForm({ ...recurringForm, category: e.target.value })}
          >
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            aria-label="Recurring transaction frequency"
            value={recurringForm.frequency}
            onChange={(e) => setRecurringForm({...recurringForm, frequency: e.target.value})}
          >
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <input
            type="date"
            aria-label="First occurrence date"
            value={recurringForm.startDate}
            onChange={(e) =>
              setRecurringForm({ ...recurringForm, startDate: e.target.value })
            }
          />

          {recurringForm.frequency === 'monthly' && (
            <select
              aria-label="Day of month for recurring transaction"
              value={recurringForm.recurDay}
              onChange={e => setRecurringForm({ ...recurringForm, recurDay: e.target.value })}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>
                  {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month
                </option>
              ))}
            </select>
          )}

          <button onClick={handleAddRecurring} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Recurring'}
          </button>
        </div>

        {/* Display Active Recurring Transactions */}
        {recurringTransactions.length > 0 ? (
          <div className="active-recurring-list">
            <h3>Active Recurring Transactions</h3>
            {recurringTransactions.map(rec => (
              <div key={rec.id} className="recurring-item">
                <span className="recurring-description">{rec.description}</span>
                <span className="recurring-amount">${rec.amount.toFixed(2)}</span>
                <span className="recurring-category">{rec.category}</span>
                <span className="recurring-frequency">
                  {rec.frequency === 'monthly'
                    ? `Monthly on day ${rec.recur_day}`
                    : `Every 2 weeks from ${rec.next_run_date}`}
                </span>
                <span className="recurring-next-date">
                  Next: {rec.next_run_date}
                </span>
                <button
                  onClick={() => handleDeleteRecurringRule(rec.id)}
                  className="recurring-delete-btn"
                  aria-label={`Delete recurring transaction: ${rec.description}`}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No recurring transactions yet. Create one above to automate your budget!</p>
        )}
      </div>

      <div className="section-divider"></div>

      {/* Search Transactions */}
      <h2>🔍 Search Transactions</h2>
      <input
        type="text"
        className="search-input"
        placeholder="Search by description, category or amount"
        aria-label="Search transactions"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />

      <TransactionList
        transactions={filteredTransactions}
        onDelete={handleDelete}
        onUpdateCategory={handleUpdateCategory}
        onUpdateTransaction={handleUpdateTransaction}
        categories={allCategories}
        goals={goals}
      />
    </div>
  );
}

export default Transactions;
