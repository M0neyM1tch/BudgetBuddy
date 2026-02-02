import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Tooltip from './Tooltip'; // ADD THIS IMPORT
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
      // ✅ Calculate next_run_date based on frequency
      let nextRunDate;
      
      if (recurringForm.frequency === 'monthly') {
        // For monthly: use the selected day of the current/next month
        const today = new Date();
        const targetDay = parseInt(recurringForm.recurDay);
        
        // Start with today, set to target day
        const nextDate = new Date(today.getFullYear(), today.getMonth(), targetDay);
        
        // If the date has already passed this month, move to next month
        if (nextDate <= today) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        
        nextRunDate = nextDate.toISOString().split('T')[0];
        
      } else if (recurringForm.frequency === 'biweekly') {
        // ✅ For biweekly, use the date picker value
        nextRunDate = recurringForm.nextOccurrenceDate;
        
        // Validate that it's not in the past
        const selectedDate = new Date(nextRunDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
          alert('Next occurrence date cannot be in the past. Please select today or a future date.');
          return;
        }
      }

      console.log('📝 Creating recurring rule with next_run_date:', nextRunDate);

      // ✅ Create recurring rule in database
      const newRule = await addRecurringRule(user.id, {
        description: recurringForm.description,
        amount: parseFloat(recurringForm.amount),
        category: recurringForm.category,
        frequency: recurringForm.frequency,
        recur_day: recurringForm.frequency === 'monthly' ? parseInt(recurringForm.recurDay) : null,
        next_run_date: nextRunDate,  // ✅ Changed from next_occurrence_date
      });

      console.log('✅ Recurring rule created:', newRule);

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

      // Reload recurring rules to show the new one
      await loadRecurringRules();
      
    } catch (error) {
      console.error('❌ Error adding recurring rule:', error);
      alert('Failed to create recurring transaction: ' + error.message);
    }
  };

  // ✅ FIX 1: Add missing handleDelete function
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    
    try {
      await deleteTransactionDB(id, user.id);  // ✅ Added user.id
      setTransactions(transactions.filter(tx => tx.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction: ' + error.message);
    }
  };

  // ✅ FIX 2: Add missing handleUpdateCategory function
  const handleUpdateCategory = async (id, newCategory) => {
    try {
      await updateTransactionDB(id, { category: newCategory }, user.id);  // ✅ Added user.id
      setTransactions(
        transactions.map((tx) => (tx.id === id ? { ...tx, category: newCategory } : tx))
      );
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Failed to update category: ' + error.message);
    }
  };

  // ✅ FIX 3: Add missing handleUpdateTransaction function
  const handleUpdateTransaction = async (id, updates) => {
    try {
      await updateTransactionDB(id, updates, user.id);  // ✅ Added user.id
      setTransactions(
        transactions.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction: ' + error.message);
    }
  };

  // ✅ FIX 4: Fix deleteRecurringRule to include user.id
  const handleDeleteRecurringRule = async (ruleId) => {
    if (!window.confirm('Delete this recurring transaction?')) return;

    try {
      await deleteRecurringRule(ruleId, user.id);  // ✅ Added user.id
      setRecurringTransactions((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (error) {
      console.error('Error deleting recurring rule:', error);
      alert('Failed to delete recurring transaction: ' + error.message);
    }
  };

  return (
    <div className="transactions-container">
      {/* PRIMARY: Transaction Input - WITH TOOLTIP */}
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

      {/* PRIMARY: Recurring Transactions - WITH TOOLTIP */}
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
              placeholder="Next Occurrence"
            />
          )}

          {/* MONTHLY: Day of month picker */}
          {recurringForm.frequency === 'monthly' && (
            <select
              value={recurringForm.recurDay}
              onChange={(e) => setRecurringForm({ ...recurringForm, recurDay: e.target.value })}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of month
                </option>
              ))}
            </select>
          )}

          <button onClick={handleAddRecurring}>Add Recurring</button>
        </div>

        {/* Display Active Recurring Transactions */}
        {recurringTransactions.length > 0 && (
          <div className="active-recurring-list" style={{ marginTop: '20px' }}>
            <h3>Active Recurring Transactions</h3>
            {recurringTransactions.map((rec) => (
              <div
                key={rec.id}
                className="recurring-item"
                style={{
                  background: '#374151',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{rec.description}</span>
                <span>${rec.amount.toFixed(2)}</span>
                <span>{rec.category}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {rec.frequency === 'monthly' ? `Monthly on day ${rec.recur_day}` : 'Biweekly (every 14 days)'}
                </span>
                <span style={{ fontSize: '12px', color: '#10b981' }}>
                  Next: {rec.next_run_date}
                </span>
                <button
                  onClick={() => handleDeleteRecurringRule(rec.id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="section-divider"></div>

      {/* Search Transactions */}
      <h2>Search Transactions</h2>
      <input
        type="text"
        className="search-input"
        placeholder="Search by description, category or amount"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
