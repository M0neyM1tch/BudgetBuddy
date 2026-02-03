import React, { useState, useEffect } from 'react';
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
  goals,
  summaryIncome,
  summarySavings,
  summaryExpenses,
  onTransactionChange // ✅ ADDED THIS PROP
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recurringTransactions, setRecurringTransactions] = useState([]);

  // Form data state for manual transactions
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Income',
  });

  // Form data state for recurring transactions
  const [recurringForm, setRecurringForm] = useState({
    description: '',
    amount: '',
    category: 'Expenses',
    frequency: 'monthly',
    recurDay: '1',
    nextOccurrenceDate: new Date().toISOString().split('T')[0]
  });

  // Load recurring rules on mount
  useEffect(() => {
    if (user) {
      loadRecurringRules();
    }
  }, [user]);

  const loadRecurringRules = async () => {
    try {
      const rules = await fetchRecurringRules(user.id);
      setRecurringTransactions(rules);
    } catch (error) {
      console.error('Error loading recurring rules:', error);
    }
  };

  // Create combined categories list with goals
  const allCategories = [
    ...categories,
    ...goals.map((goal) => `Goal: ${goal.name}`)
  ];

  // Filtered transactions based on search query
  const filteredTransactions = searchQuery
    ? transactions.filter((tx) => {
        const matchDesc = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = tx.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchAmount = tx.amount.toString().includes(searchQuery);
        return matchDesc || matchCat || matchAmount;
      })
    : transactions;

  // Add new transaction
  const handleAddTransaction = async () => {
    const newTx = {
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
    };

    try {
      const added = await addTransactionDB(user.id, newTx);
      setTransactions((prev) => [added, ...prev]);

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        category: 'Income',
      });

      // ✅ REFRESH DASHBOARD
      if (onTransactionChange) {
        await onTransactionChange();
      }

    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  // Add recurring transaction
  const handleAddRecurring = async () => {
    if (
      !recurringForm.description ||
      !recurringForm.amount ||
      isNaN(parseFloat(recurringForm.amount))
    ) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Calculate next_run_date based on frequency
      let nextRunDate;
      
      if (recurringForm.frequency === 'monthly') {
        const today = new Date();
        const targetDay = parseInt(recurringForm.recurDay);
        const nextDate = new Date(today.getFullYear(), today.getMonth(), targetDay);
        if (nextDate <= today) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        nextRunDate = nextDate.toISOString().split('T')[0];
        
      } else if (recurringForm.frequency === 'biweekly') {
        nextRunDate = recurringForm.nextOccurrenceDate;
        const selectedDate = new Date(nextRunDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          alert('Next occurrence date cannot be in the past. Please select today or a future date.');
          return;
        }
      }

      // Create recurring rule in database
      const newRule = await addRecurringRule(user.id, {
        description: recurringForm.description,
        amount: parseFloat(recurringForm.amount),
        category: recurringForm.category,
        frequency: recurringForm.frequency,
        recur_day: recurringForm.frequency === 'monthly' ? parseInt(recurringForm.recurDay) : null,
        next_run_date: nextRunDate,
      });

      // Update local state
      setRecurringTransactions(prev => [...prev, newRule]);

      alert(`✅ Recurring ${recurringForm.frequency} transaction created!\nNext occurrence: ${nextRunDate}`);

      // Reset form
      setRecurringForm({
        description: '',
        amount: '',
        category: 'Expenses',
        frequency: 'monthly',
        recurDay: '1',
        nextOccurrenceDate: new Date().toISOString().split('T')[0]
      });

      await loadRecurringRules();

      // ✅ REFRESH DASHBOARD
      if (onTransactionChange) {
        await onTransactionChange();
      }
      
    } catch (error) {
      console.error('❌ Error adding recurring rule:', error);
      alert('Failed to create recurring transaction: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    
    try {
      await deleteTransactionDB(id, user.id);
      setTransactions(transactions.filter(tx => tx.id !== id));

      // ✅ REFRESH DASHBOARD
      if (onTransactionChange) {
        await onTransactionChange();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction: ' + error.message);
    }
  };

  const handleUpdateCategory = async (id, newCategory) => {
    try {
      await updateTransactionDB(id, { category: newCategory }, user.id);
      setTransactions(
        transactions.map((tx) => (tx.id === id ? { ...tx, category: newCategory } : tx))
      );
      
      // ✅ REFRESH DASHBOARD (categories affect charts)
      if (onTransactionChange) {
        await onTransactionChange();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category: ' + error.message);
    }
  };

  const handleUpdateTransaction = async (id, updates) => {
    try {
      await updateTransactionDB(id, updates, user.id);
      setTransactions(
        transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
      );

      // ✅ REFRESH DASHBOARD
      if (onTransactionChange) {
        await onTransactionChange();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction: ' + error.message);
    }
  };

  const handleDeleteRecurringRule = async (ruleId) => {
    if (!window.confirm('Delete this recurring transaction?')) return;

    try {
      await deleteRecurringRule(ruleId, user.id);
      setRecurringTransactions((prev) => prev.filter((r) => r.id !== ruleId));

      // ✅ REFRESH DASHBOARD
      if (onTransactionChange) {
        await onTransactionChange();
      }
    } catch (error) {
      console.error('Error deleting recurring rule:', error);
      alert('Failed to delete recurring transaction: ' + error.message);
    }
  };

  return (
    <div className="transactions-container">
      {/* PRIMARY: Transaction Input */}
      <div className="primary-section">
        <h2>
          Variable Transactions
          <Tooltip content={
            <>
              <h4>Variable (One-Time) Transactions</h4>
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

      {/* PRIMARY: Recurring Transactions */}
      <div className="primary-section">
        <h2>
          Recurring Transactions
          <Tooltip content={
            <>
              <h4>Recurring Transactions</h4>
              <p>Set up transactions that <strong>repeat automatically</strong>, like monthly rent, biweekly paychecks, or yearly subscriptions.</p>
              <p>Configure it once, and BudgetBuddy will create future transactions automatically based on your schedule.</p>
            </>
          } />
        </h2>

        <div className="recurring-form">
          <input
            type="text"
            placeholder="Description"
            value={recurringForm.description}
            onChange={(e) => setRecurringForm({ ...recurringForm, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="Amount"
            value={recurringForm.amount}
            onChange={(e) => setRecurringForm({ ...recurringForm, amount: e.target.value })}
          />
          <select
            value={recurringForm.category}
            onChange={(e) => setRecurringForm({ ...recurringForm, category: e.target.value })}
          >
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={recurringForm.frequency}
            onChange={(e) => setRecurringForm({ ...recurringForm, frequency: e.target.value })}
          >
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </select>

          {/* BI-WEEKLY: Date picker for next occurrence */}
          {recurringForm.frequency === 'biweekly' && (
            <input
              type="date"
              value={recurringForm.nextOccurrenceDate}
              onChange={(e) => setRecurringForm({ ...recurringForm, nextOccurrenceDate: e.target.value })}
              title="Select the next date this transaction occurs"
            />
          )}

          {/* MONTHLY: Day selector */}
          {recurringForm.frequency === 'monthly' && (
            <select
              value={recurringForm.recurDay}
              onChange={(e) => setRecurringForm({ ...recurringForm, recurDay: e.target.value })}
            >
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}{['st','nd','rd'][((i+1)%10)-1] || 'th'} of month</option>
              ))}
            </select>
          )}

          <button onClick={handleAddRecurring} className="btn-recurring">
            ADD RECURRING
          </button>
        </div>

        {/* List of Active Recurring Rules */}
        {recurringTransactions.length > 0 && (
          <div className="recurring-list">
            <h3>Active Recurring Rules</h3>
            <div className="active-recurring-rules">
              {recurringTransactions.map(rule => (
                <div key={rule.id} className="recurring-rule-card">
                  <div className="rule-header">
                    <span className="rule-icon">
                      {rule.category === 'Income' ? '💰' : '💸'}
                    </span>
                    <div className="rule-info">
                      <strong>{rule.description}</strong>
                      <span className="rule-meta">
                        {rule.frequency === 'monthly' ? `Monthly (Day ${rule.recurday})` : 'Biweekly'} • Next: {new Date(rule.nextrundate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="rule-footer">
                    <span 
                      className="rule-amount" 
                      style={{ color: rule.category === 'Income' ? '#10b981' : '#ef4444' }}
                    >
                      {rule.category === 'Income' ? '+' : '-'}${Math.abs(rule.amount).toFixed(2)}
                    </span>
                    <button 
                      className="delete-rule-btn" 
                      onClick={() => handleDeleteRecurringRule(rule.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SEARCH & LIST */}
      <div className="secondary-section">
        <h2>Search Transactions</h2>
        <input
          type="text"
          placeholder="Search by description, category or amount"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <TransactionList
          transactions={filteredTransactions}
          onDelete={handleDelete} // ✅ FIXED: Passed handleDelete instead of handleDeleteTransaction
          onUpdateCategory={handleUpdateCategory} // ✅ FIXED: Passed update function
          onUpdateTransaction={handleUpdateTransaction} // ✅ FIXED: Passed update function
        />
      </div>
    </div>
  );
}

export default Transactions;
